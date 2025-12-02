
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

const ResidentialBuyPropertyMatch = require('../models/match/residentialBuyPropertyMatch');
const ResidentialBuyCustomerMatch = require('../models/match/residentialBuyCustomerMatch');

const Reminder = require("../models/reminder");
// const Agent = require("../models/agent");
// const Employee = require("../models/employee");
const User = require("../models/user");
// const ResidentialPropertyCustomer = require("../models/residentialPropertyCustomer");
const ResidentialPropertyCustomerRent = require("../models/residentialPropertyCustomerRent");
const ResidentialPropertyCustomerBuy = require("../models/residentialPropertyCustomerBuy");
const CommercialPropertyCustomerRent = require("../models/commercialPropertyCustomerRent");
const CommercialPropertyCustomerBuy = require("../models/commercialPropertyCustomerBuy");
const Message = require("../models/message");

const logger = require('../utils/logger');
const { uniqueId } = require('./utility.service');



const getReminderList = async (agentIdDictParam) => {
  logger.info("getReminderList 1: ") //req_user_id
  const agentIdDict = JSON.parse(JSON.stringify(agentIdDictParam));
  const reqUserId = agentIdDict.req_user_id;// user id
  const agentId = agentIdDict.agent_id;// agent id

  if (reqUserId === agentId) {
    const remiderArray = await Reminder.find({
      $or: [
        { agent_id_of_client: agentId },
        { meeting_creator_id: reqUserId }
      ]
    }).sort({ user_id: -1 }).lean().exec();

    for (let reminder of remiderArray) {
      if (agentIdDict.req_user_id !== reminder.agent_id_of_client) {
        const user = await User.findOne({ id: reminder.agent_id_of_client }).lean().exec();
        reminder.client_name = user.name ? user.name : "Agent";
        reminder.client_mobile = user.mobile;
      }
    }


    return remiderArray;
  } else if (reqUserId !== agentId) {
    // then only return the remoder which matched req_user_id with meeting_creator_id
    const remiderArray = await Reminder.find({
      $or: [
        { meeting_creator_id: reqUserId }
      ]
    }).sort({ user_id: -1 }).lean().exec();
    for (let reminder of remiderArray) {
      const reqUserIdDetails = await User.findOne({ id: reqUserId }).lean().exec();

      if (reqUserIdDetails.works_for !== reminder.agent_id_of_client) {
        const user = await User.findOne({ id: reminder.agent_id_of_client }).lean().exec();
        reminder.client_name = user.name ? user.name : "Agent";
        reminder.client_mobile = user.mobile;
      }
    }
    return remiderArray;
  }


};

const getReminderListByCustomerId = async (agentIdDictParam) => {
  logger.info("getReminderListByCustomerId 1: ")
  // customer_id: customerData.customer_id,
  //   property_type: customerData.customer_locality.property_type,// Residential, commercial
  //   property_for: customerData.customer_locality.property_for,// Rent, sell
  const customerDataDict = JSON.parse(JSON.stringify(agentIdDictParam));
  const reqUserId = customerDataDict.req_user_id;
  const customerId = customerDataDict.customer_id;
  const propertyType = customerDataDict.property_type;
  const propertyFor = customerDataDict.property_for;
  // first find cusomer and get reminder of the customer
  logger.info(JSON.stringify(agentIdDictParam));
  let finalReminderDataArr = [];
  let reminderArr;

  if (propertyType.toLowerCase() === "Residential".toLowerCase()) {
    if (propertyFor.toLowerCase() === "Rent".toLowerCase()) {
      const customer = await ResidentialPropertyCustomerRent.find({ customer_id: customerId }).lean().exec();
      reminderArr = customer[0].reminders;


    } else if (propertyFor.toLowerCase() === "Sell".toLowerCase() || propertyFor.toLowerCase() === "Buy".toLowerCase()) {

      const customer = await ResidentialPropertyCustomerBuy.find({ customer_id: customerId }).lean().exec();
      reminderArr = customer[0].reminders;
    }
  } if (propertyType.toLowerCase() === "Commercial".toLowerCase()) {
    if (propertyFor.toLowerCase() === "Rent".toLowerCase()) {

      const customer = await CommercialPropertyCustomerRent.find({ customer_id: customerId }).lean().exec();
      reminderArr = customer[0].reminders;
    } else if (propertyFor.toLowerCase() === "Buy".toLowerCase()) {
      const customer = await CommercialPropertyCustomerBuy.find({ customer_id: customerId }).lean().exec();
      reminderArr = customer[0].reminders;

    }
  }

  const reminderDataArr = await Reminder.find({ reminder_id: { $in: reminderArr } }).lean().exec();
  for (let reminder of reminderDataArr) {
    if (reminder.agent_id_of_client === reqUserId) {
      finalReminderDataArr.push(reminder);
    } else if (reminder.meeting_creator_id === reqUserId) {
      const otherCustomerAgentIdDetails = await User.findOne({ id: reminder.meeting_creator_id }).lean().exec();
      reminder.client_name = otherCustomerAgentIdDetails.name === null ? "Agent" : otherCustomerAgentIdDetails.name + ', Agent';
      reminder.client_mobile = otherCustomerAgentIdDetails.mobile;
      finalReminderDataArr.push(reminder);
    }

  }

  return finalReminderDataArr;


};

