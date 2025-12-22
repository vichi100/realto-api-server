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

// GET /prop/:agentId/:propertyId/:propertyType
exports.getPropertyByPublicPath = catchAsync(async (req, res, next) => {
  const { agentId, propertyId, propertyType } = req.params;
  const result = await PropertyService.getPropertyByPublicPath({
    agent_id: agentId,
    property_id: propertyId,
    property_type: propertyType,
  });
  if (!result) {
    return res.status(404).json({ error: 'Property not found' });
  }
  res.status(200).json(result);
});

