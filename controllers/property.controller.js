const PropertyService = require('../services/property/property.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getPropertyDetailsByIdToShare = catchAsync(async (req, res, next) => {
  const propertyDetails = req.body;
  const propertyDetail = await PropertyService.getPropertyDetailsByIdToShare(propertyDetails);
  res.status(201).json(propertyDetail);
});

exports.getPropertyListingForMeeting = catchAsync(async (req, res, next) => {
  const agentDetailsParam = req.body;
  const properties = await PropertyService.getPropertyListingForMeeting(agentDetailsParam);
  res.status(201).json(properties);
});

