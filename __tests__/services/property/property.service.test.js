// Mock all dependencies before requiring the service
jest.mock('../../../models/commercialPropertyRent');
jest.mock('../../../models/commercialPropertySell');
jest.mock('../../../models/match/commercialBuyCustomerMatch');
jest.mock('../../../models/match/commercialRentCustomerMatch');
jest.mock('../../../models/residentialPropertyRent');
jest.mock('../../../models/residentialPropertySell');
jest.mock('../../../models/match/residentialRentCustomerMatch');
jest.mock('../../../models/match/residentialBuyCustomerMatch');
jest.mock('../../../models/user');
jest.mock('../../../utils/logger');

const CommercialPropertyRent = require('../../../models/commercialPropertyRent');
const CommercialPropertySell = require('../../../models/commercialPropertySell');
const CommercialBuyCustomerMatch = require('../../../models/match/commercialBuyCustomerMatch');
const CommercialRentCustomerMatch = require('../../../models/match/commercialRentCustomerMatch');
const ResidentialPropertyRent = require('../../../models/residentialPropertyRent');
const ResidentialPropertySell = require('../../../models/residentialPropertySell');
const ResidentialRentCustomerMatch = require('../../../models/match/residentialRentCustomerMatch');
const ResidentialBuyCustomerMatch = require('../../../models/match/residentialBuyCustomerMatch');
const User = require('../../../models/user');
const logger = require('../../../utils/logger');

const {
  getPropertyDetailsByIdToShare,
  getPropertyListingForMeeting
} = require('../../../services/property/property.service');

