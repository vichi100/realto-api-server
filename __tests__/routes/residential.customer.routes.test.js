const request = require('supertest');
const express = require('express');
const residentialCustomerRoutes = require('../../routes/residential.customer.routes');
const residentialCustomerController = require('../../controllers/residential.customer.controller');

jest.mock('../../controllers/residential.customer.controller');

const app = express();
app.use(express.json());
app.use('/api/residential-customer', residentialCustomerRoutes);

describe('Residential Customer Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/residential-customer/addNewResidentialCustomer', () => {
    it('should route to addNewResidentialCustomer controller', async () => {
      residentialCustomerController.addNewResidentialCustomer.mockImplementation((req, res) => {
        res.status(201).json({ id: 'cust-1', type: 'Rent' });
      });

      await request(app)
        .post('/api/residential-customer/addNewResidentialCustomer')
        .send({ agent_id: 'agent-1', type: 'Rent' })
        .expect(201);

      expect(residentialCustomerController.addNewResidentialCustomer).toHaveBeenCalled();
    });
  });

  describe('POST /api/residential-customer/getResidentialCustomerList', () => {
    it('should route to getResidentialCustomerList controller', async () => {
      residentialCustomerController.getResidentialCustomerList.mockImplementation((req, res) => {
        res.status(201).json([{ id: 'cust-1' }, { id: 'cust-2' }]);
      });

      await request(app)
        .post('/api/residential-customer/getResidentialCustomerList')
        .send({ agent_id: 'agent-1' })
        .expect(201);

      expect(residentialCustomerController.getResidentialCustomerList).toHaveBeenCalled();
    });
  });

  describe('POST /api/residential-customer/deleteResidintialCustomer', () => {
    it('should route to deleteResidintialCustomer controller', async () => {
      residentialCustomerController.deleteResidintialCustomer.mockImplementation((req, res) => {
        res.status(201).json('Customer deleted successfully.');
      });

      await request(app)
        .post('/api/residential-customer/deleteResidintialCustomer')
        .send({ customer_id: 'cust-1' })
        .expect(201);

      expect(residentialCustomerController.deleteResidintialCustomer).toHaveBeenCalled();
    });
  });

  describe('POST /api/residential-customer/closeResidintialCustomer', () => {
    it('should route to closeResidintialCustomer controller', async () => {
      residentialCustomerController.closeResidintialCustomer.mockImplementation((req, res) => {
        res.status(201).json({ id: 'cust-1', status: 1 });
      });

      await request(app)
        .post('/api/residential-customer/closeResidintialCustomer')
        .send({ customer_id: 'cust-1' })
        .expect(201);

      expect(residentialCustomerController.closeResidintialCustomer).toHaveBeenCalled();
    });
  });
});
