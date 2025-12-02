

const CommercialCustomerBuyLocation = require("../../models/commercialCustomerBuyLocation");
const CommercialCustomerRentLocation = require("../../models/commercialCustomerRentLocation");
const CommercialBuyCustomerMatch = require('../../models/match/commercialBuyCustomerMatch');
const CommercialRentCustomerMatch = require('../../models/match/commercialRentCustomerMatch');
const User = require("../../models/user");
const CommercialPropertyCustomerRent = require("../../models/commercialPropertyCustomerRent");
const CommercialPropertyCustomerBuy = require("../../models/commercialPropertyCustomerBuy");

const logger = require('../../utils/logger');


const addNewCommercialCustomer = async (customerDetailsParam) => {
  logger.info("Prop details1: " + JSON.stringify(customerDetailsParam));
  const customerDetails = JSON.parse(JSON.stringify(customerDetailsParam));
  // logger.info("Prop details2: " + propertyDetails);
  const customerId = uniqueId();
  // get location from location_area
  const locationArray = [];
  customerDetails.customer_locality.location_area.forEach((locationData, i) => {
    logger.info(locationData.location);
    locationArray.push(locationData.location);
  });

  // const locationArray = customerDetails.customer_locality.location_area.map(locationData => ({
  //   type: "Point",
  //   coordinates: locationData.location.coordinates,
  // }));

  let commercialCustomerRentLocationDictArray = [];
  let commercialCustomerBuyLocationDictArray = [];

  const locations = customerDetails.customer_locality.location_area.map((location) => ({
    ...location,
    // customer_id: customerId, // Reference the customer
    // agent_id: customerDetails.agent_id,
  }));

  const customerDetailsDict = {
    customer_id: customerId,
    agent_id: customerDetails.agent_id,

    customer_details: {
      name: customerDetails.customer_details.name,
      mobile1: customerDetails.customer_details.mobile1,
      address: customerDetails.customer_details.address
    },
    customer_locality: {
      city: customerDetails.customer_locality.city,
      location_area: customerDetails.customer_locality.location_area,
      property_type: customerDetails.customer_locality.property_type,
      property_for: customerDetails.customer_locality.property_for,
      // pin: customerDetails.customer_locality.pin
    },

    customer_property_details: {
      building_type: customerDetails.customer_property_details.building_type,
      parking_type: customerDetails.customer_property_details.parking_type,
      property_used_for:
        customerDetails.customer_property_details.property_used_for,
      property_size: customerDetails.customer_property_details.property_size,
    },

    image_urls: ["vichi1"],
    create_date_time: new Date(Date.now()),
    update_date_time: new Date(Date.now())
  };

  if (customerDetails.customer_locality.property_type === "Commercial") {
    if (customerDetails.customer_locality.property_for === "Rent") {
      customerDetailsDict["customer_rent_details"] = {
        expected_rent: customerDetails.customer_rent_details.expected_rent,
        expected_deposit:
          customerDetails.customer_rent_details.expected_deposit,
        available_from: customerDetails.customer_rent_details.available_from
      };
      for (let location of locations) {
        const commercialCustomerRentLocationDict = {
          customer_id: customerId,
          location: location.location,
          agent_id: customerDetails.agent_id,

          customer_property_details: {
            building_type: customerDetails.customer_property_details.building_type,
            parking_type: customerDetails.customer_property_details.parking_type,
            property_used_for:
              customerDetails.customer_property_details.property_used_for,
            property_size: customerDetails.customer_property_details.property_size,
          },
          customer_rent_details: {
            expected_rent: customerDetails.customer_rent_details.expected_rent,
            expected_deposit:
              customerDetails.customer_rent_details.expected_deposit,
            available_from: customerDetails.customer_rent_details.available_from
          }


        }
        commercialCustomerRentLocationDictArray.push(commercialCustomerRentLocationDict);
      }
    } else if (customerDetails.customer_locality.property_for === "Buy") {
      customerDetailsDict["customer_buy_details"] = {
        expected_buy_price:
          customerDetails.customer_buy_details.expected_buy_price,
        available_from: customerDetails.customer_buy_details.available_from,
        negotiable: customerDetails.customer_buy_details.negotiable
      };

      for (let location of locations) {
        const commercialCustomerBuyLocationDict = {
          customer_id: customerId,
          location: location.location,
          agent_id: customerDetails.agent_id,

          customer_property_details: {
            building_type: customerDetails.customer_property_details.building_type,
            parking_type: customerDetails.customer_property_details.parking_type,
            property_used_for:
              customerDetails.customer_property_details.property_used_for,
            property_size: customerDetails.customer_property_details.property_size,
          },
          customer_buy_details: {
            expected_buy_price:
              customerDetails.customer_buy_details.expected_buy_price,
            available_from: customerDetails.customer_buy_details.available_from,
            negotiable: customerDetails.customer_buy_details.negotiable
          }


        }
        commercialCustomerBuyLocationDictArray.push(commercialCustomerBuyLocationDict);
      }
    }
  }

  if (customerDetails.customer_locality.property_for.toLowerCase() === 'rent') {

    const savedProperty = await CommercialPropertyCustomerRent.create(customerDetailsDict);
    const createdDocuments = await CommercialCustomerRentLocation.create(commercialCustomerRentLocationDictArray);

  } else if (customerDetails.customer_locality.property_for.toLowerCase() === 'buy') {
    const savedProperty = await CommercialPropertyCustomerBuy.create(customerDetailsDict);
    const createdDocuments = await CommercialCustomerBuyLocation.create(commercialCustomerBuyLocationDictArray);

  }

  return JSON.stringify(customerDetailsDict);
};




