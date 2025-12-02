const MatchService = require('../services/match.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getmatchedResidentialCustomerRentList = catchAsync(async (req, res, next) => {
  const propertyDetails = req.body;
  const result = await MatchService.getmatchedResidentialCustomerRentList(propertyDetails);
  res.status(201).json(result);
});

exports.getMatchedResidentialProptiesRentList = catchAsync(async (req, res, next) => {
  const customerDetails = req.body;
  const result = await MatchService.getMatchedResidentialProptiesRentList(customerDetails);
  res.status(201).json(result);
});

exports.matchedResidentialProptiesBuyList = catchAsync(async (req, res, next) => {
  const customerDetails = req.body;
  const result = await MatchService.matchedResidentialProptiesBuyList(customerDetails);
  res.status(201).json(result);
});

exports.getMatchedResidentialCustomerBuyList = catchAsync(async (req, res, next) => {
  const propertyDetails = req.body;
  const result = await MatchService.getMatchedResidentialCustomerBuyList(propertyDetails);
  res.status(201).json(result);
});

exports.getMatchedCommercialProptiesRentList = catchAsync(async (req, res, next) => {
  const customerDetails = req.body;
  const result = await MatchService.getMatchedCommercialProptiesRentList(customerDetails);
  res.status(201).json(result);
});

exports.getMatchedCommercialProptiesBuyList = catchAsync(async (req, res, next) => {
  const customerDetails = req.body;
  const result = await MatchService.getMatchedCommercialProptiesBuyList(customerDetails);
  res.status(201).json(result);
}); 
exports.getMatchedCommercialCustomerRentList = catchAsync(async (req, res, next) => {
  const propertyDetails = req.body;
  const result = await MatchService.getMatchedCommercialCustomerRentList(propertyDetails);
  res.status(201).json(result);
});

exports.getMatchedCommercialCustomerSellList = catchAsync(async (req, res, next) => {
  const propertyDetails = req.body;
  const result = await MatchService.getMatchedCommercialCustomerSellList(propertyDetails);
  res.status(201).json(result);
});

exports.getMatchedCommercialProptiesList = catchAsync(async (req, res, next) => {
  const customerDetails = req.body;
  const result = await MatchService.getMatchedCommercialProptiesList(customerDetails);
  res.status(201).json(result);
});



