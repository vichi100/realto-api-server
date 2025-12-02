const express = require('express');
const router = express.Router();
const commercialCustomerController = require('../controllers/commercial.customer.controller');

// POST routes: path names match controller method names
router.post('/addNewCommercialCustomer', commercialCustomerController.addNewCommercialCustomer);
router.post('/getCommercialCustomerListings', commercialCustomerController.getCommercialCustomerListings);
router.post('/deleteCommercialCustomer', commercialCustomerController.deleteCommercialCustomer);
router.post('/closeCommercialCustomer', commercialCustomerController.closeCommercialCustomer);

module.exports = router;
