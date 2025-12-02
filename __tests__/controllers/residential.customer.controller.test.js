const CustomerService = require('../../services/customer/residential.customer.service');
const residentialCustomerController = require('../../controllers/residential.customer.controller');

jest.mock('../../services/customer/residential.customer.service');

describe('Residential Customer Controller', () => {
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

  describe('addNewResidentialCustomer', () => {
    it('should add residential customer successfully', async () => {
      const mockCustomer = { id: 'cust-1', type: 'Rent', property_type: 'Residential' };
      req.body = { agent_id: 'agent-1', type: 'Rent', name: 'John Doe' };
      CustomerService.addNewResidentialCustomer.mockResolvedValue(mockCustomer);

      await residentialCustomerController.addNewResidentialCustomer(req, res, next);

      expect(CustomerService.addNewResidentialCustomer).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCustomer);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      CustomerService.addNewResidentialCustomer.mockRejectedValue(error);

      await residentialCustomerController.addNewResidentialCustomer(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getResidentialCustomerList', () => {
    it('should return residential customer list', async () => {
      const mockCustomers = [
        { id: 'cust-1', type: 'Rent' },
        { id: 'cust-2', type: 'Buy' }
      ];
      req.body = { agent_id: 'agent-1', req_user_id: 'agent-1' };
      CustomerService.getResidentialCustomerList.mockResolvedValue(mockCustomers);

      await residentialCustomerController.getResidentialCustomerList(req, res, next);

      expect(CustomerService.getResidentialCustomerList).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockCustomers);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      CustomerService.getResidentialCustomerList.mockRejectedValue(error);

      await residentialCustomerController.getResidentialCustomerList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteResidintialCustomer', () => {
    it('should delete customer successfully', async () => {
      req.body = { customer_id: 'cust-1', req_user_id: 'agent-1' };
      CustomerService.deleteResidintialCustomer.mockResolvedValue();

      await residentialCustomerController.deleteResidintialCustomer(req, res, next);

      expect(CustomerService.deleteResidintialCustomer).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith('Customer deleted successfully.');
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Unauthorized');
      CustomerService.deleteResidintialCustomer.mockRejectedValue(error);

      await residentialCustomerController.deleteResidintialCustomer(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('closeResidintialCustomer', () => {
    it('should close customer successfully', async () => {
      const mockCustomer = { id: 'cust-1', status: 1 };
      req.body = { customer_id: 'cust-1', req_user_id: 'agent-1' };
      CustomerService.closeResidintialCustomer.mockResolvedValue(mockCustomer);

      await residentialCustomerController.closeResidintialCustomer(req, res, next);

      expect(CustomerService.closeResidintialCustomer).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockCustomer);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      CustomerService.closeResidintialCustomer.mockRejectedValue(error);

      await residentialCustomerController.closeResidintialCustomer(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
