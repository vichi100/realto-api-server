// Commercial RENT Property Match Job (MODULAR + CLEAN + NEW WEIGHTS)

const schedule = require("node-schedule");
const mongoose = require("mongoose");

// MODELS
const commercialPropertyRent = require("../models/commercialPropertyRent");
const commercialCustomerRentLocation = require("../models/commercialCustomerRentLocation");

const commercialRentPropertyMatch = require("../models/match/commercialRentPropertyMatch");
const commercialRentCustomerMatch = require("../models/match/commercialRentCustomerMatch");
const commercialPropertyCustomerRent = require("../models/commercialPropertyCustomerRent");

// SCORING ENGINE
const engine = require("./matchEngine");
const logger = require('../../utils/logger');

// CONNECT DB
// mongoose.connect("mongodb://realto:realto123@207.180.239.115:27017/realtodb");

schedule.scheduleJob("*/10 * * * * *", async () => {
  console.log("Running Commercial RENT Property Match...");

  const properties = await commercialPropertyRent.find().lean();

  for (const property of properties) {
    const pLoc = property.location?.coordinates;
    if (!pLoc) continue;

    const availableFromDate = property.rent_details.available_from;

    // 1️⃣ FIND CUSTOMERS WITHIN 10km RADIUS
    const customers = await commercialCustomerRentLocation.aggregate([
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
      // RENT PRICE (Commercial = very sensitive, weight 30)
      // ------------------------------------------------
      scores.price = engine.scoreCommercialPrice(
        property.rent_details.expected_rent,
        customer.customer_rent_details.expected_rent
      );

      // ------------------------------------------------
      // DEPOSIT (Commercial Rent)
      // ------------------------------------------------
      scores.deposit = engine.scoreRentDeposit(
        property.rent_details.expected_deposit,
        customer.customer_rent_details.expected_deposit
      );

      // ------------------------------------------------
      // SIZE (Highly sensitive: weight 25)
      // ------------------------------------------------
      scores.size = engine.scoreCommercialSize(
        property.property_details.property_size,
        customer.customer_property_details.property_size
      );

      // ------------------------------------------------
      // IDEAL FOR (Commercial)
      // ------------------------------------------------
      scores.idealFor = engine.scoreIdealFor(
        property.property_details.ideal_for,
        customer.customer_property_details.property_used_for
      );

      // ------------------------------------------------
      // PROPERTY USED FOR (Commercial)
      // ------------------------------------------------
      scores.propertyUsedFor = engine.scorePropertyUsedFor(
        property.property_details.property_used_for,
        customer.customer_property_details.property_used_for
      );

      // ------------------------------------------------
      // BUILDING TYPE
      // ------------------------------------------------
      scores.buildingType = engine.scorePropertyUsedFor(
        property.property_details.building_type,
        customer.customer_property_details.building_type
      );

      // ------------------------------------------------
      // PARKING TYPE
      // ------------------------------------------------
      scores.parking = engine.scoreParking(
        property.property_details.parking_type,
        customer.customer_property_details.parking_type
      );

      // ------------------------------------------------
      // AVAILABLE FROM DATE (Commercial → 90 days range)
      // ------------------------------------------------
      scores.date = engine.scoreAvailableFrom(
        availableFromDate,
        customer.customer_rent_details.available_from,
        true // commercial
      );

      // ------------------------------------------------
      // FINAL SCORE
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

      await updateCustomerMatch(customer, property, finalScore);
    }

    await updatePropertyMatch(property, matchedMine, matchedOther);

    await commercialPropertyRent.updateOne(
      { property_id: property.property_id },
      {
        $set: {
          match_count: matchedMine.length + matchedOther.length,
        },
      }
    );
  }

  console.log("Commercial RENT Matching Completed.");
});

// -----------------------------------------------------
// HELPERS
// -----------------------------------------------------

async function updateCustomerMatch(customer, property, score) {
  const existing = await commercialRentCustomerMatch.findOne({
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

    if (customer.agent_id === property.agent_id) {
      if (!mine.some(e => e.property_id === property.property_id)) mine.push(entry);
    } else {
      if (!other.some(e => e.property_id === property.property_id)) other.push(entry);
    }

    const newCount = mine.length + other.length;

    await commercialRentCustomerMatch.updateOne(
      { customer_id: customer.customer_id },
      {
        $set: {
          matched_property_id_mine: mine,
          matched_property_id_other: other,
          match_count: newCount,
          update_date_time: new Date(),
        },
      }
    );

    await commercialPropertyCustomerRent.updateOne(
      { customer_id: customer.customer_id },
      { $set: { match_count: newCount } }
    );
  } else {
    const obj = {
      customer_id: customer.customer_id,
      agent_id: customer.agent_id,
      match_count: 1,
      matched_property_id_mine: customer.agent_id === property.agent_id ? [entry] : [],
      matched_property_id_other: customer.agent_id !== property.agent_id ? [entry] : [],
      update_date_time: new Date(),
    };

    await commercialRentCustomerMatch.create(obj);

    await commercialPropertyCustomerRent.updateOne(
      { customer_id: customer.customer_id },
      { $set: { match_count: 1 } }
    );
  }
}

async function updatePropertyMatch(property, mineArr, otherArr) {
  const existing = await commercialRentPropertyMatch.findOne({
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

    await commercialRentPropertyMatch.updateOne(
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
    await commercialRentPropertyMatch.create({
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