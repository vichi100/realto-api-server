const PropertyService = require('../../services/property/property.service');
const propertyController = require('../../controllers/property.controller');

jest.mock('../../services/property/property.service');

describe('Property Controller', () => {
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

  describe('getPropertyDetailsByIdToShare', () => {
    it('should get property details successfully', async () => {
      const mockProperty = {
        id: 'prop-1',
        address: 'Test Address',
        agent: { name: 'Agent Name' }
      };
      req.body = { property_id: 'prop-1', type: 'Rent', property_type: 'Residential' };
      PropertyService.getPropertyDetailsByIdToShare.mockResolvedValue(mockProperty);

      await propertyController.getPropertyDetailsByIdToShare(req, res, next);

      expect(PropertyService.getPropertyDetailsByIdToShare).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockProperty);
    });

    it('should handle errors', async () => {
      const error = new Error('Property not found');
      PropertyService.getPropertyDetailsByIdToShare.mockRejectedValue(error);

      await propertyController.getPropertyDetailsByIdToShare(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPropertyListingForMeeting', () => {
    it('should get property list for meeting', async () => {
      const mockProperties = [
        { id: 'prop-1', address: 'Property 1' },
        { id: 'prop-2', address: 'Property 2' }
      ];
      req.body = { customer_id: 'cust-1', type: 'Rent', property_type: 'Residential' };
      PropertyService.getPropertyListingForMeeting.mockResolvedValue(mockProperties);

      await propertyController.getPropertyListingForMeeting(req, res, next);

      expect(PropertyService.getPropertyListingForMeeting).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockProperties);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      PropertyService.getPropertyListingForMeeting.mockRejectedValue(error);

      await propertyController.getPropertyListingForMeeting(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
