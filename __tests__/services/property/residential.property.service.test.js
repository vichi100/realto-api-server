// Mock all dependencies before requiring the service
jest.mock('../../../models/residentialPropertyRent');
jest.mock('../../../models/residentialPropertySell');
jest.mock('../../../models/match/residentialRentPropertyMatch');
jest.mock('../../../models/match/residentialBuyPropertyMatch');
jest.mock('../../../models/user');
jest.mock('../../../utils/logger');
jest.mock('fs');
jest.mock('sharp');
jest.mock('../../../services/utility.service');

const ResidentialPropertyRent = require('../../../models/residentialPropertyRent');
const ResidentialPropertySell = require('../../../models/residentialPropertySell');
const ResidentialRentPropertyMatch = require('../../../models/match/residentialRentPropertyMatch');
const ResidentialBuyPropertyMatch = require('../../../models/match/residentialBuyPropertyMatch');
const User = require('../../../models/user');
const logger = require('../../../utils/logger');
const fs = require('fs');
const sharp = require('sharp');
const utilityService = require('../../../services/utility.service');

const {
  addNewResidentialRentProperty,
  getResidentialPropertyListings,
  deleteResidentialProperty,
  closeResidentialProperty
} = require('../../../services/property/residential.property.service');

describe('Residential Property Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock utility service functions
    utilityService.getDirectoryPath.mockReturnValue('/test/dir/');
    utilityService.getFileName.mockReturnValue('test-file.jpg');
    utilityService.uniqueId.mockReturnValue('prop-12345');
  });

  describe('addNewResidentialRentProperty', () => {
    
    it('should create a residential rent property with images', async () => {
      const mockPropertyDetails = {
        body: {
          propertyFinalDetails: JSON.stringify({
            agent_id: 'agent-123',
            property_type: 'Residential',
            property_for: 'Rent',
            owner_details: {
              name: 'John Doe',
              mobile1: '1234567890',
              address: '123 Main St'
            },
            property_address: {
              city: 'Mumbai',
              flat_number: 'A-101',
              building_name: 'Tower A',
              landmark_or_street: 'Main Road',
              pin: '400001',
              location_area: {
                location: { type: 'Point', coordinates: [72.8777, 19.0760] },
                main_text: 'Andheri',
                formatted_address: 'Andheri, Mumbai'
              }
            },
            property_details: {
              house_type: 'Apartment',
              bhk_type: '2BHK',
              washroom_numbers: 2,
              furnishing_status: 'Semi-Furnished',
              parking_type: 'Covered',
              parking_number: 1,
              property_age: '5 years',
              floor_number: 3,
              total_floor: 10,
              lift: true,
              property_size: '1000 sqft'
            },
            rent_details: {
              expected_rent: 25000,
              expected_deposit: 50000,
              available_from: '2025-01-01',
              preferred_tenants: 'Family',
              non_veg_allowed: true
            }
          })
        },
        files: {
          image1: { data: Buffer.from('fake-image-data') }
        }
      };

      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockReturnValue(undefined);
      sharp.mockReturnValue({
        toFile: jest.fn((path, callback) => callback(null, { size: 1024 }))
      });
      
      ResidentialPropertyRent.create.mockResolvedValue({ property_id: 'prop-12345' });

      const result = await addNewResidentialRentProperty(mockPropertyDetails);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.property_id).toBe('prop-12345');
      expect(parsedResult.property_for).toBe('Rent');
      expect(parsedResult.rent_details.expected_rent).toBe(25000);
      expect(ResidentialPropertyRent.create).toHaveBeenCalled();
    });

    it('should create a residential sell property with images', async () => {
      const mockPropertyDetails = {
        body: {
          propertyFinalDetails: JSON.stringify({
            agent_id: 'agent-456',
            property_type: 'Residential',
            property_for: 'Sell',
            owner_details: {
              name: 'Jane Smith',
              mobile1: '9876543210',
              address: '456 Park Ave'
            },
            property_address: {
              city: 'Delhi',
              flat_number: 'B-202',
              building_name: 'Green Heights',
              landmark_or_street: 'Park Street',
              pin: '110001',
              location_area: {
                location: { type: 'Point', coordinates: [77.2090, 28.6139] },
                main_text: 'Connaught Place',
                formatted_address: 'CP, Delhi'
              }
            },
            property_details: {
              house_type: 'Villa',
              bhk_type: '3BHK',
              washroom_numbers: 3,
              furnishing_status: 'Fully-Furnished',
              parking_type: 'Open',
              parking_number: 2,
              property_age: '2 years',
              floor_number: 1,
              total_floor: 2,
              lift: false,
              property_size: '2000 sqft'
            },
            sell_details: {
              expected_sell_price: 5000000,
              maintenance_charge: 5000,
              available_from: '2025-02-01',
              negotiable: true
            }
          })
        },
        files: {}
      };

      fs.existsSync.mockReturnValue(true);
      ResidentialPropertySell.create.mockResolvedValue({ property_id: 'prop-12345' });

      const result = await addNewResidentialRentProperty(mockPropertyDetails);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.property_id).toBe('prop-12345');
      expect(parsedResult.property_for).toBe('Sell');
      expect(parsedResult.sell_details.expected_sell_price).toBe(5000000);
      expect(ResidentialPropertySell.create).toHaveBeenCalled();
    });

    it('should create directory if it does not exist', async () => {
      const mockPropertyDetails = {
        propertyFinalDetails: JSON.stringify({
          agent_id: 'agent-789',
          property_type: 'Residential',
          property_for: 'Rent',
          owner_details: { name: 'Test', mobile1: '1111111111', address: 'Test Address' },
          property_address: {
            city: 'Bangalore',
            flat_number: 'C-303',
            building_name: 'Tech Tower',
            landmark_or_street: 'MG Road',
            pin: '560001',
            location_area: {
              location: { type: 'Point', coordinates: [77.5946, 12.9716] },
              main_text: 'MG Road',
              formatted_address: 'MG Road, Bangalore'
            }
          },
          property_details: {
            house_type: 'Apartment',
            bhk_type: '1BHK',
            washroom_numbers: 1,
            furnishing_status: 'Unfurnished',
            parking_type: 'None',
            parking_number: 0,
            property_age: '10 years',
            floor_number: 5,
            total_floor: 15,
            lift: true,
            property_size: '600 sqft'
          },
          rent_details: {
            expected_rent: 15000,
            expected_deposit: 30000,
            available_from: '2025-03-01',
            preferred_tenants: 'Bachelor',
            non_veg_allowed: false
          }
        })
      };

      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockReturnValue(undefined);
      ResidentialPropertyRent.create.mockResolvedValue({ property_id: 'prop-12345' });

      await addNewResidentialRentProperty(mockPropertyDetails);

      expect(fs.mkdirSync).toHaveBeenCalled();
    });
  });

  describe('getResidentialPropertyListings', () => {
    
    it('should return all properties for an agent when reqUserId matches agent_id', async () => {
      const agentDetails = {
        agent_id: 'agent-123',
        req_user_id: 'agent-123'
      };

      const mockRentProperties = [
        { property_id: 'rent-1', update_date_time: new Date('2025-01-01') }
      ];
      const mockSellProperties = [
        { property_id: 'sell-1', update_date_time: new Date('2025-01-02') }
      ];

      ResidentialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRentProperties)
        })
      });

      ResidentialPropertySell.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSellProperties)
        })
      });

      const result = await getResidentialPropertyListings(agentDetails);

      expect(result).toHaveLength(2);
      expect(result[0].property_id).toBe('sell-1'); // More recent first
      expect(result[1].property_id).toBe('rent-1');
    });

    it('should return assigned properties for an employee', async () => {
      const employeeDetails = {
        agent_id: 'agent-123',
        req_user_id: 'employee-456'
      };

      const mockEmployee = {
        id: 'employee-456',
        assigned_residential_rent_properties: ['rent-1'],
        assigned_residential_sell_properties: ['sell-1']
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployee)
        })
      });

      ResidentialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([{ property_id: 'rent-1', update_date_time: new Date('2025-01-01') }])
        })
      });

      ResidentialPropertySell.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([{ property_id: 'sell-1', update_date_time: new Date('2025-01-02') }])
        })
      });

      const result = await getResidentialPropertyListings(employeeDetails);

      expect(result).toHaveLength(2);
      expect(User.findOne).toHaveBeenCalledWith({ id: 'employee-456' });
    });

    it('should handle errors gracefully', async () => {
      const agentDetails = {
        agent_id: 'agent-error',
        req_user_id: 'agent-error'
      };

      ResidentialPropertyRent.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const result = await getResidentialPropertyListings(agentDetails);

      expect(result).toBe('Internal Server Error');
    });
  });

  describe('deleteResidentialProperty', () => {
    
    it('should allow agent to delete their own property (Rent)', async () => {
      const deleteParams = {
        req_user_id: 'agent-123',
        dataToDelete: {
          property_id: 'prop-123',
          agent_id: 'agent-123',
          property_type: 'Residential',
          property_for: 'Rent'
        }
      };

      const mockAgent = {
        id: 'agent-123',
        user_type: 'agent',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAgent)
        })
      });

      ResidentialPropertyRent.deleteOne.mockResolvedValue({ deletedCount: 1 });
      ResidentialRentPropertyMatch.deleteMany.mockResolvedValue({ deletedCount: 1 });

      const result = await deleteResidentialProperty(deleteParams);

      expect(result).toBe('success');
      expect(ResidentialPropertyRent.deleteOne).toHaveBeenCalledWith({ property_id: 'prop-123' });
      expect(ResidentialRentPropertyMatch.deleteMany).toHaveBeenCalledWith({ property_id: 'prop-123' });
    });

    it('should allow agent to delete their own property (Sell)', async () => {
      const deleteParams = {
        req_user_id: 'agent-456',
        dataToDelete: {
          property_id: 'prop-456',
          agent_id: 'agent-456',
          property_type: 'Residential',
          property_for: 'Sell'
        }
      };

      const mockAgent = {
        id: 'agent-456',
        user_type: 'agent',
        works_for: 'agent-456'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAgent)
        })
      });

      ResidentialPropertySell.deleteOne.mockResolvedValue({ deletedCount: 1 });
      ResidentialBuyPropertyMatch.deleteMany.mockResolvedValue({ deletedCount: 1 });

      const result = await deleteResidentialProperty(deleteParams);

      expect(result).toBe('success');
      expect(ResidentialPropertySell.deleteOne).toHaveBeenCalledWith({ property_id: 'prop-456' });
    });

    it('should allow admin employee to delete property', async () => {
      const deleteParams = {
        req_user_id: 'employee-admin',
        dataToDelete: {
          property_id: 'prop-789',
          agent_id: 'agent-123',
          property_type: 'Residential',
          property_for: 'Rent'
        }
      };

      const mockEmployee = {
        id: 'employee-admin',
        user_type: 'employee',
        employee_role: 'admin',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployee)
        })
      });

      ResidentialPropertyRent.deleteOne.mockResolvedValue({ deletedCount: 1 });
      ResidentialRentPropertyMatch.deleteMany.mockResolvedValue({ deletedCount: 1 });

      const result = await deleteResidentialProperty(deleteParams);

      expect(result).toBe('success');
    });

    it('should deny access if user does not work for property agent', async () => {
      const deleteParams = {
        req_user_id: 'employee-other',
        dataToDelete: {
          property_id: 'prop-999',
          agent_id: 'agent-123',
          property_type: 'Residential',
          property_for: 'Rent'
        }
      };

      const mockEmployee = {
        id: 'employee-other',
        user_type: 'employee',
        works_for: 'agent-different'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployee)
        })
      });

      const result = await deleteResidentialProperty(deleteParams);

      expect(result).toBe('Unauthorized access');
      expect(ResidentialPropertyRent.deleteOne).not.toHaveBeenCalled();
    });

    it('should deny access for non-admin employee', async () => {
      const deleteParams = {
        req_user_id: 'employee-regular',
        dataToDelete: {
          property_id: 'prop-111',
          agent_id: 'agent-123',
          property_type: 'Residential',
          property_for: 'Rent'
        }
      };

      const mockEmployee = {
        id: 'employee-regular',
        user_type: 'employee',
        employee_role: 'regular',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployee)
        })
      });

      const result = await deleteResidentialProperty(deleteParams);

      expect(result).toBe('Unauthorized access');
    });

    it('should handle database errors during deletion', async () => {
      const deleteParams = {
        req_user_id: 'agent-123',
        dataToDelete: {
          property_id: 'prop-error',
          agent_id: 'agent-123',
          property_type: 'Residential',
          property_for: 'Rent'
        }
      };

      const mockAgent = {
        id: 'agent-123',
        user_type: 'agent',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAgent)
        })
      });

      ResidentialPropertyRent.deleteOne.mockRejectedValue(new Error('Database error'));

      const result = await deleteResidentialProperty(deleteParams);

      expect(result).toBe('Internal Server Error');
    });
  });

  describe('closeResidentialProperty', () => {
    
    it('should close (status 0->1) a residential rent property for agent', async () => {
      const closeParams = {
        req_user_id: 'agent-123',
        dataToClose: {
          property_id: 'prop-123',
          agent_id: 'agent-123',
          property_type: 'Residential',
          property_for: 'Rent',
          property_status: 0
        }
      };

      const mockAgent = {
        id: 'agent-123',
        user_type: 'agent',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAgent)
        })
      });

      ResidentialPropertyRent.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await closeResidentialProperty(closeParams);

      expect(result).toBe('success');
      expect(ResidentialPropertyRent.updateOne).toHaveBeenCalledWith(
        { property_id: 'prop-123' },
        expect.objectContaining({
          $set: expect.objectContaining({
            property_status: 1,
            is_close_successfully: 'yes'
          })
        })
      );
    });

    it('should reopen (status 1->0) a residential sell property for agent', async () => {
      const closeParams = {
        req_user_id: 'agent-456',
        dataToClose: {
          property_id: 'prop-456',
          agent_id: 'agent-456',
          property_type: 'Residential',
          property_for: 'Sell',
          property_status: 1
        }
      };

      const mockAgent = {
        id: 'agent-456',
        user_type: 'agent',
        works_for: 'agent-456'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAgent)
        })
      });

      ResidentialPropertySell.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await closeResidentialProperty(closeParams);

      expect(result).toBe('success');
      expect(ResidentialPropertySell.updateOne).toHaveBeenCalledWith(
        { property_id: 'prop-456' },
        expect.objectContaining({
          $set: expect.objectContaining({
            property_status: 0,
            is_close_successfully: 'yes'
          })
        })
      );
    });

    it('should allow employee to close property', async () => {
      const closeParams = {
        req_user_id: 'employee-789',
        dataToClose: {
          property_id: 'prop-789',
          agent_id: 'agent-123',
          property_type: 'Residential',
          property_for: 'Rent',
          property_status: 0
        }
      };

      const mockEmployee = {
        id: 'employee-789',
        user_type: 'employee',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployee)
        })
      });

      ResidentialPropertyRent.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await closeResidentialProperty(closeParams);

      expect(result).toBe('success');
    });

    it('should deny access if user does not work for property agent', async () => {
      const closeParams = {
        req_user_id: 'employee-other',
        dataToClose: {
          property_id: 'prop-999',
          agent_id: 'agent-123',
          property_type: 'Residential',
          property_for: 'Rent',
          property_status: 0
        }
      };

      const mockEmployee = {
        id: 'employee-other',
        user_type: 'employee',
        works_for: 'agent-different'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployee)
        })
      });

      const result = await closeResidentialProperty(closeParams);

      expect(result).toBe('Unauthorized access');
      expect(ResidentialPropertyRent.updateOne).not.toHaveBeenCalled();
    });

    it('should handle database errors during update', async () => {
      const closeParams = {
        req_user_id: 'agent-123',
        dataToClose: {
          property_id: 'prop-error',
          agent_id: 'agent-123',
          property_type: 'Residential',
          property_for: 'Rent',
          property_status: 0
        }
      };

      const mockAgent = {
        id: 'agent-123',
        user_type: 'agent',
        works_for: 'agent-123'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAgent)
        })
      });

      ResidentialPropertyRent.updateOne.mockRejectedValue(new Error('Database error'));

      const result = await closeResidentialProperty(closeParams);

      expect(result).toBe('Internal Server Error');
    });
  });
});
