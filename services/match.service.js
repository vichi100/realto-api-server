
const CommercialPropertyRent = require("../models/commercialPropertyRent");
const CommercialPropertySell = require("../models/commercialPropertySell");
// UNCOMMENT THIS LINE LATER FOR PRODUCTION, FIX THIS
const CommercialBuyPropertyMatch = require('../models/match/commercialBuyPropertyMatch'); // UNCOMMENT THIS LINE LATER FOR PRODUCTION, FIX THIS
const CommercialBuyCustomerMatch = require('../models/match/commercialBuyCustomerMatch');

const CommercialRentPropertyMatch = require('../models/match/commercialRentPropertyMatch');
const CommercialRentCustomerMatch = require('../models/match/commercialRentCustomerMatch');

const ResidentialPropertyRent = require("../models/residentialPropertyRent");
const ResidentialPropertySell = require("../models/residentialPropertySell");
const ResidentialRentPropertyMatch = require('../models/match/residentialRentPropertyMatch');
const ResidentialBuyPropertyMatchBuy = require('../models/match/residentialBuyPropertyMatch');
// const ResidentialBuyCustomerMatch = require('./models/match/residentialBuyCustomerMatch');
const ResidentialRentCustomerMatch = require('../models/match/residentialRentCustomerMatch');

const ResidentialBuyPropertyMatch = require('../models/match/residentialBuyPropertyMatch');
const ResidentialBuyCustomerMatch = require('../models/match/residentialBuyCustomerMatch');
// const ResidentialPropertyCustomer = require("../models/residentialPropertyCustomer");
const ResidentialPropertyCustomerRent = require("../models/residentialPropertyCustomerRent");
const ResidentialPropertyCustomerBuy = require("../models/residentialPropertyCustomerBuy");
const CommercialPropertyCustomerRent = require("../models/commercialPropertyCustomerRent");
const CommercialPropertyCustomerBuy = require("../models/commercialPropertyCustomerBuy");

const logger = require('../utils/logger');
const { 
  replaceOwnerDetailsWithAgentDetails, 
  replaceCustomerDetailsWithAgentDetails 
} = require('./utility.service');

