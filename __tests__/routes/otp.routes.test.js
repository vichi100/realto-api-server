const request = require('supertest');
const express = require('express');
const otpRoutes = require('../../routes/otp.routes');
const otpController = require('../../controllers/otp.controller');

jest.mock('../../controllers/otp.controller');

const app = express();
app.use(express.json());
app.use('/api/otp', otpRoutes);

describe('OTP Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/otp/generateOTP', () => {
    it('should call generateOTP controller', async () => {
      otpController.generateOTP.mockImplementation((req, res) => {
        res.status(201).json({ Status: 'Success', Details: 'OTP sent' });
      });

      const response = await request(app)
        .post('/api/otp/generateOTP')
        .send({ mobile: '9876543210', otp: '123456' })
        .expect(201);

      expect(otpController.generateOTP).toHaveBeenCalled();
      expect(response.body.Status).toBe('Success');
    });

    it('should handle OTP generation with different mobile formats', async () => {
      otpController.generateOTP.mockImplementation((req, res) => {
        res.status(201).json({ Status: 'Success', Details: 'OTP sent' });
      });

      await request(app)
        .post('/api/otp/generateOTP')
        .send({ mobile: '+919876543210', otp: '654321' })
        .expect(201);

      expect(otpController.generateOTP).toHaveBeenCalled();
    });
  });
});
