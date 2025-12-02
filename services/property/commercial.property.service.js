

const CommercialPropertyRent = require("../../models/commercialPropertyRent");
const CommercialPropertySell = require("../../models/commercialPropertySell");
const CommercialBuyPropertyMatch = require('../../models/match/commercialBuyPropertyMatch'); 
const CommercialRentPropertyMatch = require('../../models/match/commercialRentPropertyMatch');
const User = require("../../models/user");
const fs = require('fs');
const sharp = require('sharp');
const { IMAGE_PATH_URL} = require('./../../config/env');
const { getDirectoryPath, getFileName, uniqueId } = require("../utility.service");



const addNewCommercialProperty = async (propertyFinalDetails) => {
    const payload = propertyFinalDetails && propertyFinalDetails.body ? propertyFinalDetails.body : propertyFinalDetails;
    logger.info("Prop details1: " + JSON.stringify(payload));
    const obj = JSON.parse(JSON.stringify(payload));
    const propertyDetails = JSON.parse(obj.propertyFinalDetails)

    const dir = getDirectoryPath(propertyDetails.agent_id);
    const createDirPath = IMAGE_PATH_URL + dir;


    if (!fs.existsSync(createDirPath)) {
        fs.mkdirSync(createDirPath, { recursive: true });
    }

    // storing files- START
    propertyDetails.image_urls = [];

    const files = propertyFinalDetails && propertyFinalDetails.files ? propertyFinalDetails.files : {};
    Object.keys(files).forEach((item, index) => {
        logger.info("item", item);
        const file = files[item];

        const fileName = getFileName(propertyDetails.agent_id, index);
        // propertyDetails.agent_id + "_"+index+ "_"+ new Date(Date.now()).getTime() + ".jpeg";
        const path = createDirPath + fileName
        propertyDetails.image_urls.push({ url: dir + fileName });

        sharp(file.data)
            // .resize(320, 240)
            .toFile(path, (err, info) => {
                if (err) {
                    logger.info('sharp>>>', err);
                }
                else {
                    logger.info('resize ok !');
                }
            });

    })
    // storing files- END

    // logger.info("Prop details2: " + propertyDetails);
    const propertyId = uniqueId();
    const locationArea = propertyDetails.property_address.location_area
    const gLocation = locationArea.location;

    const propertyDetailsDict = {
        property_id: propertyId,
        agent_id: propertyDetails.agent_id,
        property_type: propertyDetails.property_type,
        property_for: propertyDetails.property_for,
        owner_details: {
            name: propertyDetails.owner_details.name,
            mobile1: propertyDetails.owner_details.mobile1,
            address: propertyDetails.owner_details.address
        },
        location: gLocation,
        property_address: {
            city: propertyDetails.property_address.city,
            main_text: locationArea.main_text,
            formatted_address: locationArea.formatted_address,
            flat_number: propertyDetails.property_address.flat_number,
            building_name: propertyDetails.property_address.building_name,
            landmark_or_street: propertyDetails.property_address.landmark_or_street,
            pin: propertyDetails.property_address.pin
        },

        property_details: {
            property_used_for: propertyDetails.property_details.property_used_for,
            building_type: propertyDetails.property_details.building_type,
            ideal_for: propertyDetails.property_details.ideal_for,
            parking_type: propertyDetails.property_details.parking_type,
            property_age: propertyDetails.property_details.property_age,
            power_backup: propertyDetails.property_details.power_backup,
            property_size: propertyDetails.property_details.property_size
        },

        image_urls: propertyDetails.image_urls, //["vichi1"],
        create_date_time: new Date(Date.now()),
        update_date_time: new Date(Date.now())
    };

    if (propertyDetails.property_type === "Commercial") {
        if (propertyDetails.property_for === "Rent") {
            propertyDetailsDict["rent_details"] = {
                expected_rent: propertyDetails.rent_details.expected_rent,
                expected_deposit: propertyDetails.rent_details.expected_deposit,
                available_from: propertyDetails.rent_details.available_from
            };

            const savedProperty = await CommercialPropertyRent.create(propertyDetailsDict);
            logger.info("Property saved with create, and default:", savedProperty);

        } else if (propertyDetails.property_for === "Sell") {
            propertyDetailsDict["sell_details"] = {
                expected_sell_price: propertyDetails.sell_details.expected_sell_price,
                maintenance_charge: propertyDetails.sell_details.maintenance_charge,
                available_from: propertyDetails.sell_details.available_from,
                negotiable: propertyDetails.sell_details.negotiable
            };

            const savedProperty = await CommercialPropertySell.create(propertyDetailsDict);
            logger.info("Property saved with create, and default:", savedProperty);
        }

        return JSON.stringify(propertyDetailsDict);
    }


};

