// Mock all model dependencies
jest.mock('../../models/commercialPropertyRent');
jest.mock('../../models/commercialPropertySell');
jest.mock('../../models/match/commercialBuyPropertyMatch');
jest.mock('../../models/match/commercialBuyCustomerMatch');
jest.mock('../../models/match/commercialRentPropertyMatch');
jest.mock('../../models/match/commercialRentCustomerMatch');
jest.mock('../../models/residentialPropertyRent');
jest.mock('../../models/residentialPropertySell');
jest.mock('../../models/match/residentialRentPropertyMatch');
jest.mock('../../models/match/residentialBuyPropertyMatch');
jest.mock('../../models/match/residentialRentCustomerMatch');
jest.mock('../../models/match/residentialBuyCustomerMatch');
jest.mock('../../models/residentialPropertyCustomerRent');
jest.mock('../../models/residentialPropertyCustomerBuy');
jest.mock('../../models/commercialPropertyCustomerRent');
jest.mock('../../models/commercialPropertyCustomerBuy');

const mockReplaceOwnerDetailsWithAgentDetails = jest.fn();
const mockReplaceCustomerDetailsWithAgentDetails = jest.fn();

jest.mock('../../services/utility.service', () => ({
  replaceOwnerDetailsWithAgentDetails: mockReplaceOwnerDetailsWithAgentDetails,
  replaceCustomerDetailsWithAgentDetails: mockReplaceCustomerDetailsWithAgentDetails
}));

const matchService = require('../../services/match.service');

const CommercialPropertyRent = require('../../models/commercialPropertyRent');
const CommercialPropertySell = require('../../models/commercialPropertySell');
const CommercialBuyPropertyMatch = require('../../models/match/commercialBuyPropertyMatch');
const CommercialBuyCustomerMatch = require('../../models/match/commercialBuyCustomerMatch');
const CommercialRentPropertyMatch = require('../../models/match/commercialRentPropertyMatch');
const CommercialRentCustomerMatch = require('../../models/match/commercialRentCustomerMatch');
const ResidentialPropertyRent = require('../../models/residentialPropertyRent');
const ResidentialPropertySell = require('../../models/residentialPropertySell');
const ResidentialRentPropertyMatch = require('../../models/match/residentialRentPropertyMatch');
const ResidentialBuyPropertyMatch = require('../../models/match/residentialBuyPropertyMatch');
const ResidentialRentCustomerMatch = require('../../models/match/residentialRentCustomerMatch');
const ResidentialBuyCustomerMatch = require('../../models/match/residentialBuyCustomerMatch');
const ResidentialPropertyCustomerRent = require('../../models/residentialPropertyCustomerRent');
const ResidentialPropertyCustomerBuy = require('../../models/residentialPropertyCustomerBuy');
const CommercialPropertyCustomerRent = require('../../models/commercialPropertyCustomerRent');
const CommercialPropertyCustomerBuy = require('../../models/commercialPropertyCustomerBuy');
const utilityService = require('../../services/utility.service');

