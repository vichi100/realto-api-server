const PropertyService = require('../services/property/residential.property.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.addNewResidentialRentProperty = catchAsync(async (req, res, next) => {
  const propertyDetails = req.body;
  const savedCustomer = await PropertyService.addNewResidentialRentProperty(propertyDetails);
  res.status(201).json({
    status: 'success',
    data: savedProperty
  });
});


exports.getResidentialPropertyListings = catchAsync(async (req, res, next) => {
  const agentDetailsParam = req.body;
  const properties = await PropertyService.getResidentialPropertyListings(agentDetailsParam);
  res.status(200).json({
    status: 'success',
    data: properties
  });
});

exports.deleteResidentialProperty = catchAsync(async (req, res, next) => {
  const reqDataParam = req.body;
 
  await PropertyService.deleteResidentialProperty(reqDataParam);
  res.status(200).json({
    status: 'success',
    message: 'Property deleted successfully.'
  });
});
exports.closeResidentialProperty = catchAsync(async (req, res, next) => {
  const reqDataParam = req.body;
  
  const updatedProperty = await PropertyService.closeResidentialProperty(reqDataParam);
  res.status(200).json({
    status: 'success',
    data: updatedProperty
  });
});


