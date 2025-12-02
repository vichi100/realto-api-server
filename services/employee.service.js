
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


const addEmployee = async (employeeDetailsParam) => {
  const employeeDetails = JSON.parse(JSON.stringify(employeeDetailsParam));
  logger.info(JSON.stringify(employeeDetailsParam));
  // first check if any employee with that mobile number exist
  // first check if +91 is appended to the mobile number
  let mobileNumber = employeeDetails.emp_mobile;
  if (!mobileNumber.startsWith("+91")) {
    mobileNumber = "+91" + mobileNumber;
  }
  // Check if the mobile number is already registered
  const emp = await User.find({ mobile: mobileNumber }).lean().exec();
    if (emp && emp.length > 0) {
      return {
        errorCode: "EMPLOYEE_EXISTS",
        message: "This mobile number is already registered"
      };
    }

  try {
    const newUserId = uniqueId();
    const empObj = {
      user_type: "employee", // employee or agent
      id: newUserId,
      expo_token: null,
      name: employeeDetails.emp_name,
      company_name: employeeDetails.company_name,
      mobile: mobileNumber,
      address: employeeDetails.address,
      city: employeeDetails.city,
      employee_ids: [], // if employee then it will be empty,
      works_for: employeeDetails.agent_id,// whom he works for
      user_status: "active",// suspended or active
      employee_role: employeeDetails.employee_role,
      create_date_time: new Date(Date.now()),
      update_date_time: new Date(Date.now())
    };
    const result = await User.create(empObj);
    logger.info("New employee added : ", result);
    return result;
  } catch (err) {
    console.error(`getUserDetails# Failed to fetch documents : ${err}`);
    return null;
  }

};
const updateEmployeeDetails = async (employeeDetailsParam) => {
  const employeeDetails = JSON.parse(JSON.stringify(employeeDetailsParam));
  logger.info(JSON.stringify(employeeDetailsParam));
  // first check if any employee with that mobile number exist
  // first check if +91 is appended to the mobile number
  const empId = employeeDetails.emp_id;
  const name = employeeDetails.emp_name;
  const role = employeeDetails.employee_role;
  let mobileNumber = employeeDetails.emp_mobile;
  if (!mobileNumber.startsWith("+91")) {
    mobileNumber = "+91" + mobileNumber;
  }


  try {

    // first verfy if mobile number is already exist then only update
    // Check if the mobile number is already registered
    const emp = await User.findOne({ id: empId }).lean().exec();
    if (!emp) {
      return {
        errorCode: "EMPLOYEE_EXISTS",
        message: "This mobile number is already registered"
      };
    }
    // Update the employee details
    const result = await User.updateOne(
      { id: empId }, // Find the user by empId
      {
        $set: {
          name: name,
          mobile: mobileNumber,
          employee_role: role,
          update_date_time: new Date(Date.now()) // Update the timestamp
        }
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Employee with ID ${empId} updated successfully`);
      return {
        successCode: "EMPLOYEE_UPDATED",
        message: "Employee details updated successfully"
      };
    } else {
      console.error(`Employee with ID ${empId} not found`);
      return {
        errorCode: "EMPLOYEE_NOT_FOUND",
        message: "Employee not found"
      };
    }
  } catch (err) {
    console.error(`Failed to update employee details: ${err}`);
    return {
      errorCode: "INTERNAL_SERVER_ERROR",
      message: "Failed to update employee details"
    };
  }
};
const deleteEmployee = async (employeeDetailsParam) => {
  const session = await mongoose.startSession(); // Start a new session for the transaction
  session.startTransaction(); // Start the transaction

  try {
    const employeeDetails = JSON.parse(JSON.stringify(employeeDetailsParam));
    logger.info(JSON.stringify(employeeDetailsParam));
    const employeeId = employeeDetails.employee_id;

    // Fetch the employee document
    const employeeObj = await User.findOne({ id: employeeId }).lean().exec();

    if (!employeeObj) {
      throw new Error("Employee not found");
    }

    const residentialRentProperties = employeeObj.assigned_residential_rent_properties;
    const residentialSellProperties = employeeObj.assigned_residential_sell_properties;
    const commercialRentProperties = employeeObj.assigned_commercial_rent_properties;
    const commercialSellProperties = employeeObj.assigned_commercial_sell_properties;

    const residentialRentCustomers = employeeObj.assigned_residential_rent_customers;
    const residentialBuyCustomers = employeeObj.assigned_residential_buy_customers;
    const commercialRentCustomers = employeeObj.assigned_commercial_rent_customers;
    const commercialBuyCustomers = employeeObj.assigned_commercial_buy_customers;

    // Update all related documents in a transaction
    await ResidentialPropertyRent.updateMany(
      { property_id: { $in: residentialRentProperties } },
      { $pull: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeObj.name } },
      { session }
    );

    await ResidentialPropertySell.updateMany(
      { property_id: { $in: residentialSellProperties } },
      { $pull: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeObj.name } },
      { session }
    );

    await CommercialPropertyRent.updateMany(
      { property_id: { $in: commercialRentProperties } },
      { $pull: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeObj.name } },
      { session }
    );

    await CommercialPropertySell.updateMany(
      { property_id: { $in: commercialSellProperties } },
      { $pull: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeObj.name } },
      { session }
    );

    // customers

    await ResidentialPropertyCustomerRent.updateMany(
      { customer_id: { $in: residentialRentCustomers } },
      { $pull: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeObj.name } },
      { session }
    );

    await ResidentialPropertyCustomerBuy.updateMany(
      { customer_id: { $in: residentialBuyCustomers } },
      { $pull: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeObj.name } },
      { session }
    );

    await CommercialPropertyCustomerRent.updateMany(
      { customer_id: { $in: commercialRentCustomers } },
      { $pull: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeObj.name } },
      { session }
    );

    await CommercialPropertyCustomerBuy.updateMany(
      { customer_id: { $in: commercialBuyCustomers } },
      { $pull: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeObj.name } },
      { session }
    );

    // remove the employee id from the agent document
    await User.updateOne(
      { id: employeeObj.works_for },
      { $pull: { employees: employeeId } },
      { session }
    );

    // Delete the employee document
    await User.deleteOne({ id: employeeId }, { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    logger.info("Employee deleted successfully");
    return "success";
  } catch (err) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting employee:", err);
    return {
      error: "Failed to delete employee",
      details: err
    };
  }
};
const removeEmployee = async (removeEmpObjParam) => {
  try {
    const removeEmpObj = JSON.parse(JSON.stringify(removeEmpObjParam));
    const agent_id = removeEmpObj.agent_id;
    const employee_id = removeEmpObj.employee_id;
    logger.info(JSON.stringify(removeEmpObj));

    await User.collection.deleteOne({ id: employee_id });
    await User.collection.updateOne({ id: agent_id }, { $pull: { employees: employee_id } });
    logger.info("1");
    return "success";
  } catch (err) {
    logger.info("err: " + err);
    return err;
  }
};

const updateEmployeeEditRights = async (editRightEmpObjParam) => {
  try {
    const editRightEmpObj = JSON.parse(JSON.stringify(editRightEmpObjParam));
    const employee_id = editRightEmpObj.employee_id;
    const access_rights = editRightEmpObj.access_rights;
    await User.collection.updateOne({ id: employee_id }, { $set: { access_rights: access_rights } });
    return "success";
  } catch (err) {
    logger.info("err: " + err);
    return err;
  }
};

const getEmployeeList = async (userObjParam) => {
  const userObj = JSON.parse(JSON.stringify(userObjParam));
  logger.info(JSON.stringify(userObjParam));
  try {
    const empList = await User.find({ works_for: userObj.req_user_id, user_type: "employee" }).sort({ user_id: -1 }).lean().exec();
    logger.info("EmployeeList:  " + JSON.stringify(empList));
    return empList;
  } catch (err) {
    console.error(`getUserDetails# Failed to fetch documents : ${err}`);
    return null;
  }
};
const insertNewUserAsEmployee = empObj => {
  // const userDetailsObj = JSON.parse(JSON.stringify(req.body));
  // const userId = uuid.v4();
  // const userObj = {
  //   user_type: userType, // employee or agent
  //   id: userId,
  //   expo_token: null,
  //   name: null,
  //   company_name: null,
  //   mobile: mobileNumber,
  //   address: null,
  //   city: null,
  //   access_rights: accessRights,
  //   employees: [], // if employee then it will be empty
  //   create_date_time: new Date(Date.now()),
  //   update_date_time: new Date(Date.now())
  // };
  User.collection.insertOne(empObj, function (err, data) {
    if (err) {
      logger.info(err);
      // res.send(JSON.stringify("fail"));
      // res.end();
      return false;
    } else {
      logger.info("Employee Added" + JSON.stringify(data));

      // res.send(JSON.stringify({ user_details: empObj }));
      // res.end();
      return true;
    }
  });
};
const getEmployerDetails = agentIdsArray => {
  Agent.find({ agent_id: { $in: agentIdsArray } }, function (err, data) {
    if (err) {
      logger.info(err);
      res.send(JSON.stringify("fail"));
      res.end();
      return [];
    }
    logger.info("data: " + data);
    if (data.length !== 0) {
      logger.info("Agent is present: " + data);

      return data;
    } else {
      // mobile number is not present let create an agent id for him
      insertNewAgent();
    }
  });
};


const updateUserEmployeeList = (agentId, employeeId) => {
  
  User.updateOne(
    { id: agentId },
    { $addToSet: { employees: employeeId } },
    function (err, data) {
      if (err) {
        logger.info(err);
        // res.send(JSON.stringify("fail"));
        // res.end();
        return false;
      } else {
        // res.send(JSON.stringify({ user_id: agent_id }));
        // res.end();
        return true;
      }
    }
  );
};


const updatePropertiesForEmployee = async (userObjParam) => {
  const userObj = JSON.parse(JSON.stringify(userObjParam));
  logger.info(JSON.stringify(userObjParam));
  const reqUserId = userObj.req_user_id;
  const employeeId = userObj.employee_id;
  const employeeName = userObj.employee_name;
  const operation = userObj.operation;
  const userData = userObj.user_data;
  const whatToUpdateData = userObj.what_to_update_data;
  const { isResidential, isCommercial, isForRent, isForSell, isProperty, isCustomer } = whatToUpdateData;
  let fieldToUpdate = null;
  let updatedEmployee = null;
  let assetId = null;
  try {
    if (isProperty) {
      if (isResidential && isForRent) {
        fieldToUpdate = "assigned_residential_rent_properties"
      } else if (isResidential && isForSell) {
        fieldToUpdate = "assigned_residential_sell_properties"
      } else if (isCommercial && isForRent) {
        fieldToUpdate = "assigned_commercial_rent_properties"
      } else if (isCommercial && isForSell) {
        fieldToUpdate = "assigned_commercial_sell_properties"
      }

      assetId = whatToUpdateData.property_id;

    } else if (isCustomer) {
      if (isResidential && isForRent) {
        fieldToUpdate = "assigned_residential_rent_customers"
      } else if (isResidential && isForSell) {
        fieldToUpdate = "assigned_residential_buy_customers"
      } else if (isCommercial && isForRent) {
        fieldToUpdate = "assigned_commercial_rent_customers"
      } else if (isCommercial && isForSell) {
        fieldToUpdate = "assigned_commercial_buy_customers"
      }

      assetId = whatToUpdateData.customer_id;
    }

    if (operation === "add") {
      updatedEmployee = await User.findOneAndUpdate(
        { id: employeeId, works_for: reqUserId }, // Query to find the employee
        {
          $addToSet: { [fieldToUpdate]: assetId }, // Add the property/customer to the employee's assigned list
          $set: { update_date_time: new Date(Date.now()) } // Update the timestamp
        },
        { new: true, lean: true } // Return the updated document and convert it to a plain JavaScript object
      );
    } else if (operation === "remove") {
      updatedEmployee = await User.findOneAndUpdate(
        { id: employeeId, works_for: reqUserId }, // Query to find the employee
        {
          $pull: { [fieldToUpdate]: assetId }, // Remove the property/customer from the employee's assigned list
          $set: { update_date_time: new Date(Date.now()) } // Update the timestamp
        },
        { new: true, lean: true } // Return the updated document and convert it to a plain JavaScript object
      );
    }

    // Use findOneAndUpdate to check if the employee exists and update the document


    if (!updatedEmployee) {
      return "Unauthorized or employee not found";
    }

    let isScuuess = false;
    if (operation === "add") {
      isScuuess = await addEmplolyeeToPropertyOrCustomer(whatToUpdateData, employeeId, employeeName);
    } else if (operation === "remove") {
      isScuuess = await removeEmployeeFromPropertyOrCustomer(whatToUpdateData, employeeId, employeeName);
    }

    if (!isScuuess) {
      return "Unauthorized or employee not found";
    }

    return "success";
  } catch (err) {
    console.error(`updatePropertiesForEmployee# Failed to update employee: ${err}`);
    return { error: "Internal Server Error", details: err };
  }
};
const addEmplolyeeToPropertyOrCustomer = async (whatToUpdateData, employeeId, employeeName) => {
  if (whatToUpdateData.isProperty) {
    if (whatToUpdateData.isResidential) {
      if (whatToUpdateData.isForRent) {
        await ResidentialPropertyRent.updateOne(
          { property_id: whatToUpdateData.property_id },
          {
            $addToSet: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeName },
          }
        );

      } else if (whatToUpdateData.isForSell) {
        await ResidentialPropertySell.updateOne(
          { property_id: whatToUpdateData.property_id },
          {
            $addToSet: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeName },
          }
        );
      }
    } else if (whatToUpdateData.isCommercial) {
      if (whatToUpdateData.isForRent) {
        await CommercialPropertyRent.updateOne(
          { property_id: whatToUpdateData.property_id },
          {
            $addToSet: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeName },
          }
        );

      } else if (whatToUpdateData.isForSell) {
        await CommercialPropertySell.updateOne(
          { property_id: whatToUpdateData.property_id },
          {
            $addToSet: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeName },
          }
        );
      }
    }
  } else if (whatToUpdateData.isCustomer) {
    if (whatToUpdateData.isResidential) {
      if (whatToUpdateData.isForRent) {
        await ResidentialPropertyCustomerRent.updateOne(
          { customer_id: whatToUpdateData.customer_id },
          {
            $addToSet: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeName },
          }
        );

      } else if (whatToUpdateData.isForSell) {
        await ResidentialPropertyCustomerBuy.updateOne(
          { customer_id: whatToUpdateData.customer_id },
          {
            $addToSet: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeName },
          }
        );
      }
    } else if (whatToUpdateData.isCommercial) {
      if (whatToUpdateData.isForRent) {
        await CommercialPropertyCustomerRent.updateOne(
          { customer_id: whatToUpdateData.customer_id },
          {
            $addToSet: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeName },
          }
        );

      } else if (whatToUpdateData.isForSell) {
        await CommercialPropertyCustomerBuy.updateOne(
          { customer_id: whatToUpdateData.customer_id },
          {
            $addToSet: { assigned_to_employee: employeeId, assigned_to_employee_name: employeeName },
          }
        );
      }
    }
  }
  return true;
}
const removeEmployeeFromPropertyOrCustomer = async (whatToUpdateData, employeeId, employeeName) => {
  if (whatToUpdateData.isProperty) {
    if (whatToUpdateData.isResidential) {
      if (whatToUpdateData.isForRent) {
        // First, remove the employee ID
        await ResidentialPropertyRent.updateOne(
          { property_id: whatToUpdateData.property_id },
          { $pull: { assigned_to_employee: employeeId } } // Remove the employee ID
        );

        // Then, remove the employee name
        await ResidentialPropertyRent.updateOne(
          { property_id: whatToUpdateData.property_id },
          { $pull: { assigned_to_employee_name: employeeName } } // Remove the employee name
        );
      } else if (whatToUpdateData.isForSell) {
        // First, remove the employee ID
        await ResidentialPropertySell.updateOne(
          { property_id: whatToUpdateData.property_id },
          { $pull: { assigned_to_employee: employeeId } } // Remove the employee ID
        );

        // Then, remove the employee name
        await ResidentialPropertySell.updateOne(
          { property_id: whatToUpdateData.property_id },
          { $pull: { assigned_to_employee_name: employeeName } } // Remove the employee name
        );
      }
    } else if (whatToUpdateData.isCommercial) {
      if (whatToUpdateData.isForRent) {
        // First, remove the employee ID
        await CommercialPropertyRent.updateOne(
          { property_id: whatToUpdateData.property_id },
          { $pull: { assigned_to_employee: employeeId } } // Remove the employee ID
        );

        // Then, remove the employee name
        await CommercialPropertyRent.updateOne(
          { property_id: whatToUpdateData.property_id },
          { $pull: { assigned_to_employee_name: employeeName } } // Remove the employee name
        );
      } else if (whatToUpdateData.isForSell) {
        // First, remove the employee ID
        await CommercialPropertySell.updateOne(
          { property_id: whatToUpdateData.property_id },
          { $pull: { assigned_to_employee: employeeId } } // Remove the employee ID
        );

        // Then, remove the employee name
        await CommercialPropertySell.updateOne(
          { property_id: whatToUpdateData.property_id },
          { $pull: { assigned_to_employee_name: employeeName } } // Remove the employee name
        );
      }
    }
  } else if (whatToUpdateData.isCustomer) {
    if (whatToUpdateData.isResidential) {
      if (whatToUpdateData.isForRent) {
        // First, remove the employee ID
        await ResidentialPropertyCustomerRent.updateOne(
          { customer_id: whatToUpdateData.customer_id },
          { $pull: { assigned_to_employee: employeeId } } // Remove the employee ID
        );

        // Then, remove the employee name
        await ResidentialPropertyCustomerRent.updateOne(
          { customer_id: whatToUpdateData.customer_id },
          { $pull: { assigned_to_employee_name: employeeName } } // Remove the employee name
        );
      } else if (whatToUpdateData.isForSell) {
        // First, remove the employee ID
        await ResidentialPropertyCustomerBuy.updateOne(
          { customer_id: whatToUpdateData.customer_id },
          { $pull: { assigned_to_employee: employeeId } } // Remove the employee ID
        );

        // Then, remove the employee name
        await ResidentialPropertyCustomerBuy.updateOne(
          { customer_id: whatToUpdateData.customer_id },
          { $pull: { assigned_to_employee_name: employeeName } } // Remove the employee name
        );
      }
    } else if (whatToUpdateData.isCommercial) {
      if (whatToUpdateData.isForRent) {
        // First, remove the employee ID
        await CommercialPropertyCustomerRent.updateOne(
          { customer_id: whatToUpdateData.customer_id },
          { $pull: { assigned_to_employee: employeeId } } // Remove the employee ID
        );

        // Then, remove the employee name
        await CommercialPropertyCustomerRent.updateOne(
          { customer_id: whatToUpdateData.customer_id },
          { $pull: { assigned_to_employee_name: employeeName } } // Remove the employee name
        );
      } else if (whatToUpdateData.isForSell) {
        // First, remove the employee ID
        await CommercialPropertyCustomerBuy.updateOne(
          { customer_id: whatToUpdateData.customer_id },
          { $pull: { assigned_to_employee: employeeId } } // Remove the employee ID
        );

        // Then, remove the employee name
        await CommercialPropertyCustomerBuy.updateOne(
          { customer_id: whatToUpdateData.customer_id },
          { $pull: { assigned_to_employee_name: employeeName } } // Remove the employee name
        );
      }
    }
  }
  return true;
};

module.exports = {
  addEmployee,
  updateEmployeeDetails,
  deleteEmployee,
  removeEmployee,
  updateEmployeeEditRights,
  getEmployeeList,
  updatePropertiesForEmployee,
  insertNewUserAsEmployee,
  getEmployerDetails,
  updateUserEmployeeList
};