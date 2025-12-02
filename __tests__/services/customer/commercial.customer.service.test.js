// Mock all dependencies before requiring the service
jest.mock('../../../models/commercialCustomerBuyLocation');
jest.mock('../../../models/commercialCustomerRentLocation');
jest.mock('../../../models/match/commercialBuyCustomerMatch');
jest.mock('../../../models/match/commercialRentCustomerMatch');
jest.mock('../../../models/user');
jest.mock('../../../models/commercialPropertyCustomerRent');
jest.mock('../../../models/commercialPropertyCustomerBuy');
jest.mock('../../../utils/logger');

// Mock uniqueId globally
global.uniqueId = jest.fn(() => 'test-customer-id-123');

const CommercialCustomerBuyLocation = require('../../../models/commercialCustomerBuyLocation');
const CommercialCustomerRentLocation = require('../../../models/commercialCustomerRentLocation');
const CommercialBuyCustomerMatch = require('../../../models/match/commercialBuyCustomerMatch');
const CommercialRentCustomerMatch = require('../../../models/match/commercialRentCustomerMatch');
const User = require('../../../models/user');
const CommercialPropertyCustomerRent = require('../../../models/commercialPropertyCustomerRent');
const CommercialPropertyCustomerBuy = require('../../../models/commercialPropertyCustomerBuy');
const logger = require('../../../utils/logger');

const {
  addNewCommercialCustomer,
  getCommercialCustomerListings,
  deleteCommercialCustomer,
  closeCommercialCustomer
} = require('../../../services/customer/commercial.customer.service');

