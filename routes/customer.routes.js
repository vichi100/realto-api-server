const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

// POST routes: path names match controller method names
router.post('/getCustomerDetailsByIdToShare', customerController.getCustomerDetailsByIdToShare);
router.post('/getCustomerListForMeeting', customerController.getCustomerListForMeeting);
router.post('/getCustomerAndMeetingDetails', customerController.getCustomerAndMeetingDetails);

module.exports = router;
