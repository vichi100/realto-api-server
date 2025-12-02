const request = require('supertest');
const express = require('express');
const residentialPropertyRoutes = require('../../routes/residential.property.routes');
const residentialPropertyController = require('../../controllers/residential.property.controller');

jest.mock('../../controllers/residential.property.controller');

const app = express();
app.use(express.json());
app.use('/api/residential-property', residentialPropertyRoutes);

describe('Residential Property Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/residential-property/addNewResidentialRentProperty', () => {
    it('should route to addNewResidentialRentProperty controller', async () => {
      residentialPropertyController.addNewResidentialRentProperty.mockImplementation((req, res) => {
        res.status(201).json({ id: 'prop-1', type: 'Rent' });
      });

      await request(app)
        .post('/api/residential-property/addNewResidentialRentProperty')
        .send({ agent_id: 'agent-1', type: 'Rent', bhk: '2' })
        .expect(201);

      expect(residentialPropertyController.addNewResidentialRentProperty).toHaveBeenCalled();
    });
  });

  describe('POST /api/residential-property/getResidentialPropertyListings', () => {
    it('should route to getResidentialPropertyListings controller', async () => {
      residentialPropertyController.getResidentialPropertyListings.mockImplementation((req, res) => {
        res.status(201).json([{ id: 'prop-1' }, { id: 'prop-2' }]);
      });

      await request(app)
        .post('/api/residential-property/getResidentialPropertyListings')
        .send({ agent_id: 'agent-1' })
        .expect(201);

      expect(residentialPropertyController.getResidentialPropertyListings).toHaveBeenCalled();
    });
  });

  describe('POST /api/residential-property/deleteResidentialProperty', () => {
    it('should route to deleteResidentialProperty controller', async () => {
      residentialPropertyController.deleteResidentialProperty.mockImplementation((req, res) => {
        res.status(201).json('Property deleted successfully.');
      });

      await request(app)
        .post('/api/residential-property/deleteResidentialProperty')
        .send({ property_id: 'prop-1' })
        .expect(201);

      expect(residentialPropertyController.deleteResidentialProperty).toHaveBeenCalled();
    });
  });

  describe('POST /api/residential-property/closeResidentialProperty', () => {
    it('should route to closeResidentialProperty controller', async () => {
      residentialPropertyController.closeResidentialProperty.mockImplementation((req, res) => {
        res.status(201).json({ id: 'prop-1', status: 1 });
      });

      await request(app)
        .post('/api/residential-property/closeResidentialProperty')
        .send({ property_id: 'prop-1' })
        .expect(201);

      expect(residentialPropertyController.closeResidentialProperty).toHaveBeenCalled();
    });
  });
});