const getCommercialCustomerListings = async (agentDetailsParam) => {
  try {
    const agentDetails = JSON.parse(JSON.stringify(agentDetailsParam));
    // logger.info(JSON.stringify(req.body));
    const agent_id = agentDetails.agent_id;// works_for
    const reqUserId = agentDetails.req_user_id;// user id

    if (agent_id === reqUserId) {
      const commercialPropertyCustomerRent = await CommercialPropertyCustomerRent.find({ agent_id: agent_id }).lean().exec();
      const commercialPropertyCustomerBuy = await CommercialPropertyCustomerBuy.find({ agent_id: agent_id }).lean().exec();

      const data = [...commercialPropertyCustomerRent, ...commercialPropertyCustomerBuy];

      logger.info("ResidentialPropertyCustomer: ", JSON.stringify(data));
      return data;

    } else if (agent_id !== reqUserId) {
      const empObj = await User.findOne({ id: reqUserId }).lean().exec();
      const commercialPropertyCustomerRentIds = empObj.assigned_commercial_rent_customers;
      const commercialPropertyCustomerBuyIds = empObj.assigned_commercial_buy_customers;
      const commercialPropertyCustomerRent = await CommercialPropertyCustomerRent.find({ customer_id: { $in: commercialPropertyCustomerRentIds } }).lean().exec();
      const commercialPropertyCustomerBuy = await CommercialPropertyCustomerBuy.find({ customer_id: { $in: commercialPropertyCustomerBuyIds } }).lean().exec();
      const data = [...commercialPropertyCustomerRent, ...commercialPropertyCustomerBuy];
      logger.info("ResidentialPropertyCustomer: ", JSON.stringify(data));
      return data;
    }



  } catch (err) {
    console.error(err);
    return "Internal Server Error";
  }
};



