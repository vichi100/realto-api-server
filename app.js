const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');

const logger = require('./utils/logger');
const { IMAGE_PATH_URL} = require('./config/env');

// Controllers
const commercialCustomerController = require('./controllers/commercial.customer.controller');
const commercialPropertyController = require('./controllers/commercial.property.controller');
const customerController = require('./controllers/customer.controller');
const propertyController = require('./controllers/property.controller');
const globalSearchController = require('./controllers/global.search.controller');
const matchController = require('./controllers/match.service.controller');
const residentialPropertyController = require('./controllers/residential.property.controller');
const residentialCustomerController = require('./controllers/residential.customer.controller');
const reminderController = require('./controllers/reminder.controller');
const userController = require('./controllers/user.controller');
const analyticsController = require('./controllers/analytics.controller');
const employeeController = require('./controllers/employee.controller');
const otpController = require('./controllers/otp.controller');

// Basic middleware
app.use(express.json());
app.use(fileUpload());
app.use(bodyParser.json());

app.use(express.static(IMAGE_PATH_URL));

// Basic routes that should stay in app.js
app.get('/', (req, res) => res.send('Hello'));
app.get('/health', (req, res) => res.sendStatus(200));
app.get('/error', (req, res) => { throw new Error('Test error'); });

// --- Wrappers (no mounted routers) ---

// Residential property
app.post('/residentialPropertyListings', function (req, res) {
	logger.info('getResidentialPropertyListings');
	residentialPropertyController.getResidentialPropertyListings(req, res);
});
app.post('/deleteResidentialProperty', function (req, res) {
	logger.info('deleteResidentialProperty');
	residentialPropertyController.deleteResidentialProperty(req, res);
});
app.post('/closeResidentialProperty', function (req, res) {
	logger.info('closeResidentialProperty');
	residentialPropertyController.closeResidentialProperty(req, res);
});

// Commercial property
app.post('/deleteCommercialProperty', function (req, res) {
	logger.info('deleteCommercialProperty');
	commercialPropertyController.deleteCommercialProperty(req, res);
});
app.post('/closeCommercialProperty', function (req, res) {
	logger.info('closeCommercialProperty');
	commercialPropertyController.closeCommercialProperty(req, res);
});
app.post('/commercialPropertyListings', function (req, res) {
	logger.info('getCommercialPropertyListings');
	commercialPropertyController.getCommercialPropertyListings(req, res);
});
app.post('/addNewCommercialProperty', function (req, res) {
	logger.info('addNewCommercialProperty');
	commercialPropertyController.addNewCommercialProperty(req, res);
});

// Residential customer
app.post('/deleteResidintialCustomer', function (req, res) {
	logger.info('deleteResidintialCustomer');
	residentialCustomerController.deleteResidintialCustomer(req, res);
});
app.post('/closeResidintialCustomer', function (req, res) {
	logger.info('closeResidintialCustomer');
	residentialCustomerController.closeResidintialCustomer(req, res);
});
app.post('/residentialCustomerList', function (req, res) {
	logger.info('getResidentialCustomerList');
	residentialCustomerController.getResidentialCustomerList(req, res);
});
app.post('/addNewResidentialCustomer', function (req, res) {
	logger.info('addNewResidentialCustomer');
	residentialCustomerController.addNewResidentialCustomer(req, res);
});

// Commercial customer
app.post('/deleteCommercialCustomer', function (req, res) {
	logger.info('deleteCommercialCustomer');
	commercialCustomerController.deleteCommercialCustomer(req, res);
});
app.post('/closeCommercialCustomer', function (req, res) {
	logger.info('closeCommercialCustomer');
	commercialCustomerController.closeCommercialCustomer(req, res);
});
app.post('/commercialCustomerList', function (req, res) {
	logger.info('getCommercialCustomerListings');
	commercialCustomerController.getCommercialCustomerListings(req, res);
});
app.post('/addNewCommercialCustomer', function (req, res) {
	logger.info('addNewCommercialCustomer');
	commercialCustomerController.addNewCommercialCustomer(req, res);
});

// Property + Customer sharing/meetings
app.post('/getPropertyDetailsByIdToShare', function (req, res) {
	logger.info('getPropertyDetailsByIdToShare');
	propertyController.getPropertyDetailsByIdToShare(req, res);
});
app.post('/getCustomerDetailsByIdToShare', function (req, res) {
	logger.info('getCustomerDetailsByIdToShare');
	customerController.getCustomerDetailsByIdToShare(req, res);
});
app.post('/getPropertyListingForMeeting', function (req, res) {
	logger.info('getPropertyListingForMeeting');
	propertyController.getPropertyListingForMeeting(req, res);
});
app.post('/getCustomerListForMeeting', function (req, res) {
	logger.info('getCustomerListForMeeting');
	customerController.getCustomerListForMeeting(req, res);
});
app.post('/getCustomerAndMeetingDetails', function (req, res) {
	logger.info('getCustomerAndMeetingDetails');
	customerController.getCustomerAndMeetingDetails(req, res);
});

// Global search
app.post('/getGlobalSearchResult', function (req, res) {
	logger.info('getGlobalSearchResult');
	globalSearchController.getGlobalSearchResult(req, res);
});
app.post('/getAllGlobalListingByLocations', function (req, res) {
	logger.info('getAllGlobalListingByLocations');
	globalSearchController.getAllGlobalListingByLocations(req, res);
});