/*
get matched property using property_id from residentialRentPropertyMatch
get matched_customer_id_mine from matched property
get customer details using matched_customer_id_mine from residentialPropertyCustomerRent
get matched_customer_id_other from matched property
get customer details using matched_customer_id_other from residentialPropertyCustomerRent
send both customer details
*/
const getmatchedResidentialCustomerRentList = async (propertyDetailsParam) => {
  try {
    const propertyDetails = JSON.parse(JSON.stringify(propertyDetailsParam));
    const property_id = propertyDetails.property_id;
    const reqUserId = propertyDetails.req_user_id;

    // 1) Get matched property using property_id from residentialRentPropertyMatch
    const matchedProperty = await ResidentialRentPropertyMatch.findOne({ property_id: property_id }).lean().exec();

    if (!matchedProperty) {
      return { error: "No matched property found" };
    }

    // create dict of matched_customer_id_mine and percentage
    const myMatchedCustomeryList = matchedProperty.matched_customer_id_mine;
    const myMatchedCustomeryDictList = {};
    for (let myMatchedCustomerDict of myMatchedCustomeryList) {
      myMatchedCustomeryDictList[myMatchedCustomerDict.customer_id] = myMatchedCustomerDict.matched_percentage;
    }

    // create dict of matched_customer_id_other and percentage
    const otherMatchedCustomeryList = matchedProperty.matched_customer_id_other;
    const otherMatchedCustomeryDictList = {};
    for (let otherMatchedCustomerDict of otherMatchedCustomeryList) {
      otherMatchedCustomeryDictList[otherMatchedCustomerDict.customer_id] = otherMatchedCustomerDict.matched_percentage;
    }

    // 2) Get matched_customer_id_mine from matched property
    const matchedCustomerMineIds = matchedProperty.matched_customer_id_mine.map(customer => customer.customer_id);

    // 3) Get customer details using matched_customer_id_mine from residentialPropertyCustomerRent
    const matchedCustomerRentDetailsMine = await ResidentialPropertyCustomerRent.find({ customer_id: { $in: matchedCustomerMineIds } }).lean().exec();
    // const matchedCustomerBuyDetailsMine = await ResidentialPropertyCustomerBuy.find({ customer_id: { $in: matchedCustomerMineIds } });

    for (let matchedCustomerRentDetail of matchedCustomerRentDetailsMine) {
      const matchedCustomerId = matchedCustomerRentDetail.customer_id;
      const matchedPercentage = myMatchedCustomeryDictList[matchedCustomerId];
      matchedCustomerRentDetail.matched_percentage = matchedPercentage;
    }
    const matchedCustomerDetailsMine = [...matchedCustomerRentDetailsMine];

    // 4) Get matched_customer_id_other from matched property
    const matchedCustomerOtherIds = matchedProperty.matched_customer_id_other.map(customer => customer.customer_id);

    // 5) Get customer details using matched_customer_id_other from residentialPropertyCustomerRent
    const matchedCustomerRentDetailsOther = await ResidentialPropertyCustomerRent.find({ customer_id: { $in: matchedCustomerOtherIds } }).lean().exec();
    // const matchedCustomerBuyDetailsOther = await ResidentialPropertyCustomerBuy.find({ customer_id: { $in: matchedCustomerOtherIds } });
    for (let matchedCustomerRentDetail of matchedCustomerRentDetailsOther) {
      const matchedCustomerId = matchedCustomerRentDetail.customer_id;
      const matchedPercentage = otherMatchedCustomeryDictList[matchedCustomerId];
      matchedCustomerRentDetail.matched_percentage = matchedPercentage;
    }

    const matchedCustomerDetailsOther = [...matchedCustomerRentDetailsOther];
    await replaceCustomerDetailsWithAgentDetails(matchedCustomerDetailsOther, reqUserId);
    // 6) Return both customer details
    return {
      matchedCustomerDetailsMine,
      matchedCustomerDetailsOther
    };
  } catch (err) {
    console.error(err);
    return { error: "Internal Server Error", details: err };
  }
};
const getMatchedResidentialProptiesRentList = async (customerDetailsParam) => {
  try {
    const customerDetails = JSON.parse(JSON.stringify(customerDetailsParam));
    const customer_id = customerDetails.customer_id;
    const reqUserId = customerDetails.req_user_id;

    // 1) Get matched property using property_id from residentialRentPropertyMatch
    const matchedPCustomer = await ResidentialRentCustomerMatch.findOne({ customer_id: customer_id }).lean().exec();

    if (!matchedPCustomer) {
      return { error: "No matched property found" };
    }

    // create dict of matched_property_id_mine and percentage
    const mineMatchedPropertyList = matchedPCustomer.matched_property_id_mine;
    const mineMatchedPropertyDictList = {};
    for (let mineMatchedPropertyDict of mineMatchedPropertyList) {
      mineMatchedPropertyDictList[mineMatchedPropertyDict.property_id] = mineMatchedPropertyDict.matched_percentage;
    }
    // create dict of matched_property_id_other and percentage
    const otherMatchedPropertyList = matchedPCustomer.matched_property_id_other;
    const otherMatchedPropertyDictList = {};
    for (let otherMatchedPropertyDict of otherMatchedPropertyList) {
      otherMatchedPropertyDictList[otherMatchedPropertyDict.property_id] = otherMatchedPropertyDict.matched_percentage;
    }

    // 2) Get matched_customer_id_mine from matched property
    const matchedPropertyMineIds = matchedPCustomer.matched_property_id_mine.map(property => property.property_id);

    // 3) Get customer details using matched_customer_id_mine from residentialPropertyCustomerRent
    const matchedPropertyRentDetailsMine = await ResidentialPropertyRent.find({ property_id: { $in: matchedPropertyMineIds } }).lean().exec();
    // const matchedPropertyBuyDetailsMine = await ResidentialPropertySell.find({ property_id: { $in: matchedPropertyMineIds } });
    for (let matchedPropertyRentDetail of matchedPropertyRentDetailsMine) {
      const matchedPropertyId = matchedPropertyRentDetail.property_id;
      const matchedPercentage = mineMatchedPropertyDictList[matchedPropertyId];
      matchedPropertyRentDetail.matched_percentage = matchedPercentage;
    }
    const matchedPropertyDetailsMine = [...matchedPropertyRentDetailsMine];

    // 4) Get matched_customer_id_other from matched property
    const matchedPropertyOtherIds = matchedPCustomer.matched_property_id_other.map(property => property.property_id);

    // 5) Get customer details using matched_customer_id_other from residentialPropertyCustomerRent
    const matchedPropertyRentDetailsOther = await ResidentialPropertyRent.find({ property_id: { $in: matchedPropertyOtherIds } }).lean().exec();
    // const matchedPropertyBuyDetailsOther = await ResidentialPropertySell.find({ property_id: { $in: matchedPropertyOtherIds } });
    for (let matchedPropertyRentDetail of matchedPropertyRentDetailsOther) {
      const matchedPropertyId = matchedPropertyRentDetail.property_id;
      const matchedPercentage = otherMatchedPropertyDictList[matchedPropertyId];
      matchedPropertyRentDetail.matched_percentage = matchedPercentage;
    }
    let matchedPropertyDetailsOther = [...matchedPropertyRentDetailsOther];
    // if we are sending property deatils of other agents then we need to reppace owner deatils with agent deatils
    matchedPropertyDetailsOther = await replaceOwnerDetailsWithAgentDetails(matchedPropertyDetailsOther, reqUserId);

    // const matchedPropertyDetailsOther = [...matchedPropertyRentDetailsOther, ...matchedPropertyBuyDetailsOther];
    // 6) Return both customer details
    return {
      matchedPropertyDetailsMine,
      matchedPropertyDetailsOther
    };
  } catch (err) {
    console.error(err);
    return { error: "Internal Server Error", details: err };
  }

}

