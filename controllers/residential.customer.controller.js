const CustomerService = require('../services/customer/residential.customer.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.addNewResidentialCustomer = catchAsync(async (req, res, next) => {
  const customerDetails = req.body;
  const savedCustomer = await CustomerService.addNewResidentialCustomer(customerDetails);
  res.status(201).json({
    status: 'success',
    data: savedCustomer
  });
});




exports.getResidentialCustomerList = catchAsync(async (req, res, next) => {
  const agentDetailsParam = req.body;
  const customers = await CustomerService.getResidentialCustomerList(agentDetailsParam);
  res.status(200).json({
    status: 'success',
    data: customers
  });
});






exports.deleteResidintialCustomer = catchAsync(async (req, res, next) => {
  const reqDataParam = req.body;
  await CustomerService.deleteResidintialCustomer(reqDataParam);
  res.status(200).json({
    status: 'success',
    message: 'Customer deleted successfully.'
  });
});
exports.closeResidintialCustomer = catchAsync(async (req, res, next) => {
  const reqDataParam = req.body;
  const updatedCustomer = await CustomerService.closeResidintialCustomer(reqDataParam);
  res.status(200).json({
    status: 'success',
    data: updatedCustomer
  });
});
