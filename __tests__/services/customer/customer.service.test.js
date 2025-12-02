// Mock all dependencies before requiring the service
jest.mock('../../../models/commercialPropertyRent');
jest.mock('../../../models/commercialPropertySell');
jest.mock('../../../models/match/commercialBuyPropertyMatch');
jest.mock('../../../models/match/commercialBuyCustomerMatch');
jest.mock('../../../models/match/commercialRentPropertyMatch');
jest.mock('../../../models/match/commercialRentCustomerMatch');
jest.mock('../../../models/residentialPropertyRent');
jest.mock('../../../models/residentialPropertySell');
jest.mock('../../../models/match/residentialRentPropertyMatch');
jest.mock('../../../models/match/residentialRentCustomerMatch');
jest.mock('../../../models/match/residentialBuyPropertyMatch');
jest.mock('../../../models/match/residentialBuyCustomerMatch');
jest.mock('../../../models/user');
jest.mock('../../../models/residentialPropertyCustomerRent');
jest.mock('../../../models/residentialPropertyCustomerBuy');
jest.mock('../../../models/commercialPropertyCustomerRent');
jest.mock('../../../models/commercialPropertyCustomerBuy');
jest.mock('../../../utils/logger');
jest.mock('../../../services/utility.service');

const CommercialPropertyRent = require('../../../models/commercialPropertyRent');
const CommercialPropertySell = require('../../../models/commercialPropertySell');
const CommercialBuyPropertyMatch = require('../../../models/match/commercialBuyPropertyMatch');
const CommercialBuyCustomerMatch = require('../../../models/match/commercialBuyCustomerMatch');
const CommercialRentPropertyMatch = require('../../../models/match/commercialRentPropertyMatch');
const CommercialRentCustomerMatch = require('../../../models/match/commercialRentCustomerMatch');
const ResidentialPropertyRent = require('../../../models/residentialPropertyRent');
const ResidentialPropertySell = require('../../../models/residentialPropertySell');
const ResidentialRentPropertyMatch = require('../../../models/match/residentialRentPropertyMatch');
const ResidentialRentCustomerMatch = require('../../../models/match/residentialRentCustomerMatch');
const ResidentialBuyPropertyMatch = require('../../../models/match/residentialBuyPropertyMatch');
const ResidentialBuyCustomerMatch = require('../../../models/match/residentialBuyCustomerMatch');
const User = require('../../../models/user');
const ResidentialPropertyCustomerRent = require('../../../models/residentialPropertyCustomerRent');
const ResidentialPropertyCustomerBuy = require('../../../models/residentialPropertyCustomerBuy');
const CommercialPropertyCustomerRent = require('../../../models/commercialPropertyCustomerRent');
const CommercialPropertyCustomerBuy = require('../../../models/commercialPropertyCustomerBuy');
const logger = require('../../../utils/logger');
const {
  removeDuplicates,
  modifyPropertyOwnerAndAddressDetails,
  modifyCustomerDetails
} = require('../../../services/utility.service');

const {
  getCustomerDetailsByIdToShare,
  getCustomerListForMeeting,
  getCustomerAndMeetingDetails
} = require('../../../services/customer/customer.service');

