const EmployeeService = require('../services/employee.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.addEmployee = catchAsync(async (req, res, next) => {
  const employeeDetails = req.body;
  const savedEmployeeDetails = await EmployeeService.addEmployee(employeeDetails);
  res.status(201).json(savedEmployeeDetails);
});

exports.updateEmployeeDetails = catchAsync(async (req, res, next) => {
  const employeeDetails = req.body;
  const updatedEmployeeDetails = await EmployeeService.updateEmployeeDetails(employeeDetails);
  res.status(201).json(updatedEmployeeDetails);
});

exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const employeeDetailsParam = req.body;
  const result = await EmployeeService.deleteEmployee(employeeDetailsParam);
  res.status(201).json(result);
});

exports.removeEmployee = catchAsync(async (req, res, next) => {
  const employeeDetailsParam = req.body;
  const result =  EmployeeService.removeEmployee(employeeDetailsParam);
  res.status(201).json(result);
});

exports.updateEmployeeEditRights = catchAsync(async (req, res, next) => {
  const employeeDetailsParam = req.body;
  const updatedEmployee = await EmployeeService.updateEmployeeEditRights(employeeDetailsParam);
  res.status(201).json(updatedEmployee);
});

exports.getEmployeeList = catchAsync(async (req, res, next) => {
  const userObjParam = req.body;
  const employeeList = await EmployeeService.getEmployeeList(userObjParam);
  res.status(201).json(employeeList);
});

exports.updatePropertiesForEmployee = catchAsync(async (req, res, next) => {
  const employeeDetailsParam = req.body;
  const updatedEmployee = await EmployeeService.updatePropertiesForEmployee(employeeDetailsParam);
  res.status(201).json(updatedEmployee);
});

exports.insertNewUserAsEmployee = catchAsync(async (req, res, next) => {
  const employeeDetailsParam = req.body;
  const newEmployee = await EmployeeService.insertNewUserAsEmployee(employeeDetailsParam);
  res.status(201).json(newEmployee);
});

exports.getEmployerDetails = catchAsync(async (req, res, next) => {
  const userObjParam = req.params;
  const employerDetails = await EmployeeService.getEmployerDetails(userObjParam);
  res.status(201).json(employerDetails);
});

exports.updateUserEmployeeList = catchAsync(async (req, res, next) => {
  const { agentId, employeeId } = req.body;
  const updatedUser = await EmployeeService.updateUserEmployeeList(agentId, employeeId);
  res.status(201).json(updatedUser);
});


