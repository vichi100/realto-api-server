const express = require('express');
const router = express.Router();
const commercialPropertyController = require('../controllers/commercial.property.controller');

// POST routes: path names match controller method names
router.post('/addNewCommercialProperty', commercialPropertyController.addNewCommercialProperty);
router.post('/getCommercialPropertyListings', commercialPropertyController.getCommercialPropertyListings);
router.post('/deleteCommercialProperty', commercialPropertyController.deleteCommercialProperty);
router.post('/closeCommercialProperty', commercialPropertyController.closeCommercialProperty);

module.exports = router;
