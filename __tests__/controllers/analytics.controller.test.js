const AnalyticsService = require('../../services/analytics.service');
const analyticsController = require('../../controllers/analytics.controller');

jest.mock('../../services/analytics.service');

describe('Analytics Controller', () => {
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

  describe('getTotalListingSummary', () => {
    it('should return listing summary for agent', async () => {
      const mockSummary = {
        residential_rent_properties: 10,
        residential_sell_properties: 5,
        commercial_rent_properties: 3,
        commercial_sell_properties: 2,
        residential_rent_customers: 8,
        residential_buy_customers: 4,
        commercial_rent_customers: 6,
        commercial_buy_customers: 3
      };
      req.body = { agent_id: 'agent-1', req_user_id: 'agent-1' };
      AnalyticsService.getTotalListingSummary.mockResolvedValue(mockSummary);

      await analyticsController.getTotalListingSummary(req, res, next);

      expect(AnalyticsService.getTotalListingSummary).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSummary);
    });

    it('should return listing summary for employee', async () => {
      const mockSummary = {
        residential_rent_properties: 2,
        residential_sell_properties: 1,
        commercial_rent_properties: 0,
        commercial_sell_properties: 1,
        residential_rent_customers: 3,
        residential_buy_customers: 2,
        commercial_rent_customers: 1,
        commercial_buy_customers: 0
      };
      req.body = { agent_id: 'agent-1', req_user_id: 'employee-1' };
      AnalyticsService.getTotalListingSummary.mockResolvedValue(mockSummary);

      await analyticsController.getTotalListingSummary(req, res, next);

      expect(AnalyticsService.getTotalListingSummary).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockSummary);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      req.body = { agent_id: 'agent-1' };
      AnalyticsService.getTotalListingSummary.mockRejectedValue(error);

      await analyticsController.getTotalListingSummary(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should return zero counts when no data exists', async () => {
      const mockSummary = {
        residential_rent_properties: 0,
        residential_sell_properties: 0,
        commercial_rent_properties: 0,
        commercial_sell_properties: 0,
        residential_rent_customers: 0,
        residential_buy_customers: 0,
        commercial_rent_customers: 0,
        commercial_buy_customers: 0
      };
      req.body = { agent_id: 'new-agent' };
      AnalyticsService.getTotalListingSummary.mockResolvedValue(mockSummary);

      await analyticsController.getTotalListingSummary(req, res, next);

      expect(res.json).toHaveBeenCalledWith(mockSummary);
    });
  });
});
