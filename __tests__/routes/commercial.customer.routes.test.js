const request = require('supertest');
const express = require('express');
const commercialCustomerRoutes = require('../../routes/commercial.customer.routes');
const commercialCustomerController = require('../../controllers/commercial.customer.controller');

jest.mock('../../controllers/commercial.customer.controller');

const app = express();
app.use(express.json());
app.use('/api/commercial-customer', commercialCustomerRoutes);

describe('Commercial Customer Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/commercial-customer/addNewCommercialCustomer', () => {
    it('should route to addNewCommercialCustomer controller', async () => {
      commercialCustomerController.addNewCommercialCustomer.mockImplementation((req, res) => {
        res.status(201).json({ id: 'cust-1', type: 'Rent' });
      });

      await request(app)
        .post('/api/commercial-customer/addNewCommercialCustomer')
        .send({ agent_id: 'agent-1', type: 'Rent' })
        .expect(201);

      expect(commercialCustomerController.addNewCommercialCustomer).toHaveBeenCalled();
    });
  });

  describe('POST /api/commercial-customer/getCommercialCustomerListings', () => {
    it('should route to getCommercialCustomerListings controller', async () => {
      commercialCustomerController.getCommercialCustomerListings.mockImplementation((req, res) => {
        res.status(201).json([{ id: 'cust-1' }, { id: 'cust-2' }]);
      });

      await request(app)
        .post('/api/commercial-customer/getCommercialCustomerListings')
        .send({ agent_id: 'agent-1' })
        .expect(201);

      expect(commercialCustomerController.getCommercialCustomerListings).toHaveBeenCalled();
    });
  });

  describe('POST /api/commercial-customer/deleteCommercialCustomer', () => {
    it('should route to deleteCommercialCustomer controller', async () => {
      commercialCustomerController.deleteCommercialCustomer.mockImplementation((req, res) => {
        res.status(201).json('Customer deleted successfully.');
      });

      await request(app)
        .post('/api/commercial-customer/deleteCommercialCustomer')
        .send({ customer_id: 'cust-1' })
        .expect(201);

      expect(commercialCustomerController.deleteCommercialCustomer).toHaveBeenCalled();
    });
  });

  describe('POST /api/commercial-customer/closeCommercialCustomer', () => {
    it('should route to closeCommercialCustomer controller', async () => {
      commercialCustomerController.closeCommercialCustomer.mockImplementation((req, res) => {
        res.status(201).json({ id: 'cust-1', status: 1 });
      });

      await request(app)
        .post('/api/commercial-customer/closeCommercialCustomer')
        .send({ customer_id: 'cust-1' })
        .expect(201);

      expect(commercialCustomerController.closeCommercialCustomer).toHaveBeenCalled();
    });
  });
});
