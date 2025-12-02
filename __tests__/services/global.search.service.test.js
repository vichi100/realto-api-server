// Mock all dependencies before requiring the service
jest.mock('../../models/commercialPropertyRent');
jest.mock('../../models/commercialPropertySell');
jest.mock('../../models/commercialCustomerBuyLocation');
jest.mock('../../models/commercialCustomerRentLocation');
jest.mock('../../models/match/commercialBuyPropertyMatch');
jest.mock('../../models/match/commercialBuyCustomerMatch');
jest.mock('../../models/match/commercialRentPropertyMatch');
jest.mock('../../models/match/commercialRentCustomerMatch');
jest.mock('../../models/residentialPropertyRent');
jest.mock('../../models/residentialPropertySell');
jest.mock('../../models/residentialCustomerBuyLocation');
jest.mock('../../models/residentialCustomerRentLocation');
jest.mock('../../models/match/residentialRentPropertyMatch');
jest.mock('../../models/match/residentialBuyPropertyMatch');
jest.mock('../../models/match/residentialRentCustomerMatch');
jest.mock('../../models/match/residentialBuyCustomerMatch');
jest.mock('../../models/residentialPropertyCustomerRent');
jest.mock('../../models/residentialPropertyCustomerBuy');
jest.mock('../../models/commercialPropertyCustomerRent');
jest.mock('../../models/commercialPropertyCustomerBuy');
jest.mock('../../utils/logger');
jest.mock('../../services/utility.service');

const CommercialPropertyRent = require('../../models/commercialPropertyRent');
const CommercialPropertySell = require('../../models/commercialPropertySell');
const ResidentialPropertyRent = require('../../models/residentialPropertyRent');
const ResidentialPropertySell = require('../../models/residentialPropertySell');
const ResidentialCustomerRentLocation = require('../../models/residentialCustomerRentLocation');
const ResidentialCustomerBuyLocation = require('../../models/residentialCustomerBuyLocation');
const CommercialCustomerRentLocation = require('../../models/commercialCustomerRentLocation');
const CommercialCustomerBuyLocation = require('../../models/commercialCustomerBuyLocation');
const ResidentialPropertyCustomerRent = require('../../models/residentialPropertyCustomerRent');
const ResidentialPropertyCustomerBuy = require('../../models/residentialPropertyCustomerBuy');
const CommercialPropertyCustomerRent = require('../../models/commercialPropertyCustomerRent');
const CommercialPropertyCustomerBuy = require('../../models/commercialPropertyCustomerBuy');
const ResidentialRentPropertyMatch = require('../../models/match/residentialRentPropertyMatch');
const ResidentialBuyPropertyMatch = require('../../models/match/residentialBuyPropertyMatch');
const CommercialRentPropertyMatch = require('../../models/match/commercialRentPropertyMatch');
const CommercialBuyPropertyMatch = require('../../models/match/commercialBuyPropertyMatch');
const ResidentialRentCustomerMatch = require('../../models/match/residentialRentCustomerMatch');
const ResidentialBuyCustomerMatch = require('../../models/match/residentialBuyCustomerMatch');
const CommercialRentCustomerMatch = require('../../models/match/commercialRentCustomerMatch');
const CommercialBuyCustomerMatch = require('../../models/match/commercialBuyCustomerMatch');
const logger = require('../../utils/logger');
const utilityService = require('../../services/utility.service');

const { getGlobalSearchResult } = require('../../services/global.search.service');

