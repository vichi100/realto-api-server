

const ResidentialCustomerBuyLocation = require("../../models/residentialCustomerBuyLocation");
const ResidentialCustomerRentLocation = require("../../models/residentialCustomerRentLocation");
const ResidentialRentCustomerMatch = require('../../models/match/residentialRentCustomerMatch');
const ResidentialBuyCustomerMatch = require('../../models/match/residentialBuyCustomerMatch');
const User = require("../../models/user");
const ResidentialPropertyCustomerRent = require("../../models/residentialPropertyCustomerRent");
const ResidentialPropertyCustomerBuy = require("../../models/residentialPropertyCustomerBuy");



const addNewResidentialCustomer = async (customerDetailsParam) => {
  logger.info("Prop details1: " + JSON.stringify(customerDetailsParam));
  const customerDetails = JSON.parse(JSON.stringify(customerDetailsParam));
  // logger.info("Prop details2: " + propertyDetails);
  const customerId = uniqueId();
  let residentialCustomerRentLocationDictArray = [];
  let residentialCustomerBuyLocationDictArray = [];
  // get location from location_area
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
      preferred_tenants: customerDetails.customer_locality.preferred_tenants
    },

    customer_property_details: {
      house_type: customerDetails.customer_property_details.house_type,
      bhk_type: customerDetails.customer_property_details.bhk_type,
      furnishing_status:
        customerDetails.customer_property_details.furnishing_status,
      parking_type: customerDetails.customer_property_details.parking_type,
      lift: customerDetails.customer_property_details.lift
    },

    image_urls: ["vichi1"],
    create_date_time: new Date(Date.now()),
    update_date_time: new Date(Date.now())
  };

  if (customerDetails.customer_locality.property_type === "Residential") {
    if (customerDetails.customer_locality.property_for === "Rent") {
      customerDetailsDict["customer_rent_details"] = {
        expected_rent: customerDetails.customer_rent_details.expected_rent,
        expected_deposit:
          customerDetails.customer_rent_details.expected_deposit,
        available_from: customerDetails.customer_rent_details.available_from,

      };

      for (let location of locations) {
        const residentialCustomerRentLocationDict = {
          customer_id: customerId,
          location: location.location,
          agent_id: customerDetails.agent_id,
          customer_property_details: {
            house_type: customerDetails.customer_property_details.house_type,
            bhk_type: customerDetails.customer_property_details.bhk_type,
            furnishing_status:
              customerDetails.customer_property_details.furnishing_status,
            parking_type: customerDetails.customer_property_details.parking_type,
          },

          customer_rent_details: {
            expected_rent: customerDetails.customer_rent_details.expected_rent,
            expected_deposit:
              customerDetails.customer_rent_details.expected_deposit,
            available_from: customerDetails.customer_rent_details.available_from,
            preferred_tenants: customerDetails.customer_locality.preferred_tenants
          },
        }
        residentialCustomerRentLocationDictArray.push(residentialCustomerRentLocationDict);
      }
      // for each loaction there will be one entry

    } else if (customerDetails.customer_locality.property_for === "Buy") {
      customerDetailsDict["customer_buy_details"] = {
        expected_buy_price:
          customerDetails.customer_buy_details.expected_buy_price,
        available_from: customerDetails.customer_buy_details.available_from,
        negotiable: customerDetails.customer_buy_details.negotiable
      };
      for (let location of locations) {
        const residentialCustomerBuyLocationDict = {
          customer_id: customerId,
          location: location.location,
          agent_id: customerDetails.agent_id,
          customer_property_details: {
            house_type: customerDetails.customer_property_details.house_type,
            bhk_type: customerDetails.customer_property_details.bhk_type,
            furnishing_status:
              customerDetails.customer_property_details.furnishing_status,
            parking_type: customerDetails.customer_property_details.parking_type,
          },
          customer_buy_details: {
            expected_buy_price:
              customerDetails.customer_buy_details.expected_buy_price,
            available_from: customerDetails.customer_buy_details.available_from,
            negotiable: customerDetails.customer_buy_details.negotiable
          },

        }

        residentialCustomerBuyLocationDictArray.push(residentialCustomerBuyLocationDict);

      }

    }
  }



  if (customerDetails.customer_locality.property_for.toLowerCase() === 'rent') {

    const savedProperty = await ResidentialPropertyCustomerRent.create(customerDetailsDict);
    const createdDocuments = await ResidentialCustomerRentLocation.create(residentialCustomerRentLocationDictArray);
    logger.info("ResidentialPropertyCustomerRent created successfully:", createdDocuments);

  } else if (customerDetails.customer_locality.property_for.toLowerCase() === 'buy') {

    const savedProperty = await ResidentialPropertyCustomerBuy.create(customerDetailsDict);
    const createdDocuments = await ResidentialCustomerBuyLocation.create(residentialCustomerBuyLocationDictArray);

  }
  return JSON.stringify(customerDetailsDict);

};


