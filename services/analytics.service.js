
const CommercialPropertyRent = require("../models/commercialPropertyRent");
const CommercialPropertySell = require("../models/commercialPropertySell");

const ResidentialPropertyRent = require("../models/residentialPropertyRent");
const ResidentialPropertySell = require("../models/residentialPropertySell");
const User = require("../models/user");
// const ResidentialPropertyCustomer = require("../models/residentialPropertyCustomer");
const ResidentialPropertyCustomerRent = require("../models/residentialPropertyCustomerRent");
const ResidentialPropertyCustomerBuy = require("../models/residentialPropertyCustomerBuy");
const CommercialPropertyCustomerRent = require("../models/commercialPropertyCustomerRent");
const CommercialPropertyCustomerBuy = require("../models/commercialPropertyCustomerBuy");

const logger = require('../utils/logger');



const getTotalListingSummary = async (agentObj) => {
  logger.info("Prop details1: " + JSON.stringify(agentObj));
  const agent = JSON.parse(JSON.stringify(agentObj));
  // first check if user is agent or employee
  // if agent he can see all properties/customers for him and his employees
  // if employee he can see all properties/customers which are assigned to him
  const reqUserId = agent.req_user_id;
  const agentId = agent.agent_id;

  let residentialPropertyRentCount = 0;
  let residentialPropertySellCount = 0;
  let commercialPropertyRentCount = 0;
  let commercialPropertySellCount = 0;
  let residentialPropertyCustomerRentCount = 0;
  let residentialPropertyCustomerBuyCount = 0;
  let commercialPropertyCustomerRentCount = 0;
  let commercialPropertyCustomerBuyCount = 0;

  if (reqUserId === agentId) {
    // means this is agent
    // for properties
    residentialPropertyRentCount = await ResidentialPropertyRent.countDocuments({ agent_id: agentId }).lean().exec();
    residentialPropertySellCount = await ResidentialPropertySell.countDocuments({ agent_id: agentId }).lean().exec();
    commercialPropertyRentCount = await CommercialPropertyRent.countDocuments({ agent_id: agentId }).lean().exec();
    commercialPropertySellCount = await CommercialPropertySell.countDocuments({ agent_id: agentId }).lean().exec();
    // for customers
    residentialPropertyCustomerRentCount = await ResidentialPropertyCustomerRent.countDocuments({ agent_id: agentId }).lean().exec();
    residentialPropertyCustomerBuyCount = await ResidentialPropertyCustomerBuy.countDocuments({ agent_id: agentId }).lean().exec();
    commercialPropertyCustomerRentCount = await CommercialPropertyCustomerRent.countDocuments({ agent_id: agentId }).lean().exec();
    commercialPropertyCustomerBuyCount = await CommercialPropertyCustomerBuy.countDocuments({ agent_id: agentId }).lean().exec();



  } else if (reqUserId !== agentId) {
    // means this is employee
    // now find what are properties/customers are assigned to him
    const employeeObj = await User.findOne({ id: reqUserId }).lean().exec();
    residentialPropertyRentCount = employeeObj.assigned_residential_rent_properties.length;
    residentialPropertySellCount = employeeObj.assigned_residential_sell_properties.length;
    commercialPropertyRentCount = employeeObj.assigned_commercial_rent_properties.length;
    commercialPropertySellCount = employeeObj.assigned_commercial_sell_properties.length;
    // for customers
    residentialPropertyCustomerRentCount = employeeObj.assigned_residential_rent_customers.length;
    residentialPropertyCustomerBuyCount = employeeObj.assigned_residential_buy_customers.length;
    commercialPropertyCustomerRentCount = employeeObj.assigned_commercial_rent_customers.length;
    commercialPropertyCustomerBuyCount = employeeObj.assigned_commercial_buy_customers.length;
  }

  const responseObj = {
    residentialPropertyRentCount: residentialPropertyRentCount,
    residentialPropertySellCount: residentialPropertySellCount,
    commercialPropertyRentCount: commercialPropertyRentCount,
    commercialPropertySellCount: commercialPropertySellCount,
    residentialPropertyCustomerRentCount: residentialPropertyCustomerRentCount,
    residentialPropertyCustomerBuyCount: residentialPropertyCustomerBuyCount,
    commercialPropertyCustomerRentCount: commercialPropertyCustomerRentCount,
    commercialPropertyCustomerBuyCount: commercialPropertyCustomerBuyCount
  }

  return responseObj;


}

module.exports = {
  getTotalListingSummary
};