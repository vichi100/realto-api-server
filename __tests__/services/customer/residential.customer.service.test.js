// Mock all dependencies before requiring the service
jest.mock('../../../models/residentialCustomerBuyLocation');
jest.mock('../../../models/residentialCustomerRentLocation');
jest.mock('../../../models/match/residentialRentCustomerMatch');
jest.mock('../../../models/match/residentialBuyCustomerMatch');
jest.mock('../../../models/user');
jest.mock('../../../models/residentialPropertyCustomerRent');
jest.mock('../../../models/residentialPropertyCustomerBuy');
jest.mock('../../../utils/logger');

// Mock uniqueId globally
global.uniqueId = jest.fn(() => 'test-customer-id-456');

const ResidentialCustomerBuyLocation = require('../../../models/residentialCustomerBuyLocation');
const ResidentialCustomerRentLocation = require('../../../models/residentialCustomerRentLocation');
const ResidentialRentCustomerMatch = require('../../../models/match/residentialRentCustomerMatch');
const ResidentialBuyCustomerMatch = require('../../../models/match/residentialBuyCustomerMatch');
const User = require('../../../models/user');
const ResidentialPropertyCustomerRent = require('../../../models/residentialPropertyCustomerRent');
const ResidentialPropertyCustomerBuy = require('../../../models/residentialPropertyCustomerBuy');
const logger = require('../../../utils/logger');

const {
  addNewResidentialCustomer,
  getResidentialCustomerList,
  deleteResidintialCustomer,
  closeResidintialCustomer
} = require('../../../services/customer/residential.customer.service');

