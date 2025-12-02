// Commercial BUY Property Match Job (MODULAR + CLEAN + UPDATED WEIGHTS)

const schedule = require("node-schedule");
const mongoose = require("mongoose");

// MODELS
const commercialPropertySell = require("../models/commercialPropertySell");
const commercialCustomerBuyLocation = require("../models/commercialCustomerBuyLocation");

const commercialBuyPropertyMatch = require("../models/match/commercialBuyPropertyMatch");
const commercialBuyCustomerMatch = require("../models/match/commercialBuyCustomerMatch");
const commercialPropertyCustomerBuy = require("../models/commercialPropertyCustomerBuy");

// SCORING ENGINE
const engine = require("./matchEngine");

// CONNECT
// mongoose.connect("mongodb://realto:realto123@207.180.239.115:27017/realtodb");

schedule.scheduleJob("*/10 * * * * *", async () => {
  console.log("Running Commercial BUY Property Match...");

  const properties = await commercialPropertySell.find().lean();

  for (const property of properties) {
    const pLoc = property.location?.coordinates;
    if (!pLoc) continue;

    const availableFromDate = property.sell_details.available_from;

    // 1️⃣ FIND CUSTOMERS WITHIN 10KM
    const customers = await commercialCustomerBuyLocation.aggregate([
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
      // LOCATION (mandatory)
      // ------------------------------------------------
      const locCheck = engine.scoreLocation(customer.distance);
      if (!locCheck.ok) continue;
      scores.location = locCheck.score;

      // ------------------------------------------------
      // COMMERCIAL BUY PRICE (very sensitive, max 30)
      // ------------------------------------------------
      scores.price = engine.scoreCommercialPrice(
        property.sell_details.expected_sell_price,
        customer.customer_buy_details.expected_buy_price
      );

      // ------------------------------------------------
      // SIZE (critical, max 25)
      // ------------------------------------------------
      scores.size = engine.scoreCommercialSize(
        property.property_details.property_size,
        customer.customer_property_details.property_size
      );

      // ------------------------------------------------
      // IDEAL FOR (commercial)
      // ------------------------------------------------
      scores.idealFor = engine.scoreIdealFor(
        property.property_details.ideal_for,
        customer.customer_property_details.property_used_for
      );

      // ------------------------------------------------
      // PROPERTY USED FOR (commercial)
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
      // AVAILABLE FROM DATE (Commercial → 90 days)
      // ------------------------------------------------
      scores.date = engine.scoreAvailableFrom(
        availableFromDate,
        customer.customer_buy_details.available_from,
        true // commercial
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

      await updateCustomerMatch(customer, property, finalScore);
    }

    await updatePropertyMatch(property, matchedMine, matchedOther);

    await commercialPropertySell.updateOne(
      { property_id: property.property_id },
      {
        $set: {
          match_count: matchedMine.length + matchedOther.length,
        },
      }
    );
  }

  console.log("Commercial BUY Matching Completed.");
});

// -----------------------------------------------------
// HELPERS
// -----------------------------------------------------

async function updateCustomerMatch(customer, property, score) {
  const existing = await commercialBuyCustomerMatch.findOne({
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

    const matchCount = mine.length + other.length;

    await commercialBuyCustomerMatch.updateOne(
      { customer_id: customer.customer_id },
      {
        $set: {
          matched_property_id_mine: mine,
          matched_property_id_other: other,
          match_count: matchCount,
          update_date_time: new Date(),
        },
      }
    );

    await commercialPropertyCustomerBuy.updateOne(
      { customer_id: customer.customer_id },
      { $set: { match_count: matchCount } }
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

    await commercialBuyCustomerMatch.create(obj);

    await commercialPropertyCustomerBuy.updateOne(
      { customer_id: customer.customer_id },
      { $set: { match_count: 1 } }
    );
  }
}

async function updatePropertyMatch(property, mineArr, otherArr) {
  const existing = await commercialBuyPropertyMatch.findOne({
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

    await commercialBuyPropertyMatch.updateOne(
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
    await commercialBuyPropertyMatch.create({
      property_id: property.property_id,
      agent_id: property.agent_id,
      matched_customer_id_mine: mineArr,
      matched_customer_id_other: otherArr,
      match_count: mineArr.length + otherArr.length,
      update_date_time: new Date(),
    });
  }
}
