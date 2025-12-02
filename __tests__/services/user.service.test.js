const userService = require('../../services/user.service');

// Mock all models
jest.mock('../../models/commercialPropertyRent');
jest.mock('../../models/commercialPropertySell');
jest.mock('../../models/residentialPropertyRent');
jest.mock('../../models/residentialPropertySell');
jest.mock('../../models/reminder');
jest.mock('../../models/user');
jest.mock('../../models/residentialPropertyCustomerRent');
jest.mock('../../models/residentialPropertyCustomerBuy');
jest.mock('../../models/commercialPropertyCustomerRent');
jest.mock('../../models/commercialPropertyCustomerBuy');

// Mock utility service
jest.mock('../../services/utility.service', () => {
  let callCount = 0;
  const mockUniqueId = jest.fn(() => {
    callCount++;
    return `unique-id-${callCount}`;
  });
  return {
    uniqueId: mockUniqueId
  };
});

// Mock logger
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

// Suppress console.error for cleaner test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

const CommercialPropertyRent = require('../../models/commercialPropertyRent');
const CommercialPropertySell = require('../../models/commercialPropertySell');
const ResidentialPropertyRent = require('../../models/residentialPropertyRent');
const ResidentialPropertySell = require('../../models/residentialPropertySell');
const ResidentialPropertyCustomerRent = require('../../models/residentialPropertyCustomerRent');
const ResidentialPropertyCustomerBuy = require('../../models/residentialPropertyCustomerBuy');
const CommercialPropertyCustomerRent = require('../../models/commercialPropertyCustomerRent');
const CommercialPropertyCustomerBuy = require('../../models/commercialPropertyCustomerBuy');
const Reminder = require('../../models/reminder');
const User = require('../../models/user');
const { uniqueId } = require('../../services/utility.service');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkLoginRole', () => {
    it('should return existing agent user details when user exists', async () => {
      const userDetails = { user_mobile: '+919876543210' };
      const mockUser = {
        user_type: 'agent',
        id: 'agent123',
        expo_token: 'expo-token-123',
        name: 'John Doe',
        company_name: 'Real Estate Co',
        mobile: '+919876543210',
        address: '123 Main St',
        city: 'Mumbai',
        access_rights: 'all',
        user_status: 'active'
      };

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      const result = await userService.checkLoginRole(userDetails);

      expect(result.user_details).toBeDefined();
      expect(result.user_details.user_type).toBe('agent');
      expect(result.user_details.id).toBe('agent123');
      expect(result.user_details.mobile).toBe('+919876543210');
      expect(result.user_details.works_for).toBe('agent123');
      expect(User.findOne).toHaveBeenCalledWith({ mobile: '+919876543210' });
    });

    it('should create new agent user when user does not exist', async () => {
      const userDetails = { user_mobile: '+919999999999' };

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      User.collection = {
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-id' })
      };

      const result = await userService.checkLoginRole(userDetails);

      expect(result.user_details).toBeDefined();
      expect(result.user_details.user_type).toBe('agent');
      expect(result.user_details.mobile).toBe('+919999999999');
      expect(result.user_details.access_rights).toBe('all');
      expect(User.collection.insertOne).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const userDetails = { user_mobile: '+919876543210' };

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const result = await userService.checkLoginRole(userDetails);

      expect(result).toBe('fail');
    });

    it('should set works_for to user id for agent', async () => {
      const userDetails = { user_mobile: '+919876543210' };
      const mockUser = {
        user_type: 'agent',
        id: 'agent456',
        expo_token: null,
        name: 'Jane Smith',
        company_name: 'Property Solutions',
        mobile: '+919876543210',
        address: '456 Park Ave',
        city: 'Delhi',
        access_rights: 'all',
        user_status: 'active'
      };

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      const result = await userService.checkLoginRole(userDetails);

      expect(result.user_details.works_for).toBe(result.user_details.id);
      expect(result.user_details.works_for).toBe('agent456');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const profileDetails = {
        user_id: 'user123',
        name: 'John Updated',
        company: 'Updated Company',
        city: 'Bangalore',
        email: 'john@example.com'
      };

      User.collection = {
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
      };

      const result = await userService.updateUserProfile(profileDetails);

      expect(result).toBe('success');
      expect(User.collection.updateOne).toHaveBeenCalledWith(
        { id: 'user123' },
        {
          $set: {
            name: 'John Updated',
            company_name: 'Updated Company',
            city: 'Bangalore',
            email: 'john@example.com'
          }
        }
      );
    });

    it('should handle update errors', async () => {
      const profileDetails = {
        user_id: 'user123',
        name: 'John',
        company: 'Company',
        city: 'Mumbai',
        email: 'john@example.com'
      };

      const dbError = new Error('Database error');
      User.collection = {
        updateOne: jest.fn().mockRejectedValue(dbError)
      };

      const result = await userService.updateUserProfile(profileDetails);

      expect(result).toEqual(dbError);
    });

    it('should update all profile fields correctly', async () => {
      const profileDetails = {
        user_id: 'user456',
        name: 'Jane Doe',
        company: 'Real Estate Solutions',
        city: 'Chennai',
        email: 'jane.doe@example.com'
      };

      User.collection = {
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
      };

      await userService.updateUserProfile(profileDetails);

      const updateCall = User.collection.updateOne.mock.calls[0];
      expect(updateCall[1].$set.name).toBe('Jane Doe');
      expect(updateCall[1].$set.company_name).toBe('Real Estate Solutions');
      expect(updateCall[1].$set.city).toBe('Chennai');
      expect(updateCall[1].$set.email).toBe('jane.doe@example.com');
    });
  });

  describe('deleteAgentAccount', () => {
    it('should delete agent account and all related data when authorized', async () => {
      const agentObj = {
        agent_id: 'agent123',
        req_user_id: 'agent123'
      };

      const mockEmployees = [
        { id: 'emp1', works_for: 'agent123', user_type: 'employee' },
        { id: 'emp2', works_for: 'agent123', user_type: 'employee' }
      ];

      ResidentialPropertyRent.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 5 })
      });
      ResidentialPropertySell.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 3 })
      });
      CommercialPropertyRent.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 2 })
      });
      CommercialPropertySell.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 })
      });
      ResidentialPropertyCustomerRent.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 4 })
      });
      ResidentialPropertyCustomerBuy.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 6 })
      });
      CommercialPropertyCustomerRent.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 2 })
      });
      CommercialPropertyCustomerBuy.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 3 })
      });
      Reminder.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 10 })
      });

      User.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployees)
        })
      });

      User.deleteOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 })
      });

      const result = await userService.deleteAgentAccount(agentObj);

      expect(result).toBe('success');
      expect(ResidentialPropertyRent.deleteMany).toHaveBeenCalledWith({ agent_id: 'agent123' });
      expect(ResidentialPropertySell.deleteMany).toHaveBeenCalledWith({ agent_id: 'agent123' });
      expect(CommercialPropertyRent.deleteMany).toHaveBeenCalledWith({ agent_id: 'agent123' });
      expect(CommercialPropertySell.deleteMany).toHaveBeenCalledWith({ agent_id: 'agent123' });
      expect(ResidentialPropertyCustomerRent.deleteMany).toHaveBeenCalledWith({ agent_id: 'agent123' });
      expect(ResidentialPropertyCustomerBuy.deleteMany).toHaveBeenCalledWith({ agent_id: 'agent123' });
      expect(CommercialPropertyCustomerRent.deleteMany).toHaveBeenCalledWith({ agent_id: 'agent123' });
      expect(CommercialPropertyCustomerBuy.deleteMany).toHaveBeenCalledWith({ agent_id: 'agent123' });
      expect(Reminder.deleteMany).toHaveBeenCalledTimes(2);
      expect(User.deleteOne).toHaveBeenCalledTimes(3); // 2 employees + 1 agent
    });

    it('should return unauthorized when reqUserId does not match agent_id', async () => {
      const agentObj = {
        agent_id: 'agent123',
        req_user_id: 'agent456'
      };

      const result = await userService.deleteAgentAccount(agentObj);

      expect(result).toEqual({ status: 403, message: 'Unauthorized' });
      expect(ResidentialPropertyRent.deleteMany).not.toHaveBeenCalled();
    });

    it('should delete agent even when no employees exist', async () => {
      const agentObj = {
        agent_id: 'agent123',
        req_user_id: 'agent123'
      };

      ResidentialPropertyRent.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 })
      });
      ResidentialPropertySell.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 })
      });
      CommercialPropertyRent.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 })
      });
      CommercialPropertySell.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 })
      });
      ResidentialPropertyCustomerRent.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 })
      });
      ResidentialPropertyCustomerBuy.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 })
      });
      CommercialPropertyCustomerRent.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 })
      });
      CommercialPropertyCustomerBuy.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 })
      });
      Reminder.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 })
      });

      User.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([])
        })
      });

      User.deleteOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 })
      });

      const result = await userService.deleteAgentAccount(agentObj);

      expect(result).toBe('success');
      expect(User.deleteOne).toHaveBeenCalledTimes(1); // Only agent deleted
    });

    it('should delete all reminders created by agent and employees', async () => {
      const agentObj = {
        agent_id: 'agent789',
        req_user_id: 'agent789'
      };

      ResidentialPropertyRent.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      ResidentialPropertySell.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      CommercialPropertyRent.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      CommercialPropertySell.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      ResidentialPropertyCustomerRent.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      ResidentialPropertyCustomerBuy.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      CommercialPropertyCustomerRent.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      CommercialPropertyCustomerBuy.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      Reminder.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });

      User.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([])
        })
      });

      User.deleteOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });

      await userService.deleteAgentAccount(agentObj);

      expect(Reminder.deleteMany).toHaveBeenCalledWith({ agent_id_of_client: 'agent789' });
      expect(Reminder.deleteMany).toHaveBeenCalledWith({ meeting_creator_id: 'agent789' });
    });
  });

  describe('reactivateAccount', () => {
    it('should reactivate user account successfully', async () => {
      const agentObj = { agent_id: 'agent123' };

      User.collection = {
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
      };

      const result = await userService.reactivateAccount(agentObj);

      expect(result).toBe('success');
      expect(User.collection.updateOne).toHaveBeenCalledWith(
        { id: 'agent123' },
        { $set: { user_status: 'active' } }
      );
    });

    it('should handle reactivation errors', async () => {
      const agentObj = { agent_id: 'agent456' };
      const dbError = new Error('Database error');

      User.collection = {
        updateOne: jest.fn().mockRejectedValue(dbError)
      };

      const result = await userService.reactivateAccount(agentObj);

      expect(result).toEqual(dbError);
    });
  });

  describe('insertNewUserAsAgent', () => {
    it('should insert new agent user successfully', async () => {
      const mobileNumber = '+919876543210';
      const userType = 'agent';
      const accessRights = 'all';

      User.collection = {
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-id' })
      };

      const result = await userService.insertNewUserAsAgent(mobileNumber, userType, accessRights);

      expect(result.user_details).toBeDefined();
      expect(result.user_details.user_type).toBe('agent');
      expect(result.user_details.mobile).toBe('+919876543210');
      expect(result.user_details.access_rights).toBe('all');
      expect(result.user_details.works_for).toBe(result.user_details.id);
      expect(User.collection.insertOne).toHaveBeenCalled();
    });

    it('should handle insertion errors', async () => {
      const mobileNumber = '+919999999999';
      const userType = 'agent';
      const accessRights = 'all';

      User.collection = {
        insertOne: jest.fn().mockRejectedValue(new Error('Insert error'))
      };

      const result = await userService.insertNewUserAsAgent(mobileNumber, userType, accessRights);

      expect(result).toBe('fail');
    });

    it('should set expo_token to null for new user', async () => {
      const mobileNumber = '+911234567890';
      const userType = 'agent';
      const accessRights = 'all';

      User.collection = {
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-id' })
      };

      const result = await userService.insertNewUserAsAgent(mobileNumber, userType, accessRights);

      expect(result.user_details.expo_token).toBeNull();
      expect(result.user_details.name).toBeNull();
      expect(result.user_details.company_name).toBeNull();
    });
  });

  describe('getUserDetails', () => {
    it('should return existing user when found', async () => {
      const userDetails = {
        mobile: '+919876543210',
        country: 'India',
        country_code: '+91'
      };

      const mockUser = {
        id: 'user123',
        mobile: '+919876543210',
        name: 'John Doe',
        user_type: 'agent'
      };

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      const result = await userService.getUserDetails(userDetails);

      expect(result).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({ mobile: '+919876543210' });
    });

    it('should create new user when not found', async () => {
      const userDetails = {
        mobile: '+919999999999',
        country: 'India',
        country_code: '+91'
      };

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      User.create = jest.fn().mockResolvedValue({
        id: 'unique-id-7',
        mobile: '+919999999999',
        user_type: 'agent'
      });

      const result = await userService.getUserDetails(userDetails);

      expect(result).toBeDefined();
      expect(result.mobile).toBe('+919999999999');
      expect(result.country).toBe('India');
      expect(result.country_code).toBe('+91');
      expect(result.user_type).toBe('agent');
      expect(User.create).toHaveBeenCalled();
    });

    it('should handle errors during user fetch', async () => {
      const userDetails = {
        mobile: '+919876543210',
        country: 'India',
        country_code: '+91'
      };

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      const result = await userService.getUserDetails(userDetails);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle errors during user creation', async () => {
      const userDetails = {
        mobile: '+919999999999',
        country: 'India',
        country_code: '+91'
      };

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      User.create = jest.fn().mockRejectedValue(new Error('Insert error'));

      const result = await userService.getUserDetails(userDetails);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should set works_for to user id for new agent', async () => {
      const userDetails = {
        mobile: '+918888888888',
        country: 'India',
        country_code: '+91'
      };

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      User.create = jest.fn().mockImplementation((userObj) => {
        return Promise.resolve(userObj);
      });

      const result = await userService.getUserDetails(userDetails);

      expect(result.works_for).toBe(result.id);
    });
  });

  describe('getUserProfileDeatails', () => {
    it('should return user profile when user exists', async () => {
      const userDetails = {
        req_user_id: 'user123',
        mobile: '+919876543210'
      };

      const mockUser = {
        id: 'user123',
        mobile: '+919876543210',
        name: 'John Doe',
        company_name: 'Real Estate Co',
        city: 'Mumbai'
      };

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      const result = await userService.getUserProfileDeatails(userDetails);

      expect(result).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({
        id: 'user123',
        mobile: '+919876543210'
      });
    });

    it('should return null when user does not exist', async () => {
      const userDetails = {
        req_user_id: 'user456',
        mobile: '+919999999999'
      };

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await userService.getUserProfileDeatails(userDetails);

      expect(result).toBeNull();
    });

    it('should query with both id and mobile', async () => {
      const userDetails = {
        req_user_id: 'user789',
        mobile: '+911234567890'
      };

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({})
        })
      });

      await userService.getUserProfileDeatails(userDetails);

      expect(User.findOne).toHaveBeenCalledWith({
        id: 'user789',
        mobile: '+911234567890'
      });
    });
  });
});
