const CustomerService = require('../../services/customer/commercial.customer.service');
const commercialCustomerController = require('../../controllers/commercial.customer.controller');

jest.mock('../../services/customer/commercial.customer.service');

describe('Commercial Customer Controller', () => {
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

  describe('addNewCommercialCustomer', () => {
    it('should add commercial customer successfully', async () => {
      const mockCustomer = { id: 'cust-1', type: 'Rent', property_type: 'Commercial' };
      req.body = { agent_id: 'agent-1', type: 'Rent', name: 'John Doe' };
      CustomerService.addNewCommercialCustomer.mockResolvedValue(mockCustomer);

      await commercialCustomerController.addNewCommercialCustomer(req, res, next);

      expect(CustomerService.addNewCommercialCustomer).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCustomer);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      CustomerService.addNewCommercialCustomer.mockRejectedValue(error);

      await commercialCustomerController.addNewCommercialCustomer(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getCommercialCustomerListings', () => {
    it('should return commercial customer listings', async () => {
      const mockCustomers = [
        { id: 'cust-1', type: 'Rent' },
        { id: 'cust-2', type: 'Buy' }
      ];
      req.body = { agent_id: 'agent-1', req_user_id: 'agent-1' };
      CustomerService.getCommercialCustomerListings.mockResolvedValue(mockCustomers);

      await commercialCustomerController.getCommercialCustomerListings(req, res, next);

      expect(CustomerService.getCommercialCustomerListings).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockCustomers);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      CustomerService.getCommercialCustomerListings.mockRejectedValue(error);

      await commercialCustomerController.getCommercialCustomerListings(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteCommercialCustomer', () => {
    it('should delete customer successfully', async () => {
      req.body = { customer_id: 'cust-1', req_user_id: 'agent-1' };
      CustomerService.deleteCommercialCustomer.mockResolvedValue();

      await commercialCustomerController.deleteCommercialCustomer(req, res, next);

      expect(CustomerService.deleteCommercialCustomer).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith('Customer deleted successfully.');
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Unauthorized');
      CustomerService.deleteCommercialCustomer.mockRejectedValue(error);

      await commercialCustomerController.deleteCommercialCustomer(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('closeCommercialCustomer', () => {
    it('should close customer successfully', async () => {
      const mockCustomer = { id: 'cust-1', status: 1 };
      req.body = { customer_id: 'cust-1', req_user_id: 'agent-1' };
      CustomerService.closeCommercialCustomer.mockResolvedValue(mockCustomer);

      await commercialCustomerController.closeCommercialCustomer(req, res, next);

      expect(CustomerService.closeCommercialCustomer).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockCustomer);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      CustomerService.closeCommercialCustomer.mockRejectedValue(error);

      await commercialCustomerController.closeCommercialCustomer(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
