const MatchService = require('../../services/match.service');
const matchServiceController = require('../../controllers/match.service.controller');

jest.mock('../../services/match.service');

describe('Match Service Controller', () => {
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

  describe('getmatchedResidentialCustomerRentList', () => {
    it('should return matched residential rent customers', async () => {
      const mockResult = {
        mine_customers: [{ id: 'cust-1' }],
        other_customers: [{ id: 'cust-2' }]
      };
      req.body = { property_id: 'prop-1', agent_id: 'agent-1' };
      MatchService.getmatchedResidentialCustomerRentList.mockResolvedValue(mockResult);

      await matchServiceController.getmatchedResidentialCustomerRentList(req, res, next);

      expect(MatchService.getmatchedResidentialCustomerRentList).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      MatchService.getmatchedResidentialCustomerRentList.mockRejectedValue(error);

      await matchServiceController.getmatchedResidentialCustomerRentList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMatchedResidentialProptiesRentList', () => {
    it('should return matched residential rent properties', async () => {
      const mockResult = {
        mine_properties: [{ id: 'prop-1' }],
        other_properties: [{ id: 'prop-2' }]
      };
      req.body = { customer_id: 'cust-1', agent_id: 'agent-1' };
      MatchService.getMatchedResidentialProptiesRentList.mockResolvedValue(mockResult);

      await matchServiceController.getMatchedResidentialProptiesRentList(req, res, next);

      expect(MatchService.getMatchedResidentialProptiesRentList).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      MatchService.getMatchedResidentialProptiesRentList.mockRejectedValue(error);

      await matchServiceController.getMatchedResidentialProptiesRentList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('matchedResidentialProptiesBuyList', () => {
    it('should return matched residential buy properties', async () => {
      const mockResult = {
        mine_properties: [{ id: 'prop-1' }],
        other_properties: [{ id: 'prop-2' }]
      };
      req.body = { customer_id: 'cust-1', agent_id: 'agent-1' };
      MatchService.matchedResidentialProptiesBuyList.mockResolvedValue(mockResult);

      await matchServiceController.matchedResidentialProptiesBuyList(req, res, next);

      expect(MatchService.matchedResidentialProptiesBuyList).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      MatchService.matchedResidentialProptiesBuyList.mockRejectedValue(error);

      await matchServiceController.matchedResidentialProptiesBuyList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMatchedResidentialCustomerBuyList', () => {
    it('should return matched residential buy customers', async () => {
      const mockResult = {
        mine_customers: [{ id: 'cust-1' }],
        other_customers: [{ id: 'cust-2' }]
      };
      req.body = { property_id: 'prop-1', agent_id: 'agent-1' };
      MatchService.getMatchedResidentialCustomerBuyList.mockResolvedValue(mockResult);

      await matchServiceController.getMatchedResidentialCustomerBuyList(req, res, next);

      expect(MatchService.getMatchedResidentialCustomerBuyList).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      MatchService.getMatchedResidentialCustomerBuyList.mockRejectedValue(error);

      await matchServiceController.getMatchedResidentialCustomerBuyList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMatchedCommercialProptiesRentList', () => {
    it('should return matched commercial rent properties', async () => {
      const mockResult = {
        mine_properties: [{ id: 'prop-1' }],
        other_properties: [{ id: 'prop-2' }]
      };
      req.body = { customer_id: 'cust-1', agent_id: 'agent-1' };
      MatchService.getMatchedCommercialProptiesRentList.mockResolvedValue(mockResult);

      await matchServiceController.getMatchedCommercialProptiesRentList(req, res, next);

      expect(MatchService.getMatchedCommercialProptiesRentList).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      MatchService.getMatchedCommercialProptiesRentList.mockRejectedValue(error);

      await matchServiceController.getMatchedCommercialProptiesRentList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMatchedCommercialProptiesBuyList', () => {
    it('should return matched commercial buy properties', async () => {
      const mockResult = {
        mine_properties: [{ id: 'prop-1' }],
        other_properties: [{ id: 'prop-2' }]
      };
      req.body = { customer_id: 'cust-1', agent_id: 'agent-1' };
      MatchService.getMatchedCommercialProptiesBuyList.mockResolvedValue(mockResult);

      await matchServiceController.getMatchedCommercialProptiesBuyList(req, res, next);

      expect(MatchService.getMatchedCommercialProptiesBuyList).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      MatchService.getMatchedCommercialProptiesBuyList.mockRejectedValue(error);

      await matchServiceController.getMatchedCommercialProptiesBuyList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMatchedCommercialCustomerRentList', () => {
    it('should return matched commercial rent customers', async () => {
      const mockResult = {
        mine_customers: [{ id: 'cust-1' }],
        other_customers: [{ id: 'cust-2' }]
      };
      req.body = { property_id: 'prop-1', agent_id: 'agent-1' };
      MatchService.getMatchedCommercialCustomerRentList.mockResolvedValue(mockResult);

      await matchServiceController.getMatchedCommercialCustomerRentList(req, res, next);

      expect(MatchService.getMatchedCommercialCustomerRentList).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      MatchService.getMatchedCommercialCustomerRentList.mockRejectedValue(error);

      await matchServiceController.getMatchedCommercialCustomerRentList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMatchedCommercialCustomerSellList', () => {
    it('should return matched commercial sell customers', async () => {
      const mockResult = {
        mine_customers: [{ id: 'cust-1' }],
        other_customers: [{ id: 'cust-2' }]
      };
      req.body = { property_id: 'prop-1', agent_id: 'agent-1' };
      MatchService.getMatchedCommercialCustomerSellList.mockResolvedValue(mockResult);

      await matchServiceController.getMatchedCommercialCustomerSellList(req, res, next);

      expect(MatchService.getMatchedCommercialCustomerSellList).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      MatchService.getMatchedCommercialCustomerSellList.mockRejectedValue(error);

      await matchServiceController.getMatchedCommercialCustomerSellList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMatchedCommercialProptiesList', () => {
    it('should return all matched commercial properties', async () => {
      const mockResult = {
        mine_properties: [{ id: 'prop-1' }],
        other_properties: [{ id: 'prop-2' }]
      };
      req.body = { customer_id: 'cust-1', agent_id: 'agent-1' };
      MatchService.getMatchedCommercialProptiesList.mockResolvedValue(mockResult);

      await matchServiceController.getMatchedCommercialProptiesList(req, res, next);

      expect(MatchService.getMatchedCommercialProptiesList).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      MatchService.getMatchedCommercialProptiesList.mockRejectedValue(error);

      await matchServiceController.getMatchedCommercialProptiesList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
