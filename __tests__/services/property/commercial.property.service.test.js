// Mock all dependencies before requiring the service
jest.mock('../../../models/commercialPropertyRent');
jest.mock('../../../models/commercialPropertySell');
jest.mock('../../../models/match/commercialBuyPropertyMatch');
jest.mock('../../../models/match/commercialRentPropertyMatch');
jest.mock('../../../models/user');
jest.mock('../../../utils/logger');
jest.mock('../../../services/utility.service');
jest.mock('fs');
jest.mock('sharp');

const CommercialPropertyRent = require('../../../models/commercialPropertyRent');
const CommercialPropertySell = require('../../../models/commercialPropertySell');
const CommercialBuyPropertyMatch = require('../../../models/match/commercialBuyPropertyMatch');
const CommercialRentPropertyMatch = require('../../../models/match/commercialRentPropertyMatch');
const User = require('../../../models/user');
const logger = require('../../../utils/logger');
const { getDirectoryPath, getFileName, uniqueId } = require('../../../services/utility.service');
const fs = require('fs');
const sharp = require('sharp');

const {
  addNewCommercialProperty,
  getCommercialPropertyListings,
  deleteCommercialProperty,
  closeCommercialProperty
} = require('../../../services/property/commercial.property.service');

describe('Commercial Property Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    uniqueId.mockReturnValue('test-property-id-789');
    getDirectoryPath.mockReturnValue('/test/dir/');
    getFileName.mockReturnValue('test-image.jpeg');
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockReturnValue(undefined);
    
    // Mock sharp
    const sharpMock = jest.fn().mockReturnValue({
      toFile: jest.fn((path, callback) => callback(null, { size: 1024 }))
    });
    sharp.mockImplementation(sharpMock);
  });

  describe('addNewCommercialProperty', () => {
    
    it('should create a commercial rent property with images', async () => {
      const mockPropertyData = {
        body: {
          propertyFinalDetails: JSON.stringify({
            agent_id: 'agent-123',
            property_type: 'Commercial',
            property_for: 'Rent',
            owner_details: {
              name: 'John Doe',
              mobile1: '9876543210',
              address: '123 Business St'
            },
            property_address: {
              city: 'Mumbai',
              location_area: {
                location: {
                  type: 'Point',
                  coordinates: [72.8777, 19.0760]
                },
                main_text: 'Andheri West',
                formatted_address: 'Andheri West, Mumbai'
              },
              flat_number: 'A-101',
              building_name: 'Business Tower',
              landmark_or_street: 'Near Metro',
              pin: '400053'
            },
            property_details: {
              property_used_for: 'Office',
              building_type: 'Commercial Complex',
              ideal_for: 'IT Office',
              parking_type: 'Covered',
              property_age: '5 years',
              power_backup: 'Full',
              property_size: '2000'
            },
            rent_details: {
              expected_rent: 100000,
              expected_deposit: 300000,
              available_from: new Date('2024-01-01')
            }
          })
        },
        files: {
          image1: { data: Buffer.from('test') }
        }
      };

      CommercialPropertyRent.create.mockResolvedValue({ property_id: 'test-property-id-789' });

      const result = await addNewCommercialProperty(mockPropertyData);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.property_id).toBe('test-property-id-789');
      expect(parsedResult.agent_id).toBe('agent-123');
      expect(parsedResult.property_type).toBe('Commercial');
      expect(parsedResult.property_for).toBe('Rent');
      expect(parsedResult.rent_details.expected_rent).toBe(100000);
      expect(CommercialPropertyRent.create).toHaveBeenCalledTimes(1);
      expect(sharp).toHaveBeenCalled();
    });

    it('should create a commercial sell property with images', async () => {
      const mockPropertyData = {
        body: {
          propertyFinalDetails: JSON.stringify({
            agent_id: 'agent-456',
            property_type: 'Commercial',
            property_for: 'Sell',
            owner_details: {
              name: 'Jane Smith',
              mobile1: '9876543211',
              address: '456 Market Rd'
            },
            property_address: {
              city: 'Pune',
              location_area: {
                location: {
                  type: 'Point',
                  coordinates: [73.8567, 18.5204]
                },
                main_text: 'Koregaon Park',
                formatted_address: 'Koregaon Park, Pune'
              },
              flat_number: 'G-Floor',
              building_name: 'Trade Center',
              landmark_or_street: 'Main Road',
              pin: '411001'
            },
            property_details: {
              property_used_for: 'Retail',
              building_type: 'Shopping Complex',
              ideal_for: 'Store',
              parking_type: 'Open',
              property_age: '2 years',
              power_backup: 'Partial',
              property_size: '1500'
            },
            sell_details: {
              expected_sell_price: 15000000,
              maintenance_charge: 5000,
              available_from: new Date('2024-02-01'),
              negotiable: true
            }
          })
        },
        files: {
          image1: { data: Buffer.from('test1') },
          image2: { data: Buffer.from('test2') }
        }
      };

      CommercialPropertySell.create.mockResolvedValue({ property_id: 'test-property-id-789' });

      const result = await addNewCommercialProperty(mockPropertyData);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.property_id).toBe('test-property-id-789');
      expect(parsedResult.agent_id).toBe('agent-456');
      expect(parsedResult.property_for).toBe('Sell');
      expect(parsedResult.sell_details.expected_sell_price).toBe(15000000);
      expect(parsedResult.sell_details.negotiable).toBe(true);
      expect(CommercialPropertySell.create).toHaveBeenCalledTimes(1);
    });

    it('should create directory if it does not exist', async () => {
      fs.existsSync.mockReturnValue(false);

      const mockPropertyData = {
        propertyFinalDetails: JSON.stringify({
          agent_id: 'agent-789',
          property_type: 'Commercial',
          property_for: 'Rent',
          owner_details: { name: 'Test', mobile1: '1234567890', address: 'Test' },
          property_address: {
            city: 'Delhi',
            location_area: {
              location: { type: 'Point', coordinates: [77.2090, 28.6139] },
              main_text: 'CP',
              formatted_address: 'Connaught Place, Delhi'
            },
            flat_number: '1', building_name: 'Test', landmark_or_street: 'Test', pin: '110001'
          },
          property_details: {
            property_used_for: 'Office', building_type: 'Building', ideal_for: 'Business',
            parking_type: 'None', property_age: '10', power_backup: 'No', property_size: '1000'
          },
          rent_details: { expected_rent: 50000, expected_deposit: 150000, available_from: new Date() }
        }),
        files: {}
      };

      CommercialPropertyRent.create.mockResolvedValue({ property_id: 'test-property-id-789' });

      await addNewCommercialProperty(mockPropertyData);

      expect(fs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe('getCommercialPropertyListings', () => {
    
    it('should return all properties for an agent when reqUserId matches agent_id', async () => {
      const agentDetails = {
        agent_id: 'agent-123',
        req_user_id: 'agent-123'
      };

      const mockRentProperties = [
        { property_id: 'rent-1', agent_id: 'agent-123', update_date_time: new Date('2024-01-01') },
        { property_id: 'rent-2', agent_id: 'agent-123', update_date_time: new Date('2024-01-02') }
      ];
      const mockSellProperties = [
        { property_id: 'sell-1', agent_id: 'agent-123', update_date_time: new Date('2024-01-03') }
      ];

      CommercialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRentProperties)
        })
      });
      
      CommercialPropertySell.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSellProperties)
        })
      });

      const result = await getCommercialPropertyListings(agentDetails);

      expect(result).toHaveLength(3);
      expect(result[0].property_id).toBe('sell-1'); // Most recent
      expect(CommercialPropertyRent.find).toHaveBeenCalledWith({ agent_id: 'agent-123' });
      expect(CommercialPropertySell.find).toHaveBeenCalledWith({ agent_id: 'agent-123' });
    });

    it('should return assigned properties for an employee', async () => {
      const employeeDetails = {
        agent_id: 'agent-123',
        req_user_id: 'employee-456'
      };

      const mockEmployee = {
        id: 'employee-456',
        assigned_commercial_rent_properties: ['rent-1', 'rent-2'],
        assigned_commercial_sell_properties: ['sell-1']
      };

      const mockRentProperties = [
        { property_id: 'rent-1', update_date_time: new Date('2024-01-01') },
        { property_id: 'rent-2', update_date_time: new Date('2024-01-02') }
      ];
      const mockSellProperties = [
        { property_id: 'sell-1', update_date_time: new Date('2024-01-03') }
      ];

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployee)
        })
      });

      CommercialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRentProperties)
        })
      });

      CommercialPropertySell.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSellProperties)
        })
      });

      const result = await getCommercialPropertyListings(employeeDetails);

      expect(result).toHaveLength(3);
      expect(User.findOne).toHaveBeenCalledWith({ id: 'employee-456' });
      expect(CommercialPropertyRent.find).toHaveBeenCalledWith({
        property_id: { $in: ['rent-1', 'rent-2'] }
      });
      expect(CommercialPropertySell.find).toHaveBeenCalledWith({
        property_id: { $in: ['sell-1'] }
      });
    });

    it('should handle employee not found', async () => {
      const employeeDetails = {
        agent_id: 'agent-123',
        req_user_id: 'employee-999'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await getCommercialPropertyListings(employeeDetails);

      expect(result).toEqual({
        errorCode: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found'
      });
    });

    it('should handle errors gracefully', async () => {
      const agentDetails = {
        agent_id: 'agent-123',
        req_user_id: 'agent-123'
      };

      CommercialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const result = await getCommercialPropertyListings(agentDetails);

      expect(result).toBe('Internal Server Error');
    });
  });

  describe('deleteCommercialProperty', () => {
    
    it('should allow agent to delete their own property (Rent)', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToDelete: {
          property_id: 'property-1',
          agent_id: 'agent-123',
          property_type: 'Commercial',
          property_for: 'Rent'
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

      CommercialPropertyRent.deleteOne.mockResolvedValue({ deletedCount: 1 });
      CommercialRentPropertyMatch.deleteMany.mockResolvedValue({ deletedCount: 2 });

      const result = await deleteCommercialProperty(reqData);

      expect(result).toBe('success');
      expect(CommercialPropertyRent.deleteOne).toHaveBeenCalledWith({ property_id: 'property-1' });
      expect(CommercialRentPropertyMatch.deleteMany).toHaveBeenCalledWith({ property_id: 'property-1' });
    });

    it('should allow agent to delete their own property (Sell)', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToDelete: {
          property_id: 'property-2',
          agent_id: 'agent-123',
          property_type: 'Commercial',
          property_for: 'Sell'
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

      CommercialPropertySell.deleteOne.mockResolvedValue({ deletedCount: 1 });
      CommercialBuyPropertyMatch.deleteMany.mockResolvedValue({ deletedCount: 3 });

      const result = await deleteCommercialProperty(reqData);

      expect(result).toBe('success');
      expect(CommercialPropertySell.deleteOne).toHaveBeenCalledWith({ property_id: 'property-2' });
      expect(CommercialBuyPropertyMatch.deleteMany).toHaveBeenCalledWith({ property_id: 'property-2' });
    });

    it('should allow admin employee to delete property', async () => {
      const reqData = {
        req_user_id: 'employee-456',
        dataToDelete: {
          property_id: 'property-3',
          agent_id: 'agent-123',
          property_type: 'Commercial',
          property_for: 'Rent'
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

      CommercialPropertyRent.deleteOne.mockResolvedValue({ deletedCount: 1 });
      CommercialRentPropertyMatch.deleteMany.mockResolvedValue({ deletedCount: 1 });

      const result = await deleteCommercialProperty(reqData);

      expect(result).toBe('success');
    });

    it('should deny access if user does not work for property agent', async () => {
      const reqData = {
        req_user_id: 'employee-789',
        dataToDelete: {
          property_id: 'property-4',
          agent_id: 'agent-123',
          property_type: 'Commercial',
          property_for: 'Rent'
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

      const result = await deleteCommercialProperty(reqData);

      expect(result).toBe('Unauthorized access');
      expect(CommercialPropertyRent.deleteOne).not.toHaveBeenCalled();
    });

    it('should deny access for non-admin employee', async () => {
      const reqData = {
        req_user_id: 'employee-999',
        dataToDelete: {
          property_id: 'property-5',
          agent_id: 'agent-123',
          property_type: 'Commercial',
          property_for: 'Sell'
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

      const result = await deleteCommercialProperty(reqData);

      expect(result).toBe('Unauthorized access');
    });

    it('should handle database errors during deletion', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToDelete: {
          property_id: 'property-6',
          agent_id: 'agent-123',
          property_type: 'Commercial',
          property_for: 'Rent'
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

      CommercialPropertyRent.deleteOne.mockRejectedValue(new Error('Delete failed'));

      const result = await deleteCommercialProperty(reqData);

      expect(result).toBe('Internal Server Error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('closeCommercialProperty', () => {
    
    it('should close (status 0->1) a commercial rent property for agent', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToClose: {
          property_id: 'property-1',
          agent_id: 'agent-123',
          property_status: 0,
          property_type: 'Commercial',
          property_for: 'Rent'
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

      CommercialPropertyRent.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await closeCommercialProperty(reqData);

      expect(result).toBe('success');
      expect(CommercialPropertyRent.updateOne).toHaveBeenCalledWith(
        { property_id: 'property-1' },
        expect.objectContaining({
          $set: expect.objectContaining({
            property_status: 1,
            is_close_successfully: 'yes'
          })
        })
      );
    });

    it('should reopen (status 1->0) a commercial sell property for agent', async () => {
      const reqData = {
        req_user_id: 'agent-456',
        dataToClose: {
          property_id: 'property-2',
          agent_id: 'agent-456',
          property_status: 1,
          property_type: 'Commercial',
          property_for: 'Sell'
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

      CommercialPropertySell.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await closeCommercialProperty(reqData);

      expect(result).toBe('success');
      expect(CommercialPropertySell.updateOne).toHaveBeenCalledWith(
        { property_id: 'property-2' },
        expect.objectContaining({
          $set: expect.objectContaining({
            property_status: 0,
            is_close_successfully: 'yes'
          })
        })
      );
    });

    it('should allow employee to close property', async () => {
      const reqData = {
        req_user_id: 'employee-789',
        dataToClose: {
          property_id: 'property-3',
          agent_id: 'agent-123',
          property_status: 0,
          property_type: 'Commercial',
          property_for: 'Rent'
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

      CommercialPropertyRent.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await closeCommercialProperty(reqData);

      expect(result).toBe('success');
    });

    it('should deny access if user does not work for property agent', async () => {
      const reqData = {
        req_user_id: 'employee-999',
        dataToClose: {
          property_id: 'property-4',
          agent_id: 'agent-123',
          property_status: 0,
          property_type: 'Commercial',
          property_for: 'Sell'
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

      const result = await closeCommercialProperty(reqData);

      expect(result).toBe('Unauthorized access');
      expect(CommercialPropertySell.updateOne).not.toHaveBeenCalled();
    });

    it('should handle database errors during update', async () => {
      const reqData = {
        req_user_id: 'agent-123',
        dataToClose: {
          property_id: 'property-5',
          agent_id: 'agent-123',
          property_status: 0,
          property_type: 'Commercial',
          property_for: 'Rent'
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

      CommercialPropertyRent.updateOne.mockRejectedValue(new Error('Update failed'));

      const result = await closeCommercialProperty(reqData);

      expect(result).toBe('Internal Server Error');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
