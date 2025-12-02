const CustomerService = require('../services/customer/customer.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getCustomerDetailsByIdToShare = catchAsync(async (req, res, next) => {
  const customerDetails = req.body;
  const customerDetail = await CustomerService.getCustomerDetailsByIdToShare(customerDetails);
  res.status(201).json({
    status: 'success',
    data: customerDetail
  });
});


exports.getCustomerListForMeeting = catchAsync(async (req, res, next) => {
  const customerDetails = req.body;
  const customerList = await CustomerService.getCustomerListForMeeting(customerDetails);
  res.status(201).json({
    status: 'success',
    data: customerList
  });
});


exports.getCustomerAndMeetingDetails = catchAsync(async (req, res, next) => {
  const customerDetails = req.body;
  const customerAndMeetingDetails = await CustomerService.getCustomerAndMeetingDetails(customerDetails);
  res.status(201).json({
    status: 'success',
    data: customerAndMeetingDetails
  });
});






  