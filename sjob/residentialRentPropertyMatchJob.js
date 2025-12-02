// Residential Rent Property Match Job (MODULAR + CLEAN VERSION)

const schedule = require("node-schedule");
const mongoose = require("mongoose");

const residentialPropertyRent = require("../models/residentialPropertyRent");
const residentialCustomerRentLocation = require("../models/residentialCustomerRentLocation");

const residentialRentPropertyMatch = require("../models/match/residentialRentPropertyMatch");
const residentialRentCustomerMatch = require("../models/match/residentialRentCustomerMatch");
const ResidentialPropertyCustomerRent = require("../models/residentialPropertyCustomerRent");

const engine = require("./matchEngine");
const logger = require('../utils/logger');

// Connect to MongoDB
// mongoose.connect("mongodb://realto:realto123@207.180.239.115:27017/realtodb");

schedule.scheduleJob("*/10 * * * * *", async () => {
  console.log("Running Residential Rent Property Match...");

  const properties = await residentialPropertyRent.find().lean();

  for (const property of properties) {
    const pLoc = property.location?.coordinates;
    if (!pLoc) continue;

    const availableFromDate = property.rent_details.available_from;

    // 1. Find customers within 10km radius
    const customers = await residentialCustomerRentLocation.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: pLoc },
          distanceField: "distance",
          maxDistance: engine.LOCATION_RADIUS_METERS,
          spherical: true,
        },
      }
    ]);

    // FINAL MATCH LISTS
    const matchedCustomerMine = [];
    const matchedCustomerOther = [];

    for (const customer of customers) {
      const scores = {};

      // ---------------------------------------------------------
      // LOCATION SCORE (Mandatory)
      // ---------------------------------------------------------
      const locCheck = engine.scoreLocation(customer.distance);
      if (!locCheck.ok) continue;
      scores.location = locCheck.score;

      // ---------------------------------------------------------
      // BHK SCORE (Residential sensitivity)
      // ---------------------------------------------------------
      scores.bhk = engine.scoreBHK(
        property.property_details.bhk_type,
        customer.customer_property_details.bhk_type
      );

      // ---------------------------------------------------------
      // RENT PRICE SCORE (More sensitive)
      // ---------------------------------------------------------
      scores.price = engine.scoreRentPrice(
        property.rent_details.expected_rent,
        customer.customer_rent_details.expected_rent
      );

      // ---------------------------------------------------------
      // DEPOSIT SCORE
      // ---------------------------------------------------------
      scores.deposit = engine.scoreRentDeposit(
        property.rent_details.expected_deposit,
        customer.customer_rent_details.expected_deposit
      );

      // ---------------------------------------------------------
      // PREFERRED TENANTS
      // ---------------------------------------------------------
      scores.preferredTenant = engine.scoreRentPreferredTenants(
        property.rent_details.preferred_tenants,
        customer.customer_rent_details.preferred_tenants
      );

      // ---------------------------------------------------------
      // NON VEG
      // ---------------------------------------------------------
      scores.nonVeg = engine.scoreRentNonVeg(
        property.rent_details.non_veg_allowed,
        customer.customer_rent_details.non_veg_allowed
      );

      // ---------------------------------------------------------
      // FURNISHING
      // ---------------------------------------------------------
      scores.furnish = engine.scoreFurnishing(
        property.property_details.furnishing_status,
        customer.customer_property_details.furnishing_status
      );

      // ---------------------------------------------------------
      // PARKING
      // ---------------------------------------------------------
      scores.parking = engine.scoreParking(
        property.property_details.parking_type,
        customer.customer_property_details.parking_type
      );

      // ---------------------------------------------------------
      // DATE MATCH
      // ---------------------------------------------------------
      scores.date = engine.scoreAvailableFrom(
        availableFromDate,
        customer.customer_rent_details.available_from,
        false // residential
      );

      // ---------------------------------------------------------
      // COMPUTE FINAL SCORE
      // ---------------------------------------------------------
      const finalScore = engine.computeFinalScore(scores);
      if (finalScore < engine.MIN_SCORE_THRESHOLD) continue;

      const customerEntry = {
        customer_id: customer.customer_id,
        agent_id: customer.agent_id,
        distance: customer.distance,
        matched_percentage: Math.ceil(finalScore)
      };

      if (customer.agent_id === property.agent_id) {
        matchedCustomerMine.push(customerEntry);
      } else {
        matchedCustomerOther.push(customerEntry);
      }

      // ---------------------------------------------------------
      // UPDATE CUSTOMER → MATCHED PROPERTIES LIST
      // ---------------------------------------------------------
      await updateCustomerMatch(customer, property, finalScore);
    }

    // ---------------------------------------------------------
    // UPDATE PROPERTY → MATCHED CUSTOMERS LIST
    // ---------------------------------------------------------
    await updatePropertyMatch(property, matchedCustomerMine, matchedCustomerOther);

    // ---------------------------------------------------------
    // UPDATE PROPERTY MATCH COUNT (MAIN COLLECTION)
    // ---------------------------------------------------------
    await residentialPropertyRent.updateOne(
      { property_id: property.property_id },
      {
        $set: {
          match_count: matchedCustomerMine.length + matchedCustomerOther.length
        }
      }
    );
  }

  console.log("Residential Rent Matching Completed.");
});

// -----------------------------------------------------
// HELPERS
// -----------------------------------------------------

async function updateCustomerMatch(customer, property, score) {
  const existing = await residentialRentCustomerMatch.findOne({
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
      if (!mine.some(e => e.property_id === property.property_id)) {
        mine.push(entry);
      }
    } else {
      if (!other.some(e => e.property_id === property.property_id)) {
        other.push(entry);
      }
    }

    await residentialRentCustomerMatch.updateOne(
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

    await ResidentialPropertyCustomerRent.updateOne(
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

    await residentialRentCustomerMatch.create(obj);

    await ResidentialPropertyCustomerRent.updateOne(
      { customer_id: customer.customer_id },
      { $set: { match_count: 1 } }
    );
  }
}

async function updatePropertyMatch(property, mineArr, otherArr) {
  const existing = await residentialRentPropertyMatch.findOne({
    property_id: property.property_id,
  });

  if (existing) {
    const mine = existing.matched_customer_id_mine;
    const other = existing.matched_customer_id_other;

    // merge uniques
    mineArr.forEach(c => {
      if (!mine.some(m => m.customer_id === c.customer_id)) mine.push(c);
    });
    otherArr.forEach(c => {
      if (!other.some(m => m.customer_id === c.customer_id)) other.push(c);
    });

    await residentialRentPropertyMatch.updateOne(
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
    await residentialRentPropertyMatch.create({
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