
const ResidentialPropertyRent = require("../../models/residentialPropertyRent");
const ResidentialPropertySell = require("../../models/residentialPropertySell");

const ResidentialRentPropertyMatch = require('../../models/match/residentialRentPropertyMatch');
const ResidentialBuyPropertyMatchBuy = require('../../models/match/residentialBuyPropertyMatch');
const User = require("../../models/user");
const fs = require('fs');
const sharp = require('sharp');
const { IMAGE_PATH_URL} = require('./../../config/env');
const { getDirectoryPath, getFileName, uniqueId } = require("../utility.service");

const logger = require('../../utils/logger');


const addNewResidentialRentProperty = async (propertyFinalDetails) => {
    const payload = propertyFinalDetails && propertyFinalDetails.body ? propertyFinalDetails.body : propertyFinalDetails;
    const obj = JSON.parse(JSON.stringify(payload));
    logger.info("Test message");
    logger.info("propertyFinalDetails: ", JSON.parse(obj.propertyFinalDetails))
    console.info("propertyFinalDetails: ", JSON.parse(obj.propertyFinalDetails))
    const propertyDetails = JSON.parse(obj.propertyFinalDetails)

    const dir = getDirectoryPath(propertyDetails.agent_id);
    const createDirPath = IMAGE_PATH_URL + dir;

    logger.info("createDirPath: ", createDirPath)
    if (!fs.existsSync(createDirPath)) {
        fs.mkdirSync(createDirPath, { recursive: true });
    }

    // storing files - START
    propertyDetails.image_urls = [];
    const files = propertyFinalDetails && propertyFinalDetails.files ? propertyFinalDetails.files : {};
    if (files && Object.keys(files).length > 0) {
        Object.keys(files).forEach((item, index) => {
            logger.info("item", item);
            const file = files[item];
            const fileName = getFileName(propertyDetails.agent_id, index);
            const path = createDirPath + fileName;
            propertyDetails.image_urls.push({ url: dir + fileName });
            sharp(file.data)
                .toFile(path, (err, info) => {
                    if (err) {
                        logger.info('sharp>>>', err);
                    } else {
                        logger.info('resize ok !');
                    }
                });
        });
    }
    // storing files - END
    const locationArea = propertyDetails.property_address.location_area
    const gLocation = locationArea.location;
    const propertyId = uniqueId();

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
            house_type: propertyDetails.property_details.house_type,
            bhk_type: propertyDetails.property_details.bhk_type,
            washroom_numbers: propertyDetails.property_details.washroom_numbers,
            furnishing_status: propertyDetails.property_details.furnishing_status,
            parking_type: propertyDetails.property_details.parking_type,
            parking_number: propertyDetails.property_details.parking_number,
            property_age: propertyDetails.property_details.property_age,
            floor_number: propertyDetails.property_details.floor_number,
            total_floor: propertyDetails.property_details.total_floor,
            lift: propertyDetails.property_details.lift,
            property_size: propertyDetails.property_details.property_size
        },

        // rent_details: {
        //   expected_rent: propertyDetails.rent_details.expected_rent,
        //   expected_deposit: propertyDetails.rent_details.expected_deposit,
        //   available_from: propertyDetails.rent_details.available_from,
        //   preferred_tenants: propertyDetails.rent_details.preferred_tenants,
        //   non_veg_allowed: propertyDetails.rent_details.non_veg_allowed
        // },

        image_urls: propertyDetails.image_urls,//["vichi1"],
        create_date_time: new Date(Date.now()),
        update_date_time: new Date(Date.now())
    };

    if (propertyDetails.property_type === "Residential") {
        if (propertyDetails.property_for === "Rent") {
            propertyDetailsDict["rent_details"] = {
                expected_rent: propertyDetails.rent_details.expected_rent,
                expected_deposit: propertyDetails.rent_details.expected_deposit,
                available_from: propertyDetails.rent_details.available_from,
                preferred_tenants: propertyDetails.rent_details.preferred_tenants,
                non_veg_allowed: propertyDetails.rent_details.non_veg_allowed
            };

            const savedProperty = await ResidentialPropertyRent.create(propertyDetailsDict);
            logger.info("Property saved with create, and default:", savedProperty);

        } else if (propertyDetails.property_for === "Sell") {
            propertyDetailsDict["sell_details"] = {
                expected_sell_price: propertyDetails.sell_details.expected_sell_price,
                maintenance_charge: propertyDetails.sell_details.maintenance_charge,
                available_from: propertyDetails.sell_details.available_from,
                negotiable: propertyDetails.sell_details.negotiable
            };

            const savedProperty = await ResidentialPropertySell.create(propertyDetailsDict);
            logger.info("Property saved with create, and default:", savedProperty);

        }
        return JSON.stringify(propertyDetailsDict);
    }


};