// there will be two cases
// 1) I am the owner of property/custome means I am the agent
// I can see all the remoinders of this property or customer for which I am the agent
// 2) I am employee
// I can see only those reminders which are created by me
const getPropReminderList = async (agentIdDictParam) => {
  logger.info(JSON.stringify(agentIdDictParam));
  const reqData = JSON.parse(JSON.stringify(agentIdDictParam));
  const propertyId = reqData.property_id;
  const reqUserId = reqData.req_user_id;// user id
  const agentId = reqData.agent_id;// works_for

  if (reqUserId === agentId) {
    // Case 1: Agent can see all reminders for the property
    const remiderList = await Reminder.find({
      category_ids: { $in: [propertyId] },
      $or: [
        { meeting_creator_id: reqUserId }, // Include reminders created by the agent
        { agent_id_of_client: reqUserId } // Include reminders where the agent is the client
      ]
    }).sort({ property_id: -1 }).lean().exec();

    for (let reminder of remiderList) {
      if (reqUserId !== reminder.agent_id_of_client) {
        const user = await User.findOne({ id: reminder.agent_id_of_client }).lean().exec();
        reminder.client_name = user.name ? user.name : "Agent";
        reminder.client_mobile = user.mobile;
      }
    }
    logger.info("getPropReminderList resp:  " + JSON.stringify(remiderList));
    return remiderList;
  } else if (reqUserId !== agentId) {
    // Case 2: Employee can only see reminders created by them
    const remiderList = await Reminder.find({
      category_ids: { $in: [propertyId] },
      meeting_creator_id: reqUserId // Only include reminders created by the employee
    })
      .sort({ property_id: -1 })
      .lean()
      .exec();

    for (let reminder of remiderList) {
      // if reqUserid agent id and agent id of client is not same then only mask the details
      const reqUserIdDetails = await User.findOne({ id: reqUserId }).lean().exec();

      if (reqUserIdDetails.works_for !== reminder.agent_id_of_client) {
        const user = await User.findOne({ id: reminder.agent_id_of_client }).lean().exec();
        reminder.client_name = user.name ? user.name : "Agent";
        reminder.client_mobile = user.mobile;
      }
    }
    logger.info("getPropReminderList resp:  " + JSON.stringify(remiderList));
    return remiderList;
  }



};

// get reminder list by customer id
//1) no should be able to others others meeting deatils
//2) if I am customer agent then I should be able to see meeting which means req_user_id =  customer_agent_id
//3) if I am not customer agent then I should be able to see meeting which means req_user_id =  customer_agent_id
const getCustomerReminderList = async (agentIdDictParam) => {
  logger.info("getCustomerReminderList: " + JSON.stringify(agentIdDictParam));
  const reqData = JSON.parse(JSON.stringify(agentIdDictParam));
  const customerId = reqData.customer_id;
  const reqUserId = reqData.req_user_id;
  const agentIdOfClient = reqData.agent_id_of_client;


  const remiderList = await Reminder.find({
    $or: [
      // 1st condition: Must match BOTH inside $and
      {
        $and: [
          { client_id: customerId },
          { meeting_creator_id: reqUserId }
        ]
      },
      // 2nd condition: Must match BOTH inside $and
      {
        $and: [
          { client_id: customerId },
          { agent_id_of_client: reqUserId }
        ]
      }
    ]
  })



  logger.info("getCustomerReminderList resp:  " + JSON.stringify(remiderList));
  return remiderList;
};

const addNewReminder = async (agentIdDictParam) => {
  const reminderDetails = JSON.parse(JSON.stringify(agentIdDictParam));
  const reminderId = uniqueId();
  reminderDetails["reminder_id"] = reminderId;
  logger.info("reminderDetails: " + JSON.stringify(reminderDetails));

  await Reminder.create(reminderDetails);
  if (reminderDetails.category_type === "Residential") {
    if (reminderDetails.category_for === "Rent") {
      await ResidentialPropertyRent.updateOne
        ({ property_id: reminderDetails.category_ids[0] }, { $addToSet: { reminders: reminderId } }).exec();

      await ResidentialPropertyCustomerRent.
        updateOne({ customer_id: reminderDetails.client_id }, { $addToSet: { reminders: reminderId } }).exec();


    } else if (reminderDetails.category_for === "Buy" || reminderDetails.category_for === "Sell") {
      await ResidentialPropertySell.updateOne
        ({ property_id: reminderDetails.category_ids[0] }, { $addToSet: { reminders: reminderId } }).exec();

      await ResidentialPropertyCustomerBuy.updateOne
        ({ customer_id: reminderDetails.client_id }, { $addToSet: { reminders: reminderId } }).exec();


    }
  } else if (reminderDetails.category_type === "Commercial") {
    if (reminderDetails.category_for === "Rent") {
      await CommercialPropertyRent.updateOne
        ({ property_id: reminderDetails.category_ids[0] }, { $addToSet: { reminders: reminderId } }).exec();

      await CommercialPropertyCustomerRent.updateOne
        ({ customer_id: reminderDetails.client_id }, { $addToSet: { reminders: reminderId } }).exec();

    } else if (reminderDetails.category_for === "Sell" || reminderDetails.category_for === "Buy") {
      await CommercialPropertySell.updateOne
        ({ property_id: reminderDetails.category_ids[0] }, { $addToSet: { reminders: reminderId } }).exec();

      await CommercialPropertyCustomerBuy.updateOne
        ({ customer_id: reminderDetails.client_id }, { $addToSet: { reminders: reminderId } }).exec();

    }

  }

  logger.info("reminderId: ", reminderId);
  return { reminderId: reminderId };

};

module.exports = {
  getReminderList,
  getPropReminderList,
  addNewReminder,
  getCustomerReminderList,
  getReminderListByCustomerId
};