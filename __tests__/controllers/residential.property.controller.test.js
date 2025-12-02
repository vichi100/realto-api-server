const PropertyService = require('../../services/property/residential.property.service');
const residentialPropertyController = require('../../controllers/residential.property.controller');

jest.mock('../../services/property/residential.property.service');

describe('Residential Property Controller', () => {
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

  describe('addNewResidentialRentProperty', () => {
    it('should add residential rent property successfully', async () => {
      const mockProperty = { id: 'prop-1', type: 'Rent', property_type: 'Residential' };
      req.body = { agent_id: 'agent-1', type: 'Rent', bhk: '2' };
      PropertyService.addNewResidentialRentProperty.mockResolvedValue(mockProperty);

      await residentialPropertyController.addNewResidentialRentProperty(req, res, next);

      expect(PropertyService.addNewResidentialRentProperty).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockProperty);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      PropertyService.addNewResidentialRentProperty.mockRejectedValue(error);

      await residentialPropertyController.addNewResidentialRentProperty(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getResidentialPropertyListings', () => {
    it('should return residential property listings', async () => {
      const mockProperties = [
        { id: 'prop-1', type: 'Rent' },
        { id: 'prop-2', type: 'Sell' }
      ];
      req.body = { agent_id: 'agent-1', req_user_id: 'agent-1' };
      PropertyService.getResidentialPropertyListings.mockResolvedValue(mockProperties);

      await residentialPropertyController.getResidentialPropertyListings(req, res, next);

      expect(PropertyService.getResidentialPropertyListings).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockProperties);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      PropertyService.getResidentialPropertyListings.mockRejectedValue(error);

      await residentialPropertyController.getResidentialPropertyListings(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteResidentialProperty', () => {
    it('should delete property successfully', async () => {
      req.body = { property_id: 'prop-1', req_user_id: 'agent-1' };
      PropertyService.deleteResidentialProperty.mockResolvedValue();

      await residentialPropertyController.deleteResidentialProperty(req, res, next);

      expect(PropertyService.deleteResidentialProperty).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith('Property deleted successfully.');
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Unauthorized');
      PropertyService.deleteResidentialProperty.mockRejectedValue(error);

      await residentialPropertyController.deleteResidentialProperty(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('closeResidentialProperty', () => {
    it('should close property successfully', async () => {
      const mockProperty = { id: 'prop-1', status: 1 };
      req.body = { property_id: 'prop-1', req_user_id: 'agent-1' };
      PropertyService.closeResidentialProperty.mockResolvedValue(mockProperty);

      await residentialPropertyController.closeResidentialProperty(req, res, next);

      expect(PropertyService.closeResidentialProperty).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockProperty);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      PropertyService.closeResidentialProperty.mockRejectedValue(error);

      await residentialPropertyController.closeResidentialProperty(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
