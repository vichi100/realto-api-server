
const CommercialPropertyRent = require("../../models/commercialPropertyRent");
const CommercialPropertySell = require("../../models/commercialPropertySell");
const CommercialBuyPropertyMatch = require('../../models/match/commercialBuyPropertyMatch'); // UNCOMMENT THIS LINE LATER FOR PRODUCTION, FIX THIS
const CommercialBuyCustomerMatch = require('../../models/match/commercialBuyCustomerMatch');

const CommercialRentPropertyMatch = require('../../models/match/commercialRentPropertyMatch');
const CommercialRentCustomerMatch = require('../../models/match/commercialRentCustomerMatch');

const ResidentialPropertyRent = require("../../models/residentialPropertyRent");
const ResidentialPropertySell = require("../../models/residentialPropertySell");
const ResidentialRentPropertyMatch = require('../../models/match/residentialRentPropertyMatch');
const ResidentialRentCustomerMatch = require('../../models/match/residentialRentCustomerMatch');

const ResidentialBuyPropertyMatch = require('../../models/match/residentialBuyPropertyMatch');
const ResidentialBuyCustomerMatch = require('../../models/match/residentialBuyCustomerMatch');
const User = require("../../models/user");
// const ResidentialPropertyCustomer = require("./models/residentialPropertyCustomer");
const ResidentialPropertyCustomerRent = require("../../models/residentialPropertyCustomerRent");
const ResidentialPropertyCustomerBuy = require("../../models/residentialPropertyCustomerBuy");
const CommercialPropertyCustomerRent = require("../../models/commercialPropertyCustomerRent");
const CommercialPropertyCustomerBuy = require("../../models/commercialPropertyCustomerBuy");

const logger = require('../../utils/logger');
const { removeDuplicates, modifyPropertyOwnerAndAddressDetails, modifyCustomerDetails } = require('../utility.service');