const matchedResidentialProptiesBuyList = async (customerDetailsParam) => {
  try {
    const customerDetails = JSON.parse(JSON.stringify(customerDetailsParam));
    const customer_id = customerDetails.customer_id;
    const reqUserId = customerDetails.req_user_id;

    // 1) Get matched property using property_id from residentialRentPropertyMatch
    const matchedPCustomer = await ResidentialBuyCustomerMatch.findOne({ customer_id: customer_id }).lean().exec();

    if (!matchedPCustomer) {
      return { error: "No matched property found" };
    }

    // create dict of matched_property_id_mine and percentage
    const mineMatchedPropertyList = matchedPCustomer.matched_property_id_mine;
    const mineMatchedPropertyDictList = {};
    for (let mineMatchedPropertyDict of mineMatchedPropertyList) {
      mineMatchedPropertyDictList[mineMatchedPropertyDict.property_id] = mineMatchedPropertyDict.matched_percentage;
    }
    // create dict of matched_property_id_other and percentage
    const otherMatchedPropertyList = matchedPCustomer.matched_property_id_other;
    const otherMatchedPropertyDictList = {};
    for (let otherMatchedPropertyDict of otherMatchedPropertyList) {
      otherMatchedPropertyDictList[otherMatchedPropertyDict.property_id] = otherMatchedPropertyDict.matched_percentage;
    }

    // 2) Get matched_customer_id_mine from matched property
    const matchedPropertyMineIds = matchedPCustomer.matched_property_id_mine.map(property => property.property_id);

    // 3) Get customer details using matched_customer_id_mine from residentialPropertyCustomerRent
    const matchedPropertyRentDetailsMine = await ResidentialPropertySell.find({ property_id: { $in: matchedPropertyMineIds } }).lean().exec();
    // const matchedPropertyBuyDetailsMine = await ResidentialPropertySell.find({ property_id: { $in: matchedPropertyMineIds } });
    for (let matchedPropertyRentDetail of matchedPropertyRentDetailsMine) {
      const matchedPropertyId = matchedPropertyRentDetail.property_id;
      const matchedPercentage = mineMatchedPropertyDictList[matchedPropertyId];
      matchedPropertyRentDetail.matched_percentage = matchedPercentage;
    }
    const matchedPropertyDetailsMine = [...matchedPropertyRentDetailsMine];

    // 4) Get matched_customer_id_other from matched property
    const matchedPropertyOtherIds = matchedPCustomer.matched_property_id_other.map(property => property.property_id);

    // 5) Get customer details using matched_customer_id_other from residentialPropertyCustomerRent
    const matchedPropertyRentDetailsOther = await ResidentialPropertySell.find({ property_id: { $in: matchedPropertyOtherIds } }).lean().exec();
    // const matchedPropertyBuyDetailsOther = await ResidentialPropertySell.find({ property_id: { $in: matchedPropertyOtherIds } });
    for (let matchedPropertyRentDetail of matchedPropertyRentDetailsOther) {
      const matchedPropertyId = matchedPropertyRentDetail.property_id;
      const matchedPercentage = otherMatchedPropertyDictList[matchedPropertyId];
      matchedPropertyRentDetail.matched_percentage = matchedPercentage;
    }
    let matchedPropertyDetailsOther = [...matchedPropertyRentDetailsOther];
    matchedPropertyDetailsOther = await replaceOwnerDetailsWithAgentDetails(matchedPropertyDetailsOther, reqUserId);
    // const matchedPropertyDetailsOther = [...matchedPropertyRentDetailsOther, ...matchedPropertyBuyDetailsOther];
    // 6) Return both customer details
    return {
      matchedPropertyDetailsMine,
      matchedPropertyDetailsOther
    };
  } catch (err) {
    console.error(err);
    return { error: "Internal Server Error", details: err };
  }

}