const getResidentialPropertyListings = async (agentDetailsParam) => {
    try {
        const agentDetails = JSON.parse(JSON.stringify(agentDetailsParam && agentDetailsParam.body ? agentDetailsParam.body : agentDetailsParam));
        const agent_id = agentDetails.agent_id;
        const reqUserId = agentDetails.req_user_id;
        if (reqUserId === agent_id) {
            // Use await to wait for the database query to complete
            const residentialPropertyRentData = await ResidentialPropertyRent.find({ agent_id: agent_id }).lean().exec();
            const residentialPropertySellData = await ResidentialPropertySell.find({ agent_id: agent_id }).lean().exec();

            // Merge the two arrays
            const allProperties = [...residentialPropertyRentData, ...residentialPropertySellData];

            // Sort the merged array based on update_date_time
            allProperties.sort((a, b) => new Date(b.update_date_time) - new Date(a.update_date_time));

            logger.info(JSON.stringify(allProperties));
            return allProperties;

        } else if (reqUserId !== agent_id) {
            const empObj = await User.findOne({ id: reqUserId }).lean().exec();
            const residentialPropertyRentIds = empObj.assigned_residential_rent_properties;
            const residentialPropertySellIds = empObj.assigned_residential_sell_properties;
            const residentialPropertyRentData = await ResidentialPropertyRent.find({ property_id: { $in: residentialPropertyRentIds } }).lean().exec();
            const residentialPropertySellData = await ResidentialPropertySell.find({ property_id: { $in: residentialPropertySellIds } }).lean().exec();
            // Merge the two arrays
            const allProperties = [...residentialPropertyRentData, ...residentialPropertySellData];
            // Sort the merged array based on update_date_time
            allProperties.sort((a, b) => new Date(b.update_date_time) - new Date(a.update_date_time));
            logger.info(JSON.stringify(allProperties));
            return allProperties;

        }
    } catch (err) {
        console.error(err); // Log the error
        return "Internal Server Error"; // Send an error response
    }
};

const deleteResidentialProperty = async (deleteParams) => {
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
    // 
    if ((user.user_type === "agent" && reqUserId === propertyAgentId)
        || (user.user_type === "employee" && user.employee_role === "admin")) {
        // User is an agent or an employee with admin rights
        try {
            // Delete the property from ResidentialPropertyRent and ResidentialPropertySell collections
            if (itemToDelete.property_type === "Residential" && itemToDelete.property_for === "Rent") {
                await ResidentialPropertyRent.deleteOne({ property_id: propertyId });
                // Also delete from the match collections if they exist
                await ResidentialRentPropertyMatch.deleteMany({ property_id: propertyId });
            } else if (itemToDelete.property_type === "Residential" && itemToDelete.property_for === "Sell") {
                await ResidentialPropertySell.deleteOne({ property_id: propertyId });
                // Also delete from the match collections if they exist
                await ResidentialBuyPropertyMatchBuy.deleteMany({ property_id: propertyId });
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

}
const closeResidentialProperty = async (closeParams) => {
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
    // 
    if ((user.user_type === "agent" && reqUserId === propertyAgentId)
        || (user.user_type === "employee")) {
        // User is an agent or an employee with admin rights
        try {
            // Delete the property from ResidentialPropertyRent and ResidentialPropertySell collections
            if (itemToClose.property_type === "Residential" && itemToClose.property_for === "Rent") {
                const result = await ResidentialPropertyRent.updateOne(
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
                // await ResidentialRentPropertyMatch.deleteMany({ property_id: propertyId });
            } else if (itemToClose.property_type === "Residential" && itemToClose.property_for === "Sell") {
                const result = await ResidentialPropertySell.updateOne(
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
                // await ResidentialBuyPropertyMatchBuy.deleteMany({ property_id: propertyId });
            }
            logger.info("Property closed successfully");
            return "success";
        } catch (err) {
            logger.error(`Error closing property: ${err}`);
            return "Internal Server Error";
        }
    } else {
        logger.info("Unauthorized access");
        return "Unauthorized access";
    }

}

module.exports = {
    addNewResidentialRentProperty,
    getResidentialPropertyListings,
    deleteResidentialProperty,
    closeResidentialProperty,
};