const getCommercialPropertyListings = async (agentDetailsParam) => {
    try {
        const agentDetails = JSON.parse(JSON.stringify(agentDetailsParam && agentDetailsParam.body ? agentDetailsParam.body : agentDetailsParam));
        const agent_id = agentDetails.agent_id;
        const reqUserId = agentDetails.req_user_id;

        if (reqUserId === agent_id) {
            // Agent case: Fetch all properties for the agent
            const commercialPropertyRentData = await CommercialPropertyRent.find({ agent_id: agent_id }).lean().exec();
            const commercialPropertySellData = await CommercialPropertySell.find({ agent_id: agent_id }).lean().exec();

            // Merge and sort the properties
            const allProperties = [...commercialPropertyRentData, ...commercialPropertySellData];
            allProperties.sort((a, b) => new Date(b.update_date_time) - new Date(a.update_date_time));

            logger.info(JSON.stringify(allProperties));
            return allProperties;
        } else {
            // Employee case: Fetch assigned properties
            const empObj = await User.findOne({ id: reqUserId }).lean().exec();

            if (!empObj) {
                // Handle case where employee is not found
                console.error(`Employee with id ${reqUserId} not found`);
                return { errorCode: "EMPLOYEE_NOT_FOUND", message: "Employee not found" };
            }

            const commercialPropertyRentIds = empObj.assigned_commercial_rent_properties || [];
            const commercialPropertySellIds = empObj.assigned_commercial_sell_properties || [];

            const commercialPropertyRentData = await CommercialPropertyRent.find({ property_id: { $in: commercialPropertyRentIds } }).lean().exec();
            const commercialPropertySellData = await CommercialPropertySell.find({ property_id: { $in: commercialPropertySellIds } }).lean().exec();

            // Merge and sort the properties
            const allProperties = [...commercialPropertyRentData, ...commercialPropertySellData];
            allProperties.sort((a, b) => new Date(b.update_date_time) - new Date(a.update_date_time));

            logger.info(JSON.stringify(allProperties));
            return allProperties;
        }
    } catch (err) {
        console.error(err);
        return "Internal Server Error";
    }
};


