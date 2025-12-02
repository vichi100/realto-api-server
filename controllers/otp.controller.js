const OtpService = require('../services/otp.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.generateOTP = catchAsync(async (req, res, next) => {
  const otpDetails = req.body;
  const result = await OtpService.generateOTP(otpDetails);
  res.status(201).json(result);
});