const getMatchedResidentialCustomerBuyList = async (propertyDetailsParam) => {
  try {
    const propertyDetails = JSON.parse(JSON.stringify(propertyDetailsParam));
    const property_id = propertyDetails.property_id;
    const reqUserId = propertyDetails.req_user_id;

    // 1) Get matched property using property_id from residentialRentPropertyMatch
    const matchedProperty = await ResidentialBuyPropertyMatch.findOne({ property_id: property_id }).lean().exec();

    if (!matchedProperty) {
      return { error: "No matched property found" };
    }

    // create dict of matched_customer_id_mine and percentage
    const myMatchedCustomeryList = matchedProperty.matched_customer_id_mine;
    const myMatchedCustomeryDictList = {};
    for (let myMatchedCustomerDict of myMatchedCustomeryList) {
      myMatchedCustomeryDictList[myMatchedCustomerDict.customer_id] = myMatchedCustomerDict.matched_percentage;
    }

    // create dict of matched_customer_id_other and percentage
    const otherMatchedCustomeryList = matchedProperty.matched_customer_id_other;
    const otherMatchedCustomeryDictList = {};
    for (let otherMatchedCustomerDict of otherMatchedCustomeryList) {
      otherMatchedCustomeryDictList[otherMatchedCustomerDict.customer_id] = otherMatchedCustomerDict.matched_percentage;
    }

    // 2) Get matched_customer_id_mine from matched property
    const matchedCustomerMineIds = matchedProperty.matched_customer_id_mine.map(customer => customer.customer_id);

    // 3) Get customer details using matched_customer_id_mine from residentialPropertyCustomerRent
    const matchedCustomerRentDetailsMine = await ResidentialPropertyCustomerBuy.find({ customer_id: { $in: matchedCustomerMineIds } }).lean().exec();
    // const matchedCustomerBuyDetailsMine = await ResidentialPropertyCustomerBuy.find({ customer_id: { $in: matchedCustomerMineIds } });
    for (let matchedCustomerRentDetail of matchedCustomerRentDetailsMine) {
      const matchedCustomerId = matchedCustomerRentDetail.customer_id;
      const matchedPercentage = myMatchedCustomeryDictList[matchedCustomerId];
      matchedCustomerRentDetail.matched_percentage = matchedPercentage;
    }
    const matchedCustomerDetailsMine = [...matchedCustomerRentDetailsMine];

    // 4) Get matched_customer_id_other from matched property
    const matchedCustomerOtherIds = matchedProperty.matched_customer_id_other.map(customer => customer.customer_id);

    // 5) Get customer details using matched_customer_id_other from residentialPropertyCustomerRent
    const matchedCustomerRentDetailsOther = await ResidentialPropertyCustomerBuy.find({ customer_id: { $in: matchedCustomerOtherIds } }).lean().exec();
    // const matchedCustomerBuyDetailsOther = await ResidentialPropertyCustomerBuy.find({ customer_id: { $in: matchedCustomerOtherIds } });
    for (let matchedCustomerRentDetail of matchedCustomerRentDetailsOther) {
      const matchedCustomerId = matchedCustomerRentDetail.customer_id;
      const matchedPercentage = otherMatchedCustomeryDictList[matchedCustomerId];
      matchedCustomerRentDetail.matched_percentage = matchedPercentage;
    }

    const matchedCustomerDetailsOther = [...matchedCustomerRentDetailsOther];
    await replaceCustomerDetailsWithAgentDetails(matchedCustomerDetailsOther, reqUserId);
    // 6) Return both customer details
    return {
      matchedCustomerDetailsMine,
      matchedCustomerDetailsOther
    };
  } catch (err) {
    console.error(err);
    return { error: "Internal Server Error", details: err };
  }
};