describe('Residential Customer Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addNewResidentialCustomer', () => {
    
    it('should create a residential rent customer with locations', async () => {
      const mockCustomerData = {
        agent_id: 'agent-123',
        customer_details: {
          name: 'Alice Johnson',
          mobile1: '9876543210',
          address: '456 Park Ave'
        },
        customer_locality: {
          city: 'Mumbai',
          property_type: 'Residential',
          property_for: 'Rent',
          preferred_tenants: 'Family',
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
          house_type: 'Apartment',
          bhk_type: '2BHK',
          furnishing_status: 'Semi-Furnished',
          parking_type: 'Covered',
          lift: true
        },
        customer_rent_details: {
          expected_rent: 30000,
          expected_deposit: 90000,
          available_from: new Date('2024-01-01')
        }
      };

      ResidentialPropertyCustomerRent.create.mockResolvedValue({ customer_id: 'test-customer-id-456' });
      ResidentialCustomerRentLocation.create.mockResolvedValue([{ customer_id: 'test-customer-id-456' }]);

      const result = await addNewResidentialCustomer(mockCustomerData);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.customer_id).toBe('test-customer-id-456');
      expect(parsedResult.agent_id).toBe('agent-123');
      expect(parsedResult.customer_property_details.bhk_type).toBe('2BHK');
      expect(ResidentialPropertyCustomerRent.create).toHaveBeenCalledTimes(1);
      expect(ResidentialCustomerRentLocation.create).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should create a residential buy customer with locations', async () => {
      const mockCustomerData = {
        agent_id: 'agent-789',
        customer_details: {
          name: 'Bob Smith',
          mobile1: '9876543211',
          address: '789 Ocean Drive'
        },
        customer_locality: {
          city: 'Pune',
          property_type: 'Residential',
          property_for: 'Buy',
          preferred_tenants: 'N/A',
          location_area: [
            {
              location: {
                type: 'Point',
                coordinates: [73.8567, 18.5204]
              }
            }
          ]
        },
        customer_property_details: {
          house_type: 'Villa',
          bhk_type: '3BHK',
          furnishing_status: 'Fully-Furnished',
          parking_type: 'Open',
          lift: false
        },
        customer_buy_details: {
          expected_buy_price: 8000000,
          available_from: new Date('2024-02-01'),
          negotiable: true
        }
      };

      ResidentialPropertyCustomerBuy.create.mockResolvedValue({ customer_id: 'test-customer-id-456' });
      ResidentialCustomerBuyLocation.create.mockResolvedValue([{ customer_id: 'test-customer-id-456' }]);

      const result = await addNewResidentialCustomer(mockCustomerData);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.customer_id).toBe('test-customer-id-456');
      expect(parsedResult.agent_id).toBe('agent-789');
      expect(parsedResult.customer_property_details.bhk_type).toBe('3BHK');
      expect(ResidentialPropertyCustomerBuy.create).toHaveBeenCalledTimes(1);
      expect(ResidentialCustomerBuyLocation.create).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple locations for rent customer', async () => {
      const mockCustomerData = {
        agent_id: 'agent-999',
        customer_details: {
          name: 'Charlie Brown',
          mobile1: '9876543212',
          address: '123 Main St'
        },
        customer_locality: {
          city: 'Bangalore',
          property_type: 'Residential',
          property_for: 'Rent',
          preferred_tenants: 'Bachelor',
          location_area: [
            { location: { type: 'Point', coordinates: [77.5946, 12.9716] } },
            { location: { type: 'Point', coordinates: [77.6101, 12.9345] } }
          ]
        },
        customer_property_details: {
          house_type: 'Independent House',
          bhk_type: '4BHK',
          furnishing_status: 'Unfurnished',
          parking_type: 'Covered',
          lift: true
        },
        customer_rent_details: {
          expected_rent: 50000,
          expected_deposit: 150000,
          available_from: new Date('2024-03-01')
        }
      };

      ResidentialPropertyCustomerRent.create.mockResolvedValue({ customer_id: 'test-customer-id-456' });
      ResidentialCustomerRentLocation.create.mockResolvedValue([
        { customer_id: 'test-customer-id-456' },
        { customer_id: 'test-customer-id-456' }
      ]);

      const result = await addNewResidentialCustomer(mockCustomerData);

      expect(ResidentialCustomerRentLocation.create).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ customer_id: 'test-customer-id-456' }),
          expect.objectContaining({ customer_id: 'test-customer-id-456' })
        ])
      );
    });

    it('should handle multiple locations for buy customer', async () => {
      const mockCustomerData = {
        agent_id: 'agent-555',
        customer_details: {
          name: 'Diana Prince',
          mobile1: '9876543213',
          address: '555 Hero Lane'
        },
        customer_locality: {
          city: 'Delhi',
          property_type: 'Residential',
          property_for: 'Buy',
          preferred_tenants: 'N/A',
          location_area: [
            { location: { type: 'Point', coordinates: [77.2090, 28.6139] } },
            { location: { type: 'Point', coordinates: [77.1025, 28.7041] } },
            { location: { type: 'Point', coordinates: [77.3910, 28.5355] } }
          ]
        },
        customer_property_details: {
          house_type: 'Penthouse',
          bhk_type: '5BHK',
          furnishing_status: 'Fully-Furnished',
          parking_type: 'Covered',
          lift: true
        },
        customer_buy_details: {
          expected_buy_price: 15000000,
          available_from: new Date('2024-04-01'),
          negotiable: false
        }
      };

      ResidentialPropertyCustomerBuy.create.mockResolvedValue({ customer_id: 'test-customer-id-456' });
      ResidentialCustomerBuyLocation.create.mockResolvedValue([
        { customer_id: 'test-customer-id-456' },
        { customer_id: 'test-customer-id-456' },
        { customer_id: 'test-customer-id-456' }
      ]);

      const result = await addNewResidentialCustomer(mockCustomerData);

      expect(ResidentialCustomerBuyLocation.create).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ customer_id: 'test-customer-id-456' }),
          expect.objectContaining({ customer_id: 'test-customer-id-456' }),
          expect.objectContaining({ customer_id: 'test-customer-id-456' })
        ])
      );
    });
  });

  describe('getResidentialCustomerList', () => {
    
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

      ResidentialPropertyCustomerRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRentCustomers)
        })
      });
      
      ResidentialPropertyCustomerBuy.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockBuyCustomers)
        })
      });

      const result = await getResidentialCustomerList(agentDetails);

      expect(result).toEqual([...mockRentCustomers, ...mockBuyCustomers]);
      expect(ResidentialPropertyCustomerRent.find).toHaveBeenCalledWith({ agent_id: 'agent-123' });
      expect(ResidentialPropertyCustomerBuy.find).toHaveBeenCalledWith({ agent_id: 'agent-123' });
    });

    it('should return assigned customers for an employee', async () => {
      const employeeDetails = {
        agent_id: 'agent-123',
        req_user_id: 'employee-456'
      };

      const mockEmployee = {
        id: 'employee-456',
        assigned_residential_rent_customers: ['rent-1', 'rent-2'],
        assigned_residential_buy_customers: ['buy-1']
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

      ResidentialPropertyCustomerRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRentCustomers)
        })
      });

      ResidentialPropertyCustomerBuy.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockBuyCustomers)
        })
      });

      const result = await getResidentialCustomerList(employeeDetails);

      expect(result).toEqual([...mockRentCustomers, ...mockBuyCustomers]);
      expect(User.findOne).toHaveBeenCalledWith({ id: 'employee-456' });
      expect(ResidentialPropertyCustomerRent.find).toHaveBeenCalledWith({
        customer_id: { $in: ['rent-1', 'rent-2'] }
      });
      expect(ResidentialPropertyCustomerBuy.find).toHaveBeenCalledWith({
        customer_id: { $in: ['buy-1'] }
      });
    });

    it('should handle errors gracefully', async () => {
      const agentDetails = {
        agent_id: 'agent-123',
        req_user_id: 'agent-123'
      };

      ResidentialPropertyCustomerRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const result = await getResidentialCustomerList(agentDetails);

      expect(result).toBe('Internal Server Error');
    });
  });

  describe('deleteResidintialCustomer', () => {
    
    it('should allow agent to delete their own customer (Rent)', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToDelete: {
          customer_id: 'customer-1',
          agent_id: 'agent-123',
          customer_locality: {
            property_type: 'Residential',
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

      ResidentialPropertyCustomerRent.deleteOne.mockResolvedValue({ deletedCount: 1 });
      ResidentialRentCustomerMatch.deleteMany.mockResolvedValue({ deletedCount: 2 });

      const result = await deleteResidintialCustomer(reqData);

      expect(result).toBe('success');
      expect(ResidentialPropertyCustomerRent.deleteOne).toHaveBeenCalledWith({ customer_id: 'customer-1' });
      expect(ResidentialRentCustomerMatch.deleteMany).toHaveBeenCalledWith({ customer_id: 'customer-1' });
    });

    it('should allow agent to delete their own customer (Buy)', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToDelete: {
          customer_id: 'customer-2',
          agent_id: 'agent-123',
          customer_locality: {
            property_type: 'Residential',
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

      ResidentialPropertyCustomerBuy.deleteOne.mockResolvedValue({ deletedCount: 1 });
      ResidentialBuyCustomerMatch.deleteMany.mockResolvedValue({ deletedCount: 3 });

      const result = await deleteResidintialCustomer(reqData);

      expect(result).toBe('success');
      expect(ResidentialPropertyCustomerBuy.deleteOne).toHaveBeenCalledWith({ customer_id: 'customer-2' });
      expect(ResidentialBuyCustomerMatch.deleteMany).toHaveBeenCalledWith({ customer_id: 'customer-2' });
    });

    it('should allow admin employee to delete customer', async () => {
      const reqData = {
        req_user_id: 'employee-456',
        dataToDelete: {
          customer_id: 'customer-3',
          agent_id: 'agent-123',
          customer_locality: {
            property_type: 'Residential',
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

      ResidentialPropertyCustomerRent.deleteOne.mockResolvedValue({ deletedCount: 1 });
      ResidentialRentCustomerMatch.deleteMany.mockResolvedValue({ deletedCount: 1 });

      const result = await deleteResidintialCustomer(reqData);

      expect(result).toBe('success');
    });

    it('should deny access if user does not work for customer agent', async () => {
      const reqData = {
        req_user_id: 'employee-789',
        dataToDelete: {
          customer_id: 'customer-4',
          agent_id: 'agent-123',
          customer_locality: {
            property_type: 'Residential',
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

      const result = await deleteResidintialCustomer(reqData);

      expect(result).toBe('Unauthorized access');
      expect(ResidentialPropertyCustomerRent.deleteOne).not.toHaveBeenCalled();
    });

    it('should deny access for non-admin employee', async () => {
      const reqData = {
        req_user_id: 'employee-999',
        dataToDelete: {
          customer_id: 'customer-5',
          agent_id: 'agent-123',
          customer_locality: {
            property_type: 'Residential',
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

      const result = await deleteResidintialCustomer(reqData);

      expect(result).toBe('Unauthorized access');
    });

    it('should handle database errors during deletion', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToDelete: {
          customer_id: 'customer-6',
          agent_id: 'agent-123',
          customer_locality: {
            property_type: 'Residential',
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

      ResidentialPropertyCustomerRent.deleteOne.mockRejectedValue(new Error('Delete failed'));

      const result = await deleteResidintialCustomer(reqData);

      expect(result).toBe('Internal Server Error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('closeResidintialCustomer', () => {
    
    it('should close (status 0->1) a residential rent customer for agent', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToClose: {
          customer_id: 'customer-1',
          agent_id: 'agent-123',
          customer_status: 0,
          customer_locality: {
            property_type: 'Residential',
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

      ResidentialPropertyCustomerRent.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await closeResidintialCustomer(reqData);

      expect(result).toBe('success');
      expect(ResidentialPropertyCustomerRent.updateOne).toHaveBeenCalledWith(
        { customer_id: 'customer-1' },
        expect.objectContaining({
          $set: expect.objectContaining({
            customer_status: 1,
            is_close_successfully: 'yes'
          })
        })
      );
    });

    it('should reopen (status 1->0) a residential buy customer for agent', async () => {
      const reqData = {
        req_user_id: 'agent-456',
        dataToClose: {
          customer_id: 'customer-2',
          agent_id: 'agent-456',
          customer_status: 1,
          customer_locality: {
            property_type: 'Residential',
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

      ResidentialPropertyCustomerBuy.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await closeResidintialCustomer(reqData);

      expect(result).toBe('success');
      expect(ResidentialPropertyCustomerBuy.updateOne).toHaveBeenCalledWith(
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
            property_type: 'Residential',
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

      ResidentialPropertyCustomerRent.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await closeResidintialCustomer(reqData);

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
            property_type: 'Residential',
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

      const result = await closeResidintialCustomer(reqData);

      expect(result).toBe('Unauthorized access');
      expect(ResidentialPropertyCustomerBuy.updateOne).not.toHaveBeenCalled();
    });

    it('should handle database errors during update', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToClose: {
          customer_id: 'customer-5',
          agent_id: 'agent-123',
          customer_status: 0,
          customer_locality: {
            property_type: 'Residential',
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

      ResidentialPropertyCustomerRent.updateOne.mockRejectedValue(new Error('Update failed'));

      const result = await closeResidintialCustomer(reqData);

      expect(result).toBe('Internal Server Error');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
