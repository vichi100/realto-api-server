const { customAlphabet } = require('nanoid');
const User = require("../models/user");


const uniqueId = () => {
  const nanoid1 = customAlphabet('1234567890', 5); // Generates a 5-digit random number
  const nanoid2 = customAlphabet('1234567890', 3);
  const nanoid3 = customAlphabet('1234567890', 2);
  const uniqueNumber = Date.now().toString() + nanoid1() + nanoid2() + nanoid3();
  logger.info(uniqueNumber); // Example: 171051387612387
  return uniqueNumber;
}


const getFileName = (agent_id, index) => {
  return agent_id + "_" + index + "_" + new Date(Date.now()).getTime() + ".jpeg";
}


const getDirectoryPath = (agent_id) => {
  const hashCode = Math.abs(hash(agent_id)).toString();
  logger.info("propertyDetails: ", agent_id)
  logger.info("hashCode: ", hashCode);

  const lastFive = hashCode.slice(- 5);
  const childOneDir = lastFive.slice(0, 2)
  const childTwoDir = lastFive.slice(2, 4)
  const childThreeDir = lastFive.slice(-1)
  logger.info("lastFive: ", lastFive);
  logger.info("childOneDir: ", childOneDir);
  logger.info("childTwoDir: ", childTwoDir);
  logger.info("childThreeDir: ", childThreeDir);
  const dir = "/" + childOneDir + "/" + childTwoDir + "/" + childThreeDir + "/";
  return dir;

}


// This is for Properties of other agents
const replaceOwnerDetailsWithAgentDetails = async (matchedPropertyDetailsOther, reqUserId) => {// Array as argument
  const finalObjAfterMasking = [];
  for (let matchedPropertyDetailsOtherX of matchedPropertyDetailsOther) {
    const otherPropertyAgentId = matchedPropertyDetailsOtherX.agent_id;
    if (otherPropertyAgentId === reqUserId) {
      finalObjAfterMasking.push(matchedPropertyDetailsOtherX);
      continue;
    }
    const otherPropertyAgentIdDetails = await User.findOne({ id: otherPropertyAgentId }).lean().exec();
    if (otherPropertyAgentIdDetails !== null) {
      matchedPropertyDetailsOtherX["property_address"] = {
        city: matchedPropertyDetailsOtherX.property_address.city,
        main_text: matchedPropertyDetailsOtherX.property_address.main_text,
        formatted_address: matchedPropertyDetailsOtherX.property_address.formatted_address,
        flat_number: '',
        building_name: '',
        landmark_or_street: matchedPropertyDetailsOtherX.property_address.landmark_or_street,
      }
      matchedPropertyDetailsOtherX["owner_details"] = {
        name: otherPropertyAgentIdDetails.name ? otherPropertyAgentIdDetails.name + ', Agent' : 'Agent',
        mobile1: otherPropertyAgentIdDetails.mobile,
        address: 'Please contact agent and refer to property id: ' + matchedPropertyDetailsOtherX.property_id?.slice(-6),
      }
      finalObjAfterMasking.push(matchedPropertyDetailsOtherX);
    }
  }
  return finalObjAfterMasking;
}


// This is for Customers of other agents
const replaceCustomerDetailsWithAgentDetails = async (matchedCustomerDetailsOther, reqUserId) => {// Array as argument
  for (let matchedCustomerDetailsOtherX of matchedCustomerDetailsOther) {
    const otherCustomerAgentId = matchedCustomerDetailsOtherX.agent_id;
    if (otherCustomerAgentId !== reqUserId) {
      const otherCustomerAgentIdDetails = await User.findOne({ id: otherCustomerAgentId }).lean().exec();

      matchedCustomerDetailsOtherX["customer_details"] = {
        name: otherCustomerAgentIdDetails.name === null ? 'Agent' : otherCustomerAgentIdDetails.name + ', Agent',
        mobile1: otherCustomerAgentIdDetails.mobile,
        address: 'Please contact agent and refer to customer Id: ' + matchedCustomerDetailsOtherX.customer_id?.slice(-6),
      }
    }
  }
  return matchedCustomerDetailsOther;
}


