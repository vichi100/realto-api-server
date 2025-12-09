const PropertyService = require('../services/property/residential.property.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

exports.addNewResidentialRentProperty = catchAsync(async (req, res, next) => {
  logger.info('Controller - req.body keys:', Object.keys(req.body));
  logger.info('Controller - req.files:', req.files ? 'YES' : 'NO');
  if (req.files) {
    logger.info('Controller - Number of files:', Object.keys(req.files).length);
    logger.info('Controller - File keys:', Object.keys(req.files));
  }
  
  const savedCustomer = await PropertyService.addNewResidentialRentProperty(req);
  res.status(201).json(savedCustomer);
});


exports.getResidentialPropertyListings = catchAsync(async (req, res, next) => {
  const agentDetailsParam = req.body;
  const properties = await PropertyService.getResidentialPropertyListings(agentDetailsParam);
  res.status(201).json(properties);
});

exports.deleteResidentialProperty = catchAsync(async (req, res, next) => {
  const reqDataParam = req.body;
 
  const result = await PropertyService.deleteResidentialProperty(reqDataParam);
  res.status(201).json(result);
});
exports.closeResidentialProperty = catchAsync(async (req, res, next) => {
  const reqDataParam = req.body;
  
  const updatedProperty = await PropertyService.closeResidentialProperty(reqDataParam);
  res.status(201).json(updatedProperty);
});


