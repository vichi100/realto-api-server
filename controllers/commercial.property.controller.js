const PropertyService = require('../services/property/commercial.property.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.addNewCommercialProperty = catchAsync(async (req, res, next) => {
  const propertyDetails = req.body;
  const savedProperty = await PropertyService.addNewCommercialProperty(propertyDetails);
  res.status(201).json({
    status: 'success',
    data: savedProperty
  });
});


exports.getCommercialPropertyListings = catchAsync(async (req, res, next) => {
  const agentDetailsParam = req.body;
  const properties = await PropertyService.getCommercialPropertyListings(agentDetailsParam);
  res.status(200).json({
    status: 'success',
    data: properties
  });
});

exports.deleteCommercialProperty = catchAsync(async (req, res, next) => {
  const reqDataParam = req.body;
 
  await PropertyService.deleteCommercialProperty(reqDataParam);
  res.status(200).json({
    status: 'success',
    message: 'Property deleted successfully.'
  });
});

exports.closeCommercialProperty = catchAsync(async (req, res, next) => {
  const reqDataParam = req.body;
  
  const updatedProperty = await PropertyService.closeCommercialProperty(reqDataParam);
  res.status(200).json({
    status: 'success',
    data: updatedProperty
  });
});
