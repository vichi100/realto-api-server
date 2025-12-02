const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.service.controller');

// POST routes: path names match controller method names
router.post('/getmatchedResidentialCustomerRentList', matchController.getmatchedResidentialCustomerRentList);
router.post('/getMatchedResidentialProptiesRentList', matchController.getMatchedResidentialProptiesRentList);
router.post('/matchedResidentialProptiesBuyList', matchController.matchedResidentialProptiesBuyList);
router.post('/getMatchedResidentialCustomerBuyList', matchController.getMatchedResidentialCustomerBuyList);
router.post('/getMatchedCommercialProptiesRentList', matchController.getMatchedCommercialProptiesRentList);
router.post('/getMatchedCommercialProptiesBuyList', matchController.getMatchedCommercialProptiesBuyList);
router.post('/getMatchedCommercialCustomerRentList', matchController.getMatchedCommercialCustomerRentList);
router.post('/getMatchedCommercialCustomerSellList', matchController.getMatchedCommercialCustomerSellList);
router.post('/getMatchedCommercialProptiesList', matchController.getMatchedCommercialProptiesList);

module.exports = router;
