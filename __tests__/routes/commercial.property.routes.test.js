const request = require('supertest');
const express = require('express');
const commercialPropertyRoutes = require('../../routes/commercial.property.routes');
const commercialPropertyController = require('../../controllers/commercial.property.controller');

jest.mock('../../controllers/commercial.property.controller');

const app = express();
app.use(express.json());
app.use('/api/commercial-property', commercialPropertyRoutes);

describe('Commercial Property Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/commercial-property/addNewCommercialProperty', () => {
    it('should route to addNewCommercialProperty controller', async () => {
      commercialPropertyController.addNewCommercialProperty.mockImplementation((req, res) => {
        res.status(201).json({ id: 'prop-1', type: 'Rent' });
      });

      await request(app)
        .post('/api/commercial-property/addNewCommercialProperty')
        .send({ agent_id: 'agent-1', type: 'Rent' })
        .expect(201);

      expect(commercialPropertyController.addNewCommercialProperty).toHaveBeenCalled();
    });
  });

  describe('POST /api/commercial-property/getCommercialPropertyListings', () => {
    it('should route to getCommercialPropertyListings controller', async () => {
      commercialPropertyController.getCommercialPropertyListings.mockImplementation((req, res) => {
        res.status(201).json([{ id: 'prop-1' }, { id: 'prop-2' }]);
      });

      await request(app)
        .post('/api/commercial-property/getCommercialPropertyListings')
        .send({ agent_id: 'agent-1' })
        .expect(201);

      expect(commercialPropertyController.getCommercialPropertyListings).toHaveBeenCalled();
    });
  });

  describe('POST /api/commercial-property/deleteCommercialProperty', () => {
    it('should route to deleteCommercialProperty controller', async () => {
      commercialPropertyController.deleteCommercialProperty.mockImplementation((req, res) => {
        res.status(201).json('Property deleted successfully.');
      });

      await request(app)
        .post('/api/commercial-property/deleteCommercialProperty')
        .send({ property_id: 'prop-1' })
        .expect(201);

      expect(commercialPropertyController.deleteCommercialProperty).toHaveBeenCalled();
    });
  });

  describe('POST /api/commercial-property/closeCommercialProperty', () => {
    it('should route to closeCommercialProperty controller', async () => {
      commercialPropertyController.closeCommercialProperty.mockImplementation((req, res) => {
        res.status(201).json({ id: 'prop-1', status: 1 });
      });

      await request(app)
        .post('/api/commercial-property/closeCommercialProperty')
        .send({ property_id: 'prop-1' })
        .expect(201);

      expect(commercialPropertyController.closeCommercialProperty).toHaveBeenCalled();
    });
  });
});
