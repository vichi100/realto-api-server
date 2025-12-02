
const axios = require("axios");
const { OTP_API } = require('../config/env');
const logger = require('../utils/logger');


const generateOTP = async (otpDetails) => {
  logger.info(JSON.stringify(otpDetails));
  const obj = JSON.parse(JSON.stringify(otpDetails));
  const mobile = obj.mobile;
  const OTP = obj.otp;

  try {
    await axios.get(`https://2factor.in/API/V1/${OTP_API}/SMS/${mobile}/${OTP}/FlickSickOTP1`);
    return 'success';
  } catch (err) {
    console.error(`generateOTP# Failed to fetch documents : ${err}`);
    return 'fail';
  }
};

module.exports = {
  generateOTP
};