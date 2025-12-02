const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');

// POST routes: path names match controller method names
router.post('/getPropertyDetailsByIdToShare', propertyController.getPropertyDetailsByIdToShare);
router.post('/getPropertyListingForMeeting', propertyController.getPropertyListingForMeeting);

module.exports = router;