// Match service
app.post('/matchedResidentialCustomerRentList', function (req, res) {
	logger.info('getmatchedResidentialCustomerRentList');
	matchController.getmatchedResidentialCustomerRentList(req, res);
});
app.post('/matchedResidentialProptiesRentList', function (req, res) {
	logger.info('getMatchedResidentialProptiesRentList');
	matchController.getMatchedResidentialProptiesRentList(req, res);
});
app.post('/matchedResidentialProptiesBuyList', function (req, res) {
	logger.info('matchedResidentialProptiesBuyList');
	matchController.matchedResidentialProptiesBuyList(req, res);
});
app.post('/matchedResidentialCustomerBuyList', function (req, res) {
	logger.info('getMatchedResidentialCustomerBuyList');
	matchController.getMatchedResidentialCustomerBuyList(req, res);
});
app.post('/matchedCommercialProptiesRentList', function (req, res) {
	logger.info('getMatchedCommercialProptiesRentList');
	matchController.getMatchedCommercialProptiesRentList(req, res);
});
app.post('/matchedCommercialProptiesBuyList', function (req, res) {
	logger.info('getMatchedCommercialProptiesBuyList');
	matchController.getMatchedCommercialProptiesBuyList(req, res);
});
app.post('/matchedCommercialCustomerRentList', function (req, res) {
	logger.info('getMatchedCommercialCustomerRentList');
	matchController.getMatchedCommercialCustomerRentList(req, res);
});
app.post('/matchedCommercialCustomerSellList', function (req, res) {
	logger.info('getMatchedCommercialCustomerSellList');
	matchController.getMatchedCommercialCustomerSellList(req, res);
});

// Reminders
app.post('/getReminderList', function (req, res) {
	logger.info('getReminderList');
	reminderController.getReminderList(req, res);
});
app.post('/getReminderListByCustomerId', function (req, res) {
	logger.info('getReminderListByCustomerId');
	reminderController.getReminderListByCustomerId(req, res);
});
app.post('/addNewReminder', function (req, res) {
	logger.info('addNewReminder');
	reminderController.addNewReminder(req, res);
});
app.post('/getPropReminderList', function (req, res) {
	logger.info('getPropReminderList');
	reminderController.getPropReminderList(req, res);
});
app.post('/getCustomerReminderList', function (req, res) {
	logger.info('getCustomerReminderList');
	reminderController.getCustomerReminderList(req, res);
});

// Users
app.post('/checkLoginRole', function (req, res) {
	logger.info('checkLoginRole');
	userController.checkLoginRole(req, res);
});
app.post('/updateUserProfile', function (req, res) {
	logger.info('updateUserProfile');
	userController.updateUserProfile(req, res);
});
app.post('/deleteAgentAccount', function (req, res) {
	logger.info('deleteAgentAccount');
	userController.deleteAgentAccount(req, res);
});
app.post('/reactivateAccount', function (req, res) {
	logger.info('reactivateAccount');
	userController.reactivateAccount(req, res);
});
app.post('/insertNewAgent', function (req, res) {
	logger.info('insertNewAgent');
	userController.insertNewUserAsAgent(req, res);
});
app.post('/getUserDetails', function (req, res) {
	logger.info('getUserDetails');
	userController.getUserDetails(req, res);
});
app.post('/getUserProfileDeatails', function (req, res) {
	logger.info('getUserProfileDeatails');
	userController.getUserProfileDeatails(req, res);
});
// Alias endpoint name expected by UI
app.post('/getUserProfile', function (req, res) {
	logger.info('getUserProfileDeatails');
	userController.getUserProfileDeatails(req, res);
});

// Analytics
app.post('/getTotalListingSummary', function (req, res) {
	logger.info('getTotalListingSummary');
	analyticsController.getTotalListingSummary(req, res);
});

// Employees
app.post('/addEmployee', function (req, res) {
	logger.info('addEmployee');
	employeeController.addEmployee(req, res);
});
app.post('/updateEmployeeDetails', function (req, res) {
	logger.info('updateEmployeeDetails');
	employeeController.updateEmployeeDetails(req, res);
});
app.post('/deleteEmployee', function (req, res) {
	logger.info('deleteEmployee');
	employeeController.deleteEmployee(req, res);
});
app.post('/removeEmployee', function (req, res) {
	logger.info('removeEmployee');
	employeeController.removeEmployee(req, res);
});
app.post('/updateEmployeeEditRights', function (req, res) {
	logger.info('updateEmployeeEditRights');
	employeeController.updateEmployeeEditRights(req, res);
});
app.post('/employeeList', function (req, res) {
	logger.info('getEmployeeList');
	employeeController.getEmployeeList(req, res);
});
app.post('/updatePropertiesForEmployee', function (req, res) {
	logger.info('updatePropertiesForEmployee');
	employeeController.updatePropertiesForEmployee(req, res);
});

// OTP
app.post('/generateOTP', function (req, res) {
	logger.info('generateOTP');
	otpController.generateOTP(req, res);
});

// Residential property create
app.post('/addNewResidentialRentProperty', function (req, res) {
	logger.info('addNewResidentialRentProperty');
	residentialPropertyController.addNewResidentialRentProperty(req, res);
});

module.exports = app;