const getResidentialCustomerList = async (agentDetailsParam) => {
  try {
    const agentDetails = JSON.parse(JSON.stringify(agentDetailsParam));
    // logger.info(JSON.stringify(req.body));
    const agent_id = agentDetails.agent_id;// works_for
    const reqUserId = agentDetails.req_user_id;// user id

    if (agent_id === reqUserId) {
      const residentialPropertyCustomerRent = await ResidentialPropertyCustomerRent.find({ agent_id: agent_id }).lean().exec();
      const residentialPropertyCustomerBuy = await ResidentialPropertyCustomerBuy.find({ agent_id: agent_id }).lean().exec();

      const data = [...residentialPropertyCustomerRent, ...residentialPropertyCustomerBuy];

      logger.info("ResidentialPropertyCustomer: ", JSON.stringify(data));
      return data;
    } else if (agent_id !== reqUserId) {
      const empObj = await User.findOne({ id: reqUserId }).lean().exec();
      const residentialPropertyCustomerRentIds = empObj.assigned_residential_rent_customers;
      const residentialPropertyCustomerBuyIds = empObj.assigned_residential_buy_customers;
      const residentialPropertyCustomerRent = await ResidentialPropertyCustomerRent.find({ customer_id: { $in: residentialPropertyCustomerRentIds } }).lean().exec();
      const residentialPropertyCustomerBuy = await ResidentialPropertyCustomerBuy.find({ customer_id: { $in: residentialPropertyCustomerBuyIds } }).lean().exec();
      const data = [...residentialPropertyCustomerRent, ...residentialPropertyCustomerBuy];
      logger.info("ResidentialPropertyCustomer: ", JSON.stringify(data));
      return data;
    }


  } catch (err) {
    console.error(err);
    return "Internal Server Error";
  }
};


const deleteResidintialCustomer = async (reqDataParam) => {
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
      // Delete the customer from ResidentialPropertyCustomerRent and ResidentialPropertyCustomerBuy collections
      if (itemToDelete.customer_locality.property_type === "Residential" && itemToDelete.customer_locality.property_for === "Rent") {
        await ResidentialPropertyCustomerRent.deleteOne({ customer_id: customerId });
        // Also delete from the match collections if they exist
        await ResidentialRentCustomerMatch.deleteMany({ customer_id: customerId });
      } else if (itemToDelete.customer_locality.property_type === "Residential" && itemToDelete.customer_locality.property_for === "Buy") {
        await ResidentialPropertyCustomerBuy.deleteOne({ customer_id: customerId });
        // Also delete from the match collections if they exist
        await ResidentialBuyCustomerMatch.deleteMany({ customer_id: customerId });
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

const closeResidintialCustomer = async (reqDataParam) => {
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
      // Delete the customer from ResidentialPropertyCustomerRent and ResidentialPropertyCustomerBuy collections
      if (itemToClose.customer_locality.property_type === "Residential" && itemToClose.customer_locality.property_for === "Rent") {

        const result = await ResidentialPropertyCustomerRent.updateOne(
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
        // await ResidentialRentCustomerMatch.deleteMany({ customer_id: customerId });
      } else if (itemToClose.customer_locality.property_type === "Residential" && itemToClose.customer_locality.property_for === "Buy") {

        const result = await ResidentialPropertyCustomerBuy.updateOne(
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
        // await ResidentialBuyCustomerMatch.deleteMany({ customer_id: customerId });
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
  addNewResidentialCustomer,
  getResidentialCustomerList,
  deleteResidintialCustomer,
  closeResidintialCustomer
};




