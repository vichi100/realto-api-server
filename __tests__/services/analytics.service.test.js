// Mock all dependencies before requiring the service
jest.mock('../../models/commercialPropertyRent');
jest.mock('../../models/commercialPropertySell');
jest.mock('../../models/residentialPropertyRent');
jest.mock('../../models/residentialPropertySell');
jest.mock('../../models/user');
jest.mock('../../models/residentialPropertyCustomerRent');
jest.mock('../../models/residentialPropertyCustomerBuy');
jest.mock('../../models/commercialPropertyCustomerRent');
jest.mock('../../models/commercialPropertyCustomerBuy');
jest.mock('../../utils/logger');

const CommercialPropertyRent = require('../../models/commercialPropertyRent');
const CommercialPropertySell = require('../../models/commercialPropertySell');
const ResidentialPropertyRent = require('../../models/residentialPropertyRent');
const ResidentialPropertySell = require('../../models/residentialPropertySell');
const User = require('../../models/user');
const ResidentialPropertyCustomerRent = require('../../models/residentialPropertyCustomerRent');
const ResidentialPropertyCustomerBuy = require('../../models/residentialPropertyCustomerBuy');
const CommercialPropertyCustomerRent = require('../../models/commercialPropertyCustomerRent');
const CommercialPropertyCustomerBuy = require('../../models/commercialPropertyCustomerBuy');
const logger = require('../../utils/logger');

const { getTotalListingSummary } = require('../../services/analytics.service');