const getCustomerDetailsByIdToShare = (queryObjParam) => {
  const propObj = JSON.parse(JSON.stringify(queryObjParam));
  logger.info(JSON.stringify(queryObjParam));
  // const propertyId = JSON.parse(JSON.stringify(req.body)).property_id;
  // const agentId = JSON.parse(JSON.stringify(req.body)).agent_id;
  // property_type: String,
  //   property_for: String,
  let propQuery = null;
  if (propObj.property_type.toLowerCase() === "residential") {
    if (propObj.property_for.toLowerCase() === "rent") {
      propQuery = ResidentialPropertyCustomerRent.findOne({ customer_id: propObj.customer_id }).lean().exec();
    } else if (propObj.property_for.toLowerCase() === "buy") {
      propQuery = ResidentialPropertyCustomerBuy.findOne({ customer_id: propObj.customer_id }).lean().exec();
    }

  } else if (propObj.property_type.toLowerCase() === "commercial") {
    if (propObj.property_for.toLowerCase() === "rent") {
      propQuery = CommercialPropertyCustomerRent.findOne({ customer_id: propObj.customer_id }).lean().exec();
    } else if (propObj.property_for.toLowerCase() === "buy") {
      propQuery = CommercialPropertyCustomerBuy.findOne({ customer_id: propObj.customer_id }).lean().exec();
    }

  }
  return Promise.all([
    propQuery,
    User.findOne({ id: propObj.agent_id }).exec()
  ]).then(results => {
    // results[0].xxxxxx = "kkkkk"
    let customerDetailX = results[0];
    // logger.info(JSON.stringify(customerDetail));

    const agentDetails = results[1];
    // logger.info(JSON.stringify(agentDetails));

    // logger.info(propObj.customer_id);

    // customerDetailX.customer_details = null;
    customerDetailX.customer_details = {
      name: agentDetails.name,
      mobile1: agentDetails.mobile,
      customer_id: propObj.customer_id
    }
    logger.info(customerDetailX);
    return JSON.stringify(customerDetailX);
  });

};
const getCustomerListForMeeting = async (queryObjParam) => {
  const queryObj = JSON.parse(JSON.stringify(queryObjParam));
  logger.info(JSON.stringify(queryObjParam));
  const reqUserId = queryObj.req_user_id;
  const agent_id = queryObj.agent_id;
  const property_type = queryObj.property_type;
  const propertyId = queryObj.property_id;
  const propertyAgentId = queryObj.property_agent_id;
  let property_for = queryObj.property_for;
  logger.info("xxx", property_type);
  let CustomerModel;
  let MatchModel;

  if (property_type === "Residential") {
    if (property_for === "Sell") {
      property_for = "Buy";
    }
    if (property_for.toLowerCase() === "rent") {
      CustomerModel = ResidentialPropertyCustomerRent;
      MatchModel = ResidentialRentPropertyMatch;
    } else if (property_for.toLowerCase() === "buy") {
      CustomerModel = ResidentialPropertyCustomerBuy;
      MatchModel = ResidentialBuyPropertyMatch;
    }
  } else if (property_type === "Commercial") {
    if (property_for === "Sell") {
      property_for = "Buy";
    }
    if (property_for.toLowerCase() === "rent") {
      CustomerModel = CommercialPropertyCustomerRent;
      MatchModel = CommercialRentPropertyMatch;
    } else if (property_for.toLowerCase() === "buy") {
      CustomerModel = CommercialPropertyCustomerBuy;
      MatchModel = CommercialBuyPropertyMatch;
    }
  }

  const myCustomerListX = await CustomerModel.find({
    agent_id: agent_id,
    "customer_locality.property_type": property_type,
    "customer_locality.property_for": property_for
  }).lean().exec();

  // find other agent customers which are matched with this property
  const matchedData = await MatchModel.findOne({ property_id: propertyId, }).lean().exec();
  // create a dict each for my matched and other matched this dict will contain customer_id and matched percentage
  const myMatchedCustomerDictList = matchedData ? matchedData.matched_customer_id_mine : [];
  const myMatchedCustomerMap = {};
  const myMatchedCustomerIdList = [];
  for (let myMatchedCustomerDict of myMatchedCustomerDictList) {
    myMatchedCustomerIdList.push(myMatchedCustomerDict.customer_id);
    myMatchedCustomerMap[myMatchedCustomerDict.customer_id.toString()] = myMatchedCustomerDict.matched_percentage.toString();
  }

  // get my matched customer details
  const myMatchedCustomerList = await CustomerModel.find({ customer_id: { $in: myMatchedCustomerIdList } }).lean().exec();
  for (let myMatchedCustomer of myMatchedCustomerList) {
    myMatchedCustomer.matched_percentage = myMatchedCustomerMap[myMatchedCustomer.customer_id.toString()];
  }

  const otherMatchedCustomerDictList = matchedData ? matchedData.matched_customer_id_other : [];
  const otherMatchedCustomerMap = {};
  // const otherMatchedCustomerIdList = [];
  for (let otherMatchedCustomerDict of otherMatchedCustomerDictList) {
    // otherMatchedCustomerIdList.push(otherMatchedCustomerDict.customer_id);
    otherMatchedCustomerMap[otherMatchedCustomerDict.customer_id.toString()] = otherMatchedCustomerDict.matched_percentage.toString();
  }
  let otherCustomerList = []
  if (matchedData) {
    const otherAgentCustomerDictList = matchedData ? matchedData.matched_customer_id_other : [];
    const otherAgentCustomerList = [];
    for (let otherAgentCustomerDict of otherAgentCustomerDictList) {
      otherAgentCustomerList.push(otherAgentCustomerDict.customer_id);
    }

    if (reqUserId === propertyAgentId) {// why this condition is needed ?
      otherCustomerList = await CustomerModel.find({ customer_id: { $in: otherAgentCustomerList } }).lean().exec();
      for (let otherCustomer of otherCustomerList) {
        const otherAgent = await User.findOne({ id: otherCustomer.agent_id }).lean().exec();
        otherCustomer.customer_details.name = otherAgent.name ? otherAgent.name : "Agent";
        otherCustomer.customer_details.mobile1 = otherAgent.mobile;
        otherCustomer.matched_percentage = otherMatchedCustomerMap[otherCustomer.customer_id.toString()];
      }
    } else if (reqUserId !== propertyAgentId) {
      // if reqUserId is not same as propertyAgentId then we will show only those customers which are matched with this property and agent id is same as reqUserId
      otherCustomerList = await CustomerModel.find({ customer_id: { $in: otherAgentCustomerList } }).lean().exec();
      for (let otherCustomer of otherCustomerList) {
        const otherAgent = await User.findOne({ id: otherCustomer.agent_id }).lean().exec();
        // otherCustomer.customer_details.name = otherAgent.name;
        // otherCustomer.customer_details.mobile1 = otherAgent.mobile;
        otherCustomer.matched_percentage = otherMatchedCustomerMap[otherCustomer.customer_id.toString()];
      }
      // filter out those customers whose agent id is not same as reqUserId
      otherCustomerList = otherCustomerList.filter(customer => customer.agent_id === reqUserId);
    }
  }

  const myCustomerList = removeDuplicates(myMatchedCustomerList, myCustomerListX, "customer_id");
  var finalData = [];
  if (propertyAgentId && propertyAgentId !== reqUserId) {

    finalData = [...otherCustomerList];
  } else {
    finalData = [...myCustomerList, ...myMatchedCustomerList, ...otherCustomerList];
  }
  // finalData = [ ...myMatchedCustomerList, ...otherCustomerList];
  logger.info(JSON.stringify(finalData));
  return finalData;

};
const getCustomerAndMeetingDetails = async (queryObjParam) => {
  logger.info("getCustomerAndMeetingDetails: " + JSON.stringify(queryObjParam));
  const queryObj = JSON.parse(JSON.stringify(queryObjParam));
  const reqUserId = queryObj.req_user_id;

  let propertyDetail = [];
  let customerDetails = [];
  let matchModel;
  if (queryObj.category_type === "Residential") {
    if (queryObj.category_for === "Rent") {
      propertyDetail = await ResidentialPropertyRent.find({ property_id: { $in: queryObj.category_ids } }).lean().exec();
      customerDetails = await ResidentialPropertyCustomerRent.findOne({ customer_id: queryObj.client_id }).lean().exec();
      matchModel = ResidentialRentCustomerMatch;


    } else if (queryObj.category_for === "Sell" || queryObj.category_for === "Buy") {

      propertyDetail = await ResidentialPropertySell.find({
        property_id: { $in: queryObj.category_ids }
      }).lean().exec();
      customerDetails = await ResidentialPropertyCustomerBuy.findOne({
        customer_id: queryObj.client_id
      }).lean().exec();

      matchModel = ResidentialBuyCustomerMatch;

    }

  } else if (queryObj.category_type === "Commercial") {
    if (queryObj.category_for === "Rent") {

      propertyDetail = await CommercialPropertyRent.find({
        property_id: { $in: queryObj.category_ids }
      }).lean().exec();

      customerDetails = await CommercialPropertyCustomerRent.findOne({
        customer_id: queryObj.client_id
      }).lean().exec();

      matchModel = CommercialRentCustomerMatch;



    } else if (queryObj.category_for === "Sell" || queryObj.category_for === "Buy") {

      propertyDetail = await CommercialPropertySell.find({
        property_id: { $in: queryObj.category_ids }
      }).lean().exec();

      customerDetails = await CommercialPropertyCustomerBuy.findOne({
        customer_id: queryObj.client_id
      }).lean().exec();

      matchModel = CommercialBuyCustomerMatch;

    }

  }

  //1) we have customer id so I ll find matched_property_id_mine and matched_property_id_other
  //2) create map so we dont have itrate multiple time
  //3) itrate thriugh propertyDetail and where match asign matched_percentage
  const matchPropertiesForCustomer = await matchModel.findOne({ customer_id: customerDetails.customer_id }).lean().exec();
  const mineMatchedPropertyList = matchPropertiesForCustomer ? matchPropertiesForCustomer.matched_property_id_mine : [];
  const otherMatchedPropertyList = matchPropertiesForCustomer ? matchPropertiesForCustomer.matched_property_id_other : [];
  const mineMatchedPropertyMap = {};
  for (let mineMatchedProperty of mineMatchedPropertyList) {
    mineMatchedPropertyMap[mineMatchedProperty.property_id.toString()] = mineMatchedProperty.matched_percentage.toString();
  }

  const otherMatchedPropertyMap = {};
  for (let otherMatchedProperty of otherMatchedPropertyList) {
    otherMatchedPropertyMap[otherMatchedProperty.property_id.toString()] = otherMatchedProperty.matched_percentage.toString();
  }
  for (let property of propertyDetail) {
    property.matched_percentage = mineMatchedPropertyMap[property.property_id.toString()]
      ? mineMatchedPropertyMap[property.property_id.toString()] : 0;
    if (property.matched_percentage === 0) {
      property.matched_percentage = otherMatchedPropertyMap[property.property_id.toString()]
        ? otherMatchedPropertyMap[property.property_id.toString()] : 0;
    }

  }

  await modifyPropertyOwnerAndAddressDetails(reqUserId, propertyDetail);
  await modifyCustomerDetails(reqUserId, customerDetails);
  const resObj = {
    property_details: propertyDetail,
    customer_details: customerDetails
  };
  return resObj;
};

module.exports = {
  getCustomerDetailsByIdToShare,
  getCustomerListForMeeting,
  getCustomerAndMeetingDetails
};