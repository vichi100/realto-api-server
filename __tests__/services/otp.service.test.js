const otpService = require('../../services/otp.service');
const axios = require('axios');
const { OTP_API } = require('../../config/env');

jest.mock('axios');
jest.mock('../../config/env', () => ({
  OTP_API: 'test-api-key-12345'
}));

describe('OTP Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('generateOTP', () => {
    it('should successfully send OTP and return success', async () => {
      const otpDetails = {
        mobile: '9876543210',
        otp: '123456'
      };

      axios.get.mockResolvedValue({ status: 200, data: { Status: 'Success' } });

      const result = await otpService.generateOTP(otpDetails);

      expect(result).toBe('success');
      expect(axios.get).toHaveBeenCalledWith(
        `https://2factor.in/API/V1/${OTP_API}/SMS/9876543210/123456/FlickSickOTP1`
      );
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should send OTP with different mobile number', async () => {
      const otpDetails = {
        mobile: '1234567890',
        otp: '654321'
      };

      axios.get.mockResolvedValue({ status: 200, data: { Status: 'Success' } });

      const result = await otpService.generateOTP(otpDetails);

      expect(result).toBe('success');
      expect(axios.get).toHaveBeenCalledWith(
        `https://2factor.in/API/V1/${OTP_API}/SMS/1234567890/654321/FlickSickOTP1`
      );
    });

    it('should handle OTP with leading zeros', async () => {
      const otpDetails = {
        mobile: '9999999999',
        otp: '001234'
      };

      axios.get.mockResolvedValue({ status: 200, data: { Status: 'Success' } });

      const result = await otpService.generateOTP(otpDetails);

      expect(result).toBe('success');
      expect(axios.get).toHaveBeenCalledWith(
        `https://2factor.in/API/V1/${OTP_API}/SMS/9999999999/001234/FlickSickOTP1`
      );
    });

    it('should return fail when axios request fails', async () => {
      const otpDetails = {
        mobile: '9876543210',
        otp: '123456'
      };

      axios.get.mockRejectedValue(new Error('Network error'));

      const result = await otpService.generateOTP(otpDetails);

      expect(result).toBe('fail');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('generateOTP# Failed to fetch documents : Error: Network error')
      );
    });

    it('should return fail when 2factor API returns error', async () => {
      const otpDetails = {
        mobile: '9876543210',
        otp: '123456'
      };

      axios.get.mockRejectedValue(new Error('Invalid API key'));

      const result = await otpService.generateOTP(otpDetails);

      expect(result).toBe('fail');
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout errors', async () => {
      const otpDetails = {
        mobile: '9876543210',
        otp: '123456'
      };

      axios.get.mockRejectedValue(new Error('timeout of 5000ms exceeded'));

      const result = await otpService.generateOTP(otpDetails);

      expect(result).toBe('fail');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('timeout of 5000ms exceeded')
      );
    });

    it('should handle 4xx HTTP errors', async () => {
      const otpDetails = {
        mobile: '9876543210',
        otp: '123456'
      };

      const error = new Error('Request failed with status code 400');
      error.response = { status: 400, data: { message: 'Bad Request' } };
      axios.get.mockRejectedValue(error);

      const result = await otpService.generateOTP(otpDetails);

      expect(result).toBe('fail');
    });

    it('should handle 5xx HTTP errors', async () => {
      const otpDetails = {
        mobile: '9876543210',
        otp: '123456'
      };

      const error = new Error('Request failed with status code 500');
      error.response = { status: 500, data: { message: 'Server Error' } };
      axios.get.mockRejectedValue(error);

      const result = await otpService.generateOTP(otpDetails);

      expect(result).toBe('fail');
    });

    it('should correctly parse JSON stringified input', async () => {
      const otpDetails = {
        mobile: '+919876543210',
        otp: '789012',
        extraField: 'ignored'
      };

      axios.get.mockResolvedValue({ status: 200 });

      const result = await otpService.generateOTP(otpDetails);

      expect(result).toBe('success');
      // Should extract mobile and otp correctly even with extra fields
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('+919876543210/789012')
      );
    });

    it('should use correct API endpoint structure', async () => {
      const otpDetails = {
        mobile: '9999999999',
        otp: '111111'
      };

      axios.get.mockResolvedValue({ status: 200 });

      await otpService.generateOTP(otpDetails);

      const expectedUrl = `https://2factor.in/API/V1/${OTP_API}/SMS/9999999999/111111/FlickSickOTP1`;
      expect(axios.get).toHaveBeenCalledWith(expectedUrl);
    });

    it('should handle mobile numbers with country code', async () => {
      const otpDetails = {
        mobile: '+91-987-654-3210',
        otp: '999999'
      };

      axios.get.mockResolvedValue({ status: 200 });

      const result = await otpService.generateOTP(otpDetails);

      expect(result).toBe('success');
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('+91-987-654-3210')
      );
    });

    it('should handle connection refused errors', async () => {
      const otpDetails = {
        mobile: '9876543210',
        otp: '123456'
      };

      const error = new Error('connect ECONNREFUSED');
      error.code = 'ECONNREFUSED';
      axios.get.mockRejectedValue(error);

      const result = await otpService.generateOTP(otpDetails);

      expect(result).toBe('fail');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle DNS lookup failures', async () => {
      const otpDetails = {
        mobile: '9876543210',
        otp: '123456'
      };

      const error = new Error('getaddrinfo ENOTFOUND 2factor.in');
      error.code = 'ENOTFOUND';
      axios.get.mockRejectedValue(error);

      const result = await otpService.generateOTP(otpDetails);

      expect(result).toBe('fail');
    });
  });
});