// modify property adress and owner deatils with agent details
const modifyPropertyOwnerAndAddressDetails = async (reqUserId, propertyDetail) => {
  if (Array.isArray(propertyDetail)) {
    for (let i = 0; i < propertyDetail.length; i++) {
      if (reqUserId !== propertyDetail[i].agent_id) {
        const otherPropertyAgentIdDetails = await User.findOne({ id: propertyDetail[i].agent_id }).lean().exec();
        propertyDetail[i]["owner_details"] = {
          name: otherPropertyAgentIdDetails.name ? otherPropertyAgentIdDetails.name + ', Agent' : 'Agent',
          mobile1: otherPropertyAgentIdDetails.mobile,
          address: 'Please contact agent and refer to property id: ' + propertyDetail[i].property_id?.slice(-6)
        }
        propertyDetail[i]["property_address"] = {
          city: propertyDetail[i].property_address.city,
          main_text: propertyDetail[i].property_address.main_text,
          formatted_address: propertyDetail[i].property_address.formatted_address,
          flat_number: '',
          building_name: '',
          landmark_or_street: propertyDetail[i].property_address.landmark_or_street,
        }
      }
    }
  } else {
    if (reqUserId !== propertyDetail.agent_id) {
      propertyDetail["property_address"] = {
        city: propertyDetail.property_address.city,
        main_text: propertyDetail.property_address.main_text,
        formatted_address: propertyDetail.property_address.formatted_address,
        flat_number: '',
        building_name: '',
        landmark_or_street: propertyDetail.property_address.landmark_or_street,
      }
      const otherPropertyAgentIdDetails = await User.findOne({ id: otherPropertyAgentId }).lean().exec();
      propertyDetail["owner_details"] = {
        name: otherPropertyAgentIdDetails.name ? otherPropertyAgentIdDetails.name + ' ,Agent' : 'Agent',
        mobile1: otherPropertyAgentIdDetails.mobile,
        address: 'Please contact agent and refer to property id: ' + propertyDetail.property_id?.slice(-6)
      }
    }
  }
}


// modifyCustomerDetails with agent details
const modifyCustomerDetails = async (reqUserId, customerDetails) => {
  if (reqUserId !== customerDetails.agent_id) {
    const otherCustomerAgentIdDetails = await User.findOne({ id: customerDetails.agent_id }).lean().exec();
    customerDetails["customer_details"] = {
      name: otherCustomerAgentIdDetails.name ? otherCustomerAgentIdDetails.name + ' ,Agent' : 'Agent',
      mobile1: otherCustomerAgentIdDetails.mobile,
      address: 'Please contact agent and refer to customer id: ' + customerDetails.customer_id?.slice(-6)
    }
  }

}

// this will remove duplicates from list2 based on propertyName
// and will return the list2
function removeDuplicates(list1, list2, propertyName) {
  // Create a Set to store the values of the specified property from the first list
  const propertyValuesFromList1 = new Set(list1.map(item => item[propertyName]));

  // Filter the second list, keeping only items whose specified property value is NOT in the Set
  const uniqueList2 = list2.filter(item => !propertyValuesFromList1.has(item[propertyName]));

  return uniqueList2;
}

// merge to lists but remove duplicate based on id
const mergeDedupe = (arr1, arr2, prop) => {
  const map = new Map();

  // Add all items from first array
  arr1.forEach(item => map.set(item[prop], item));

  // Add items from second array only if not already present
  arr2.forEach(item => {
    if (!map.has(item[prop])) {
      map.set(item[prop], item);
    }
  });

  return Array.from(map.values());
}

const hash = (str) => {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var character = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + character;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}



module.exports = {
  uniqueId,
  getFileName,
  getDirectoryPath,
  replaceOwnerDetailsWithAgentDetails,
  replaceCustomerDetailsWithAgentDetails,
  modifyPropertyOwnerAndAddressDetails,
  modifyCustomerDetails,
  removeDuplicates,
  mergeDedupe
};