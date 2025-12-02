const CustomerService = require('../../services/customer/customer.service');
const customerController = require('../../controllers/customer.controller');

jest.mock('../../services/customer/customer.service');

describe('Customer Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getCustomerDetailsByIdToShare', () => {
    it('should get customer details successfully', async () => {
      const mockCustomer = {
        id: 'cust-1',
        name: 'John Doe',
        agent: { name: 'Agent Name' }
      };
      req.body = { customer_id: 'cust-1', type: 'Rent', property_type: 'Residential' };
      CustomerService.getCustomerDetailsByIdToShare.mockResolvedValue(mockCustomer);

      await customerController.getCustomerDetailsByIdToShare(req, res, next);

      expect(CustomerService.getCustomerDetailsByIdToShare).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCustomer);
    });

    it('should handle errors', async () => {
      const error = new Error('Customer not found');
      CustomerService.getCustomerDetailsByIdToShare.mockRejectedValue(error);

      await customerController.getCustomerDetailsByIdToShare(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getCustomerListForMeeting', () => {
    it('should get customer list for meeting', async () => {
      const mockCustomers = [
        { id: 'cust-1', name: 'Customer 1' },
        { id: 'cust-2', name: 'Customer 2' }
      ];
      req.body = { property_id: 'prop-1', type: 'Rent', property_type: 'Residential' };
      CustomerService.getCustomerListForMeeting.mockResolvedValue(mockCustomers);

      await customerController.getCustomerListForMeeting(req, res, next);

      expect(CustomerService.getCustomerListForMeeting).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockCustomers);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      CustomerService.getCustomerListForMeeting.mockRejectedValue(error);

      await customerController.getCustomerListForMeeting(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getCustomerAndMeetingDetails', () => {
    it('should get customer and meeting details', async () => {
      const mockDetails = {
        customer: { id: 'cust-1', name: 'John Doe' },
        property: { id: 'prop-1', address: 'Test Address' },
        matched_percentage: 85
      };
      req.body = {
        customer_id: 'cust-1',
        property_id: 'prop-1',
        type: 'Rent',
        property_type: 'Residential'
      };
      CustomerService.getCustomerAndMeetingDetails.mockResolvedValue(mockDetails);

      await customerController.getCustomerAndMeetingDetails(req, res, next);

      expect(CustomerService.getCustomerAndMeetingDetails).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockDetails);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      CustomerService.getCustomerAndMeetingDetails.mockRejectedValue(error);

      await customerController.getCustomerAndMeetingDetails(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
