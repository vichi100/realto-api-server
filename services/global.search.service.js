
const CommercialPropertyRent = require("../models/commercialPropertyRent");
const CommercialPropertySell = require("../models/commercialPropertySell");

const CommercialCustomerBuyLocation = require("../models/commercialCustomerBuyLocation");
const CommercialCustomerRentLocation = require("../models/commercialCustomerRentLocation");

// UNCOMMENT THIS LINE LATER FOR PRODUCTION, FIX THIS
const CommercialBuyPropertyMatch = require('../models/match/commercialBuyPropertyMatch'); // UNCOMMENT THIS LINE LATER FOR PRODUCTION, FIX THIS
const CommercialBuyCustomerMatch = require('../models/match/commercialBuyCustomerMatch');

const CommercialRentPropertyMatch = require('../models/match/commercialRentPropertyMatch');
const CommercialRentCustomerMatch = require('../models/match/commercialRentCustomerMatch');

const ResidentialPropertyRent = require("../models/residentialPropertyRent");
const ResidentialPropertySell = require("../models/residentialPropertySell");

const ResidentialCustomerBuyLocation = require("../models/residentialCustomerBuyLocation");
const ResidentialCustomerRentLocation = require("../models/residentialCustomerRentLocation");

const ResidentialRentPropertyMatch = require('../models/match/residentialRentPropertyMatch');
const ResidentialBuyPropertyMatchBuy = require('../models/match/residentialBuyPropertyMatch');
// const ResidentialBuyCustomerMatch = require('./models/match/residentialBuyCustomerMatch');
const ResidentialRentCustomerMatch = require('../models/match/residentialRentCustomerMatch');
const ResidentialBuyCustomerMatch = require('../models/match/residentialBuyCustomerMatch');


// const ResidentialPropertyCustomer = require("../models/residentialPropertyCustomer");
const ResidentialPropertyCustomerRent = require("../models/residentialPropertyCustomerRent");
const ResidentialPropertyCustomerBuy = require("../models/residentialPropertyCustomerBuy");
const CommercialPropertyCustomerRent = require("../models/commercialPropertyCustomerRent");
const CommercialPropertyCustomerBuy = require("../models/commercialPropertyCustomerBuy");

const logger = require('../utils/logger');


