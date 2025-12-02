const GlobalSearchService = require('../../services/global.search.service');
const globalSearchController = require('../../controllers/global.search.controller');

jest.mock('../../services/global.search.service');

describe('Global Search Controller', () => {
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

  describe('getGlobalSearchResult', () => {
    it('should return search results for residential property rent', async () => {
      const mockResults = {
        mine_properties: [{ id: 'prop-1' }],
        other_properties: [{ id: 'prop-2' }]
      };
      req.body = {
        looking_for: 'Property',
        type: 'Rent',
        property_type: 'Residential',
        req_user_id: 'agent-1'
      };
      GlobalSearchService.getGlobalSearchResult.mockResolvedValue(mockResults);

      await globalSearchController.getGlobalSearchResult(req, res, next);

      expect(GlobalSearchService.getGlobalSearchResult).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResults);
    });

    it('should return search results for commercial customer', async () => {
      const mockResults = {
        mine_customers: [{ id: 'cust-1' }],
        other_customers: [{ id: 'cust-2' }]
      };
      req.body = {
        looking_for: 'Customer',
        type: 'Buy',
        property_type: 'Commercial',
        req_user_id: 'agent-1'
      };
      GlobalSearchService.getGlobalSearchResult.mockResolvedValue(mockResults);

      await globalSearchController.getGlobalSearchResult(req, res, next);

      expect(GlobalSearchService.getGlobalSearchResult).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockResults);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      GlobalSearchService.getGlobalSearchResult.mockRejectedValue(error);

      await globalSearchController.getGlobalSearchResult(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllGlobalListingByLocations', () => {
    it('should return listings by locations', async () => {
      const mockListings = [
        { id: 'prop-1', location: 'Location 1' },
        { id: 'prop-2', location: 'Location 2' }
      ];
      req.body = {
        locations: ['Location 1', 'Location 2'],
        property_type: 'Residential'
      };
      GlobalSearchService.getAllGlobalListingByLocations.mockResolvedValue(mockListings);

      await globalSearchController.getAllGlobalListingByLocations(req, res, next);

      expect(GlobalSearchService.getAllGlobalListingByLocations).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockListings);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      GlobalSearchService.getAllGlobalListingByLocations.mockRejectedValue(error);

      await globalSearchController.getAllGlobalListingByLocations(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
