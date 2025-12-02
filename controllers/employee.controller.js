const EmployeeService = require('../services/employee.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.addEmployee = catchAsync(async (req, res, next) => {
  const employeeDetails = req.body;
  const savedEmployeeDetails = await EmployeeService.addEmployee(employeeDetails);
  res.status(201).json({
    status: 'success',
    data: savedEmployeeDetails
  });
});

exports.updateEmployeeDetails = catchAsync(async (req, res, next) => {
  const employeeDetails = req.body;
  const updatedEmployeeDetails = await EmployeeService.updateEmployeeDetails(employeeDetails);
  res.status(200).json({
    status: 'success',
    data: updatedEmployeeDetails
  });
});

exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const { employeeId, agentId } = req.params;
  await EmployeeService.deleteEmployee(employeeId, agentId);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.removeEmployee = catchAsync(async (req, res, next) => {
  const { employeeId, agentId } = req.params;
  await EmployeeService.removeEmployee(employeeId, agentId);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updateEmployeeEditRights = catchAsync(async (req, res, next) => {
  const { employeeId, editRights } = req.body;
  const updatedEmployee = await EmployeeService.updateEmployeeEditRights(employeeId, editRights);
  res.status(200).json({
    status: 'success',
    data: updatedEmployee
  });
});

exports.getEmployeeList = catchAsync(async (req, res, next) => {
  const { agentId } = req.params;
  const employeeList = await EmployeeService.getEmployeeList(agentId);
  res.status(200).json({
    status: 'success',
    data: employeeList
  });
});

exports.updatePropertiesForEmployee = catchAsync(async (req, res, next) => {
  const { employeeId, properties } = req.body;
  const updatedEmployee = await EmployeeService.updatePropertiesForEmployee(employeeId, properties);
  res.status(200).json({
    status: 'success',
    data: updatedEmployee
  });
});

exports.insertNewUserAsEmployee = catchAsync(async (req, res, next) => {
  const { agentId, userDetails } = req.body;
  const newEmployee = await EmployeeService.insertNewUserAsEmployee(agentId, userDetails);
  res.status(201).json({
    status: 'success',
    data: newEmployee
  });
});

exports.getEmployerDetails = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;
  const employerDetails = await EmployeeService.getEmployerDetails(employeeId);
  res.status(200).json({
    status: 'success',
    data: employerDetails
  });
});

exports.updateUserEmployeeList = catchAsync(async (req, res, next) => {
  const { agentId, employeeId, action } = req.body;
  const updatedUser = await EmployeeService.updateUserEmployeeList(agentId, employeeId, action);
  res.status(200).json({
    status: 'success',
    data: updatedUser
  });
});


