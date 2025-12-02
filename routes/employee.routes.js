const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');

// POST routes: path names match controller method names
router.post('/addEmployee', employeeController.addEmployee);
router.post('/updateEmployeeDetails', employeeController.updateEmployeeDetails);
router.post('/deleteEmployee', employeeController.deleteEmployee);
router.post('/removeEmployee', employeeController.removeEmployee);
router.post('/updateEmployeeEditRights', employeeController.updateEmployeeEditRights);
router.post('/getEmployeeList', employeeController.getEmployeeList);
router.post('/updatePropertiesForEmployee', employeeController.updatePropertiesForEmployee);
router.post('/insertNewUserAsEmployee', employeeController.insertNewUserAsEmployee);
router.post('/getEmployerDetails', employeeController.getEmployerDetails);
router.post('/updateUserEmployeeList', employeeController.updateUserEmployeeList);

module.exports = router;
