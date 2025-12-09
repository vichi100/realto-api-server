const dotenv = require('dotenv');
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const imagePath = nodeEnv === 'production' 
  ? process.env.IMAGE_PATH_PROD 
  : process.env.IMAGE_PATH_DEV;

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_URL: process.env.DB_URL,
  NODE_ENV: nodeEnv,
  SERVER_NAME: process.env.SERVER_NAME || 'api.realto.com',
  IMAGE_PATH_URL: imagePath || './images',
  OTP_API: process.env.OTP_API,
  CLIENT_URL: process.env.CLIENT_URL
};