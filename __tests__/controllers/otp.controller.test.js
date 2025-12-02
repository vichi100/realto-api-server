const OtpService = require('../../services/otp.service');
const otpController = require('../../controllers/otp.controller');

// Mock the OtpService
jest.mock('../../services/otp.service');

describe('OTP Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('generateOTP', () => {
    it('should generate OTP successfully', async () => {
      const mockResult = { Status: 'Success', Details: 'OTP sent' };
      req.body = { mobile: '9876543210', otp: '123456' };
      OtpService.generateOTP.mockResolvedValue(mockResult);

      await otpController.generateOTP(req, res, next);

      expect(OtpService.generateOTP).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle OTP generation failure', async () => {
      const mockResult = { Status: 'Error', Details: 'Invalid mobile number' };
      req.body = { mobile: 'invalid', otp: '123456' };
      OtpService.generateOTP.mockResolvedValue(mockResult);

      await otpController.generateOTP(req, res, next);

      expect(OtpService.generateOTP).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle service errors via catchAsync', async () => {
      const error = new Error('Network error');
      req.body = { mobile: '9876543210', otp: '123456' };
      OtpService.generateOTP.mockRejectedValue(error);

      await otpController.generateOTP(req, res, next).catch(() => {});

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle empty request body', async () => {
      const mockResult = { Status: 'Error', Details: 'Missing parameters' };
      req.body = {};
      OtpService.generateOTP.mockResolvedValue(mockResult);

      await otpController.generateOTP(req, res, next);

      expect(OtpService.generateOTP).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle different mobile number formats', async () => {
      const mockResult = { Status: 'Success', Details: 'OTP sent' };
      req.body = { mobile: '+919876543210', otp: '654321' };
      OtpService.generateOTP.mockResolvedValue(mockResult);

      await otpController.generateOTP(req, res, next);

      expect(OtpService.generateOTP).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });
});
