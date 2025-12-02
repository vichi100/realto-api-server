const AnalyticsService = require('../services/analytics.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getTotalListingSummary = catchAsync(async (req, res, next) => {
  const agentObj = req.body;
  const allDetail = await AnalyticsService.getTotalListingSummary(agentObj);
  res.status(201).json(allDetail);
});