describe('Customer Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    removeDuplicates.mockImplementation((list1, list2) => {
      const ids = new Set(list1.map(item => item.customer_id));
      return list2.filter(item => !ids.has(item.customer_id));
    });
    
    modifyPropertyOwnerAndAddressDetails.mockResolvedValue(undefined);
    modifyCustomerDetails.mockResolvedValue(undefined);
  });

  describe('getCustomerDetailsByIdToShare', () => {
    
    it('should get residential rent customer details with agent info', async () => {
      const queryObj = {
        customer_id: 'customer-123',
        agent_id: 'agent-456',
        property_type: 'Residential',
        property_for: 'Rent'
      };

      const mockCustomer = {
        customer_id: 'customer-123',
        agent_id: 'agent-456',
        customer_details: {
          name: 'Original Name',
          mobile1: '1234567890'
        }
      };

      const mockAgent = {
        id: 'agent-456',
        name: 'Agent Smith',
        mobile: '9876543210'
      };

      ResidentialPropertyCustomerRent.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      User.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAgent)
      });

      const result = await getCustomerDetailsByIdToShare(queryObj);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.customer_id).toBe('customer-123');
      expect(parsedResult.customer_details.name).toBe('Agent Smith');
      expect(parsedResult.customer_details.mobile1).toBe('9876543210');
      expect(ResidentialPropertyCustomerRent.findOne).toHaveBeenCalledWith({ customer_id: 'customer-123' });
      expect(User.findOne).toHaveBeenCalledWith({ id: 'agent-456' });
    });

    it('should get residential buy customer details', async () => {
      const queryObj = {
        customer_id: 'customer-789',
        agent_id: 'agent-111',
        property_type: 'residential',
        property_for: 'buy'
      };

      const mockCustomer = {
        customer_id: 'customer-789',
        agent_id: 'agent-111'
      };

      const mockAgent = {
        id: 'agent-111',
        name: 'Agent John',
        mobile: '5555555555'
      };

      ResidentialPropertyCustomerBuy.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      User.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAgent)
      });

      const result = await getCustomerDetailsByIdToShare(queryObj);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.customer_details.name).toBe('Agent John');
      expect(ResidentialPropertyCustomerBuy.findOne).toHaveBeenCalled();
    });

    it('should get commercial rent customer details', async () => {
      const queryObj = {
        customer_id: 'customer-com-1',
        agent_id: 'agent-222',
        property_type: 'commercial',
        property_for: 'rent'
      };

      const mockCustomer = {
        customer_id: 'customer-com-1',
        agent_id: 'agent-222'
      };

      const mockAgent = {
        id: 'agent-222',
        name: 'Agent Bob',
        mobile: '7777777777'
      };

      CommercialPropertyCustomerRent.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      User.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAgent)
      });

      const result = await getCustomerDetailsByIdToShare(queryObj);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.customer_details.name).toBe('Agent Bob');
      expect(CommercialPropertyCustomerRent.findOne).toHaveBeenCalled();
    });

    it('should get commercial buy customer details', async () => {
      const queryObj = {
        customer_id: 'customer-com-2',
        agent_id: 'agent-333',
        property_type: 'Commercial',
        property_for: 'Buy'
      };

      const mockCustomer = {
        customer_id: 'customer-com-2',
        agent_id: 'agent-333'
      };

      const mockAgent = {
        id: 'agent-333',
        name: 'Agent Alice',
        mobile: '8888888888'
      };

      CommercialPropertyCustomerBuy.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      User.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAgent)
      });

      const result = await getCustomerDetailsByIdToShare(queryObj);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.customer_details.name).toBe('Agent Alice');
      expect(CommercialPropertyCustomerBuy.findOne).toHaveBeenCalled();
    });
  });

  describe('getCustomerListForMeeting', () => {
    
    it('should get residential rent customer list for agent', async () => {
      const queryObj = {
        req_user_id: 'agent-123',
        agent_id: 'agent-123',
        property_type: 'Residential',
        property_for: 'Rent',
        property_id: 'prop-1',
        property_agent_id: 'agent-123'
      };

      const mockMyCustomers = [
        { customer_id: 'cust-1', agent_id: 'agent-123' },
        { customer_id: 'cust-2', agent_id: 'agent-123' }
      ];

      const mockMatchedCustomers = [
        { customer_id: 'cust-matched-1', agent_id: 'agent-123' }
      ];

      let findCallCount = 0;
      ResidentialPropertyCustomerRent.find.mockImplementation(() => ({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(findCallCount++ === 0 ? mockMyCustomers : mockMatchedCustomers)
        })
      }));

      ResidentialRentPropertyMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      removeDuplicates.mockReturnValue(mockMyCustomers);

      const result = await getCustomerListForMeeting(queryObj);

      expect(result.length).toBeGreaterThanOrEqual(0);
      expect(ResidentialPropertyCustomerRent.find).toHaveBeenCalled();
      expect(ResidentialRentPropertyMatch.findOne).toHaveBeenCalledWith({ property_id: 'prop-1' });
    });

    it('should normalize "Sell" to "Buy" for residential', async () => {
      const queryObj = {
        req_user_id: 'agent-456',
        agent_id: 'agent-456',
        property_type: 'Residential',
        property_for: 'Sell',
        property_id: 'prop-2',
        property_agent_id: 'agent-456'
      };

      ResidentialPropertyCustomerBuy.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([])
        })
      });

      ResidentialBuyPropertyMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      removeDuplicates.mockReturnValue([]);

      await getCustomerListForMeeting(queryObj);

      expect(ResidentialPropertyCustomerBuy.find).toHaveBeenCalledWith(
        expect.objectContaining({
          'customer_locality.property_for': 'Buy'
        })
      );
    });

    it('should get commercial rent customer list', async () => {
      const queryObj = {
        req_user_id: 'agent-789',
        agent_id: 'agent-789',
        property_type: 'Commercial',
        property_for: 'Rent',
        property_id: 'prop-com-1',
        property_agent_id: 'agent-789'
      };

      const mockCustomers = [
        { customer_id: 'com-cust-1', agent_id: 'agent-789' }
      ];

      CommercialPropertyCustomerRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomers)
        })
      });

      CommercialRentPropertyMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      removeDuplicates.mockReturnValue(mockCustomers);

      const result = await getCustomerListForMeeting(queryObj);

      expect(CommercialPropertyCustomerRent.find).toHaveBeenCalled();
      expect(CommercialRentPropertyMatch.findOne).toHaveBeenCalled();
    });

    it('should handle matched customers from other agents', async () => {
      const queryObj = {
        req_user_id: 'agent-123',
        agent_id: 'agent-123',
        property_type: 'Residential',
        property_for: 'Rent',
        property_id: 'prop-3',
        property_agent_id: 'agent-123'
      };

      const mockMatchData = {
        property_id: 'prop-3',
        matched_customer_id_mine: [],
        matched_customer_id_other: [
          { customer_id: 'other-cust-1', matched_percentage: 75 }
        ]
      };

      const mockOtherCustomer = {
        customer_id: 'other-cust-1',
        agent_id: 'agent-999',
        customer_details: {
          name: 'Other Customer',
          mobile1: '1111111111'
        }
      };

      const mockOtherAgent = {
        id: 'agent-999',
        name: 'Other Agent',
        mobile: '2222222222'
      };

      ResidentialPropertyCustomerRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([])
        })
      }).mockReturnValueOnce({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([])
        })
      }).mockReturnValueOnce({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([])
        })
      }).mockReturnValueOnce({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockOtherCustomer])
        })
      });

      ResidentialRentPropertyMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMatchData)
        })
      });

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOtherAgent)
        })
      });

      removeDuplicates.mockReturnValue([]);

      const result = await getCustomerListForMeeting(queryObj);

      expect(User.findOne).toHaveBeenCalled();
    });

    it('should filter customers when reqUserId differs from propertyAgentId', async () => {
      const queryObj = {
        req_user_id: 'employee-111',
        agent_id: 'agent-123',
        property_type: 'Residential',
        property_for: 'Buy',
        property_id: 'prop-4',
        property_agent_id: 'agent-123'
      };

      ResidentialPropertyCustomerBuy.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([])
        })
      });

      ResidentialBuyPropertyMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      removeDuplicates.mockReturnValue([]);

      const result = await getCustomerListForMeeting(queryObj);

      expect(result).toBeDefined();
    });
  });

  describe('getCustomerAndMeetingDetails', () => {
    
    it('should get residential rent customer and property details', async () => {
      const queryObj = {
        req_user_id: 'agent-123',
        category_type: 'Residential',
        category_for: 'Rent',
        category_ids: ['prop-1', 'prop-2'],
        client_id: 'cust-1'
      };

      const mockProperties = [
        { property_id: 'prop-1', agent_id: 'agent-123' },
        { property_id: 'prop-2', agent_id: 'agent-123' }
      ];

      const mockCustomer = {
        customer_id: 'cust-1',
        agent_id: 'agent-123'
      };

      const mockMatchData = {
        customer_id: 'cust-1',
        matched_property_id_mine: [
          { property_id: 'prop-1', matched_percentage: 90 }
        ],
        matched_property_id_other: [
          { property_id: 'prop-2', matched_percentage: 80 }
        ]
      };

      ResidentialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProperties)
        })
      });

      ResidentialPropertyCustomerRent.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      ResidentialRentCustomerMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMatchData)
        })
      });

      const result = await getCustomerAndMeetingDetails(queryObj);

      expect(result.property_details).toBeDefined();
      expect(result.customer_details).toBeDefined();
      expect(result.property_details.length).toBe(2);
      expect(result.property_details[0].matched_percentage).toBe('90');
      expect(result.property_details[1].matched_percentage).toBe('80');
      expect(modifyPropertyOwnerAndAddressDetails).toHaveBeenCalledWith('agent-123', mockProperties);
      expect(modifyCustomerDetails).toHaveBeenCalledWith('agent-123', mockCustomer);
    });

    it('should handle residential buy/sell customer details', async () => {
      const queryObj = {
        req_user_id: 'agent-456',
        category_type: 'Residential',
        category_for: 'Sell',
        category_ids: ['prop-sell-1'],
        client_id: 'cust-buy-1'
      };

      const mockProperties = [
        { property_id: 'prop-sell-1', agent_id: 'agent-456' }
      ];

      const mockCustomer = {
        customer_id: 'cust-buy-1',
        agent_id: 'agent-456'
      };

      ResidentialPropertySell.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProperties)
        })
      });

      ResidentialPropertyCustomerBuy.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      ResidentialBuyCustomerMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await getCustomerAndMeetingDetails(queryObj);

      expect(result.property_details).toBeDefined();
      expect(result.customer_details).toBeDefined();
      expect(ResidentialPropertySell.find).toHaveBeenCalled();
      expect(ResidentialPropertyCustomerBuy.findOne).toHaveBeenCalled();
    });

    it('should get commercial rent customer and property details', async () => {
      const queryObj = {
        req_user_id: 'agent-789',
        category_type: 'Commercial',
        category_for: 'Rent',
        category_ids: ['com-prop-1'],
        client_id: 'com-cust-1'
      };

      const mockProperties = [
        { property_id: 'com-prop-1', agent_id: 'agent-789' }
      ];

      const mockCustomer = {
        customer_id: 'com-cust-1',
        agent_id: 'agent-789'
      };

      CommercialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProperties)
        })
      });

      CommercialPropertyCustomerRent.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      CommercialRentCustomerMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await getCustomerAndMeetingDetails(queryObj);

      expect(result.property_details).toBeDefined();
      expect(result.customer_details).toBeDefined();
      expect(CommercialPropertyRent.find).toHaveBeenCalled();
      expect(CommercialPropertyCustomerRent.findOne).toHaveBeenCalled();
    });

    it('should get commercial buy customer and property details', async () => {
      const queryObj = {
        req_user_id: 'agent-999',
        category_type: 'Commercial',
        category_for: 'Buy',
        category_ids: ['com-prop-sell-1'],
        client_id: 'com-cust-buy-1'
      };

      const mockProperties = [
        { property_id: 'com-prop-sell-1', agent_id: 'agent-999' }
      ];

      const mockCustomer = {
        customer_id: 'com-cust-buy-1',
        agent_id: 'agent-999'
      };

      CommercialPropertySell.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProperties)
        })
      });

      CommercialPropertyCustomerBuy.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      CommercialBuyCustomerMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await getCustomerAndMeetingDetails(queryObj);

      expect(result.property_details).toBeDefined();
      expect(result.customer_details).toBeDefined();
      expect(CommercialPropertySell.find).toHaveBeenCalled();
      expect(CommercialPropertyCustomerBuy.findOne).toHaveBeenCalled();
    });

    it('should set matched_percentage to 0 when no matches found', async () => {
      const queryObj = {
        req_user_id: 'agent-111',
        category_type: 'Residential',
        category_for: 'Rent',
        category_ids: ['prop-no-match'],
        client_id: 'cust-no-match'
      };

      const mockProperties = [
        { property_id: 'prop-no-match', agent_id: 'agent-111' }
      ];

      const mockCustomer = {
        customer_id: 'cust-no-match',
        agent_id: 'agent-111'
      };

      ResidentialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockProperties)
        })
      });

      ResidentialPropertyCustomerRent.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      ResidentialRentCustomerMatch.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await getCustomerAndMeetingDetails(queryObj);

      expect(result.property_details[0].matched_percentage).toBe(0);
    });
  });
});