const deleteCommercialCustomer = async (reqDataParam) => {
  logger.info(JSON.stringify(reqDataParam));
  const reqData = JSON.parse(JSON.stringify(reqDataParam));
  const reqUserId = reqData.req_user_id;
  const itemToDelete = reqData.dataToDelete;
  const customerId = itemToDelete.customer_id;
  const customerAgentId = itemToDelete.agent_id;
  // first check if request user is agent or employee
  // if agent he can delete the customer
  // if employee then he can delete if he has admin right
  const user = await User.findOne({ id: reqUserId }).lean().exec();
    if (user) {
    // checks if reqUserId works for customerAgentId    
    if (user.works_for !== customerAgentId) {
      logger.info("Unauthorized access: User does not work for the customer agent");
      return "Unauthorized access";
    }
  }
  if ((user.user_type === "agent" && reqUserId === customerAgentId)
    || (user.user_type === "employee" && user.employee_role === "admin")) {
    // User is an agent or an employee with admin rights
    try {
      // Delete the customer from CommercialPropertyCustomerRent and CommercialPropertyCustomerBuy collections
      if (itemToDelete.customer_locality.property_type === "Commercial" && itemToDelete.customer_locality.property_for === "Rent") {
        await CommercialPropertyCustomerRent.deleteOne({ customer_id: customerId });
        // Also delete from the match collections if they exist
        await CommercialRentCustomerMatch.deleteMany({ customer_id: customerId });
      } else if (itemToDelete.customer_locality.property_type === "Commercial" && itemToDelete.customer_locality.property_for === "Buy") {
        await CommercialPropertyCustomerBuy.deleteOne({ customer_id: customerId });
        // Also delete from the match collections if they exist
        await CommercialBuyCustomerMatch.deleteMany({ customer_id: customerId });
      }
        logger.info("Customer deleted successfully");
        return "success";
    } catch (err) {
      logger.error(`Error deleting customer: ${err}`);
        return "Internal Server Error";
    }
  } else {
    logger.info("Unauthorized access");
    return "Unauthorized access";
  }
};

const closeCommercialCustomer = async (reqDataParam) => {
  logger.info(JSON.stringify(reqDataParam));
  const reqData = JSON.parse(JSON.stringify(reqDataParam));
  const reqUserId = reqData.req_user_id;
  const itemToClose = reqData.dataToClose;
  const customerId = itemToClose.customer_id;
  const customerAgentId = itemToClose.agent_id;
  const customerStaus = itemToClose.customer_status;
  var newStaus = 0;
  if (customerStaus === 0) {
    newStaus = 1;
  } else {
    newStaus = 0;
  }
  // first check if request user is agent or employee
  // if agent he can delete the customer
  // if employee then he can delete if he has admin right
  const user = await User.findOne({ id: reqUserId }).lean().exec();
  if (user) {
    // checks if reqUserId works for customerAgentId    
    if (user.works_for !== customerAgentId) {
      logger.info("Unauthorized access: User does not work for the customer agent");
      return "Unauthorized access";
    }
  }
  if ((user.user_type === "agent" && reqUserId === customerAgentId)
    || (user.user_type === "employee")) {
    // User is an agent or an employee with admin rights
    try {
      // Delete the customer from CommercialPropertyCustomerRent and CommercialPropertyCustomerBuy collections
      if (itemToClose.customer_locality.property_type === "Commercial" && itemToClose.customer_locality.property_for === "Rent") {

        const result = await CommercialPropertyCustomerRent.updateOne(
          // Filter
          { customer_id: customerId },
          // Update
          {
            $set: {
              customer_status: newStaus,// Mark as closed
              is_close_successfully: "yes",
              update_date_time: new Date() // Optional: Update the timestamp
            }
          }
        );
        console.log("Update result:", result);
        // Also delete from the match collections if they exist
        // await CommercialRentCustomerMatch.deleteMany({ customer_id: customerId });
      } else if (itemToClose.customer_locality.property_type === "Commercial" && itemToClose.customer_locality.property_for === "Buy") {

        const result = await CommercialPropertyCustomerBuy.updateOne(
          // Filter
          { customer_id: customerId },
          // Update
          {
            $set: {
              customer_status: newStaus,// Mark as closed
              is_close_successfully: "yes",
              update_date_time: new Date() // Optional: Update the timestamp
            }
          }
        );
        console.log("Update result:", result);
        // Also delete from the match collections if they exist
        // await CommercialBuyCustomerMatch.deleteMany({ customer_id: customerId });
      }
      logger.info("Customer deleted successfully");
      return "success";
    } catch (err) {
      logger.error(`Error deleting customer: ${err}`);
      return "Internal Server Error";
    }
  } else {
    logger.info("Unauthorized access");
    return "Unauthorized access";
  }
};
module.exports = {
  addNewCommercialCustomer,
  getCommercialCustomerListings,
  deleteCommercialCustomer,
  closeCommercialCustomer
};