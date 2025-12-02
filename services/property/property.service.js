
const CommercialPropertyRent = require("../../models/commercialPropertyRent");
const CommercialPropertySell = require("../../models/commercialPropertySell");
const CommercialBuyCustomerMatch = require('../../models/match/commercialBuyCustomerMatch');
const CommercialRentCustomerMatch = require('../../models/match/commercialRentCustomerMatch');

const ResidentialPropertyRent = require("../../models/residentialPropertyRent");
const ResidentialPropertySell = require("../../models/residentialPropertySell");
const ResidentialRentCustomerMatch = require('../../models/match/residentialRentCustomerMatch');
const ResidentialBuyCustomerMatch = require('../../models/match/residentialBuyCustomerMatch');

const User = require("../../models/user");



const getPropertyDetailsByIdToShare = async (propObj) => {
    const body = JSON.parse(JSON.stringify(propObj));
    logger.info(JSON.stringify(propObj));
    // const propertyId = JSON.parse(JSON.stringify(req.body)).property_id;
    // const agentId = JSON.parse(JSON.stringify(req.body)).agent_id;
    // property_type: String,
    //   property_for: String,
    let propQuery = null;
    if (propObj.property_type.toLowerCase() === "residential") {
        if (propObj.property_for.toLowerCase() === "rent") {
            propQuery = ResidentialPropertyRent.findOne({ property_id: propObj.property_id }).lean().exec();
        } else if (propObj.property_for.toLowerCase() === "sell") {
            propQuery = ResidentialPropertySell.findOne({ property_id: propObj.property_id }).lean().exec();
        }

    } else {
        propQuery = commercialProperty.findOne({ property_id: propObj.property_id }).exec();
    }
    const results = await Promise.all([
        propQuery,
        User.findOne({ id: body.agent_id }).exec()
    ]);
    const propertyDetail = results[0];
    const agentDetails = results[1];
    propertyDetail["owner_details"] = {
        "name": agentDetails.name,
        // "company_name": agentDetails.company_name,
        "mobile1": agentDetails.mobile,
        "address": agentDetails.address,
    }
    return propertyDetail;

};