describe('Analytics Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTotalListingSummary', () => {
    
    it('should return summary counts for agent when reqUserId equals agentId', async () => {
      const agentObj = {
        req_user_id: 'agent-123',
        agent_id: 'agent-123'
      };

      // Mock property counts
      ResidentialPropertyRent.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(5)
        })
      });

      ResidentialPropertySell.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(3)
        })
      });

      CommercialPropertyRent.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(2)
        })
      });

      CommercialPropertySell.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(4)
        })
      });

      // Mock customer counts
      ResidentialPropertyCustomerRent.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(10)
        })
      });

      ResidentialPropertyCustomerBuy.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(8)
        })
      });

      CommercialPropertyCustomerRent.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(6)
        })
      });

      CommercialPropertyCustomerBuy.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(7)
        })
      });

      const result = await getTotalListingSummary(agentObj);

      expect(result.residentialPropertyRentCount).toBe(5);
      expect(result.residentialPropertySellCount).toBe(3);
      expect(result.commercialPropertyRentCount).toBe(2);
      expect(result.commercialPropertySellCount).toBe(4);
      expect(result.residentialPropertyCustomerRentCount).toBe(10);
      expect(result.residentialPropertyCustomerBuyCount).toBe(8);
      expect(result.commercialPropertyCustomerRentCount).toBe(6);
      expect(result.commercialPropertyCustomerBuyCount).toBe(7);

      // Verify countDocuments was called with correct agent_id
      expect(ResidentialPropertyRent.countDocuments).toHaveBeenCalledWith({ agent_id: 'agent-123' });
      expect(ResidentialPropertySell.countDocuments).toHaveBeenCalledWith({ agent_id: 'agent-123' });
      expect(CommercialPropertyRent.countDocuments).toHaveBeenCalledWith({ agent_id: 'agent-123' });
      expect(CommercialPropertySell.countDocuments).toHaveBeenCalledWith({ agent_id: 'agent-123' });
      expect(ResidentialPropertyCustomerRent.countDocuments).toHaveBeenCalledWith({ agent_id: 'agent-123' });
      expect(ResidentialPropertyCustomerBuy.countDocuments).toHaveBeenCalledWith({ agent_id: 'agent-123' });
      expect(CommercialPropertyCustomerRent.countDocuments).toHaveBeenCalledWith({ agent_id: 'agent-123' });
      expect(CommercialPropertyCustomerBuy.countDocuments).toHaveBeenCalledWith({ agent_id: 'agent-123' });
    });

    it('should return summary counts for employee when reqUserId differs from agentId', async () => {
      const employeeObj = {
        req_user_id: 'employee-456',
        agent_id: 'agent-123'
      };

      const mockEmployee = {
        id: 'employee-456',
        assigned_residential_rent_properties: ['prop1', 'prop2'],
        assigned_residential_sell_properties: ['prop3'],
        assigned_commercial_rent_properties: ['prop4', 'prop5', 'prop6'],
        assigned_commercial_sell_properties: [],
        assigned_residential_rent_customers: ['cust1', 'cust2', 'cust3'],
        assigned_residential_buy_customers: ['cust4', 'cust5'],
        assigned_commercial_rent_customers: ['cust6'],
        assigned_commercial_buy_customers: ['cust7', 'cust8', 'cust9', 'cust10']
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployee)
        })
      });

      const result = await getTotalListingSummary(employeeObj);

      expect(result.residentialPropertyRentCount).toBe(2);
      expect(result.residentialPropertySellCount).toBe(1);
      expect(result.commercialPropertyRentCount).toBe(3);
      expect(result.commercialPropertySellCount).toBe(0);
      expect(result.residentialPropertyCustomerRentCount).toBe(3);
      expect(result.residentialPropertyCustomerBuyCount).toBe(2);
      expect(result.commercialPropertyCustomerRentCount).toBe(1);
      expect(result.commercialPropertyCustomerBuyCount).toBe(4);

      // Verify User.findOne was called to fetch employee data
      expect(User.findOne).toHaveBeenCalledWith({ id: 'employee-456' });
    });

    it('should return zero counts for agent with no properties or customers', async () => {
      const agentObj = {
        req_user_id: 'agent-new',
        agent_id: 'agent-new'
      };

      // Mock all counts as 0
      ResidentialPropertyRent.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(0)
        })
      });

      ResidentialPropertySell.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(0)
        })
      });

      CommercialPropertyRent.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(0)
        })
      });

      CommercialPropertySell.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(0)
        })
      });

      ResidentialPropertyCustomerRent.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(0)
        })
      });

      ResidentialPropertyCustomerBuy.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(0)
        })
      });

      CommercialPropertyCustomerRent.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(0)
        })
      });

      CommercialPropertyCustomerBuy.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(0)
        })
      });

      const result = await getTotalListingSummary(agentObj);

      expect(result.residentialPropertyRentCount).toBe(0);
      expect(result.residentialPropertySellCount).toBe(0);
      expect(result.commercialPropertyRentCount).toBe(0);
      expect(result.commercialPropertySellCount).toBe(0);
      expect(result.residentialPropertyCustomerRentCount).toBe(0);
      expect(result.residentialPropertyCustomerBuyCount).toBe(0);
      expect(result.commercialPropertyCustomerRentCount).toBe(0);
      expect(result.commercialPropertyCustomerBuyCount).toBe(0);
    });

    it('should return zero counts for employee with no assignments', async () => {
      const employeeObj = {
        req_user_id: 'employee-new',
        agent_id: 'agent-123'
      };

      const mockEmployee = {
        id: 'employee-new',
        assigned_residential_rent_properties: [],
        assigned_residential_sell_properties: [],
        assigned_commercial_rent_properties: [],
        assigned_commercial_sell_properties: [],
        assigned_residential_rent_customers: [],
        assigned_residential_buy_customers: [],
        assigned_commercial_rent_customers: [],
        assigned_commercial_buy_customers: []
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployee)
        })
      });

      const result = await getTotalListingSummary(employeeObj);

      expect(result.residentialPropertyRentCount).toBe(0);
      expect(result.residentialPropertySellCount).toBe(0);
      expect(result.commercialPropertyRentCount).toBe(0);
      expect(result.commercialPropertySellCount).toBe(0);
      expect(result.residentialPropertyCustomerRentCount).toBe(0);
      expect(result.residentialPropertyCustomerBuyCount).toBe(0);
      expect(result.commercialPropertyCustomerRentCount).toBe(0);
      expect(result.commercialPropertyCustomerBuyCount).toBe(0);
    });

    it('should handle object with body wrapper', async () => {
      const agentObjWithBody = {
        body: {
          req_user_id: 'agent-789',
          agent_id: 'agent-789'
        }
      };

      // Mock property counts
      ResidentialPropertyRent.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(1)
        })
      });

      ResidentialPropertySell.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(2)
        })
      });

      CommercialPropertyRent.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(3)
        })
      });

      CommercialPropertySell.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(4)
        })
      });

      ResidentialPropertyCustomerRent.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(5)
        })
      });

      ResidentialPropertyCustomerBuy.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(6)
        })
      });

      CommercialPropertyCustomerRent.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(7)
        })
      });

      CommercialPropertyCustomerBuy.countDocuments.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(8)
        })
      });

      const result = await getTotalListingSummary(agentObjWithBody);

      expect(result.residentialPropertyRentCount).toBe(1);
      expect(result.residentialPropertySellCount).toBe(2);
      expect(result.commercialPropertyRentCount).toBe(3);
      expect(result.commercialPropertySellCount).toBe(4);
      expect(result.residentialPropertyCustomerRentCount).toBe(5);
      expect(result.residentialPropertyCustomerBuyCount).toBe(6);
      expect(result.commercialPropertyCustomerRentCount).toBe(7);
      expect(result.commercialPropertyCustomerBuyCount).toBe(8);
    });

    it('should return correct structure with all required fields', async () => {
      const agentObj = {
        req_user_id: 'agent-999',
        agent_id: 'agent-999'
      };

      // Mock all counts
      const mockCount = (value) => ({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(value)
        })
      });

      ResidentialPropertyRent.countDocuments.mockReturnValue(mockCount(1));
      ResidentialPropertySell.countDocuments.mockReturnValue(mockCount(2));
      CommercialPropertyRent.countDocuments.mockReturnValue(mockCount(3));
      CommercialPropertySell.countDocuments.mockReturnValue(mockCount(4));
      ResidentialPropertyCustomerRent.countDocuments.mockReturnValue(mockCount(5));
      ResidentialPropertyCustomerBuy.countDocuments.mockReturnValue(mockCount(6));
      CommercialPropertyCustomerRent.countDocuments.mockReturnValue(mockCount(7));
      CommercialPropertyCustomerBuy.countDocuments.mockReturnValue(mockCount(8));

      const result = await getTotalListingSummary(agentObj);

      // Verify response structure
      expect(result).toHaveProperty('residentialPropertyRentCount');
      expect(result).toHaveProperty('residentialPropertySellCount');
      expect(result).toHaveProperty('commercialPropertyRentCount');
      expect(result).toHaveProperty('commercialPropertySellCount');
      expect(result).toHaveProperty('residentialPropertyCustomerRentCount');
      expect(result).toHaveProperty('residentialPropertyCustomerBuyCount');
      expect(result).toHaveProperty('commercialPropertyCustomerRentCount');
      expect(result).toHaveProperty('commercialPropertyCustomerBuyCount');
      
      // Verify all are numbers
      expect(typeof result.residentialPropertyRentCount).toBe('number');
      expect(typeof result.residentialPropertySellCount).toBe('number');
      expect(typeof result.commercialPropertyRentCount).toBe('number');
      expect(typeof result.commercialPropertySellCount).toBe('number');
      expect(typeof result.residentialPropertyCustomerRentCount).toBe('number');
      expect(typeof result.residentialPropertyCustomerBuyCount).toBe('number');
      expect(typeof result.commercialPropertyCustomerRentCount).toBe('number');
      expect(typeof result.commercialPropertyCustomerBuyCount).toBe('number');
    });

    it('should handle large counts for agent', async () => {
      const agentObj = {
        req_user_id: 'agent-large',
        agent_id: 'agent-large'
      };

      const mockCount = (value) => ({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(value)
        })
      });

      ResidentialPropertyRent.countDocuments.mockReturnValue(mockCount(1000));
      ResidentialPropertySell.countDocuments.mockReturnValue(mockCount(2000));
      CommercialPropertyRent.countDocuments.mockReturnValue(mockCount(500));
      CommercialPropertySell.countDocuments.mockReturnValue(mockCount(1500));
      ResidentialPropertyCustomerRent.countDocuments.mockReturnValue(mockCount(3000));
      ResidentialPropertyCustomerBuy.countDocuments.mockReturnValue(mockCount(2500));
      CommercialPropertyCustomerRent.countDocuments.mockReturnValue(mockCount(800));
      CommercialPropertyCustomerBuy.countDocuments.mockReturnValue(mockCount(1200));

      const result = await getTotalListingSummary(agentObj);

      expect(result.residentialPropertyRentCount).toBe(1000);
      expect(result.residentialPropertySellCount).toBe(2000);
      expect(result.commercialPropertyRentCount).toBe(500);
      expect(result.commercialPropertySellCount).toBe(1500);
      expect(result.residentialPropertyCustomerRentCount).toBe(3000);
      expect(result.residentialPropertyCustomerBuyCount).toBe(2500);
      expect(result.commercialPropertyCustomerRentCount).toBe(800);
      expect(result.commercialPropertyCustomerBuyCount).toBe(1200);
    });

    it('should handle employee with mixed assignments', async () => {
      const employeeObj = {
        req_user_id: 'employee-mixed',
        agent_id: 'agent-123'
      };

      const mockEmployee = {
        id: 'employee-mixed',
        assigned_residential_rent_properties: ['p1', 'p2', 'p3', 'p4', 'p5'],
        assigned_residential_sell_properties: [],
        assigned_commercial_rent_properties: ['p6', 'p7'],
        assigned_commercial_sell_properties: ['p8', 'p9', 'p10'],
        assigned_residential_rent_customers: [],
        assigned_residential_buy_customers: ['c1'],
        assigned_commercial_rent_customers: ['c2', 'c3', 'c4'],
        assigned_commercial_buy_customers: []
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployee)
        })
      });

      const result = await getTotalListingSummary(employeeObj);

      expect(result.residentialPropertyRentCount).toBe(5);
      expect(result.residentialPropertySellCount).toBe(0);
      expect(result.commercialPropertyRentCount).toBe(2);
      expect(result.commercialPropertySellCount).toBe(3);
      expect(result.residentialPropertyCustomerRentCount).toBe(0);
      expect(result.residentialPropertyCustomerBuyCount).toBe(1);
      expect(result.commercialPropertyCustomerRentCount).toBe(3);
      expect(result.commercialPropertyCustomerBuyCount).toBe(0);
    });
  });
});