const getMatchedCommercialProptiesRentList = async (customerDetailsParam) => {
  try {
    const customerDetails = JSON.parse(JSON.stringify(customerDetailsParam));
    const customer_id = customerDetails.customer_id;
    const reqUserId = customerDetails.req_user_id;

    // 1) Get matched property using property_id from residentialRentPropertyMatch
    const matchedPCustomer = await CommercialRentCustomerMatch.findOne({ customer_id: customer_id });

    if (!matchedPCustomer) {
      return { error: "No matched property found" };
    }
    // create dict of matched_property_id_mine and percentage
    const mineMatchedPropertyList = matchedPCustomer.matched_property_id_mine;
    const mineMatchedPropertyDictList = {};
    for (let mineMatchedPropertyDict of mineMatchedPropertyList) {
      mineMatchedPropertyDictList[mineMatchedPropertyDict.property_id] = mineMatchedPropertyDict.matched_percentage;
    }
    // create dict of matched_property_id_other and percentage
    const otherMatchedPropertyList = matchedPCustomer.matched_property_id_other;
    const otherMatchedPropertyDictList = {};
    for (let otherMatchedPropertyDict of otherMatchedPropertyList) {
      otherMatchedPropertyDictList[otherMatchedPropertyDict.property_id] = otherMatchedPropertyDict.matched_percentage;
    }

    // 2) Get matched_customer_id_mine from matched property
    const matchedPropertyMineIds = matchedPCustomer.matched_property_id_mine.map(property => property.property_id);

    // 3) Get customer details using matched_customer_id_mine from residentialPropertyCustomerRent
    const matchedPropertyRentDetailsMine = await CommercialPropertyRent.find({ property_id: { $in: matchedPropertyMineIds } }).lean().exec();
    // const matchedPropertyBuyDetailsMine = await ResidentialPropertySell.find({ property_id: { $in: matchedPropertyMineIds } });
    for (let matchedPropertyRentDetail of matchedPropertyRentDetailsMine) {
      const matchedPropertyId = matchedPropertyRentDetail.property_id;
      const matchedPercentage = mineMatchedPropertyDictList[matchedPropertyId];
      matchedPropertyRentDetail.matched_percentage = matchedPercentage;
    }
    const matchedPropertyDetailsMine = [...matchedPropertyRentDetailsMine];

    // 4) Get matched_customer_id_other from matched property
    const matchedPropertyOtherIds = matchedPCustomer.matched_property_id_other.map(property => property.property_id);

    // 5) Get customer details using matched_customer_id_other from residentialPropertyCustomerRent
    const matchedPropertyRentDetailsOther = await CommercialPropertyRent.find({ property_id: { $in: matchedPropertyOtherIds } }).lean().exec();
    // const matchedPropertyBuyDetailsOther = await ResidentialPropertySell.find({ property_id: { $in: matchedPropertyOtherIds } });
    for (let matchedPropertyRentDetail of matchedPropertyRentDetailsOther) {
      const matchedPropertyId = matchedPropertyRentDetail.property_id;
      const matchedPercentage = otherMatchedPropertyDictList[matchedPropertyId];
      matchedPropertyRentDetail.matched_percentage = matchedPercentage;
    }
    let matchedPropertyDetailsOther = [...matchedPropertyRentDetailsOther];
    matchedPropertyDetailsOther = await replaceOwnerDetailsWithAgentDetails(matchedPropertyDetailsOther, reqUserId);
    // 6) Return both customer details
    return {
      matchedPropertyDetailsMine,
      matchedPropertyDetailsOther
    };
  } catch (err) {
    console.error(err);
    return { error: "Internal Server Error", details: err };
  }

}

