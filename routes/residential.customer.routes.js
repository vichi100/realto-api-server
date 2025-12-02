const express = require('express');
const router = express.Router();
const residentialCustomerController = require('../controllers/residential.customer.controller');

// POST routes: path names match controller method names
router.post('/addNewResidentialCustomer', residentialCustomerController.addNewResidentialCustomer);
router.post('/getResidentialCustomerList', residentialCustomerController.getResidentialCustomerList);
router.post('/deleteResidintialCustomer', residentialCustomerController.deleteResidintialCustomer);
router.post('/closeResidintialCustomer', residentialCustomerController.closeResidintialCustomer);

module.exports = router;
