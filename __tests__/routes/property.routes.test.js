const request = require('supertest');
const express = require('express');
const propertyRoutes = require('../../routes/property.routes');
const propertyController = require('../../controllers/property.controller');

jest.mock('../../controllers/property.controller');

const app = express();
app.use(express.json());
app.use('/api/property', propertyRoutes);

describe('Property Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/property/getPropertyDetailsByIdToShare', () => {
    it('should route to getPropertyDetailsByIdToShare controller', async () => {
      propertyController.getPropertyDetailsByIdToShare.mockImplementation((req, res) => {
        res.status(201).json({ id: 'prop-1', address: 'Test Address' });
      });

      await request(app)
        .post('/api/property/getPropertyDetailsByIdToShare')
        .send({ property_id: 'prop-1', type: 'Rent', property_type: 'Residential' })
        .expect(201);

      expect(propertyController.getPropertyDetailsByIdToShare).toHaveBeenCalled();
    });
  });

  describe('POST /api/property/getPropertyListingForMeeting', () => {
    it('should route to getPropertyListingForMeeting controller', async () => {
      propertyController.getPropertyListingForMeeting.mockImplementation((req, res) => {
        res.status(201).json([{ id: 'prop-1' }, { id: 'prop-2' }]);
      });

      await request(app)
        .post('/api/property/getPropertyListingForMeeting')
        .send({ customer_id: 'cust-1', type: 'Rent' })
        .expect(201);

      expect(propertyController.getPropertyListingForMeeting).toHaveBeenCalled();
    });
  });
});