const getMatchedCommercialProptiesBuyList = async (customerDetailsParam) => {
  try {
    const customerDetails = JSON.parse(JSON.stringify(customerDetailsParam));
    const customer_id = customerDetails.customer_id;
    const reqUserId = customerDetails.req_user_id;

    // 1) Get matched property using property_id from residentialRentPropertyMatch
    const matchedPCustomer = await CommercialBuyCustomerMatch.findOne({ customer_id: customer_id }).lean().exec();

    if (!matchedPCustomer) {
      return { error: "No matched property found" };
    }
    // create dict of matched_property_id_mine and percentage
    const mineMatchedPropertyList = matchedPCustomer.matched_property_id_mine;
    const mineMatchedPropertyDictList = {};
    for (let mineMatchedPropertyDict of mineMatchedPropertyList) {
      mineMatchedPropertyDictList[mineMatchedPropertyDict.property_id] = mineMatchedPropertyDict.matched_percentage;
    }
    // create dict of matched_property_id_other and percentage
    const otherMatchedPropertyList = matchedPCustomer.matched_property_id_other;
    const otherMatchedPropertyDictList = {};
    for (let otherMatchedPropertyDict of otherMatchedPropertyList) {
      otherMatchedPropertyDictList[otherMatchedPropertyDict.property_id] = otherMatchedPropertyDict.matched_percentage;
    }

    // 2) Get matched_customer_id_mine from matched property
    const matchedPropertyMineIds = matchedPCustomer.matched_property_id_mine.map(property => property.property_id);

    // 3) Get customer details using matched_customer_id_mine from residentialPropertyCustomerRent
    const matchedPropertyRentDetailsMine = await CommercialPropertySell.find({ property_id: { $in: matchedPropertyMineIds } }).lean().exec();
    // const matchedPropertyBuyDetailsMine = await ResidentialPropertySell.find({ property_id: { $in: matchedPropertyMineIds } });
    for (let matchedPropertyRentDetail of matchedPropertyRentDetailsMine) {
      const matchedPropertyId = matchedPropertyRentDetail.property_id;
      const matchedPercentage = mineMatchedPropertyDictList[matchedPropertyId];
      matchedPropertyRentDetail.matched_percentage = matchedPercentage;
    }
    const matchedPropertyDetailsMine = [...matchedPropertyRentDetailsMine];

    // 4) Get matched_customer_id_other from matched property, this will contain others others property id as well
    const matchedPropertyOtherIds = matchedPCustomer.matched_property_id_other.map(property => property.property_id);

    // 5) Get customer details using matched_customer_id_other from residentialPropertyCustomerRent
    const matchedPropertyRentDetailsOther = await CommercialPropertySell.find({ property_id: { $in: matchedPropertyOtherIds } }).lean().exec();
    // const matchedPropertyBuyDetailsOther = await ResidentialPropertySell.find({ property_id: { $in: matchedPropertyOtherIds } });
    for (let matchedPropertyRentDetail of matchedPropertyRentDetailsOther) {
      const matchedPropertyId = matchedPropertyRentDetail.property_id;
      const matchedPercentage = otherMatchedPropertyDictList[matchedPropertyId];
      matchedPropertyRentDetail.matched_percentage = matchedPercentage;
    }
    let matchedPropertyDetailsOther = [...matchedPropertyRentDetailsOther];
    matchedPropertyDetailsOther = await replaceOwnerDetailsWithAgentDetails(matchedPropertyDetailsOther, reqUserId);
    // 6) Return both customer details
    return {
      matchedPropertyDetailsMine,
      matchedPropertyDetailsOther
    };
  } catch (err) {
    console.error(err);
    return { error: "Internal Server Error", details: err };
  }

}