describe('Commercial Customer Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addNewCommercialCustomer', () => {
    
    it('should create a commercial rent customer with locations', async () => {
      const mockCustomerData = {
        agent_id: 'agent-123',
        customer_details: {
          name: 'John Doe',
          mobile1: '9876543210',
          address: '123 Test St'
        },
        customer_locality: {
          city: 'Mumbai',
          property_type: 'Commercial',
          property_for: 'Rent',
          location_area: [
            {
              location: {
                type: 'Point',
                coordinates: [72.8777, 19.0760]
              }
            }
          ]
        },
        customer_property_details: {
          building_type: 'Office',
          parking_type: 'Covered',
          property_used_for: 'Office Space',
          property_size: '1000'
        },
        customer_rent_details: {
          expected_rent: 50000,
          expected_deposit: 150000,
          available_from: new Date('2024-01-01')
        }
      };

      CommercialPropertyCustomerRent.create.mockResolvedValue({ customer_id: 'test-customer-id-123' });
      CommercialCustomerRentLocation.create.mockResolvedValue([{ customer_id: 'test-customer-id-123' }]);

      const result = await addNewCommercialCustomer(mockCustomerData);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.customer_id).toBe('test-customer-id-123');
      expect(parsedResult.agent_id).toBe('agent-123');
      expect(CommercialPropertyCustomerRent.create).toHaveBeenCalledTimes(1);
      expect(CommercialCustomerRentLocation.create).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should create a commercial buy customer with locations', async () => {
      const mockCustomerData = {
        agent_id: 'agent-456',
        customer_details: {
          name: 'Jane Smith',
          mobile1: '9876543211',
          address: '456 Test Ave'
        },
        customer_locality: {
          city: 'Delhi',
          property_type: 'Commercial',
          property_for: 'Buy',
          location_area: [
            {
              location: {
                type: 'Point',
                coordinates: [77.2090, 28.6139]
              }
            }
          ]
        },
        customer_property_details: {
          building_type: 'Shop',
          parking_type: 'Open',
          property_used_for: 'Retail',
          property_size: '500'
        },
        customer_buy_details: {
          expected_buy_price: 5000000,
          available_from: new Date('2024-02-01'),
          negotiable: true
        }
      };

      CommercialPropertyCustomerBuy.create.mockResolvedValue({ customer_id: 'test-customer-id-123' });
      CommercialCustomerBuyLocation.create.mockResolvedValue([{ customer_id: 'test-customer-id-123' }]);

      const result = await addNewCommercialCustomer(mockCustomerData);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.customer_id).toBe('test-customer-id-123');
      expect(parsedResult.agent_id).toBe('agent-456');
      expect(CommercialPropertyCustomerBuy.create).toHaveBeenCalledTimes(1);
      expect(CommercialCustomerBuyLocation.create).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple locations for rent customer', async () => {
      const mockCustomerData = {
        agent_id: 'agent-789',
        customer_details: {
          name: 'Bob Johnson',
          mobile1: '9876543212',
          address: '789 Test Rd'
        },
        customer_locality: {
          city: 'Bangalore',
          property_type: 'Commercial',
          property_for: 'Rent',
          location_area: [
            { location: { type: 'Point', coordinates: [77.5946, 12.9716] } },
            { location: { type: 'Point', coordinates: [77.6101, 12.9345] } }
          ]
        },
        customer_property_details: {
          building_type: 'Warehouse',
          parking_type: 'Covered',
          property_used_for: 'Storage',
          property_size: '2000'
        },
        customer_rent_details: {
          expected_rent: 75000,
          expected_deposit: 225000,
          available_from: new Date('2024-03-01')
        }
      };

      CommercialPropertyCustomerRent.create.mockResolvedValue({ customer_id: 'test-customer-id-123' });
      CommercialCustomerRentLocation.create.mockResolvedValue([
        { customer_id: 'test-customer-id-123' },
        { customer_id: 'test-customer-id-123' }
      ]);

      const result = await addNewCommercialCustomer(mockCustomerData);

      expect(CommercialCustomerRentLocation.create).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ customer_id: 'test-customer-id-123' }),
          expect.objectContaining({ customer_id: 'test-customer-id-123' })
        ])
      );
    });
  });

  describe('getCommercialCustomerListings', () => {
    
    it('should return all customers for an agent when agent_id matches req_user_id', async () => {
      const agentDetails = {
        agent_id: 'agent-123',
        req_user_id: 'agent-123'
      };

      const mockRentCustomers = [
        { customer_id: 'rent-1', agent_id: 'agent-123' },
        { customer_id: 'rent-2', agent_id: 'agent-123' }
      ];
      const mockBuyCustomers = [
        { customer_id: 'buy-1', agent_id: 'agent-123' }
      ];

      CommercialPropertyCustomerRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRentCustomers)
        })
      });
      
      CommercialPropertyCustomerBuy.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockBuyCustomers)
        })
      });

      const result = await getCommercialCustomerListings(agentDetails);

      expect(result).toEqual([...mockRentCustomers, ...mockBuyCustomers]);
      expect(CommercialPropertyCustomerRent.find).toHaveBeenCalledWith({ agent_id: 'agent-123' });
      expect(CommercialPropertyCustomerBuy.find).toHaveBeenCalledWith({ agent_id: 'agent-123' });
    });

    it('should return assigned customers for an employee', async () => {
      const employeeDetails = {
        agent_id: 'agent-123',
        req_user_id: 'employee-456'
      };

      const mockEmployee = {
        id: 'employee-456',
        assigned_commercial_rent_customers: ['rent-1', 'rent-2'],
        assigned_commercial_buy_customers: ['buy-1']
      };

      const mockRentCustomers = [
        { customer_id: 'rent-1' },
        { customer_id: 'rent-2' }
      ];
      const mockBuyCustomers = [
        { customer_id: 'buy-1' }
      ];

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployee)
        })
      });

      CommercialPropertyCustomerRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRentCustomers)
        })
      });

      CommercialPropertyCustomerBuy.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockBuyCustomers)
        })
      });

      const result = await getCommercialCustomerListings(employeeDetails);

      expect(result).toEqual([...mockRentCustomers, ...mockBuyCustomers]);
      expect(User.findOne).toHaveBeenCalledWith({ id: 'employee-456' });
      expect(CommercialPropertyCustomerRent.find).toHaveBeenCalledWith({
        customer_id: { $in: ['rent-1', 'rent-2'] }
      });
      expect(CommercialPropertyCustomerBuy.find).toHaveBeenCalledWith({
        customer_id: { $in: ['buy-1'] }
      });
    });

    it('should handle errors gracefully', async () => {
      const agentDetails = {
        agent_id: 'agent-123',
        req_user_id: 'agent-123'
      };

      CommercialPropertyCustomerRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const result = await getCommercialCustomerListings(agentDetails);

      expect(result).toBe('Internal Server Error');
    });
  });

  describe('deleteCommercialCustomer', () => {
    
    it('should allow agent to delete their own customer (Rent)', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToDelete: {
          customer_id: 'customer-1',
          agent_id: 'agent-123',
          customer_locality: {
            property_type: 'Commercial',
            property_for: 'Rent'
          }
        }
      };

      const mockUser = {
        id: 'agent-123',
        user_type: 'agent',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      CommercialPropertyCustomerRent.deleteOne.mockResolvedValue({ deletedCount: 1 });
      CommercialRentCustomerMatch.deleteMany.mockResolvedValue({ deletedCount: 2 });

      const result = await deleteCommercialCustomer(reqData);

      expect(result).toBe('success');
      expect(CommercialPropertyCustomerRent.deleteOne).toHaveBeenCalledWith({ customer_id: 'customer-1' });
      expect(CommercialRentCustomerMatch.deleteMany).toHaveBeenCalledWith({ customer_id: 'customer-1' });
    });

    it('should allow agent to delete their own customer (Buy)', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToDelete: {
          customer_id: 'customer-2',
          agent_id: 'agent-123',
          customer_locality: {
            property_type: 'Commercial',
            property_for: 'Buy'
          }
        }
      };

      const mockUser = {
        id: 'agent-123',
        user_type: 'agent',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      CommercialPropertyCustomerBuy.deleteOne.mockResolvedValue({ deletedCount: 1 });
      CommercialBuyCustomerMatch.deleteMany.mockResolvedValue({ deletedCount: 3 });

      const result = await deleteCommercialCustomer(reqData);

      expect(result).toBe('success');
      expect(CommercialPropertyCustomerBuy.deleteOne).toHaveBeenCalledWith({ customer_id: 'customer-2' });
      expect(CommercialBuyCustomerMatch.deleteMany).toHaveBeenCalledWith({ customer_id: 'customer-2' });
    });

    it('should allow admin employee to delete customer', async () => {
      const reqData = {
        req_user_id: 'employee-456',
        dataToDelete: {
          customer_id: 'customer-3',
          agent_id: 'agent-123',
          customer_locality: {
            property_type: 'Commercial',
            property_for: 'Rent'
          }
        }
      };

      const mockUser = {
        id: 'employee-456',
        user_type: 'employee',
        employee_role: 'admin',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      CommercialPropertyCustomerRent.deleteOne.mockResolvedValue({ deletedCount: 1 });
      CommercialRentCustomerMatch.deleteMany.mockResolvedValue({ deletedCount: 1 });

      const result = await deleteCommercialCustomer(reqData);

      expect(result).toBe('success');
    });

    it('should deny access if user does not work for customer agent', async () => {
      const reqData = {
        req_user_id: 'employee-789',
        dataToDelete: {
          customer_id: 'customer-4',
          agent_id: 'agent-123',
          customer_locality: {
            property_type: 'Commercial',
            property_for: 'Rent'
          }
        }
      };

      const mockUser = {
        id: 'employee-789',
        user_type: 'employee',
        works_for: 'different-agent'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      const result = await deleteCommercialCustomer(reqData);

      expect(result).toBe('Unauthorized access');
      expect(CommercialPropertyCustomerRent.deleteOne).not.toHaveBeenCalled();
    });

    it('should deny access for non-admin employee', async () => {
      const reqData = {
        req_user_id: 'employee-999',
        dataToDelete: {
          customer_id: 'customer-5',
          agent_id: 'agent-123',
          customer_locality: {
            property_type: 'Commercial',
            property_for: 'Buy'
          }
        }
      };

      const mockUser = {
        id: 'employee-999',
        user_type: 'employee',
        employee_role: 'staff',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      const result = await deleteCommercialCustomer(reqData);

      expect(result).toBe('Unauthorized access');
    });

    it('should handle database errors during deletion', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToDelete: {
          customer_id: 'customer-6',
          agent_id: 'agent-123',
          customer_locality: {
            property_type: 'Commercial',
            property_for: 'Rent'
          }
        }
      };

      const mockUser = {
        id: 'agent-123',
        user_type: 'agent',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      CommercialPropertyCustomerRent.deleteOne.mockRejectedValue(new Error('Delete failed'));

      const result = await deleteCommercialCustomer(reqData);

      expect(result).toBe('Internal Server Error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('closeCommercialCustomer', () => {
    
    it('should close (status 0->1) a commercial rent customer for agent', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToClose: {
          customer_id: 'customer-1',
          agent_id: 'agent-123',
          customer_status: 0,
          customer_locality: {
            property_type: 'Commercial',
            property_for: 'Rent'
          }
        }
      };

      const mockUser = {
        id: 'agent-123',
        user_type: 'agent',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      CommercialPropertyCustomerRent.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await closeCommercialCustomer(reqData);

      expect(result).toBe('success');
      expect(CommercialPropertyCustomerRent.updateOne).toHaveBeenCalledWith(
        { customer_id: 'customer-1' },
        expect.objectContaining({
          $set: expect.objectContaining({
            customer_status: 1,
            is_close_successfully: 'yes'
          })
        })
      );
    });

    it('should reopen (status 1->0) a commercial buy customer for agent', async () => {
      const reqData = {
        req_user_id: 'agent-456',
        dataToClose: {
          customer_id: 'customer-2',
          agent_id: 'agent-456',
          customer_status: 1,
          customer_locality: {
            property_type: 'Commercial',
            property_for: 'Buy'
          }
        }
      };

      const mockUser = {
        id: 'agent-456',
        user_type: 'agent',
        works_for: 'agent-456'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      CommercialPropertyCustomerBuy.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await closeCommercialCustomer(reqData);

      expect(result).toBe('success');
      expect(CommercialPropertyCustomerBuy.updateOne).toHaveBeenCalledWith(
        { customer_id: 'customer-2' },
        expect.objectContaining({
          $set: expect.objectContaining({
            customer_status: 0,
            is_close_successfully: 'yes'
          })
        })
      );
    });

    it('should allow employee to close customer', async () => {
      const reqData = {
        req_user_id: 'employee-789',
        dataToClose: {
          customer_id: 'customer-3',
          agent_id: 'agent-123',
          customer_status: 0,
          customer_locality: {
            property_type: 'Commercial',
            property_for: 'Rent'
          }
        }
      };

      const mockUser = {
        id: 'employee-789',
        user_type: 'employee',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      CommercialPropertyCustomerRent.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await closeCommercialCustomer(reqData);

      expect(result).toBe('success');
    });

    it('should deny access if user does not work for customer agent', async () => {
      const reqData = {
        req_user_id: 'employee-999',
        dataToClose: {
          customer_id: 'customer-4',
          agent_id: 'agent-123',
          customer_status: 0,
          customer_locality: {
            property_type: 'Commercial',
            property_for: 'Buy'
          }
        }
      };

      const mockUser = {
        id: 'employee-999',
        user_type: 'employee',
        works_for: 'different-agent'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      const result = await closeCommercialCustomer(reqData);

      expect(result).toBe('Unauthorized access');
      expect(CommercialPropertyCustomerBuy.updateOne).not.toHaveBeenCalled();
    });

    it('should handle database errors during update', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToClose: {
          customer_id: 'customer-5',
          agent_id: 'agent-123',
          customer_status: 0,
          customer_locality: {
            property_type: 'Commercial',
            property_for: 'Rent'
          }
        }
      };

      const mockUser = {
        id: 'agent-123',
        user_type: 'agent',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      CommercialPropertyCustomerRent.updateOne.mockRejectedValue(new Error('Update failed'));

      const result = await closeCommercialCustomer(reqData);

      expect(result).toBe('Internal Server Error');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