const getGlobalSearchResult = async (searchObjParam) => {
  logger.info(JSON.stringify(searchObjParam));
  const obj = JSON.parse(JSON.stringify(searchObjParam));
  const reqUserId = obj.req_user_id;
  const minePropertyList = [];
  const otherPropertyList = []; // Other agents property list
  const mineCustomerList = [];
  const otherCustomerList = []; // Other agents customer list
  try {
    if (obj.lookingFor.trim().toLowerCase() === "property".trim().toLowerCase()) {
      if (obj.whatType.trim().toLowerCase() === "residential".trim().toLowerCase()) {
        const gLocations = obj.selectedLocationArray;
        // Create an array of coordinates objects
        const coordinatesArray = gLocations.map((gLocation) => gLocation.location.coordinates);

        logger.info(coordinatesArray);

        // Convert 5 miles to radians (Earth's radius is approximately 3963.2 miles)
        const radiusInMiles = 55;
        const radiusInRadians = radiusInMiles / 3963.2;

        // Create an array of geospatial queries for each location
        const locationQueries = coordinatesArray.map((coordinates) => ({
          location: {
            $geoWithin: {
              $centerSphere: [coordinates, radiusInRadians],
            },
          },
        }));

        let residentialPropertyData = [];
        let query = null;
        let matchDocument = null;
        // Combined query
        if (obj.purpose.trim().toLowerCase() === "Rent".trim().toLowerCase()) {
          query = {
            $or: locationQueries,
            property_for: "Rent",//obj.purpose,
            // property_status: "1",
            "property_address.city": obj.city,
            "property_details.bhk_type": { $in: obj.selectedBHK }, //{ $in: obj.selectedBHK }, // Filter by bhk_type
            "rent_details.expected_rent": {
              $gte: obj.priceRange[0] || 0, // Greater than or equal to min price
              $lte: obj.priceRange[1] || Infinity, // Less than or equal to max price
            },
            // $expr: {
            //   $lte: [
            //     { $dateFromString: { dateString: "$rent_details.available_from" } }, // Convert string to Date
            //     new Date(obj.reqWithin) // Compare with reqWithin date
            //   ]
            // },
            $expr: {
              $lte: [
                "$rent_details.available_from", // The field is already a Date object
                new Date(obj.reqWithin) // Compare with reqWithin date
              ]
            },
            "rent_details.preferred_tenants": obj.tenant,
          };

          // Use await to wait for the database query to complete
          residentialPropertyData = await ResidentialPropertyRent.find(query).lean().exec();
          if (residentialPropertyData.length === 0) {
            // If no results found, modify the query to search for properties with similar BHK types
            query = {
              $or: locationQueries,
              property_for: "Rent",//obj.purpose,
              // property_status: "1",
              "property_address.city": obj.city,
              "property_details.bhk_type": { $in: obj.selectedBHK }, //{ $in: obj.selectedBHK }, // Filter by bhk_type
              "rent_details.expected_rent": {
                $gte: obj.priceRange[0] || 0, // Greater than or equal to min price
                $lte: obj.priceRange[1] || Infinity, // Less than or equal to max price
              },

            };
            residentialPropertyData = await ResidentialPropertyRent.find(query).lean().exec();
          }
          matchDocument = ResidentialRentPropertyMatch;

        } else if (obj.purpose.trim().toLowerCase() === "Buy".trim().toLowerCase()) {
          query = {
            $or: locationQueries,
            property_for: "Sell",//obj.purpose,
            // property_status: "1",
            "property_address.city": obj.city,
            "property_details.bhk_type": { $in: obj.selectedBHK }, //{ $in: obj.selectedBHK }, // Filter by bhk_type
            "sell_details.expected_sell_price": {
              $gte: obj.priceRangeCr[0] || 0, // Greater than or equal to min price
              $lte: obj.priceRangeCr[1] || Infinity, // Less than or equal to max price
            },
            // "rent_details.available_from": obj.reqWithin,
            // "rent_details.preferred_tenants": obj.tenant,
          };

          residentialPropertyData = await ResidentialPropertySell.find(query).lean().exec();
          matchDocument = ResidentialBuyPropertyMatchBuy;

        }

        // Merge the two arrays
        const allProperties = [...residentialPropertyData];
        for (let property of allProperties) {
          if (property.agent_id === reqUserId) {
            minePropertyList.push(property);
          } else {
            otherPropertyList.push(property);
          }
        }

        for (let property of otherPropertyList) {
          const result = await matchDocument.aggregate([
            {
              $match: {
                property_id: property.property_id // Filter by property_id first
              }
            },
            {
              $unwind: "$matched_customer_id_other"
            },
            {
              $match: {
                "matched_customer_id_other.agent_id": reqUserId // Filter by agent_id
              }
            },
            {
              $count: "count"
            }
          ]);
          property.match_count = result[0].count;
          logger.info(result);
        }

        const otherPropertyDataAfterMasking = await replaceOwnerDetailsWithAgentDetails(otherPropertyList, reqUserId);
        const allPropertiesData = [...minePropertyList, ...otherPropertyDataAfterMasking];

        logger.info(JSON.stringify(allPropertiesData));
        return allPropertiesData;


      } else if (obj.whatType.trim().toLowerCase() === "commercial".trim().toLowerCase()) {

        const gLocations = obj.selectedLocationArray;
        // Create an array of coordinates objects
        const coordinatesArray = gLocations.map((gLocation) => gLocation.location.coordinates);

        logger.info(coordinatesArray);

        // Convert 5 miles to radians (Earth's radius is approximately 3963.2 miles)
        const radiusInMiles = 55;
        const radiusInRadians = radiusInMiles / 3963.2;

        // Create an array of geospatial queries for each location
        const locationQueries = coordinatesArray.map((coordinates) => ({
          location: {
            $geoWithin: {
              $centerSphere: [coordinates, radiusInRadians],
            },
          },
        }));

        let residentialPropertyData = [];
        let query = null;
        let matchDocument = null;

        if (obj.purpose.trim().toLowerCase() === "Rent".trim().toLowerCase()) {

          // Combined query
          query = {
            $or: locationQueries,
            property_for: "Rent",//obj.purpose,
            // property_status: "1",
            "property_address.city": obj.city,
            "property_details.property_used_for": { $in: obj.selectedRequiredFor },
            "property_details.building_type": { $in: obj.selectedBuildingType },
            "rent_details.expected_rent": {
              $gte: obj.priceRange[0] || 0, // Greater than or equal to min price
              $lte: obj.priceRange[1] || Infinity, // Less than or equal to max price
            },
            $expr: {
              $lte: [
                "$rent_details.available_from", // The field is already a Date object
                new Date(obj.reqWithin) // Compare with reqWithin date
              ]
            },
            // "rent_details.preferred_tenants": obj.tenant,
          };

          // Use await to wait for the database query to complete
          residentialPropertyData = await CommercialPropertyRent.find(query).lean().exec();
          if (residentialPropertyData.length === 0) {
            // If no results found, modify the query to search for properties with similar Required For
            query = {
              $or: locationQueries,
              property_for: "Rent",//obj.purpose,
              // property_status: "1",
              "property_address.city": obj.city,
              "property_details.property_used_for": { $in: obj.selectedRequiredFor },
              "property_details.building_type": { $in: obj.selectedBuildingType },
              "rent_details.expected_rent": {
                $gte: obj.priceRange[0] || 0, // Greater than or equal to min price
                $lte: obj.priceRange[1] || Infinity, // Less than or equal to max price
              },

            };
            residentialPropertyData = await CommercialPropertyRent.find(query).lean().exec();
          }
          matchDocument = CommercialRentPropertyMatch;

        } else if (obj.purpose.trim().toLowerCase() === "Buy".trim().toLowerCase()) {
          // Combined query
          query = {
            $or: locationQueries,
            property_for: "Sell",//obj.purpose,
            // property_status: "1",
            "property_address.city": obj.city,
            "property_details.property_used_for": { $in: obj.selectedRequiredFor },
            "property_details.building_type": { $in: obj.selectedBuildingType },
            "sell_details.expected_sell_price": {
              $gte: obj.priceRangeCr[0] || 0, // Greater than or equal to min price
              $lte: obj.priceRangeCr[1] || Infinity, // Less than or equal to max price
            },
            // "rent_details.available_from": obj.reqWithin,
            // "rent_details.preferred_tenants": obj.tenant,
          };

          // Use await to wait for the database query to complete
          residentialPropertyData = await CommercialPropertySell.find(query).lean().exec();
          matchDocument = CommercialBuyPropertyMatch;
        }

        // const residentialPropertySellData = await ResidentialPropertySell.find(query).exec();

        // Merge the two arrays
        const allProperties = [...residentialPropertyData];
        for (let property of allProperties) {
          if (property.agent_id === reqUserId) {
            minePropertyList.push(property);
          } else {
            otherPropertyList.push(property);
          }
        }

        for (let property of otherPropertyList) {
          const result = await matchDocument.aggregate([
            {
              $match: {
                property_id: property.property_id // Filter by property_id first
              }
            },
            {
              $unwind: "$matched_customer_id_other"
            },
            {
              $match: {
                "matched_customer_id_other.agent_id": reqUserId // Filter by agent_id
              }
            },
            {
              $count: "count"
            }
          ]);
          property.match_count = result[0].count;
          logger.info(result);
        }

        const otherPropertyDataAfterMasking = await replaceOwnerDetailsWithAgentDetails(otherPropertyList, reqUserId);
        const allPropertiesData = [...minePropertyList, ...otherPropertyDataAfterMasking];

        logger.info(JSON.stringify(allPropertiesData));
        return allPropertiesData;


      }
    } else if (obj.lookingFor.trim().toLowerCase() === "customer".trim().toLowerCase()) {
      if (obj.whatType.trim().toLowerCase() === "residential".trim().toLowerCase()) {
        const gLocations = obj.selectedLocationArray;
        // Create an array of coordinates objects
        const coordinatesArray = gLocations.map((gLocation) => gLocation.location.coordinates);

        logger.info(coordinatesArray);

        // Convert 5 miles to radians (Earth's radius is approximately 3963.2 miles)
        const radiusInMiles = 55;
        const radiusInRadians = radiusInMiles / 3963.2;

        // Create an array of geospatial queries for each location
        const locationQueries = coordinatesArray.map((coordinates) => ({
          location: {
            $geoWithin: {
              $centerSphere: [coordinates, radiusInRadians],
            },
          },
        }));

        // 1) find customer id from residential_customer_rent_location
        // 2) use those customer id to find customer details and apply filter

        // Combined query
        const locationQuery = {
          $or: locationQueries, // Geospatial queries for locations
        };

        let residentialCustomerLocations = [];
        let customerIds = [];
        let residentialCustomerData = [];
        let matchDocument = null;

        if (obj.purpose.trim().toLowerCase() === "Rent".trim().toLowerCase()) {
          // Find customer IDs from residential_customer_rent_location
          residentialCustomerLocations = await ResidentialCustomerRentLocation.find(
            locationQuery, // Query filter
            { customer_id: 1 }// Projection
          ).lean().exec();

          // Extract customer IDs
          customerIds = residentialCustomerLocations.map(location => location.customer_id);
          // Use these customer IDs to find customer details
          residentialCustomerData = await ResidentialPropertyCustomerRent.find({
            customer_id: { $in: customerIds },
            "customer_locality.city": obj.city, // Filter by city
            "customer_property_details.bhk_type": { $in: ["2BHK"] }, // Filter by BHK type
            "customer_rent_details.expected_rent": {
              $gte: obj.priceRange[0] || 0, // Greater than or equal to min price
              $lte: obj.priceRange[1] || Infinity, // Less than or equal to max price
            },
            // "customer_rent_details.available_from": obj.reqWithin,
            $expr: {
              $lte: [
                "$rent_details.available_from", // The field is already a Date object
                new Date(obj.reqWithin) // Compare with reqWithin date
              ]
            },
          }).lean().exec();

          if (residentialCustomerData.length === 0) {
            // If no results found, modify the query to search for customers with similar BHK types
            residentialCustomerData = await ResidentialPropertyCustomerRent.find({
              customer_id: { $in: customerIds },
              "customer_locality.city": obj.city, // Filter by city
              "customer_property_details.bhk_type": { $in: ["2BHK"] }, // Filter by BHK type
              "customer_rent_details.expected_rent": {
                $gte: obj.priceRange[0] || 0, // Greater than or equal to min price
                $lte: obj.priceRange[1] || Infinity, // Less than or equal to max price
              },
            }).lean().exec();
          }

          matchDocument = ResidentialRentCustomerMatch;


        } else if (obj.purpose.trim().toLowerCase() === "Buy".trim().toLowerCase()) {
          // Find customer IDs from residential_customer_rent_location
          residentialCustomerLocations = await ResidentialCustomerBuyLocation.find(
            locationQuery, // Query filter
            { customer_id: 1 }// Projection
          ).lean().exec();
          // Extract customer IDs
          customerIds = residentialCustomerLocations.map(location => location.customer_id);
          // Use these customer IDs to find customer details
          residentialCustomerData = await ResidentialPropertyCustomerBuy.find({
            customer_id: { $in: customerIds },
            "customer_locality.city": obj.city, // Filter by city
            "customer_property_details.bhk_type": { $in: ["2BHK"] }, // Filter by BHK type
            "customer_buy_details.expected_buy_price": {
              $gte: obj.priceRange[0] || 0, // Greater than or equal to min price
              $lte: obj.priceRange[1] || Infinity, // Less than or equal to max price
            },
            // "customer_rent_details.available_from": obj.reqWithin,
          }).lean().exec();

          matchDocument = ResidentialBuyCustomerMatch;

        }






        const allCustomers = [...residentialCustomerData];
        for (let customer of allCustomers) {
          if (customer.agent_id === reqUserId) {
            mineCustomerList.push(customer);
          } else {
            otherCustomerList.push(customer);
          }
        }

        for (let customer of otherCustomerList) {
          const result = await matchDocument.aggregate([
            {
              $match: {
                customer_id: customer.customer_id // Filter by customer_id first
              }
            },
            {
              $unwind: "$matched_property_id_other"
            },
            {
              $match: {
                "matched_property_id_other.agent_id": reqUserId // Filter by agent_id
              }
            },
            {
              $count: "count"
            }
          ]);
          customer.match_count = result[0].count;
          logger.info(result);
        }


        const otherCustomerDataAfterMasking = await replaceCustomerDetailsWithAgentDetails(otherCustomerList, reqUserId);
        const allCustomersData = [...mineCustomerList, ...otherCustomerDataAfterMasking];

        logger.info(JSON.stringify(allCustomersData));
        return allCustomersData;
      } else if (obj.whatType.trim().toLowerCase() === "commercial".trim().toLowerCase()) {

        const gLocations = obj.selectedLocationArray;
        // Create an array of coordinates objects
        const coordinatesArray = gLocations.map((gLocation) => gLocation.location.coordinates);

        logger.info(coordinatesArray);

        // Convert 5 miles to radians (Earth's radius is approximately 3963.2 miles)
        const radiusInMiles = 55;
        const radiusInRadians = radiusInMiles / 3963.2;

        // Create an array of geospatial queries for each location
        const locationQueries = coordinatesArray.map((coordinates) => ({
          location: {
            $geoWithin: {
              $centerSphere: [coordinates, radiusInRadians],
            },
          },
        }));

        // 1) find customer id from residential_customer_rent_location
        // 2) use those customer id to find customer details and apply filter

        // Combined query
        const customerLocationQuery = {
          $or: locationQueries, // Geospatial queries for locations
        };
        let customerLocations = [];
        let customerIds = [];
        let customerData = [];
        let matchDocument = null;

        if (obj.purpose.trim().toLowerCase() === "Rent".trim().toLowerCase()) {
          // Find customer IDs from residential_customer_rent_location
          customerLocations = await CommercialCustomerRentLocation.find(customerLocationQuery, { customer_id: 1 }).lean().exec();

          // Extract customer IDs
          customerIds = customerLocations.map(location => location.customer_id);

          // Use these customer IDs to find customer details
          customerData = await CommercialPropertyCustomerRent.find({
            customer_id: { $in: customerIds },
            "customer_locality.city": obj.city, // Filter by city
            "customer_property_details.property_used_for": { $in: ["Shop"] }, // Filter by BHK type
            "customer_rent_details.expected_rent": {
              $gte: obj.priceRange[0] || 0, // Greater than or equal to min price
              $lte: obj.priceRange[1] || Infinity, // Less than or equal to max price
            },
            // "customer_rent_details.available_from": obj.reqWithin,
            $expr: {
              $lte: [
                "$rent_details.available_from", // The field is already a Date object
                new Date(obj.reqWithin) // Compare with reqWithin date
              ]
            },

          }).lean().exec();
          matchDocument = CommercialRentCustomerMatch;

        } else if (obj.purpose.trim().toLowerCase() === "Buy".trim().toLowerCase()) {
          // Find customer IDs from residential_customer_rent_location
          customerLocations = await CommercialCustomerBuyLocation.find(customerLocationQuery, { customer_id: 1 }).lean().exec();
          // Extract customer IDs
          customerIds = customerLocations.map(location => location.customer_id);
          // Use these customer IDs to find customer details
          customerData = await CommercialPropertyCustomerBuy.find({
            customer_id: { $in: customerIds },
            "customer_locality.city": obj.city, // Filter by city
            "customer_property_details.property_used_for": { $in: ["Shop"] }, // Filter by BHK type
            "customer_buy_details.expected_buy_price": {
              $gte: obj.priceRange[0] || 0, // Greater than or equal to min price
              $lte: obj.priceRange[1] || Infinity, // Less than or equal to max price
            },
            // "customer_rent_details.available_from": obj.reqWithin, 
          }).lean().exec();
          matchDocument = CommercialBuyCustomerMatch;

        }

        const allCustomers = [...customerData];
        for (let customer of allCustomers) {
          if (customer.agent_id === reqUserId) {
            mineCustomerList.push(customer);
          } else {
            otherCustomerList.push(customer);
          }
        }

        for (let customer of otherCustomerList) {
          const result = await matchDocument.aggregate([
            {
              $match: {
                customer_id: customer.customer_id // Filter by customer_id first
              }
            },
            {
              $unwind: "$matched_property_id_other"
            },
            {
              $match: {
                "matched_property_id_other.agent_id": reqUserId // Filter by agent_id
              }
            },
            {
              $count: "count"
            }
          ]);
          customer.match_count = result[0].count;
          logger.info(result);
        }


        const otherCustomerDataAfterMasking = await replaceCustomerDetailsWithAgentDetails(otherCustomerList, reqUserId);
        const allCustomersData = [...mineCustomerList, ...otherCustomerDataAfterMasking];

        logger.info(JSON.stringify(allCustomersData));
        return allCustomersData;
      }

    }

  } catch (err) {
    console.error(err);
    return { error: "Internal Server Error", details: err };
  }
};

