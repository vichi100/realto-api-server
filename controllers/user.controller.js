const UserService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.checkLoginRole = catchAsync(async (req, res, next) => {
  const userDetails = req.body;
  const user = await UserService.checkLoginRole(userDetails);
  res.status(201).json({
    status: 'success',
    data: user
  });
});


exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const userDetails = req.body;
  const user = await UserService.updateUserProfile(userDetails);
  res.status(201).json({
    status: 'success',
    data: user
  });
});

exports.deleteAgentAccount = catchAsync(async (req, res, next) => {
  const agentDetails = req.body;
  await UserService.deleteAgentAccount(agentDetails);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.reactivateAccount = catchAsync(async (req, res, next) => {
  const agentDetails = req.body;
  const user = await UserService.reactivateAccount(agentDetails);
  res.status(201).json({
    status: 'success',
    data: user
  });
});

// **Helper function**
exports.insertNewUserAsAgent = catchAsync(async (req, res, next) => {
  const userDetails = req.body;
  const user = await UserService.insertNewUserAsAgent(userDetails);
  res.status(201).json({
    status: 'success',
    data: user
  });
});

exports.getUserDetails = catchAsync(async (req, res, next) => {
  const userDetails = req.body;
  const user = await UserService.getUserDetails(userDetails);
  res.status(201).json({
    status: 'success',
    data: user
  });
});
exports.getUserProfileDeatails = catchAsync(async (req, res, next) => {
  const userDetails = req.body;
  const user = await UserService.getUserProfileDeatails(userDetails);
  res.status(201).json({
    status: 'success',
    data: user
  });
});


