
const CommercialPropertyRent = require("../models/commercialPropertyRent");
const CommercialPropertySell = require("../models/commercialPropertySell");

const ResidentialPropertyRent = require("../models/residentialPropertyRent");
const ResidentialPropertySell = require("../models/residentialPropertySell");

const Reminder = require("../models/reminder");
const User = require("../models/user");
const ResidentialPropertyCustomerRent = require("../models/residentialPropertyCustomerRent");
const ResidentialPropertyCustomerBuy = require("../models/residentialPropertyCustomerBuy");
const CommercialPropertyCustomerRent = require("../models/commercialPropertyCustomerRent");
const CommercialPropertyCustomerBuy = require("../models/commercialPropertyCustomerBuy");

const logger = require('../utils/logger');
const { uniqueId } = require('./utility.service');

const checkLoginRole = async (userDetailsParam) => {
  const mobileNumber = JSON.parse(JSON.stringify(userDetailsParam)).user_mobile;
  logger.info(JSON.stringify(userDetailsParam));

  try {
    const data = await User.findOne({ mobile: mobileNumber }).lean().exec();
    logger.info("User data: " + data);
    if (data !== null) {
      logger.info("sending resp: " + data.user_type);
      if (data.user_type === "agent") {
        const userDetails = {
          user_type: data.user_type, // employee or agent
          id: data.id,
          expo_token: data.expo_token,
          name: data.name,
          company_name: data.company_name,
          mobile: data.mobile,
          address: data.address,
          city: data.city,
          access_rights: data.access_rights,
          works_for: data.id, // self user_id
          user_status: data.user_status
        };
        logger.info("sending resp");
        return { user_details: userDetails };
      }
    } else {
      // mobile number is not present let create a new user
      const userType = "agent";
      const accessRights = "all";
      const newUser = await insertNewUserAsAgent(mobileNumber, userType, accessRights);
      return newUser;
    }
  } catch (err) {
    logger.info(err);
    return "fail";
  }
};

const updateUserProfile = async (profileDetailsParam) => {
  const profileDetails = JSON.parse(JSON.stringify(profileDetailsParam));
  try {
    await User.collection.updateOne(
      { id: profileDetails.user_id },
      {
        $set: {
          name: profileDetails.name,
          company_name: profileDetails.company,
          city: profileDetails.city,
          email: profileDetails.email
        }
      }
    );
    return "success";
  } catch (err) {
    logger.info("err1: " + err);
    return err;
  }
};

// delete agent account will remove delete property and customer which belongs to the agent
// all its employee will be deleted
// delete all reminders which created by the agent and its employee
// delete the agent account from the user collection

const deleteAgentAccount = async (agentObjParam) => {
  const agentObj = JSON.parse(JSON.stringify(agentObjParam));
  const agent_id = agentObj.agent_id;
  const reqUserId = agentObj.req_user_id;
  if (reqUserId !== agent_id) {
    return { status: 403, message: "Unauthorized" };
  }

  // remove  properties
  await ResidentialPropertyRent.deleteMany({ agent_id: agent_id }).exec();
  await ResidentialPropertySell.deleteMany({ agent_id: agent_id }).exec();
  await CommercialPropertyRent.deleteMany({ agent_id: agent_id }).exec();
  await CommercialPropertySell.deleteMany({ agent_id: agent_id }).exec();
  // remove  customers
  await ResidentialPropertyCustomerRent.deleteMany({ agent_id: agent_id }).exec();
  await ResidentialPropertyCustomerBuy.deleteMany({ agent_id: agent_id }).exec();
  await CommercialPropertyCustomerRent.deleteMany({ agent_id: agent_id }).exec();
  await CommercialPropertyCustomerBuy.deleteMany({ agent_id: agent_id }).exec();
  // remove reminders
  await Reminder.deleteMany({ agent_id_of_client: agent_id }).exec();
  await Reminder.deleteMany({ meeting_creator_id: agent_id }).exec();
  // remove employees
  const employees = await User.find({ works_for: agent_id, user_type: "employee" }).lean().exec();
  for (const employee of employees) {
    await User.deleteOne({ id: employee.id }).exec();
  }
  // finally remove the agent account
  await User.deleteOne({ id: agent_id }).exec();
  return "success";
};


const reactivateAccount = async (agentObjParam) => {
  const agentObj = JSON.parse(JSON.stringify(agentObjParam));
  const agent_id = agentObj.agent_id;

  try {
    await User.collection.updateOne({ id: agent_id }, { $set: { user_status: "active" } });
    return "success";
  } catch (err) {
    logger.info("err1: " + err);
    return err;
  }
};


const insertNewUserAsAgent = async (mobileNumber, userType, accessRights) => {
  const userId = uniqueId();
  const userObj = {
    user_type: userType, // employee or agent
    id: userId,
    expo_token: null,
    name: null,
    company_name: null,
    mobile: mobileNumber,
    address: null,
    city: null,
    access_rights: accessRights,
    employees: [], // if employee then it will be empty
    works_for: userId,
    create_date_time: new Date(Date.now()),
    update_date_time: new Date(Date.now())
  };
  try {
    await User.collection.insertOne(userObj);
    const userDetails = {
      user_type: userType, // employee or agent
      id: userId,
      expo_token: null,
      name: null,
      company_name: null,
      mobile: mobileNumber,
      address: null,
      city: null,
      access_rights: accessRights,
      works_for: userId // self user_id
    };
    return { user_details: userDetails };
  } catch (err) {
    logger.info(err);
    return "fail";
  }
};

const getUserDetails = async (userDetailsParam) => {
  try {
    const obj = JSON.parse(JSON.stringify(userDetailsParam));
    logger.info(JSON.stringify(userDetailsParam));
    const mobileXX = obj.mobile;
    const idx = uniqueId();
    const countryCode = obj.country_code;
    const user = await User.findOne({ mobile: obj.mobile }).lean().exec();
    if (user) {
      return user;
    } else {
      const userObj = {
        id: idx,
        expo_token: '',
        user_type: "agent",
        works_for: idx,
        name: null,
        country: obj.country,
        country_code: countryCode,
        mobile: obj.mobile,
        create_date_time: new Date(Date.now()),
        update_date_time: new Date(Date.now())
      };
      try {
        const newUser = await User.create(userObj);
        logger.info('New User Created', newUser);
        return userObj;
      } catch (error) {
        console.error(`getUserDetails# Failed to insert documents : ${error}`);
        return null;
      }
    }
  }
  catch (err) {
    console.error(`getUserDetails# Failed to fetch documents : ${err}`);
    return null;
  }
};

const getUserProfileDeatails = async (userDetailsParam) => {
  const obj = JSON.parse(JSON.stringify(userDetailsParam));
  const reqUserId = obj.req_user_id;
  const mobile = obj.mobile;
  const user = await User.findOne({ id: reqUserId, mobile: mobile }).lean().exec();
  if (user) {
    return user;
  } else {
    return null;
  }

}


module.exports = {
  checkLoginRole,
  updateUserProfile,
  deleteAgentAccount,
  reactivateAccount,
  insertNewUserAsAgent, // **Helper function**
  getUserDetails,
  getUserProfileDeatails
};  

