const express = require('express');
const router = express.Router();
const residentialPropertyController = require('../controllers/residential.property.controller');

// POST routes: path names match controller method names
router.post('/addNewResidentialRentProperty', residentialPropertyController.addNewResidentialRentProperty);
router.post('/getResidentialPropertyListings', residentialPropertyController.getResidentialPropertyListings);
router.post('/deleteResidentialProperty', residentialPropertyController.deleteResidentialProperty);
router.post('/closeResidentialProperty', residentialPropertyController.closeResidentialProperty);

module.exports = router;