const getAllGlobalListingByLocations = async (queryObjParam) => {
  logger.info("getAllGlobalListingByLocations: " + JSON.stringify(queryObjParam));
  const queryObj = JSON.parse(JSON.stringify(queryObjParam));
  const selectedTab = queryObj.selectedTab; // property=0, customer=1
  const propertyTypeIndex = queryObj.propertyTypeIndex; // Residential=0, Commercial=1
  // first get all location of this agent's listings including property and customer
  let queryDoc;
  let condition;
  if (selectedTab === 0) {
    condition = {
      "property_address.location_area": { $in: ["Andheri west", "Malad"] }
    };
    if (propertyTypeIndex === 0) {
      queryDoc = ResidentialProperty;
    } else if (propertyTypeIndex === 1) {
      queryDoc = CommercialProperty;
    }
  } else if (selectedTab === 1) {
    condition = {
      "customer_locality.location_area": {
        $in: ["Bandra", "And hero west", "Jogeshwari", "Powai"]
      }
    };
    if (propertyTypeIndex === 0) {
      queryDoc = ResidentialPropertyCustomer;
    } else if (propertyTypeIndex === 1) {
      queryDoc = CommercialPropertyCustomer;
    }
  }
  try {
    const data = await queryDoc.find().lean().exec();
    return data;
  } catch (err) {
    logger.info(err);
    return null;
  }
};
// searchResidentResult() // **Helper function**

module.exports = {
  getGlobalSearchResult,
  getAllGlobalListingByLocations,
};