const getMatchedCommercialCustomerRentList = async (propertyDetailsParam) => {
  try {
    const propertyDetails = JSON.parse(JSON.stringify(propertyDetailsParam));
    const property_id = propertyDetails.property_id;
    const reqUserId = propertyDetails.req_user_id;

    // 1) Get matched property using property_id from residentialRentPropertyMatch
    const matchedProperty = await CommercialRentPropertyMatch.findOne({ property_id: property_id }).lean().exec();

    if (!matchedProperty) {
      return { error: "No matched property found" };
    }

    // create dict of matched_customer_id_mine and percentage
    const myMatchedCustomeryList = matchedProperty.matched_customer_id_mine;
    const myMatchedCustomeryDictList = {};
    for (let myMatchedCustomerDict of myMatchedCustomeryList) {
      myMatchedCustomeryDictList[myMatchedCustomerDict.customer_id] = myMatchedCustomerDict.matched_percentage;
    }

    // create dict of matched_customer_id_other and percentage
    const otherMatchedCustomeryList = matchedProperty.matched_customer_id_other;
    const otherMatchedCustomeryDictList = {};
    for (let otherMatchedCustomerDict of otherMatchedCustomeryList) {
      otherMatchedCustomeryDictList[otherMatchedCustomerDict.customer_id] = otherMatchedCustomerDict.matched_percentage;
    }

    // 2) Get matched_customer_id_mine from matched property
    const matchedCustomerMineIds = matchedProperty.matched_customer_id_mine.map(customer => customer.customer_id);

    // 3) Get customer details using matched_customer_id_mine from residentialPropertyCustomerRent
    const matchedCustomerRentDetailsMine = await CommercialPropertyCustomerRent.find({ customer_id: { $in: matchedCustomerMineIds } }).lean().exec();
    // const matchedCustomerBuyDetailsMine = await CommercialPropertyCustomerBuy.find({ customer_id: { $in: matchedCustomerMineIds } });
    for (let matchedCustomerRentDetail of matchedCustomerRentDetailsMine) {
      const matchedCustomerId = matchedCustomerRentDetail.customer_id;
      const matchedPercentage = myMatchedCustomeryDictList[matchedCustomerId];
      matchedCustomerRentDetail.matched_percentage = matchedPercentage;
    }
    // const matchedCustomerDetailsMine = [...matchedCustomerRentDetailsMine, ...matchedCustomerBuyDetailsMine];
    const matchedCustomerDetailsMine = [...matchedCustomerRentDetailsMine];

    // 4) Get matched_customer_id_other from matched property
    const matchedCustomerOtherIds = matchedProperty.matched_customer_id_other.map(customer => customer.customer_id);

    // 5) Get customer details using matched_customer_id_other from residentialPropertyCustomerRent
    const matchedCustomerRentDetailsOther = await CommercialPropertyCustomerRent.find({ customer_id: { $in: matchedCustomerOtherIds } }).lean().exec();
    // const matchedCustomerBuyDetailsOther = await CommercialPropertyCustomerBuy.find({ customer_id: { $in: matchedCustomerOtherIds } });
    for (let matchedCustomerRentDetail of matchedCustomerRentDetailsOther) {
      const matchedCustomerId = matchedCustomerRentDetail.customer_id;
      const matchedPercentage = otherMatchedCustomeryDictList[matchedCustomerId];
      matchedCustomerRentDetail.matched_percentage = matchedPercentage;
    }
    // const matchedCustomerDetailsOther = [...matchedCustomerRentDetailsOther, ...matchedCustomerBuyDetailsOther];
    const matchedCustomerDetailsOther = [...matchedCustomerRentDetailsOther];
    await replaceCustomerDetailsWithAgentDetails(matchedCustomerDetailsOther, reqUserId);
    // 6) Return both customer details
    return {
      matchedCustomerDetailsMine,
      matchedCustomerDetailsOther
    };
  } catch (err) {
    console.error(err);
    return { error: "Internal Server Error", details: err };
  }
};

