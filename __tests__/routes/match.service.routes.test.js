const request = require('supertest');
const express = require('express');
const matchServiceRoutes = require('../../routes/match.service.routes');
const matchServiceController = require('../../controllers/match.service.controller');

jest.mock('../../controllers/match.service.controller');

const app = express();
app.use(express.json());
app.use('/api/match', matchServiceRoutes);

describe('Match Service Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/match/getmatchedResidentialCustomerRentList', () => {
    it('should route to getmatchedResidentialCustomerRentList controller', async () => {
      matchServiceController.getmatchedResidentialCustomerRentList.mockImplementation((req, res) => {
        res.status(201).json({ mine_customers: [], other_customers: [] });
      });

      await request(app)
        .post('/api/match/getmatchedResidentialCustomerRentList')
        .send({ property_id: 'prop-1' })
        .expect(201);

      expect(matchServiceController.getmatchedResidentialCustomerRentList).toHaveBeenCalled();
    });
  });

  describe('POST /api/match/getMatchedResidentialProptiesRentList', () => {
    it('should route to getMatchedResidentialProptiesRentList controller', async () => {
      matchServiceController.getMatchedResidentialProptiesRentList.mockImplementation((req, res) => {
        res.status(201).json({ mine_properties: [], other_properties: [] });
      });

      await request(app)
        .post('/api/match/getMatchedResidentialProptiesRentList')
        .send({ customer_id: 'cust-1' })
        .expect(201);

      expect(matchServiceController.getMatchedResidentialProptiesRentList).toHaveBeenCalled();
    });
  });

  describe('POST /api/match/matchedResidentialProptiesBuyList', () => {
    it('should route to matchedResidentialProptiesBuyList controller', async () => {
      matchServiceController.matchedResidentialProptiesBuyList.mockImplementation((req, res) => {
        res.status(201).json({ mine_properties: [], other_properties: [] });
      });

      await request(app)
        .post('/api/match/matchedResidentialProptiesBuyList')
        .send({ customer_id: 'cust-1' })
        .expect(201);

      expect(matchServiceController.matchedResidentialProptiesBuyList).toHaveBeenCalled();
    });
  });

  describe('POST /api/match/getMatchedResidentialCustomerBuyList', () => {
    it('should route to getMatchedResidentialCustomerBuyList controller', async () => {
      matchServiceController.getMatchedResidentialCustomerBuyList.mockImplementation((req, res) => {
        res.status(201).json({ mine_customers: [], other_customers: [] });
      });

      await request(app)
        .post('/api/match/getMatchedResidentialCustomerBuyList')
        .send({ property_id: 'prop-1' })
        .expect(201);

      expect(matchServiceController.getMatchedResidentialCustomerBuyList).toHaveBeenCalled();
    });
  });

  describe('POST /api/match/getMatchedCommercialProptiesRentList', () => {
    it('should route to getMatchedCommercialProptiesRentList controller', async () => {
      matchServiceController.getMatchedCommercialProptiesRentList.mockImplementation((req, res) => {
        res.status(201).json({ mine_properties: [], other_properties: [] });
      });

      await request(app)
        .post('/api/match/getMatchedCommercialProptiesRentList')
        .send({ customer_id: 'cust-1' })
        .expect(201);

      expect(matchServiceController.getMatchedCommercialProptiesRentList).toHaveBeenCalled();
    });
  });

  describe('POST /api/match/getMatchedCommercialProptiesBuyList', () => {
    it('should route to getMatchedCommercialProptiesBuyList controller', async () => {
      matchServiceController.getMatchedCommercialProptiesBuyList.mockImplementation((req, res) => {
        res.status(201).json({ mine_properties: [], other_properties: [] });
      });

      await request(app)
        .post('/api/match/getMatchedCommercialProptiesBuyList')
        .send({ customer_id: 'cust-1' })
        .expect(201);

      expect(matchServiceController.getMatchedCommercialProptiesBuyList).toHaveBeenCalled();
    });
  });

  describe('POST /api/match/getMatchedCommercialCustomerRentList', () => {
    it('should route to getMatchedCommercialCustomerRentList controller', async () => {
      matchServiceController.getMatchedCommercialCustomerRentList.mockImplementation((req, res) => {
        res.status(201).json({ mine_customers: [], other_customers: [] });
      });

      await request(app)
        .post('/api/match/getMatchedCommercialCustomerRentList')
        .send({ property_id: 'prop-1' })
        .expect(201);

      expect(matchServiceController.getMatchedCommercialCustomerRentList).toHaveBeenCalled();
    });
  });

  describe('POST /api/match/getMatchedCommercialCustomerSellList', () => {
    it('should route to getMatchedCommercialCustomerSellList controller', async () => {
      matchServiceController.getMatchedCommercialCustomerSellList.mockImplementation((req, res) => {
        res.status(201).json({ mine_customers: [], other_customers: [] });
      });

      await request(app)
        .post('/api/match/getMatchedCommercialCustomerSellList')
        .send({ property_id: 'prop-1' })
        .expect(201);

      expect(matchServiceController.getMatchedCommercialCustomerSellList).toHaveBeenCalled();
    });
  });

  describe('POST /api/match/getMatchedCommercialProptiesList', () => {
    it('should route to getMatchedCommercialProptiesList controller', async () => {
      matchServiceController.getMatchedCommercialProptiesList.mockImplementation((req, res) => {
        res.status(201).json({ mine_properties: [], other_properties: [] });
      });

      await request(app)
        .post('/api/match/getMatchedCommercialProptiesList')
        .send({ customer_id: 'cust-1' })
        .expect(201);

      expect(matchServiceController.getMatchedCommercialProptiesList).toHaveBeenCalled();
    });
  });
});
