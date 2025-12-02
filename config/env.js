const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SERVER_NAME: process.env.SERVER_NAME || 'api.realto.com',
  IMAGE_PATH_URL: process.env.IMAGE_PATH_URL,
  OTP_API: process.env.OTP_API,
  CLIENT_URL: process.env.CLIENT_URL
};