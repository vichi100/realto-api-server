const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// POST routes: path names match controller method names
router.post('/checkLoginRole', userController.checkLoginRole);
router.post('/updateUserProfile', userController.updateUserProfile);
router.post('/deleteAgentAccount', userController.deleteAgentAccount);
router.post('/reactivateAccount', userController.reactivateAccount);
router.post('/insertNewUserAsAgent', userController.insertNewUserAsAgent);
router.post('/getUserDetails', userController.getUserDetails);
router.post('/getUserProfileDeatails', userController.getUserProfileDeatails);

module.exports = router;
