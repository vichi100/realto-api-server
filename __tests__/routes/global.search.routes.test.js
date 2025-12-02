const request = require('supertest');
const express = require('express');
const globalSearchRoutes = require('../../routes/global.search.routes');
const globalSearchController = require('../../controllers/global.search.controller');

jest.mock('../../controllers/global.search.controller');

const app = express();
app.use(express.json());
app.use('/api/global-search', globalSearchRoutes);

describe('Global Search Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/global-search/getGlobalSearchResult', () => {
    it('should route to getGlobalSearchResult controller', async () => {
      globalSearchController.getGlobalSearchResult.mockImplementation((req, res) => {
        res.status(201).json({
          mine_properties: [{ id: 'prop-1' }],
          other_properties: [{ id: 'prop-2' }]
        });
      });

      await request(app)
        .post('/api/global-search/getGlobalSearchResult')
        .send({ looking_for: 'Property', type: 'Rent', property_type: 'Residential' })
        .expect(201);

      expect(globalSearchController.getGlobalSearchResult).toHaveBeenCalled();
    });
  });

  describe('POST /api/global-search/getAllGlobalListingByLocations', () => {
    it('should route to getAllGlobalListingByLocations controller', async () => {
      globalSearchController.getAllGlobalListingByLocations.mockImplementation((req, res) => {
        res.status(201).json([{ id: 'prop-1' }, { id: 'prop-2' }]);
      });

      await request(app)
        .post('/api/global-search/getAllGlobalListingByLocations')
        .send({ locations: ['Location1', 'Location2'] })
        .expect(201);

      expect(globalSearchController.getAllGlobalListingByLocations).toHaveBeenCalled();
    });
  });
});
