const request = require('supertest');
const express = require('express');
const customerRoutes = require('../../routes/customer.routes');
const customerController = require('../../controllers/customer.controller');

jest.mock('../../controllers/customer.controller');

const app = express();
app.use(express.json());
app.use('/api/customer', customerRoutes);

describe('Customer Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/customer/getCustomerDetailsByIdToShare', () => {
    it('should route to getCustomerDetailsByIdToShare controller', async () => {
      customerController.getCustomerDetailsByIdToShare.mockImplementation((req, res) => {
        res.status(201).json({ id: 'cust-1', name: 'John Doe' });
      });

      await request(app)
        .post('/api/customer/getCustomerDetailsByIdToShare')
        .send({ customer_id: 'cust-1', type: 'Rent', property_type: 'Residential' })
        .expect(201);

      expect(customerController.getCustomerDetailsByIdToShare).toHaveBeenCalled();
    });
  });

  describe('POST /api/customer/getCustomerListForMeeting', () => {
    it('should route to getCustomerListForMeeting controller', async () => {
      customerController.getCustomerListForMeeting.mockImplementation((req, res) => {
        res.status(201).json([{ id: 'cust-1' }, { id: 'cust-2' }]);
      });

      await request(app)
        .post('/api/customer/getCustomerListForMeeting')
        .send({ property_id: 'prop-1', type: 'Rent' })
        .expect(201);

      expect(customerController.getCustomerListForMeeting).toHaveBeenCalled();
    });
  });

  describe('POST /api/customer/getCustomerAndMeetingDetails', () => {
    it('should route to getCustomerAndMeetingDetails controller', async () => {
      customerController.getCustomerAndMeetingDetails.mockImplementation((req, res) => {
        res.status(201).json({
          customer: { id: 'cust-1' },
          property: { id: 'prop-1' },
          matched_percentage: 85
        });
      });

      await request(app)
        .post('/api/customer/getCustomerAndMeetingDetails')
        .send({ customer_id: 'cust-1', property_id: 'prop-1' })
        .expect(201);

      expect(customerController.getCustomerAndMeetingDetails).toHaveBeenCalled();
    });
  });
});