describe('Property Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPropertyDetailsByIdToShare', () => {
    
    it('should get residential rent property details with agent info', async () => {
      const queryObj = {
        property_id: 'prop-123',
        agent_id: 'agent-456',
        property_type: 'Residential',
        property_for: 'Rent'
      };

      const mockProperty = {
        property_id: 'prop-123',
        agent_id: 'agent-456',
        owner_details: {
          name: 'Original Owner',
          mobile1: '1234567890'
        }
      };

      const mockAgent = {
        id: 'agent-456',
        name: 'Agent Smith',
        mobile: '9876543210',
        address: '123 Agent St'
      };

      ResidentialPropertyRent.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProperty)
        })
      });

      User.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAgent)
      });

      const result = await getPropertyDetailsByIdToShare(queryObj);

      expect(result.property_id).toBe('prop-123');
      expect(result.owner_details.name).toBe('Agent Smith');
      expect(result.owner_details.mobile1).toBe('9876543210');
      expect(result.owner_details.address).toBe('123 Agent St');
      expect(ResidentialPropertyRent.findOne).toHaveBeenCalledWith({ property_id: 'prop-123' });
      expect(User.findOne).toHaveBeenCalledWith({ id: 'agent-456' });
    });

    it('should get residential sell property details', async () => {
      const queryObj = {
        property_id: 'prop-789',
        agent_id: 'agent-111',
        property_type: 'residential',
        property_for: 'sell'
      };

      const mockProperty = {
        property_id: 'prop-789',
        agent_id: 'agent-111'
      };

      const mockAgent = {
        id: 'agent-111',
        name: 'Agent John',
        mobile: '5555555555',
        address: '456 Broker Ave'
      };

      ResidentialPropertySell.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProperty)
        })
      });

      User.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAgent)
      });

      const result = await getPropertyDetailsByIdToShare(queryObj);

      expect(result.owner_details.name).toBe('Agent John');
      expect(ResidentialPropertySell.findOne).toHaveBeenCalled();
    });
  });

  describe('getPropertyListingForMeeting', () => {
    
    it('should get residential rent properties when reqUserId equals customerAgentId', async () => {
      const queryObj = {
        agent_id: 'agent-123',
        agent_id_of_client: 'agent-123',
        req_user_id: 'agent-123',
        property_type: 'Residential',
        property_for: 'Rent',
        customer_id: 'customer-1'
      };

      const mockMatchData = {
        customer_id: 'customer-1',
        matched_property_id_mine: [
          { property_id: 'prop-1', matched_percentage: 90 },
          { property_id: 'prop-2', matched_percentage: 85 }
        ],
        matched_property_id_other: [
          { property_id: 'prop-other-1', matched_percentage: 80 }
        ]
      };

      const mockMyProperties = [
        { property_id: 'prop-1', agent_id: 'agent-123' },
        { property_id: 'prop-2', agent_id: 'agent-123' }
      ];

      const mockOtherProperties = [
        {
          property_id: 'prop-other-1',
          agent_id: 'agent-999',
          property_address: {
            city: 'Mumbai',
            main_text: 'Andheri',
            formatted_address: 'Andheri, Mumbai',
            flat_number: 'A-101',
            building_name: 'Tower',
            landmark_or_street: 'Main Rd'
          }
        }
      ];

      const mockOtherAgent = {
        id: 'agent-999',
        name: 'Other Agent',
        mobile: '1111111111'
      };

      ResidentialRentCustomerMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMatchData)
        })
      });

      let findCallCount = 0;
      ResidentialPropertyRent.find.mockImplementation(() => ({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(findCallCount++ === 0 ? mockMyProperties : mockOtherProperties)
        })
      }));

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOtherAgent)
        })
      });

      const result = await getPropertyListingForMeeting(queryObj);

      expect(result.length).toBe(3);
      expect(result[0].matched_percentage).toBe('90');
      expect(result[1].matched_percentage).toBe('85');
      expect(result[2].matched_percentage).toBe('80');
      expect(result[2].owner_details.name).toBe('Other Agent');
      expect(result[2].property_address.flat_number).toBe('');
      expect(result[2].property_address.building_name).toBe('');
    });

    it('should normalize "Buy" to "Sell" for residential', async () => {
      const queryObj = {
        agent_id: 'agent-456',
        agent_id_of_client: 'agent-456',
        req_user_id: 'agent-456',
        property_type: 'Residential',
        property_for: 'Buy',
        customer_id: 'customer-2'
      };

      ResidentialBuyCustomerMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await getPropertyListingForMeeting(queryObj);

      expect(ResidentialBuyCustomerMatch.findOne).toHaveBeenCalledWith({ customer_id: 'customer-2' });
      expect(result).toEqual([]);
    });

    it('should get commercial rent properties', async () => {
      const queryObj = {
        agent_id: 'agent-789',
        agent_id_of_client: 'agent-789',
        req_user_id: 'agent-789',
        property_type: 'Commercial',
        property_for: 'Rent',
        customer_id: 'customer-com-1'
      };

      const mockMatchData = {
        customer_id: 'customer-com-1',
        matched_property_id_mine: [
          { property_id: 'com-prop-1', matched_percentage: 95 }
        ],
        matched_property_id_other: []
      };

      const mockProperties = [
        {
          property_id: 'com-prop-1',
          agent_id: 'agent-789',
          property_address: {
            city: 'Bangalore',
            main_text: 'MG Road',
            formatted_address: 'MG Road, Bangalore',
            landmark_or_street: 'Metro'
          }
        }
      ];

      CommercialRentCustomerMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMatchData)
        })
      });

      let findCallCount = 0;
      CommercialPropertyRent.find.mockReset();
      CommercialPropertyRent.find.mockImplementation(() => {
        findCallCount++;
        if (findCallCount === 1) {
          // First call for mine properties
          return {
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockProperties)
            })
          };
        } else {
          // Second call for other properties (should be empty because matched_property_id_other is empty)
          return {
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([])
            })
          };
        }
      });

      const result = await getPropertyListingForMeeting(queryObj);

      expect(result.length).toBe(1);
      expect(result[0].matched_percentage).toBe('95');
    });

    it('should get commercial sell properties (normalized from Buy)', async () => {
      const queryObj = {
        agent_id: 'agent-999',
        agent_id_of_client: 'agent-999',
        req_user_id: 'agent-999',
        property_type: 'Commercial',
        property_for: 'Buy',
        customer_id: 'customer-com-2'
      };

      CommercialBuyCustomerMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await getPropertyListingForMeeting(queryObj);

      expect(CommercialBuyCustomerMatch.findOne).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should filter properties when reqUserId differs from customerAgentId', async () => {
      const queryObj = {
        agent_id: 'agent-123',
        agent_id_of_client: 'agent-123',
        req_user_id: 'employee-456',
        property_type: 'Residential',
        property_for: 'Rent',
        customer_id: 'customer-3'
      };

      const mockMatchData = {
        customer_id: 'customer-3',
        matched_property_id_mine: [
          { property_id: 'prop-3', matched_percentage: 88 },
          { property_id: 'prop-4', matched_percentage: 82 }
        ],
        matched_property_id_other: [
          { property_id: 'prop-other', matched_percentage: 80 }
        ]
      };

      const mockOtherProperties = [
        {
          property_id: 'prop-other',
          agent_id: 'agent-999',
          property_address: {
            city: 'Delhi',
            main_text: 'Sector 1',
            formatted_address: 'Sector 1, Delhi',
            flat_number: '101',
            building_name: 'Tower',
            landmark_or_street: 'Main St'
          }
        }
      ];

      const mockOtherAgent = {
        id: 'agent-999',
        name: 'Other Agent',
        mobile: '9999999999'
      };

      ResidentialRentCustomerMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMatchData)
        })
      });

      ResidentialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOtherProperties)
        })
      });

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOtherAgent)
        })
      });

      const result = await getPropertyListingForMeeting(queryObj);

      // When reqUserId !== customerAgentId, only masked other properties are returned
      expect(result.length).toBe(1);
      expect(result[0].property_id).toBe('prop-other');
      // When reqUserId !== customerAgentId, flat_number and building_name are NOT included in the address
      expect(result[0].property_address.flat_number).toBeUndefined();
      expect(result[0].property_address.building_name).toBeUndefined();
      expect(result[0].property_address.city).toBe('Delhi');
      expect(result[0].owner_details.name).toBe('Other Agent');
    });

    it('should handle no match data', async () => {
      const queryObj = {
        agent_id: 'agent-111',
        agent_id_of_client: 'agent-111',
        req_user_id: 'agent-111',
        property_type: 'Residential',
        property_for: 'Sell',
        customer_id: 'customer-4'
      };

      ResidentialBuyCustomerMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await getPropertyListingForMeeting(queryObj);

      expect(result).toEqual([]);
    });

    it('should skip other properties if agent is deleted (null)', async () => {
      const queryObj = {
        agent_id: 'agent-222',
        agent_id_of_client: 'agent-222',
        req_user_id: 'agent-222',
        property_type: 'Commercial',
        property_for: 'Sell',
        customer_id: 'customer-5'
      };

      const mockMatchData = {
        customer_id: 'customer-5',
        matched_property_id_mine: [],
        matched_property_id_other: [
          { property_id: 'prop-deleted', matched_percentage: 75 }
        ]
      };

      const mockOtherProperties = [
        {
          property_id: 'prop-deleted',
          agent_id: 'deleted-agent',
          property_address: {
            city: 'Delhi',
            main_text: 'CP',
            formatted_address: 'CP, Delhi',
            landmark_or_street: 'Main St'
          }
        }
      ];

      CommercialBuyCustomerMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMatchData)
        })
      });

      let findCallCount = 0;
      CommercialPropertySell.find.mockImplementation(() => {
        findCallCount++;
        if (findCallCount === 1) {
          // First call for mine properties (empty because matched_property_id_mine is empty)
          return {
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([])
            })
          };
        } else {
          // Second call for other properties
          return {
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOtherProperties)
            })
          };
        }
      });

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await getPropertyListingForMeeting(queryObj);

      // When agent is null, property should NOT be added
      expect(User.findOne).toHaveBeenCalled();
      expect(result.length).toBe(0);
    });

    it('should mask property address for other agent properties', async () => {
      const queryObj = {
        agent_id: 'agent-333',
        agent_id_of_client: 'agent-333',
        req_user_id: 'agent-333',
        property_type: 'Residential',
        property_for: 'Sell',
        customer_id: 'customer-6'
      };

      const mockMatchData = {
        customer_id: 'customer-6',
        matched_property_id_mine: [],
        matched_property_id_other: [
          { property_id: 'prop-masked', matched_percentage: 92 }
        ]
      };

      const mockOtherProperties = [
        {
          property_id: 'prop-masked',
          agent_id: 'agent-444',
          property_address: {
            city: 'Pune',
            main_text: 'Koregaon Park',
            formatted_address: 'Koregaon Park, Pune',
            flat_number: 'B-202',
            building_name: 'Secret Tower',
            landmark_or_street: 'North Avenue'
          }
        }
      ];

      const mockOtherAgent = {
        id: 'agent-444',
        name: 'External Agent',
        mobile: '2222222222'
      };

      ResidentialBuyCustomerMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMatchData)
        })
      });

      let findCallCount = 0;
      ResidentialPropertySell.find.mockImplementation(() => ({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(findCallCount++ === 0 ? [] : mockOtherProperties)
        })
      }));

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOtherAgent)
        })
      });

      const result = await getPropertyListingForMeeting(queryObj);

      expect(result.length).toBe(1);
      expect(result[0].property_address.flat_number).toBe('');
      expect(result[0].property_address.building_name).toBe('');
      expect(result[0].property_address.city).toBe('Pune');
      expect(result[0].property_address.landmark_or_street).toBe('North Avenue');
      expect(result[0].owner_details.name).toBe('External Agent');
      expect(result[0].owner_details.address).toContain('Please contact agent');
    });
  });
});
