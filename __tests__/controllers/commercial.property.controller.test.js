const PropertyService = require('../../services/property/commercial.property.service');
const commercialPropertyController = require('../../controllers/commercial.property.controller');

jest.mock('../../services/property/commercial.property.service');

describe('Commercial Property Controller', () => {
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

  describe('addNewCommercialProperty', () => {
    it('should add commercial property successfully', async () => {
      const mockProperty = { id: 'prop-1', type: 'Rent', property_type: 'Commercial' };
      req.body = { agent_id: 'agent-1', type: 'Rent', area: '1000 sqft' };
      PropertyService.addNewCommercialProperty.mockResolvedValue(mockProperty);

      await commercialPropertyController.addNewCommercialProperty(req, res, next);

      expect(PropertyService.addNewCommercialProperty).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockProperty);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      PropertyService.addNewCommercialProperty.mockRejectedValue(error);

      await commercialPropertyController.addNewCommercialProperty(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getCommercialPropertyListings', () => {
    it('should return commercial property listings', async () => {
      const mockProperties = [
        { id: 'prop-1', type: 'Rent' },
        { id: 'prop-2', type: 'Sell' }
      ];
      req.body = { agent_id: 'agent-1', req_user_id: 'agent-1' };
      PropertyService.getCommercialPropertyListings.mockResolvedValue(mockProperties);

      await commercialPropertyController.getCommercialPropertyListings(req, res, next);

      expect(PropertyService.getCommercialPropertyListings).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockProperties);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      PropertyService.getCommercialPropertyListings.mockRejectedValue(error);

      await commercialPropertyController.getCommercialPropertyListings(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteCommercialProperty', () => {
    it('should delete property successfully', async () => {
      req.body = { property_id: 'prop-1', req_user_id: 'agent-1' };
      PropertyService.deleteCommercialProperty.mockResolvedValue();

      await commercialPropertyController.deleteCommercialProperty(req, res, next);

      expect(PropertyService.deleteCommercialProperty).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith('Property deleted successfully.');
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Unauthorized');
      PropertyService.deleteCommercialProperty.mockRejectedValue(error);

      await commercialPropertyController.deleteCommercialProperty(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('closeCommercialProperty', () => {
    it('should close property successfully', async () => {
      const mockProperty = { id: 'prop-1', status: 1 };
      req.body = { property_id: 'prop-1', req_user_id: 'agent-1' };
      PropertyService.closeCommercialProperty.mockResolvedValue(mockProperty);

      await commercialPropertyController.closeCommercialProperty(req, res, next);

      expect(PropertyService.closeCommercialProperty).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockProperty);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      PropertyService.closeCommercialProperty.mockRejectedValue(error);

      await commercialPropertyController.closeCommercialProperty(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