const getPropertyListingForMeeting = async (propObj) => {
    const agentDetails = JSON.parse(JSON.stringify(propObj));
    logger.info("getPropertyListingForMeeting: " + JSON.stringify(propObj));
    const agent_id = agentDetails.agent_id;
    const property_type = agentDetails.property_type;
    const customerId = agentDetails.customer_id;
    const customerAgentId = agentDetails.agent_id_of_client;
    const reqUserId = agentDetails.req_user_id;
    let property_for = agentDetails.property_for;

    let PropertyModel;
    let MatchModel;

    if (property_type === "Residential") {
        if (property_for === "Buy") {
            property_for = "Sell";
        }
        if (property_for === "Rent") {
            PropertyModel = ResidentialPropertyRent;
            MatchModel = ResidentialRentCustomerMatch;
        } else if (property_for === "Sell") {
            PropertyModel = ResidentialPropertySell;
            MatchModel = ResidentialBuyCustomerMatch;
        }
    } else if (property_type === "Commercial") {
        if (property_for === "Buy") {
            property_for = "Sell";
        }
        if (property_for === "Rent") {
            PropertyModel = CommercialPropertyRent;
            MatchModel = CommercialRentCustomerMatch;
        } else if (property_for === "Sell") {
            PropertyModel = CommercialPropertySell;
            MatchModel = CommercialBuyCustomerMatch;
        }
    }

    // const myPropertyRentListX = await PropertyModel.find({ agent_id: agent_id, property_type: property_type, property_for: property_for }).lean().exec();
    // find the list of properties which are matched with this customer but from other agents
    // There is possiblity that matched job is not run yet then we need to give users those properties which are matched with this customer from his own list
    const matchedData = await MatchModel.findOne({ customer_id: customerId }).lean().exec();
    // I have matched data now  my properties and other agent properties
    // 1) now if reqUserId is same as customerAgentId then I will show all matched properties
    // 2) now if reqUserId is not same as customerAgentId then I will show all matched properties which agent id is same as reqUserId

    const otherPropertyListAfterMasking = [];
    let myMatchedPropertyList = []

    if (matchedData) {
        // to find out mine
        const myMatchedPropertyDictList = matchedData.matched_property_id_mine;
        const myMatchedPropertyIdList = [];
        const myMatchedPropertyMap = {};
        if (reqUserId === customerAgentId) {
            for (let myMatchedPropertyDict of myMatchedPropertyDictList) {
                myMatchedPropertyIdList.push(myMatchedPropertyDict.property_id);
                myMatchedPropertyMap[myMatchedPropertyDict.property_id.toString()] = myMatchedPropertyDict.matched_percentage.toString();
            }
            myMatchedPropertyList = await PropertyModel.find({ property_id: { $in: myMatchedPropertyIdList } }).lean().exec();
            // update myMatchedPropertyList with matched percentage
            for (let myMatchedProperty of myMatchedPropertyList) {
                myMatchedProperty["matched_percentage"] = myMatchedPropertyMap[myMatchedProperty.property_id.toString()]
            }
        }


        // to find out others
        const otherAgentPropertyDictList = matchedData.matched_property_id_other;
        let otherAgentPropertyList = [];
        const otherMatchedPropertyMap = {};
        for (let otherAgentPropertyDict of otherAgentPropertyDictList) {
            otherAgentPropertyList.push(otherAgentPropertyDict.property_id);
            otherMatchedPropertyMap[otherAgentPropertyDict.property_id.toString()] = otherAgentPropertyDict.matched_percentage.toString();
        }
        if (reqUserId === customerAgentId) {
            const otherPropertyList = await PropertyModel.find({ property_id: { $in: otherAgentPropertyList } }).lean().exec();
            for (let otherProperty of otherPropertyList) {
                otherProperty["matched_percentage"] = otherMatchedPropertyMap[otherProperty.property_id.toString()];
                const otherAgent = await User.findOne({ id: otherProperty.agent_id }).lean().exec();
                // remove those agent properties which are deleted.
                if (otherAgent) {
                    otherProperty.property_address = {
                        city: otherProperty.property_address.city,
                        main_text: otherProperty.property_address.main_text,
                        formatted_address: otherProperty.property_address.formatted_address,
                        flat_number: "",
                        building_name: "",
                        landmark_or_street: otherProperty.property_address.landmark_or_street,
                    }
                    otherProperty.owner_details = {
                        name: otherAgent.name ? otherAgent.name : "Agent",
                        mobile1: otherAgent.mobile,
                        address: "Please contact agent and refer to property id: " + otherProperty.property_id?.slice(-6)
                    }
                    otherPropertyListAfterMasking.push(otherProperty);
                }

            }
        }

        if (reqUserId !== customerAgentId) {
            const otherPropertyList = await PropertyModel.find({ property_id: { $in: otherAgentPropertyList } }).lean().exec();
            for (let otherProperty of otherPropertyList) {
                otherProperty["matched_percentage"] = otherMatchedPropertyMap[otherProperty.property_id.toString()];
                const otherAgent = await User.findOne({ id: otherProperty.agent_id }).lean().exec();
                // remove those agent properties which are deleted.
                if (otherAgent) {
                    otherProperty.property_address = {
                        city: otherProperty.property_address.city,
                        main_text: otherProperty.property_address.main_text,
                        formatted_address: otherProperty.property_address.formatted_address,

                        landmark_or_street: otherProperty.property_address.landmark_or_street,
                    }
                    otherProperty.owner_details = {
                        name: otherAgent.name ? otherAgent.name : "Agent",
                        mobile1: otherAgent.mobile,
                        address: "Please contact agent and refer to property id: " + otherProperty.property_id?.slice(-6)
                    }
                    otherPropertyListAfterMasking.push(otherProperty);
                }

            }
            // if reqUserId is not same as customerAgentId then I will show only my matched properties
            myMatchedPropertyList = myMatchedPropertyList.filter(property => property.agent_id === reqUserId);
            // and other agent properties will be empty
            otherAgentPropertyList = [];

        }

    }
    // the aregument order sud be first matched data list then all data list so matched data will be added in final merge list
    // const myPropertyRentList = mergeDedupe(myMatchedPropertyList, myPropertyRentListX, "property_id");
    // const myPropertyRentList = removeDuplicates(myMatchedPropertyList, myPropertyRentListX, "property_id");
    const finalData = [...myMatchedPropertyList, ...otherPropertyListAfterMasking];
    return finalData;

};

module.exports = {
    getPropertyDetailsByIdToShare,
    getPropertyListingForMeeting,
};