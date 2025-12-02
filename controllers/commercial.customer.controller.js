// controllers/customerController.js
const CustomerService = require('../services/customer/commercial.customer.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');



exports.addNewCommercialCustomer = catchAsync(async (req, res, next) => {
  const customerDetails = req.body;
  const savedCustomer = await CustomerService.addNewCommercialCustomer(customerDetails);
  res.status(201).json({
    status: 'success',
    data: savedCustomer
  });
});

exports.getCommercialCustomerListings = catchAsync(async (req, res, next) => {
  const agentDetailsParam = req.body;
  const customers = await CustomerService.getCommercialCustomerListings(agentDetailsParam);
  res.status(200).json({
    status: 'success',
    data: customers
  });
});

exports.deleteCommercialCustomer = catchAsync(async (req, res, next) => {
  const reqDataParam = req.body;
 
  await CustomerService.deleteCommercialCustomer(reqDataParam);
  res.status(200).json({
    status: 'success',
    message: 'Customer deleted successfully.'
  });
});

exports.closeCommercialCustomer = catchAsync(async (req, res, next) => {
  const reqDataParam = req.body;
  
  const updatedCustomer = await CustomerService.closeCommercialCustomer(reqDataParam);
  res.status(200).json({
    status: 'success',
    data: updatedCustomer
  });
});
