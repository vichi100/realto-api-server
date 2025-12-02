const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otp.controller');

// POST routes: path names match controller method names
router.post('/generateOTP', otpController.generateOTP);

module.exports = router;