const getMatchedCommercialCustomerSellList = async (propertyDetailsParam) => {
  try {
    const propertyDetails = JSON.parse(JSON.stringify(propertyDetailsParam));
    const property_id = propertyDetails.property_id;
    const reqUserId = propertyDetails.req_user_id;

    // 1) Get matched property using property_id from residentialRentPropertyMatch
    const matchedProperty = await CommercialBuyPropertyMatch.findOne({ property_id: property_id }).lean().exec();

    if (!matchedProperty) {
      return { error: "No matched property found" };
    }
    // create dict of matched_customer_id_mine and percentage
    const myMatchedCustomeryList = matchedProperty.matched_customer_id_mine;
    const myMatchedCustomeryDictList = {};
    for (let myMatchedCustomerDict of myMatchedCustomeryList) {
      myMatchedCustomeryDictList[myMatchedCustomerDict.customer_id] = myMatchedCustomerDict.matched_percentage;
    }

    // create dict of matched_customer_id_other and percentage
    const otherMatchedCustomeryList = matchedProperty.matched_customer_id_other;
    const otherMatchedCustomeryDictList = {};
    for (let otherMatchedCustomerDict of otherMatchedCustomeryList) {
      otherMatchedCustomeryDictList[otherMatchedCustomerDict.customer_id] = otherMatchedCustomerDict.matched_percentage;
    }

    // 2) Get matched_customer_id_mine from matched property
    const matchedCustomerMineIds = matchedProperty.matched_customer_id_mine.map(customer => customer.customer_id);

    // 3) Get customer details using matched_customer_id_mine from residentialPropertyCustomerRent
    // const matchedCustomerRentDetailsMine = await CommercialPropertyCustomerRent.find({ customer_id: { $in: matchedCustomerMineIds } });
    const matchedCustomerBuyDetailsMine = await CommercialPropertyCustomerBuy.find({ customer_id: { $in: matchedCustomerMineIds } }).lean().exec();
    for (let matchedCustomerRentDetail of matchedCustomerBuyDetailsMine) {
      const matchedCustomerId = matchedCustomerRentDetail.customer_id;
      const matchedPercentage = myMatchedCustomeryDictList[matchedCustomerId];
      matchedCustomerRentDetail.matched_percentage = matchedPercentage;
    }
    const matchedCustomerDetailsMine = [...matchedCustomerBuyDetailsMine];

    // 4) Get matched_customer_id_other from matched property
    const matchedCustomerOtherIds = matchedProperty.matched_customer_id_other.map(customer => customer.customer_id);

    // 5) Get customer details using matched_customer_id_other from residentialPropertyCustomerRent
    // const matchedCustomerRentDetailsOther = await CommercialPropertyCustomerRent.find({ customer_id: { $in: matchedCustomerOtherIds } });
    const matchedCustomerBuyDetailsOther = await CommercialPropertyCustomerBuy.find({ customer_id: { $in: matchedCustomerOtherIds } }).lean().exec();
    for (let matchedCustomerRentDetail of matchedCustomerBuyDetailsOther) {
      const matchedCustomerId = matchedCustomerRentDetail.customer_id;
      const matchedPercentage = otherMatchedCustomeryDictList[matchedCustomerId];
      matchedCustomerRentDetail.matched_percentage = matchedPercentage;
    }

    const matchedCustomerDetailsOther = [...matchedCustomerBuyDetailsOther];
    await replaceCustomerDetailsWithAgentDetails(matchedCustomerDetailsOther, reqUserId);
    // 6) Return both customer details
    return {
      matchedCustomerDetailsMine,
      matchedCustomerDetailsOther
    };
  } catch (err) {
    console.error(err);
    return { error: "Internal Server Error", details: err };
  }

}

const getMatchedCommercialProptiesList = async (customerDetailsParam) => {
  try {
    const customerDetails = JSON.parse(JSON.stringify(customerDetailsParam));
    const customer_id = customerDetails.customer_id;

    // 1) Get matched property using property_id from residentialRentPropertyMatch
    const matchedPCustomer = await CommercialRentCustomerMatch.findOne({ customer_id: customer_id });

    if (!matchedPCustomer) {
      return { error: "No matched property found" };
    }

    // 2) Get matched_customer_id_mine from matched property
    const matchedPropertyMineIds = matchedPCustomer.matched_property_id_mine.map(property => property.property_id);

    // 3) Get customer details using matched_customer_id_mine from residentialPropertyCustomerRent
    const matchedPropertyRentDetailsMine = await CommercialPropertyRent.find({ property_id: { $in: matchedPropertyMineIds } });
    const matchedPropertyBuyDetailsMine = await CommercialPropertySell.find({ property_id: { $in: matchedPropertyMineIds } });

    const matchedPropertyDetailsMine = [...matchedPropertyRentDetailsMine, ...matchedPropertyBuyDetailsMine];

    // 4) Get matched_customer_id_other from matched property
    const matchedPropertyOtherIds = matchedPCustomer.matched_property_id_other.map(property => property.property_id);

    // 5) Get customer details using matched_customer_id_other from residentialPropertyCustomerRent
    const matchedPropertyRentDetailsOther = await CommercialPropertyRent.find({ property_id: { $in: matchedPropertyOtherIds } });
    const matchedPropertyBuyDetailsOther = await CommercialPropertySell.find({ property_id: { $in: matchedPropertyOtherIds } });

    const matchedPropertyDetailsOther = [...matchedPropertyRentDetailsOther, ...matchedPropertyBuyDetailsOther];
    // 6) Return both customer details
    return {
      matchedPropertyDetailsMine,
      matchedPropertyDetailsOther
    };
  } catch (err) {
    console.error(err);
    return { error: "Internal Server Error", details: err };
  }

}

module.exports = {
  getmatchedResidentialCustomerRentList,
  getMatchedResidentialProptiesRentList,
  matchedResidentialProptiesBuyList,
  getMatchedResidentialCustomerBuyList,
  getMatchedCommercialProptiesRentList,
  getMatchedCommercialProptiesBuyList,
  getMatchedCommercialCustomerRentList,
  getMatchedCommercialCustomerSellList,
  getMatchedCommercialProptiesList
};