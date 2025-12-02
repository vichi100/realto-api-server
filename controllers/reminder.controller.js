const ReminderService = require('../services/reminder.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getReminderList = catchAsync(async (req, res, next) => {
  const agentData = req.body;
  const remiderArray = await ReminderService.getReminderList(agentData);
  res.status(201).json({
    status: 'success',
    data: remiderArray
  });
});

exports.getPropReminderList = catchAsync(async (req, res, next) => {
  const agentData = req.body;
  const remiderArray = await ReminderService.getPropReminderList(agentData);
  res.status(201).json({
    status: 'success',
    data: remiderArray
  });
});

exports.addNewReminder = catchAsync(async (req, res, next) => {
  const reminderData = req.body;
  const newReminder = await ReminderService.addNewReminder(reminderData);
  res.status(201).json({
    status: 'success',
    data: newReminder
  });
});

exports.getCustomerReminderList = catchAsync(async (req, res, next) => {
  const customerData = req.body;
  const remiderArray = await ReminderService.getCustomerReminderList(customerData);
  res.status(201).json({
    status: 'success',
    data: remiderArray
  });
});

exports.getReminderListByCustomerId = catchAsync(async (req, res, next) => {
  const customerData = req.body;
  const remiderArray = await ReminderService.getReminderListByCustomerId(customerData);
  res.status(201).json({
    status: 'success',
    data: remiderArray  
  });
});