describe('Match Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getmatchedResidentialCustomerRentList', () => {
    it('should return matched customers (mine and other) for residential rent property', async () => {
      const propertyDetails = {
        property_id: 'prop-123',
        req_user_id: 'agent-1'
      };

      const matchedProperty = {
        property_id: 'prop-123',
        matched_customer_id_mine: [
          { customer_id: 'cust-mine-1', matched_percentage: 85 },
          { customer_id: 'cust-mine-2', matched_percentage: 90 }
        ],
        matched_customer_id_other: [
          { customer_id: 'cust-other-1', matched_percentage: 75 }
        ]
      };

      const mineCustomers = [
        { customer_id: 'cust-mine-1', customer_name: 'Customer 1', agent_id: 'agent-1' },
        { customer_id: 'cust-mine-2', customer_name: 'Customer 2', agent_id: 'agent-1' }
      ];

      const otherCustomers = [
        { customer_id: 'cust-other-1', customer_name: 'Customer 3', agent_id: 'agent-2' }
      ];

      ResidentialRentPropertyMatch.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(matchedProperty)
        })
      });

      ResidentialPropertyCustomerRent.find = jest.fn()
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mineCustomers)
          })
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(otherCustomers)
          })
        });

      mockReplaceCustomerDetailsWithAgentDetails.mockResolvedValue();

      const result = await matchService.getmatchedResidentialCustomerRentList(propertyDetails);

      expect(result.matchedCustomerDetailsMine).toHaveLength(2);
      expect(result.matchedCustomerDetailsMine[0].matched_percentage).toBe(85);
      expect(result.matchedCustomerDetailsMine[1].matched_percentage).toBe(90);
      expect(result.matchedCustomerDetailsOther).toHaveLength(1);
      expect(result.matchedCustomerDetailsOther[0].matched_percentage).toBe(75);
    });

    it('should return error if no matched property found', async () => {
      const propertyDetails = {
        property_id: 'prop-999',
        req_user_id: 'agent-1'
      };

      ResidentialRentPropertyMatch.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await matchService.getmatchedResidentialCustomerRentList(propertyDetails);

      expect(result).toEqual({ error: "No matched property found" });
    });

    it('should handle database errors', async () => {
      const propertyDetails = {
        property_id: 'prop-123',
        req_user_id: 'agent-1'
      };

      ResidentialRentPropertyMatch.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const result = await matchService.getmatchedResidentialCustomerRentList(propertyDetails);

      expect(result.error).toBe("Internal Server Error");
    });
  });

  describe('getMatchedResidentialProptiesRentList', () => {
    it('should return matched properties (mine and other) for residential rent customer', async () => {
      const customerDetails = {
        customer_id: 'cust-123',
        req_user_id: 'agent-1'
      };

      const matchedCustomer = {
        customer_id: 'cust-123',
        matched_property_id_mine: [
          { property_id: 'prop-mine-1', matched_percentage: 88 }
        ],
        matched_property_id_other: [
          { property_id: 'prop-other-1', matched_percentage: 78 }
        ]
      };

      const mineProperties = [
        { property_id: 'prop-mine-1', property_name: 'Property 1', agent_id: 'agent-1' }
      ];

      const otherProperties = [
        { property_id: 'prop-other-1', property_name: 'Property 2', agent_id: 'agent-2', matched_percentage: 78 }
      ];

      ResidentialRentCustomerMatch.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(matchedCustomer)
        })
      });

      ResidentialPropertyRent.find = jest.fn()
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mineProperties)
          })
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(otherProperties)
          })
        });

      mockReplaceOwnerDetailsWithAgentDetails.mockResolvedValue(otherProperties);

      const result = await matchService.getMatchedResidentialProptiesRentList(customerDetails);

      expect(result.matchedPropertyDetailsMine).toHaveLength(1);
      expect(result.matchedPropertyDetailsMine[0].matched_percentage).toBe(88);
      expect(result.matchedPropertyDetailsOther).toHaveLength(1);
      expect(result.matchedPropertyDetailsOther[0].matched_percentage).toBe(78);
    });

    it('should return error if no matched customer found', async () => {
      const customerDetails = {
        customer_id: 'cust-999',
        req_user_id: 'agent-1'
      };

      ResidentialRentCustomerMatch.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await matchService.getMatchedResidentialProptiesRentList(customerDetails);

      expect(result).toEqual({ error: "No matched property found" });
    });
  });

  describe('matchedResidentialProptiesBuyList', () => {
    it('should return matched sell properties for residential buy customer', async () => {
      const customerDetails = {
        customer_id: 'cust-buy-123',
        req_user_id: 'agent-1'
      };

      const matchedCustomer = {
        customer_id: 'cust-buy-123',
        matched_property_id_mine: [
          { property_id: 'prop-sell-1', matched_percentage: 92 }
        ],
        matched_property_id_other: [
          { property_id: 'prop-sell-2', matched_percentage: 82 }
        ]
      };

      const mineProperties = [
        { property_id: 'prop-sell-1', property_name: 'Sell Property 1', agent_id: 'agent-1' }
      ];

      const otherProperties = [
        { property_id: 'prop-sell-2', property_name: 'Sell Property 2', agent_id: 'agent-2' }
      ];

      ResidentialBuyCustomerMatch.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(matchedCustomer)
        })
      });

      ResidentialPropertySell.find = jest.fn()
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mineProperties)
          })
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(otherProperties)
          })
        });

      mockReplaceOwnerDetailsWithAgentDetails.mockResolvedValue(otherProperties);

      const result = await matchService.matchedResidentialProptiesBuyList(customerDetails);

      expect(result.matchedPropertyDetailsMine).toHaveLength(1);
      expect(result.matchedPropertyDetailsMine[0].matched_percentage).toBe(92);
      expect(result.matchedPropertyDetailsOther).toHaveLength(1);
      expect(result.matchedPropertyDetailsOther[0].matched_percentage).toBe(82);
    });

    it('should return error if no matched customer found', async () => {
      const customerDetails = {
        customer_id: 'cust-999',
        req_user_id: 'agent-1'
      };

      ResidentialBuyCustomerMatch.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await matchService.matchedResidentialProptiesBuyList(customerDetails);

      expect(result).toEqual({ error: "No matched property found" });
    });
  });

  describe('getMatchedResidentialCustomerBuyList', () => {
    it('should return matched buy customers for residential sell property', async () => {
      const propertyDetails = {
        property_id: 'prop-sell-123',
        req_user_id: 'agent-1'
      };

      const matchedProperty = {
        property_id: 'prop-sell-123',
        matched_customer_id_mine: [
          { customer_id: 'cust-buy-1', matched_percentage: 87 }
        ],
        matched_customer_id_other: [
          { customer_id: 'cust-buy-2', matched_percentage: 77 }
        ]
      };

      const mineCustomers = [
        { customer_id: 'cust-buy-1', customer_name: 'Buy Customer 1', agent_id: 'agent-1' }
      ];

      const otherCustomers = [
        { customer_id: 'cust-buy-2', customer_name: 'Buy Customer 2', agent_id: 'agent-2' }
      ];

      ResidentialBuyPropertyMatch.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(matchedProperty)
        })
      });

      ResidentialPropertyCustomerBuy.find = jest.fn()
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mineCustomers)
          })
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(otherCustomers)
          })
        });

      mockReplaceCustomerDetailsWithAgentDetails.mockResolvedValue();

      const result = await matchService.getMatchedResidentialCustomerBuyList(propertyDetails);

      expect(result.matchedCustomerDetailsMine).toHaveLength(1);
      expect(result.matchedCustomerDetailsMine[0].matched_percentage).toBe(87);
      expect(result.matchedCustomerDetailsOther).toHaveLength(1);
      expect(result.matchedCustomerDetailsOther[0].matched_percentage).toBe(77);
    });
  });

  describe('getMatchedCommercialProptiesRentList', () => {
    it('should return matched commercial rent properties for customer', async () => {
      const customerDetails = {
        customer_id: 'cust-comm-123',
        req_user_id: 'agent-1'
      };

      const matchedCustomer = {
        customer_id: 'cust-comm-123',
        matched_property_id_mine: [
          { property_id: 'comm-prop-1', matched_percentage: 80 }
        ],
        matched_property_id_other: [
          { property_id: 'comm-prop-2', matched_percentage: 70 }
        ]
      };

      const mineProperties = [
        { property_id: 'comm-prop-1', property_name: 'Commercial 1', agent_id: 'agent-1' }
      ];

      const otherProperties = [
        { property_id: 'comm-prop-2', property_name: 'Commercial 2', agent_id: 'agent-2' }
      ];

      CommercialRentCustomerMatch.findOne = jest.fn().mockResolvedValue(matchedCustomer);

      CommercialPropertyRent.find = jest.fn()
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mineProperties)
          })
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(otherProperties)
          })
        });

      mockReplaceOwnerDetailsWithAgentDetails.mockResolvedValue(otherProperties);

      const result = await matchService.getMatchedCommercialProptiesRentList(customerDetails);

      expect(result.matchedPropertyDetailsMine).toHaveLength(1);
      expect(result.matchedPropertyDetailsMine[0].matched_percentage).toBe(80);
      expect(result.matchedPropertyDetailsOther).toHaveLength(1);
      expect(result.matchedPropertyDetailsOther[0].matched_percentage).toBe(70);
    });

    it('should return error if no matched customer found', async () => {
      const customerDetails = {
        customer_id: 'cust-999',
        req_user_id: 'agent-1'
      };

      CommercialRentCustomerMatch.findOne = jest.fn().mockResolvedValue(null);

      const result = await matchService.getMatchedCommercialProptiesRentList(customerDetails);

      expect(result).toEqual({ error: "No matched property found" });
    });
  });

  describe('getMatchedCommercialProptiesBuyList', () => {
    it('should return matched commercial sell properties for buy customer', async () => {
      const customerDetails = {
        customer_id: 'cust-comm-buy-123',
        req_user_id: 'agent-1'
      };

      const matchedCustomer = {
        customer_id: 'cust-comm-buy-123',
        matched_property_id_mine: [
          { property_id: 'comm-sell-1', matched_percentage: 95 }
        ],
        matched_property_id_other: [
          { property_id: 'comm-sell-2', matched_percentage: 85 }
        ]
      };

      const mineProperties = [
        { property_id: 'comm-sell-1', property_name: 'Commercial Sell 1', agent_id: 'agent-1' }
      ];

      const otherProperties = [
        { property_id: 'comm-sell-2', property_name: 'Commercial Sell 2', agent_id: 'agent-2' }
      ];

      CommercialBuyCustomerMatch.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(matchedCustomer)
        })
      });

      CommercialPropertySell.find = jest.fn()
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mineProperties)
          })
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(otherProperties)
          })
        });

      mockReplaceOwnerDetailsWithAgentDetails.mockResolvedValue(otherProperties);

      const result = await matchService.getMatchedCommercialProptiesBuyList(customerDetails);

      expect(result.matchedPropertyDetailsMine).toHaveLength(1);
      expect(result.matchedPropertyDetailsMine[0].matched_percentage).toBe(95);
      expect(result.matchedPropertyDetailsOther).toHaveLength(1);
      expect(result.matchedPropertyDetailsOther[0].matched_percentage).toBe(85);
    });
  });

  describe('getMatchedCommercialCustomerRentList', () => {
    it('should return matched commercial rent customers for property', async () => {
      const propertyDetails = {
        property_id: 'comm-prop-123',
        req_user_id: 'agent-1'
      };

      const matchedProperty = {
        property_id: 'comm-prop-123',
        matched_customer_id_mine: [
          { customer_id: 'comm-cust-1', matched_percentage: 83 }
        ],
        matched_customer_id_other: [
          { customer_id: 'comm-cust-2', matched_percentage: 73 }
        ]
      };

      const mineCustomers = [
        { customer_id: 'comm-cust-1', customer_name: 'Commercial Customer 1', agent_id: 'agent-1' }
      ];

      const otherCustomers = [
        { customer_id: 'comm-cust-2', customer_name: 'Commercial Customer 2', agent_id: 'agent-2' }
      ];

      CommercialRentPropertyMatch.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(matchedProperty)
        })
      });

      CommercialPropertyCustomerRent.find = jest.fn()
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mineCustomers)
          })
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(otherCustomers)
          })
        });

      mockReplaceCustomerDetailsWithAgentDetails.mockResolvedValue();

      const result = await matchService.getMatchedCommercialCustomerRentList(propertyDetails);

      expect(result.matchedCustomerDetailsMine).toHaveLength(1);
      expect(result.matchedCustomerDetailsMine[0].matched_percentage).toBe(83);
      expect(result.matchedCustomerDetailsOther).toHaveLength(1);
      expect(result.matchedCustomerDetailsOther[0].matched_percentage).toBe(73);
    });

    it('should return error if no matched property found', async () => {
      const propertyDetails = {
        property_id: 'prop-999',
        req_user_id: 'agent-1'
      };

      CommercialRentPropertyMatch.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await matchService.getMatchedCommercialCustomerRentList(propertyDetails);

      expect(result).toEqual({ error: "No matched property found" });
    });
  });

  describe('getMatchedCommercialCustomerSellList', () => {
    it('should return matched commercial buy customers for sell property', async () => {
      const propertyDetails = {
        property_id: 'comm-sell-prop-123',
        req_user_id: 'agent-1'
      };

      const matchedProperty = {
        property_id: 'comm-sell-prop-123',
        matched_customer_id_mine: [
          { customer_id: 'comm-buy-cust-1', matched_percentage: 91 }
        ],
        matched_customer_id_other: [
          { customer_id: 'comm-buy-cust-2', matched_percentage: 81 }
        ]
      };

      const mineCustomers = [
        { customer_id: 'comm-buy-cust-1', customer_name: 'Commercial Buy Customer 1', agent_id: 'agent-1' }
      ];

      const otherCustomers = [
        { customer_id: 'comm-buy-cust-2', customer_name: 'Commercial Buy Customer 2', agent_id: 'agent-2' }
      ];

      CommercialBuyPropertyMatch.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(matchedProperty)
        })
      });

      CommercialPropertyCustomerBuy.find = jest.fn()
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mineCustomers)
          })
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(otherCustomers)
          })
        });

      mockReplaceCustomerDetailsWithAgentDetails.mockResolvedValue();

      const result = await matchService.getMatchedCommercialCustomerSellList(propertyDetails);

      expect(result.matchedCustomerDetailsMine).toHaveLength(1);
      expect(result.matchedCustomerDetailsMine[0].matched_percentage).toBe(91);
      expect(result.matchedCustomerDetailsOther).toHaveLength(1);
      expect(result.matchedCustomerDetailsOther[0].matched_percentage).toBe(81);
    });
  });

  describe('getMatchedCommercialProptiesList', () => {
    it('should return all matched commercial properties (rent and sell) for customer', async () => {
      const customerDetails = {
        customer_id: 'cust-comm-123'
      };

      const matchedCustomer = {
        customer_id: 'cust-comm-123',
        matched_property_id_mine: [
          { property_id: 'comm-prop-1', matched_percentage: 85 },
          { property_id: 'comm-prop-2', matched_percentage: 90 }
        ],
        matched_property_id_other: [
          { property_id: 'comm-prop-3', matched_percentage: 75 }
        ]
      };

      const mineRentProperties = [
        { property_id: 'comm-prop-1', property_name: 'Commercial Rent 1', property_for: 'Rent' }
      ];

      const mineSellProperties = [
        { property_id: 'comm-prop-2', property_name: 'Commercial Sell 1', property_for: 'Sell' }
      ];

      const otherRentProperties = [
        { property_id: 'comm-prop-3', property_name: 'Commercial Rent 2', property_for: 'Rent' }
      ];

      const otherSellProperties = [];

      CommercialRentCustomerMatch.findOne = jest.fn().mockResolvedValue(matchedCustomer);

      CommercialPropertyRent.find = jest.fn()
        .mockResolvedValueOnce(mineRentProperties)
        .mockResolvedValueOnce(otherRentProperties);

      CommercialPropertySell.find = jest.fn()
        .mockResolvedValueOnce(mineSellProperties)
        .mockResolvedValueOnce(otherSellProperties);

      const result = await matchService.getMatchedCommercialProptiesList(customerDetails);

      expect(result.matchedPropertyDetailsMine).toHaveLength(2);
      expect(result.matchedPropertyDetailsOther).toHaveLength(1);
    });

    it('should return error if no matched customer found', async () => {
      const customerDetails = {
        customer_id: 'cust-999'
      };

      CommercialRentCustomerMatch.findOne = jest.fn().mockResolvedValue(null);

      const result = await matchService.getMatchedCommercialProptiesList(customerDetails);

      expect(result).toEqual({ error: "No matched property found" });
    });

    it('should handle database errors', async () => {
      const customerDetails = {
        customer_id: 'cust-123'
      };

      CommercialRentCustomerMatch.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      const result = await matchService.getMatchedCommercialProptiesList(customerDetails);

      expect(result.error).toBe("Internal Server Error");
    });
  });
});