describe('Global Search Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGlobalSearchResult - Residential Property Rent', () => {
    
    it('should return residential rent properties with mine and other properties separated', async () => {
      const searchObj = {
        req_user_id: 'agent-123',
        lookingFor: 'property',
        whatType: 'residential',
        purpose: 'Rent',
        city: 'Mumbai',
        selectedLocationArray: [
          { location: { coordinates: [72.8777, 19.0760] } }
        ],
        selectedBHK: ['2BHK', '3BHK'],
        priceRange: [10000, 50000],
        reqWithin: '2025-06-01',
        tenant: 'Family'
      };

      const mockMineProperty = {
        property_id: 'prop-mine-1',
        agent_id: 'agent-123',
        property_address: { city: 'Mumbai' }
      };

      const mockOtherProperty = {
        property_id: 'prop-other-1',
        agent_id: 'agent-456',
        property_address: { city: 'Mumbai' }
      };

      ResidentialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockMineProperty, mockOtherProperty])
        })
      });

      ResidentialRentPropertyMatch.aggregate.mockResolvedValue([{ count: 5 }]);

      utilityService.replaceOwnerDetailsWithAgentDetails.mockResolvedValue([
        { ...mockOtherProperty, match_count: 5, owner_details: { name: 'Agent Name' } }
      ]);

      const result = await getGlobalSearchResult(searchObj);

      expect(result).toHaveLength(2);
      expect(result[0].property_id).toBe('prop-mine-1');
      expect(ResidentialPropertyRent.find).toHaveBeenCalled();
      expect(utilityService.replaceOwnerDetailsWithAgentDetails).toHaveBeenCalled();
    });

    it('should fallback to relaxed query if no properties found initially', async () => {
      const searchObj = {
        req_user_id: 'agent-789',
        lookingFor: 'property',
        whatType: 'residential',
        purpose: 'Rent',
        city: 'Delhi',
        selectedLocationArray: [
          { location: { coordinates: [77.2090, 28.6139] } }
        ],
        selectedBHK: ['1BHK'],
        priceRange: [15000, 25000],
        reqWithin: '2025-07-01',
        tenant: 'Bachelor'
      };

      const mockProperty = {
        property_id: 'prop-1',
        agent_id: 'agent-789',
        property_address: { city: 'Delhi' }
      };

      let callCount = 0;
      ResidentialPropertyRent.find.mockImplementation(() => ({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(callCount++ === 0 ? [] : [mockProperty])
        })
      }));

      utilityService.replaceOwnerDetailsWithAgentDetails.mockResolvedValue([]);

      const result = await getGlobalSearchResult(searchObj);

      expect(ResidentialPropertyRent.find).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1);
    });
  });

  describe('getGlobalSearchResult - Residential Property Buy', () => {
    
    it('should return residential sell properties for buy search', async () => {
      const searchObj = {
        req_user_id: 'agent-111',
        lookingFor: 'property',
        whatType: 'residential',
        purpose: 'Buy',
        city: 'Bangalore',
        selectedLocationArray: [
          { location: { coordinates: [77.5946, 12.9716] } }
        ],
        selectedBHK: ['3BHK', '4BHK'],
        priceRangeCr: [5000000, 10000000]
      };

      const mockProperty = {
        property_id: 'prop-sell-1',
        agent_id: 'agent-111',
        property_address: { city: 'Bangalore' }
      };

      ResidentialPropertySell.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockProperty])
        })
      });

      ResidentialBuyPropertyMatch.aggregate.mockResolvedValue([{ count: 3 }]);

      utilityService.replaceOwnerDetailsWithAgentDetails.mockResolvedValue([]);

      const result = await getGlobalSearchResult(searchObj);

      expect(result).toHaveLength(1);
      expect(result[0].property_id).toBe('prop-sell-1');
      expect(ResidentialPropertySell.find).toHaveBeenCalled();
    });
  });

  describe('getGlobalSearchResult - Commercial Property Rent', () => {
    
    it('should return commercial rent properties', async () => {
      const searchObj = {
        req_user_id: 'agent-222',
        lookingFor: 'property',
        whatType: 'commercial',
        purpose: 'Rent',
        city: 'Chennai',
        selectedLocationArray: [
          { location: { coordinates: [80.2707, 13.0827] } }
        ],
        selectedRequiredFor: ['Office', 'Shop'],
        selectedBuildingType: ['Commercial'],
        priceRange: [50000, 100000],
        reqWithin: '2025-08-01'
      };

      const mockMineProperty = {
        property_id: 'comm-prop-1',
        agent_id: 'agent-222',
        property_address: { city: 'Chennai' }
      };

      const mockOtherProperty = {
        property_id: 'comm-prop-2',
        agent_id: 'agent-999',
        property_address: { city: 'Chennai' }
      };

      CommercialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockMineProperty, mockOtherProperty])
        })
      });

      CommercialRentPropertyMatch.aggregate.mockResolvedValue([{ count: 7 }]);

      utilityService.replaceOwnerDetailsWithAgentDetails.mockResolvedValue([
        { ...mockOtherProperty, match_count: 7 }
      ]);

      const result = await getGlobalSearchResult(searchObj);

      expect(result).toHaveLength(2);
      expect(CommercialPropertyRent.find).toHaveBeenCalled();
    });

    it('should fallback to relaxed query for commercial rent if no results', async () => {
      const searchObj = {
        req_user_id: 'agent-333',
        lookingFor: 'property',
        whatType: 'commercial',
        purpose: 'Rent',
        city: 'Hyderabad',
        selectedLocationArray: [
          { location: { coordinates: [78.4867, 17.3850] } }
        ],
        selectedRequiredFor: ['Warehouse'],
        selectedBuildingType: ['Industrial'],
        priceRange: [100000, 200000],
        reqWithin: '2025-09-01'
      };

      let callCount = 0;
      CommercialPropertyRent.find.mockImplementation(() => ({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(callCount++ === 0 ? [] : [
            { property_id: 'prop-1', agent_id: 'agent-333' }
          ])
        })
      }));

      utilityService.replaceOwnerDetailsWithAgentDetails.mockResolvedValue([]);

      const result = await getGlobalSearchResult(searchObj);

      expect(CommercialPropertyRent.find).toHaveBeenCalledTimes(2);
    });
  });

  describe('getGlobalSearchResult - Commercial Property Buy', () => {
    
    it('should return commercial sell properties for buy search', async () => {
      const searchObj = {
        req_user_id: 'agent-444',
        lookingFor: 'property',
        whatType: 'commercial',
        purpose: 'Buy',
        city: 'Pune',
        selectedLocationArray: [
          { location: { coordinates: [73.8567, 18.5204] } }
        ],
        selectedRequiredFor: ['Office'],
        selectedBuildingType: ['IT Park'],
        priceRangeCr: [10000000, 50000000]
      };

      const mockProperty = {
        property_id: 'comm-sell-1',
        agent_id: 'agent-444',
        property_address: { city: 'Pune' }
      };

      CommercialPropertySell.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockProperty])
        })
      });

      CommercialBuyPropertyMatch.aggregate.mockResolvedValue([{ count: 2 }]);

      utilityService.replaceOwnerDetailsWithAgentDetails.mockResolvedValue([]);

      const result = await getGlobalSearchResult(searchObj);

      expect(result).toHaveLength(1);
      expect(CommercialPropertySell.find).toHaveBeenCalled();
    });
  });

  describe('getGlobalSearchResult - Residential Customer Rent', () => {
    
    it('should return residential rent customers', async () => {
      const searchObj = {
        req_user_id: 'agent-555',
        lookingFor: 'customer',
        whatType: 'residential',
        purpose: 'Rent',
        city: 'Mumbai',
        selectedLocationArray: [
          { location: { coordinates: [72.8777, 19.0760] } }
        ],
        priceRange: [20000, 40000],
        reqWithin: '2025-10-01'
      };

      const mockLocations = [
        { customer_id: 'cust-1' },
        { customer_id: 'cust-2' }
      ];

      const mockMineCustomer = {
        customer_id: 'cust-1',
        agent_id: 'agent-555'
      };

      const mockOtherCustomer = {
        customer_id: 'cust-2',
        agent_id: 'agent-666'
      };

      ResidentialCustomerRentLocation.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLocations)
        })
      });

      ResidentialPropertyCustomerRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockMineCustomer, mockOtherCustomer])
        })
      });

      ResidentialRentCustomerMatch.aggregate.mockResolvedValue([{ count: 4 }]);

      utilityService.replaceCustomerDetailsWithAgentDetails.mockResolvedValue([
        { ...mockOtherCustomer, match_count: 4 }
      ]);

      const result = await getGlobalSearchResult(searchObj);

      expect(result).toHaveLength(2);
      expect(ResidentialCustomerRentLocation.find).toHaveBeenCalled();
      expect(ResidentialPropertyCustomerRent.find).toHaveBeenCalled();
    });

    it('should fallback to relaxed query for residential rent customers', async () => {
      const searchObj = {
        req_user_id: 'agent-777',
        lookingFor: 'customer',
        whatType: 'residential',
        purpose: 'Rent',
        city: 'Delhi',
        selectedLocationArray: [
          { location: { coordinates: [77.2090, 28.6139] } }
        ],
        priceRange: [15000, 30000],
        reqWithin: '2025-11-01'
      };

      ResidentialCustomerRentLocation.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([{ customer_id: 'cust-1' }])
        })
      });

      let callCount = 0;
      ResidentialPropertyCustomerRent.find.mockImplementation(() => ({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(callCount++ === 0 ? [] : [
            { customer_id: 'cust-1', agent_id: 'agent-777' }
          ])
        })
      }));

      utilityService.replaceCustomerDetailsWithAgentDetails.mockResolvedValue([]);

      const result = await getGlobalSearchResult(searchObj);

      expect(ResidentialPropertyCustomerRent.find).toHaveBeenCalledTimes(2);
    });
  });

  describe('getGlobalSearchResult - Residential Customer Buy', () => {
    
    it('should return residential buy customers', async () => {
      const searchObj = {
        req_user_id: 'agent-888',
        lookingFor: 'customer',
        whatType: 'residential',
        purpose: 'Buy',
        city: 'Bangalore',
        selectedLocationArray: [
          { location: { coordinates: [77.5946, 12.9716] } }
        ],
        priceRange: [5000000, 15000000]
      };

      const mockLocations = [{ customer_id: 'buy-cust-1' }];

      const mockCustomer = {
        customer_id: 'buy-cust-1',
        agent_id: 'agent-888'
      };

      ResidentialCustomerBuyLocation.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLocations)
        })
      });

      ResidentialPropertyCustomerBuy.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockCustomer])
        })
      });

      ResidentialBuyCustomerMatch.aggregate.mockResolvedValue([{ count: 6 }]);

      utilityService.replaceCustomerDetailsWithAgentDetails.mockResolvedValue([]);

      const result = await getGlobalSearchResult(searchObj);

      expect(result).toHaveLength(1);
      expect(ResidentialCustomerBuyLocation.find).toHaveBeenCalled();
      expect(ResidentialPropertyCustomerBuy.find).toHaveBeenCalled();
    });
  });

  describe('getGlobalSearchResult - Commercial Customer Rent', () => {
    
    it('should return commercial rent customers', async () => {
      const searchObj = {
        req_user_id: 'agent-999',
        lookingFor: 'customer',
        whatType: 'commercial',
        purpose: 'Rent',
        city: 'Chennai',
        selectedLocationArray: [
          { location: { coordinates: [80.2707, 13.0827] } }
        ],
        priceRange: [50000, 150000],
        reqWithin: '2025-12-01'
      };

      const mockLocations = [{ customer_id: 'comm-cust-1' }];

      const mockCustomer = {
        customer_id: 'comm-cust-1',
        agent_id: 'agent-999'
      };

      CommercialCustomerRentLocation.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLocations)
        })
      });

      CommercialPropertyCustomerRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockCustomer])
        })
      });

      CommercialRentCustomerMatch.aggregate.mockResolvedValue([{ count: 8 }]);

      utilityService.replaceCustomerDetailsWithAgentDetails.mockResolvedValue([]);

      const result = await getGlobalSearchResult(searchObj);

      expect(result).toHaveLength(1);
      expect(CommercialCustomerRentLocation.find).toHaveBeenCalled();
      expect(CommercialPropertyCustomerRent.find).toHaveBeenCalled();
    });
  });

  describe('getGlobalSearchResult - Commercial Customer Buy', () => {
    
    it('should return commercial buy customers', async () => {
      const searchObj = {
        req_user_id: 'agent-1000',
        lookingFor: 'customer',
        whatType: 'commercial',
        purpose: 'Buy',
        city: 'Hyderabad',
        selectedLocationArray: [
          { location: { coordinates: [78.4867, 17.3850] } }
        ],
        priceRange: [20000000, 100000000]
      };

      const mockLocations = [{ customer_id: 'comm-buy-cust-1' }];

      const mockCustomer = {
        customer_id: 'comm-buy-cust-1',
        agent_id: 'agent-1000'
      };

      CommercialCustomerBuyLocation.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLocations)
        })
      });

      CommercialPropertyCustomerBuy.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockCustomer])
        })
      });

      CommercialBuyCustomerMatch.aggregate.mockResolvedValue([{ count: 10 }]);

      utilityService.replaceCustomerDetailsWithAgentDetails.mockResolvedValue([]);

      const result = await getGlobalSearchResult(searchObj);

      expect(result).toHaveLength(1);
      expect(CommercialCustomerBuyLocation.find).toHaveBeenCalled();
      expect(CommercialPropertyCustomerBuy.find).toHaveBeenCalled();
    });
  });

  describe('getGlobalSearchResult - Error Handling', () => {
    
    it('should handle database errors gracefully', async () => {
      const searchObj = {
        req_user_id: 'agent-error',
        lookingFor: 'property',
        whatType: 'residential',
        purpose: 'Rent',
        city: 'Mumbai',
        selectedLocationArray: [
          { location: { coordinates: [72.8777, 19.0760] } }
        ],
        selectedBHK: ['2BHK'],
        priceRange: [10000, 50000],
        reqWithin: '2025-06-01',
        tenant: 'Family'
      };

      ResidentialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const result = await getGlobalSearchResult(searchObj);

      expect(result).toHaveProperty('error');
      expect(result.error).toBe('Internal Server Error');
    });
  });

  describe('getGlobalSearchResult - Case Insensitivity', () => {
    
    it('should handle case-insensitive lookingFor parameter', async () => {
      const searchObj = {
        req_user_id: 'agent-123',
        lookingFor: 'PROPERTY',
        whatType: 'RESIDENTIAL',
        purpose: 'RENT',
        city: 'Mumbai',
        selectedLocationArray: [
          { location: { coordinates: [72.8777, 19.0760] } }
        ],
        selectedBHK: ['2BHK'],
        priceRange: [10000, 50000],
        reqWithin: '2025-06-01',
        tenant: 'Family'
      };

      ResidentialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            { property_id: 'prop-1', agent_id: 'agent-123' }
          ])
        })
      });

      utilityService.replaceOwnerDetailsWithAgentDetails.mockResolvedValue([]);

      const result = await getGlobalSearchResult(searchObj);

      expect(result).toHaveLength(1);
      expect(ResidentialPropertyRent.find).toHaveBeenCalled();
    });

    it('should handle case-insensitive customer search', async () => {
      const searchObj = {
        req_user_id: 'agent-456',
        lookingFor: 'CUSTOMER',
        whatType: 'COMMERCIAL',
        purpose: 'BUY',
        city: 'Delhi',
        selectedLocationArray: [
          { location: { coordinates: [77.2090, 28.6139] } }
        ],
        priceRange: [10000000, 50000000]
      };

      CommercialCustomerBuyLocation.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([{ customer_id: 'cust-1' }])
        })
      });

      CommercialPropertyCustomerBuy.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            { customer_id: 'cust-1', agent_id: 'agent-456' }
          ])
        })
      });

      utilityService.replaceCustomerDetailsWithAgentDetails.mockResolvedValue([]);

      const result = await getGlobalSearchResult(searchObj);

      expect(result).toHaveLength(1);
      expect(CommercialCustomerBuyLocation.find).toHaveBeenCalled();
    });
  });

  describe('getGlobalSearchResult - Match Count', () => {
    
    it('should add match_count to other properties', async () => {
      const searchObj = {
        req_user_id: 'agent-123',
        lookingFor: 'property',
        whatType: 'residential',
        purpose: 'Rent',
        city: 'Mumbai',
        selectedLocationArray: [
          { location: { coordinates: [72.8777, 19.0760] } }
        ],
        selectedBHK: ['2BHK'],
        priceRange: [10000, 50000],
        reqWithin: '2025-06-01',
        tenant: 'Family'
      };

      const mockOtherProperty = {
        property_id: 'prop-other',
        agent_id: 'agent-999',
        property_address: { city: 'Mumbai' }
      };

      ResidentialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockOtherProperty])
        })
      });

      ResidentialRentPropertyMatch.aggregate.mockResolvedValue([{ count: 15 }]);

      utilityService.replaceOwnerDetailsWithAgentDetails.mockImplementation(async (props) => {
        return props.map(p => ({ ...p, masked: true }));
      });

      await getGlobalSearchResult(searchObj);

      expect(ResidentialRentPropertyMatch.aggregate).toHaveBeenCalledWith([
        { $match: { property_id: 'prop-other' } },
        { $unwind: "$matched_customer_id_other" },
        { $match: { "matched_customer_id_other.agent_id": 'agent-123' } },
        { $count: "count" }
      ]);
    });

    it('should add match_count to other customers', async () => {
      const searchObj = {
        req_user_id: 'agent-789',
        lookingFor: 'customer',
        whatType: 'residential',
        purpose: 'Rent',
        city: 'Delhi',
        selectedLocationArray: [
          { location: { coordinates: [77.2090, 28.6139] } }
        ],
        priceRange: [15000, 30000],
        reqWithin: '2025-07-01'
      };

      const mockOtherCustomer = {
        customer_id: 'cust-other',
        agent_id: 'agent-888'
      };

      ResidentialCustomerRentLocation.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([{ customer_id: 'cust-other' }])
        })
      });

      ResidentialPropertyCustomerRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockOtherCustomer])
        })
      });

      ResidentialRentCustomerMatch.aggregate.mockResolvedValue([{ count: 12 }]);

      utilityService.replaceCustomerDetailsWithAgentDetails.mockImplementation(async (custs) => {
        return custs.map(c => ({ ...c, masked: true }));
      });

      await getGlobalSearchResult(searchObj);

      expect(ResidentialRentCustomerMatch.aggregate).toHaveBeenCalledWith([
        { $match: { customer_id: 'cust-other' } },
        { $unwind: "$matched_property_id_other" },
        { $match: { "matched_property_id_other.agent_id": 'agent-789' } },
        { $count: "count" }
      ]);
    });
  });
});