const deleteCommercialProperty = async (deleteParams) => {
    const reqData = JSON.parse(JSON.stringify(deleteParams && deleteParams.body ? deleteParams.body : deleteParams));
    logger.info(JSON.stringify(reqData));
    const reqUserId = reqData.req_user_id;
    const itemToDelete = reqData.dataToDelete;
    const propertyId = itemToDelete.property_id;
    const propertyAgentId = itemToDelete.agent_id;
    // first check if request user is agent or employee
    // if agent he can delete the property
    // if employee then he can delete if he has admin right
    const user = await User.findOne({ id: reqUserId }).lean().exec();
    if (user) {
        // checks if reqUserId works for propertyAgentId
        if (user.works_for !== propertyAgentId) {
            logger.info("Unauthorized access: User does not work for the property agent");
            return "Unauthorized access";
        }
    }
    if ((user.user_type === "agent" && reqUserId === propertyAgentId)
        || (user.user_type === "employee" && user.employee_role === "admin")) {
        // User is an agent or an employee with admin rights
        try {
            // Delete the property from CommercialPropertyRent and CommercialPropertySell collections
            if (itemToDelete.property_type === "Commercial" && itemToDelete.property_for === "Rent") {
                await CommercialPropertyRent.deleteOne({ property_id: propertyId });
                // Also delete from the match collections if they exist
                await CommercialRentPropertyMatch.deleteMany({ property_id: propertyId });
            } else if (itemToDelete.property_type === "Commercial" && itemToDelete.property_for === "Sell") {
                await CommercialPropertySell.deleteOne({ property_id: propertyId });
                // Also delete from the match collections if they exist
                await CommercialBuyPropertyMatch.deleteMany({ property_id: propertyId });
            }
            logger.info("Property deleted successfully");
            return "success";
        } catch (err) {
            logger.error(`Error deleting property: ${err}`);
            return "Internal Server Error";
        }
    } else {
        logger.info("Unauthorized access");
        return "Unauthorized access";
    }
};

const closeCommercialProperty = async (closeParams) => {
    const reqData = JSON.parse(JSON.stringify(closeParams && closeParams.body ? closeParams.body : closeParams));
    logger.info(JSON.stringify(reqData));
    const reqUserId = reqData.req_user_id;
    const itemToClose = reqData.dataToClose;
    const propertyId = itemToClose.property_id;
    const propertyAgentId = itemToClose.agent_id;
    const propertyStaus = itemToClose.property_status;
    var newStaus = 0;
    if (propertyStaus === 0) {
        newStaus = 1;
    } else {
        newStaus = 0;
    }
    // first check if request user is agent or employee
    // if agent he can delete the property
    // if employee then he can delete if he has admin right
    const user = await User.findOne({ id: reqUserId }).lean().exec();
    if (user) {
        // checks if reqUserId works for propertyAgentId
        if (user.works_for !== propertyAgentId) {
            logger.info("Unauthorized access: User does not work for the property agent");
            return "Unauthorized access";
        }
    }
    if ((user.user_type === "agent" && reqUserId === propertyAgentId)
        || (user.user_type === "employee")) {
        // User is an agent or an employee with admin rights
        try {
            // Delete the property from CommercialPropertyRent and CommercialPropertySell collections
            if (itemToClose.property_type === "Commercial" && itemToClose.property_for === "Rent") {
                const result = await CommercialPropertyRent.updateOne(
                    // Filter
                    { property_id: propertyId },
                    // Update
                    {
                        $set: {
                            property_status: newStaus,// Mark as closed
                            is_close_successfully: "yes",
                            update_date_time: new Date() // Optional: Update the timestamp
                        }
                    }
                );
                console.log("Update result:", result);
                // Also delete from the match collections if they exist
                // await CommercialRentPropertyMatch.deleteMany({ property_id: propertyId });
            } else if (itemToClose.property_type === "Commercial" && itemToClose.property_for === "Sell") {

                const result = await CommercialPropertySell.updateOne(
                    // Filter
                    { property_id: propertyId },
                    // Update
                    {
                        $set: {
                            property_status: newStaus,// Mark as closed
                            is_close_successfully: "yes",
                            update_date_time: new Date() // Optional: Update the timestamp
                        }
                    }
                );
                console.log("Update result:", result);
                // Also delete from the match collections if they exist
                // await CommercialBuyPropertyMatch.deleteMany({ property_id: propertyId });
            }
            logger.info("Property deleted successfully");
            return "success";
        } catch (err) {
            logger.error(`Error deleting property: ${err}`);
            return "Internal Server Error";
        }
    } else {
        logger.info("Unauthorized access");
        return "Unauthorized access";
    }
};

module.exports = {
    addNewCommercialProperty,
    getCommercialPropertyListings,
    deleteCommercialProperty,
    closeCommercialProperty
};