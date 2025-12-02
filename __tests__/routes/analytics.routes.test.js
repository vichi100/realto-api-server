const request = require('supertest');
const express = require('express');
const analyticsRoutes = require('../../routes/analytics.routes');
const analyticsController = require('../../controllers/analytics.controller');

jest.mock('../../controllers/analytics.controller');

const app = express();
app.use(express.json());
app.use('/api/analytics', analyticsRoutes);

describe('Analytics Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/analytics/getTotalListingSummary', () => {
    it('should call getTotalListingSummary controller', async () => {
      analyticsController.getTotalListingSummary.mockImplementation((req, res) => {
        res.status(201).json({
          residential_rent_properties: 10,
          residential_sell_properties: 5,
          commercial_rent_properties: 3,
          commercial_sell_properties: 2,
          residential_rent_customers: 8,
          residential_buy_customers: 4,
          commercial_rent_customers: 6,
          commercial_buy_customers: 3
        });
      });

      const response = await request(app)
        .post('/api/analytics/getTotalListingSummary')
        .send({ agent_id: 'agent-1', req_user_id: 'agent-1' })
        .expect(201);

      expect(analyticsController.getTotalListingSummary).toHaveBeenCalled();
      expect(response.body).toHaveProperty('residential_rent_properties');
      expect(response.body.residential_rent_properties).toBe(10);
    });

    it('should return summary for employee', async () => {
      analyticsController.getTotalListingSummary.mockImplementation((req, res) => {
        res.status(201).json({
          residential_rent_properties: 2,
          residential_sell_properties: 1,
          commercial_rent_properties: 0,
          commercial_sell_properties: 1,
          residential_rent_customers: 3,
          residential_buy_customers: 2,
          commercial_rent_customers: 1,
          commercial_buy_customers: 0
        });
      });

      const response = await request(app)
        .post('/api/analytics/getTotalListingSummary')
        .send({ agent_id: 'agent-1', req_user_id: 'employee-1' })
        .expect(201);

      expect(analyticsController.getTotalListingSummary).toHaveBeenCalled();
    });
  });
});
