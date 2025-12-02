// Residential BUY Property Match Job (MODERN + MODULAR + CLEAN)
// Uses new scoring engine (matchEngine.js)

const schedule = require("node-schedule");
const mongoose = require("mongoose");

// MODELS
const residentialPropertySell = require("../models/residentialPropertySell");
const residentialCustomerBuyLocation = require("../models/residentialCustomerBuyLocation");

const residentialBuyPropertyMatch = require("../models/match/residentialBuyPropertyMatch");
const residentialBuyCustomerMatch = require("../models/match/residentialBuyCustomerMatch");
const ResidentialPropertyCustomerBuy = require("../models/residentialPropertyCustomerBuy");

// SCORING ENGINE
const engine = require("./matchEngine");
const logger = require('../utils/logger');

// DB CONNECTION
// mongoose.connect("mongodb://realto:realto123@207.180.239.115:27017/realtodb");

schedule.scheduleJob("*/10 * * * * *", async () => {
  console.log("Running Residential BUY Property Match...");

  const properties = await residentialPropertySell.find().lean();

  for (const property of properties) {
    const pLoc = property.location?.coordinates;
    if (!pLoc) continue;

    const availableFromDate = property.sell_details.available_from;

    // 1️⃣ FIND ALL CUSTOMERS WITHIN 10 KM
    const customers = await residentialCustomerBuyLocation.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: pLoc },
          distanceField: "distance",
          maxDistance: engine.LOCATION_RADIUS_METERS,
          spherical: true,
        },
      }
    ]);

    const matchedMine = [];
    const matchedOther = [];

    for (const customer of customers) {
      const scores = {};

      // ------------------------------------------------
      // LOCATION (Mandatory)
      // ------------------------------------------------
      const locCheck = engine.scoreLocation(customer.distance);
      if (!locCheck.ok) continue;
      scores.location = locCheck.score;

      // ------------------------------------------------
      // BHK (Residential Buy Sensitivity: 25 max)
      // ------------------------------------------------
      scores.bhk = engine.scoreBHK(
        property.property_details.bhk_type,
        customer.customer_property_details.bhk_type
      );

      // ------------------------------------------------
      // BUY PRICE (More sensitive: 25 max)
      // ------------------------------------------------
      scores.price = engine.scoreBuyPrice(
        property.sell_details.expected_sell_price,
        customer.customer_buy_details.expected_buy_price
      );

      // ------------------------------------------------
      // FURNISHING
      // ------------------------------------------------
      scores.furnish = engine.scoreFurnishing(
        property.property_details.furnishing_status,
        customer.customer_property_details.furnishing_status
      );

      // ------------------------------------------------
      // PARKING
      // ------------------------------------------------
      scores.parking = engine.scoreParking(
        property.property_details.parking_type,
        customer.customer_property_details.parking_type
      );

      // ------------------------------------------------
      // AVAILABLE FROM DATE
      // ------------------------------------------------
      scores.date = engine.scoreAvailableFrom(
        availableFromDate,
        customer.customer_buy_details.available_from,
        false // residential
      );

      // ------------------------------------------------
      // COMPUTE FINAL SCORE
      // ------------------------------------------------
      const finalScore = engine.computeFinalScore(scores);
      if (finalScore < engine.MIN_SCORE_THRESHOLD) continue;

      const entry = {
        customer_id: customer.customer_id,
        agent_id: customer.agent_id,
        distance: customer.distance,
        matched_percentage: Math.ceil(finalScore),
      };

      if (customer.agent_id === property.agent_id) matchedMine.push(entry);
      else matchedOther.push(entry);

      // Update CUSTOMER DOCUMENT
      await updateCustomerMatch(customer, property, finalScore);
    }

    // Update PROPERTY MATCH Document
    await updatePropertyMatch(property, matchedMine, matchedOther);

    // Update MAIN PROPERTY match_count
    await residentialPropertySell.updateOne(
      { property_id: property.property_id },
      {
        $set: {
          match_count: matchedMine.length + matchedOther.length,
        },
      }
    );
  }

  console.log("Residential BUY Matching Completed.");
});

// -----------------------------------------------------------
// HELPERS
// -----------------------------------------------------------

async function updateCustomerMatch(customer, property, score) {
  const existing = await residentialBuyCustomerMatch.findOne({
    customer_id: customer.customer_id,
  });

  const entry = {
    property_id: property.property_id,
    agent_id: property.agent_id,
    distance: customer.distance,
    matched_percentage: Math.ceil(score),
  };

  if (existing) {
    const mine = existing.matched_property_id_mine;
    const other = existing.matched_property_id_other;

    if (property.agent_id === customer.agent_id) {
      if (!mine.some(e => e.property_id === property.property_id)) mine.push(entry);
    } else {
      if (!other.some(e => e.property_id === property.property_id)) other.push(entry);
    }

    await residentialBuyCustomerMatch.updateOne(
      { customer_id: customer.customer_id },
      {
        $set: {
          matched_property_id_mine: mine,
          matched_property_id_other: other,
          match_count: mine.length + other.length,
          update_date_time: new Date(),
        },
      }
    );

    await ResidentialPropertyCustomerBuy.updateOne(
      { customer_id: customer.customer_id },
      { $set: { match_count: mine.length + other.length } }
    );
  } else {
    const obj = {
      customer_id: customer.customer_id,
      agent_id: customer.agent_id,
      match_count: 1,
      matched_property_id_mine: property.agent_id === customer.agent_id ? [entry] : [],
      matched_property_id_other: property.agent_id !== customer.agent_id ? [entry] : [],
      update_date_time: new Date(),
    };

    await residentialBuyCustomerMatch.create(obj);

    await ResidentialPropertyCustomerBuy.updateOne(
      { customer_id: customer.customer_id },
      { $set: { match_count: 1 } }
    );
  }
}

async function updatePropertyMatch(property, mineArr, otherArr) {
  const existing = await residentialBuyPropertyMatch.findOne({
    property_id: property.property_id,
  });

  if (existing) {
    const mine = existing.matched_customer_id_mine;
    const other = existing.matched_customer_id_other;

    mineArr.forEach(c => {
      if (!mine.some(m => m.customer_id === c.customer_id)) mine.push(c);
    });
    otherArr.forEach(c => {
      if (!other.some(m => m.customer_id === c.customer_id)) other.push(c);
    });

    await residentialBuyPropertyMatch.updateOne(
      { property_id: property.property_id },
      {
        $set: {
          matched_customer_id_mine: mine,
          matched_customer_id_other: other,
          match_count: mine.length + other.length,
          update_date_time: new Date(),
        },
      }
    );
  } else {
    await residentialBuyPropertyMatch.create({
      property_id: property.property_id,
      agent_id: property.agent_id,
      matched_customer_id_mine: mineArr,
      matched_customer_id_other: otherArr,
      match_count: mineArr.length + otherArr.length,
      update_date_time: new Date(),
    });
  }
}
module.exports = schedule;