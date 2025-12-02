const reminderService = require('../../services/reminder.service');

// Mock all models
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
jest.mock('../../models/reminder');
jest.mock('../../models/user');
jest.mock('../../models/residentialPropertyCustomerRent');
jest.mock('../../models/residentialPropertyCustomerBuy');
jest.mock('../../models/commercialPropertyCustomerRent');
jest.mock('../../models/commercialPropertyCustomerBuy');
jest.mock('../../models/message');

// Mock utility service - define mock before jest.mock
const mockUniqueId = jest.fn();

// Mock utility service
jest.mock('../../services/utility.service', () => {
  const mockUniqueId = jest.fn();
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

describe('Reminder Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getReminderList', () => {
    it('should return reminders for agent when reqUserId equals agentId', async () => {
      const agentIdDict = {
        req_user_id: 'agent123',
        agent_id: 'agent123'
      };

      const mockReminders = [
        { reminder_id: 'rem1', agent_id_of_client: 'agent123', meeting_creator_id: 'agent123' },
        { reminder_id: 'rem2', agent_id_of_client: 'agent456', meeting_creator_id: 'agent123' }
      ];

      const mockUser = { id: 'agent456', name: 'Agent Name', mobile: '1234567890' };

      Reminder.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockReminders)
          })
        })
      });

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      const result = await reminderService.getReminderList(agentIdDict);

      expect(result).toHaveLength(2);
      expect(result[0].reminder_id).toBe('rem1');
      expect(result[1].client_name).toBe('Agent Name');
      expect(result[1].client_mobile).toBe('1234567890');
      expect(Reminder.find).toHaveBeenCalledWith({
        $or: [
          { agent_id_of_client: 'agent123' },
          { meeting_creator_id: 'agent123' }
        ]
      });
    });

    it('should return only meeting creator reminders when reqUserId differs from agentId', async () => {
      const agentIdDict = {
        req_user_id: 'employee123',
        agent_id: 'agent123'
      };

      const mockReminders = [
        { reminder_id: 'rem1', agent_id_of_client: 'agent456', meeting_creator_id: 'employee123' }
      ];

      const mockReqUser = { id: 'employee123', works_for: 'agent123' };
      const mockUser = { id: 'agent456', name: 'Client Agent', mobile: '9876543210' };

      Reminder.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockReminders)
          })
        })
      });

      User.findOne = jest.fn()
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockReqUser)
          })
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUser)
          })
        });

      const result = await reminderService.getReminderList(agentIdDict);

      expect(result).toHaveLength(1);
      expect(result[0].client_name).toBe('Client Agent');
      expect(Reminder.find).toHaveBeenCalledWith({
        $or: [{ meeting_creator_id: 'employee123' }]
      });
    });

    it('should not mask client details when employee works for the same agent', async () => {
      const agentIdDict = {
        req_user_id: 'employee123',
        agent_id: 'agent123'
      };

      const mockReminders = [
        { reminder_id: 'rem1', agent_id_of_client: 'agent123', meeting_creator_id: 'employee123' }
      ];

      const mockReqUser = { id: 'employee123', works_for: 'agent123' };

      Reminder.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockReminders)
          })
        })
      });

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockReqUser)
        })
      });

      const result = await reminderService.getReminderList(agentIdDict);

      expect(result).toHaveLength(1);
      expect(result[0].client_name).toBeUndefined();
      expect(result[0].client_mobile).toBeUndefined();
    });
  });

  describe('getReminderListByCustomerId', () => {
    it('should return reminders for residential rent customer', async () => {
      const customerData = {
        req_user_id: 'agent123',
        customer_id: 'cust123',
        property_type: 'Residential',
        property_for: 'Rent'
      };

      const mockCustomer = [{ customer_id: 'cust123', reminders: ['rem1', 'rem2'] }];
      const mockReminders = [
        { reminder_id: 'rem1', agent_id_of_client: 'agent123', meeting_creator_id: 'agent123' },
        { reminder_id: 'rem2', agent_id_of_client: 'agent123', meeting_creator_id: 'agent123' }
      ];

      ResidentialPropertyCustomerRent.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      Reminder.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockReminders)
        })
      });

      const result = await reminderService.getReminderListByCustomerId(customerData);

      expect(result).toHaveLength(2);
      expect(ResidentialPropertyCustomerRent.find).toHaveBeenCalledWith({ customer_id: 'cust123' });
    });

    it('should return reminders for residential buy customer', async () => {
      const customerData = {
        req_user_id: 'agent123',
        customer_id: 'cust123',
        property_type: 'Residential',
        property_for: 'Buy'
      };

      const mockCustomer = [{ customer_id: 'cust123', reminders: ['rem1'] }];
      const mockReminders = [
        { reminder_id: 'rem1', agent_id_of_client: 'agent123', meeting_creator_id: 'agent123' }
      ];

      ResidentialPropertyCustomerBuy.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      Reminder.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockReminders)
        })
      });

      const result = await reminderService.getReminderListByCustomerId(customerData);

      expect(result).toHaveLength(1);
      expect(ResidentialPropertyCustomerBuy.find).toHaveBeenCalledWith({ customer_id: 'cust123' });
    });

    it('should return reminders for commercial rent customer', async () => {
      const customerData = {
        req_user_id: 'agent123',
        customer_id: 'cust123',
        property_type: 'Commercial',
        property_for: 'Rent'
      };

      const mockCustomer = [{ customer_id: 'cust123', reminders: ['rem1'] }];
      const mockReminders = [
        { reminder_id: 'rem1', agent_id_of_client: 'agent123', meeting_creator_id: 'agent123' }
      ];

      CommercialPropertyCustomerRent.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      Reminder.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockReminders)
        })
      });

      const result = await reminderService.getReminderListByCustomerId(customerData);

      expect(result).toHaveLength(1);
      expect(CommercialPropertyCustomerRent.find).toHaveBeenCalledWith({ customer_id: 'cust123' });
    });

    it('should return reminders for commercial buy customer', async () => {
      const customerData = {
        req_user_id: 'agent123',
        customer_id: 'cust123',
        property_type: 'Commercial',
        property_for: 'Buy'
      };

      const mockCustomer = [{ customer_id: 'cust123', reminders: ['rem1'] }];
      const mockReminders = [
        { reminder_id: 'rem1', agent_id_of_client: 'agent123', meeting_creator_id: 'agent123' }
      ];

      CommercialPropertyCustomerBuy.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      Reminder.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockReminders)
        })
      });

      const result = await reminderService.getReminderListByCustomerId(customerData);

      expect(result).toHaveLength(1);
      expect(CommercialPropertyCustomerBuy.find).toHaveBeenCalledWith({ customer_id: 'cust123' });
    });

    it('should include client details when meeting_creator_id matches reqUserId', async () => {
      const customerData = {
        req_user_id: 'employee123',
        customer_id: 'cust123',
        property_type: 'Residential',
        property_for: 'Rent'
      };

      const mockCustomer = [{ customer_id: 'cust123', reminders: ['rem1'] }];
      const mockReminders = [
        { reminder_id: 'rem1', agent_id_of_client: 'agent123', meeting_creator_id: 'employee123' }
      ];

      const mockUser = { id: 'employee123', name: 'Employee Name', mobile: '1234567890' };

      ResidentialPropertyCustomerRent.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      Reminder.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockReminders)
        })
      });

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      const result = await reminderService.getReminderListByCustomerId(customerData);

      expect(result).toHaveLength(1);
      expect(result[0].client_name).toBe('Employee Name, Agent');
      expect(result[0].client_mobile).toBe('1234567890');
    });

    it('should handle null user name gracefully', async () => {
      const customerData = {
        req_user_id: 'employee123',
        customer_id: 'cust123',
        property_type: 'Residential',
        property_for: 'Rent'
      };

      const mockCustomer = [{ customer_id: 'cust123', reminders: ['rem1'] }];
      const mockReminders = [
        { reminder_id: 'rem1', agent_id_of_client: 'agent123', meeting_creator_id: 'employee123' }
      ];

      const mockUser = { id: 'employee123', name: null, mobile: '1234567890' };

      ResidentialPropertyCustomerRent.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer)
        })
      });

      Reminder.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockReminders)
        })
      });

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      const result = await reminderService.getReminderListByCustomerId(customerData);

      expect(result).toHaveLength(1);
      expect(result[0].client_name).toBe('Agent');
    });
  });

  describe('getPropReminderList', () => {
    it('should return all property reminders when reqUserId equals agentId', async () => {
      const reqData = {
        property_id: 'prop123',
        req_user_id: 'agent123',
        agent_id: 'agent123'
      };

      const mockReminders = [
        { reminder_id: 'rem1', agent_id_of_client: 'agent123', meeting_creator_id: 'agent123' },
        { reminder_id: 'rem2', agent_id_of_client: 'agent456', meeting_creator_id: 'agent123' }
      ];

      const mockUser = { id: 'agent456', name: 'Other Agent', mobile: '9876543210' };

      Reminder.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockReminders)
          })
        })
      });

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });

      const result = await reminderService.getPropReminderList(reqData);

      expect(result).toHaveLength(2);
      expect(result[1].client_name).toBe('Other Agent');
      expect(Reminder.find).toHaveBeenCalledWith({
        category_ids: { $in: ['prop123'] },
        $or: [
          { meeting_creator_id: 'agent123' },
          { agent_id_of_client: 'agent123' }
        ]
      });
    });

    it('should return only employee-created reminders when reqUserId differs from agentId', async () => {
      const reqData = {
        property_id: 'prop123',
        req_user_id: 'employee123',
        agent_id: 'agent123'
      };

      const mockReminders = [
        { reminder_id: 'rem1', agent_id_of_client: 'agent456', meeting_creator_id: 'employee123' }
      ];

      const mockReqUser = { id: 'employee123', works_for: 'agent123' };
      const mockUser = { id: 'agent456', name: 'Client Agent', mobile: '9876543210' };

      Reminder.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockReminders)
          })
        })
      });

      User.findOne = jest.fn()
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockReqUser)
          })
        })
        .mockReturnValueOnce({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockUser)
          })
        });

      const result = await reminderService.getPropReminderList(reqData);

      expect(result).toHaveLength(1);
      expect(result[0].client_name).toBe('Client Agent');
      expect(Reminder.find).toHaveBeenCalledWith({
        category_ids: { $in: ['prop123'] },
        meeting_creator_id: 'employee123'
      });
    });

    it('should not mask details when employee works for same agent as client', async () => {
      const reqData = {
        property_id: 'prop123',
        req_user_id: 'employee123',
        agent_id: 'agent123'
      };

      const mockReminders = [
        { reminder_id: 'rem1', agent_id_of_client: 'agent123', meeting_creator_id: 'employee123' }
      ];

      const mockReqUser = { id: 'employee123', works_for: 'agent123' };

      Reminder.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockReminders)
          })
        })
      });

      User.findOne = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockReqUser)
        })
      });

      const result = await reminderService.getPropReminderList(reqData);

      expect(result).toHaveLength(1);
      expect(result[0].client_name).toBeUndefined();
    });
  });

  describe('getCustomerReminderList', () => {
    it('should return reminders matching client_id and meeting_creator_id', async () => {
      const reqData = {
        customer_id: 'cust123',
        req_user_id: 'employee123',
        agent_id_of_client: 'agent123'
      };

      const mockReminders = [
        { reminder_id: 'rem1', client_id: 'cust123', meeting_creator_id: 'employee123' }
      ];

      Reminder.find = jest.fn().mockResolvedValue(mockReminders);

      const result = await reminderService.getCustomerReminderList(reqData);

      expect(result).toHaveLength(1);
      expect(result[0].reminder_id).toBe('rem1');
      expect(Reminder.find).toHaveBeenCalledWith({
        $or: [
          { $and: [{ client_id: 'cust123' }, { meeting_creator_id: 'employee123' }] },
          { $and: [{ client_id: 'cust123' }, { agent_id_of_client: 'employee123' }] }
        ]
      });
    });

    it('should return reminders matching client_id and agent_id_of_client', async () => {
      const reqData = {
        customer_id: 'cust123',
        req_user_id: 'agent123',
        agent_id_of_client: 'agent123'
      };

      const mockReminders = [
        { reminder_id: 'rem1', client_id: 'cust123', agent_id_of_client: 'agent123' }
      ];

      Reminder.find = jest.fn().mockResolvedValue(mockReminders);

      const result = await reminderService.getCustomerReminderList(reqData);

      expect(result).toHaveLength(1);
      expect(result[0].reminder_id).toBe('rem1');
    });

    it('should return empty array when no reminders match', async () => {
      const reqData = {
        customer_id: 'cust123',
        req_user_id: 'employee123',
        agent_id_of_client: 'agent123'
      };

      Reminder.find = jest.fn().mockResolvedValue([]);

      const result = await reminderService.getCustomerReminderList(reqData);

      expect(result).toHaveLength(0);
    });
  });

  describe('addNewReminder', () => {
    beforeEach(() => {
      uniqueId.mockReturnValue('unique-reminder-id');
    });

    it('should create reminder for residential rent property', async () => {
      const reminderDetails = {
        category_type: 'Residential',
        category_for: 'Rent',
        category_ids: ['prop123'],
        client_id: 'cust123'
      };

      Reminder.create = jest.fn().mockResolvedValue({});
      ResidentialPropertyRent.updateOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      ResidentialPropertyCustomerRent.updateOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });

      const result = await reminderService.addNewReminder(reminderDetails);

      expect(result.reminderId).toBe('unique-reminder-id');
      expect(Reminder.create).toHaveBeenCalledWith({
        ...reminderDetails,
        reminder_id: 'unique-reminder-id'
      });
      expect(ResidentialPropertyRent.updateOne).toHaveBeenCalledWith(
        { property_id: 'prop123' },
        { $addToSet: { reminders: 'unique-reminder-id' } }
      );
      expect(ResidentialPropertyCustomerRent.updateOne).toHaveBeenCalledWith(
        { customer_id: 'cust123' },
        { $addToSet: { reminders: 'unique-reminder-id' } }
      );
    });

    it('should create reminder for residential buy property', async () => {
      const reminderDetails = {
        category_type: 'Residential',
        category_for: 'Buy',
        category_ids: ['prop123'],
        client_id: 'cust123'
      };

      Reminder.create = jest.fn().mockResolvedValue({});
      ResidentialPropertySell.updateOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      ResidentialPropertyCustomerBuy.updateOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });

      const result = await reminderService.addNewReminder(reminderDetails);

      expect(result.reminderId).toBe('unique-reminder-id');
      expect(ResidentialPropertySell.updateOne).toHaveBeenCalledWith(
        { property_id: 'prop123' },
        { $addToSet: { reminders: 'unique-reminder-id' } }
      );
      expect(ResidentialPropertyCustomerBuy.updateOne).toHaveBeenCalledWith(
        { customer_id: 'cust123' },
        { $addToSet: { reminders: 'unique-reminder-id' } }
      );
    });

    it('should create reminder for residential sell property', async () => {
      const reminderDetails = {
        category_type: 'Residential',
        category_for: 'Sell',
        category_ids: ['prop123'],
        client_id: 'cust123'
      };

      Reminder.create = jest.fn().mockResolvedValue({});
      ResidentialPropertySell.updateOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      ResidentialPropertyCustomerBuy.updateOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });

      const result = await reminderService.addNewReminder(reminderDetails);

      expect(result.reminderId).toBe('unique-reminder-id');
      expect(ResidentialPropertySell.updateOne).toHaveBeenCalled();
    });

    it('should create reminder for commercial rent property', async () => {
      const reminderDetails = {
        category_type: 'Commercial',
        category_for: 'Rent',
        category_ids: ['prop123'],
        client_id: 'cust123'
      };

      Reminder.create = jest.fn().mockResolvedValue({});
      CommercialPropertyRent.updateOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      CommercialPropertyCustomerRent.updateOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });

      const result = await reminderService.addNewReminder(reminderDetails);

      expect(result.reminderId).toBe('unique-reminder-id');
      expect(CommercialPropertyRent.updateOne).toHaveBeenCalledWith(
        { property_id: 'prop123' },
        { $addToSet: { reminders: 'unique-reminder-id' } }
      );
      expect(CommercialPropertyCustomerRent.updateOne).toHaveBeenCalledWith(
        { customer_id: 'cust123' },
        { $addToSet: { reminders: 'unique-reminder-id' } }
      );
    });

    it('should create reminder for commercial buy property', async () => {
      const reminderDetails = {
        category_type: 'Commercial',
        category_for: 'Buy',
        category_ids: ['prop123'],
        client_id: 'cust123'
      };

      Reminder.create = jest.fn().mockResolvedValue({});
      CommercialPropertySell.updateOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      CommercialPropertyCustomerBuy.updateOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });

      const result = await reminderService.addNewReminder(reminderDetails);

      expect(result.reminderId).toBe('unique-reminder-id');
      expect(CommercialPropertySell.updateOne).toHaveBeenCalledWith(
        { property_id: 'prop123' },
        { $addToSet: { reminders: 'unique-reminder-id' } }
      );
      expect(CommercialPropertyCustomerBuy.updateOne).toHaveBeenCalledWith(
        { customer_id: 'cust123' },
        { $addToSet: { reminders: 'unique-reminder-id' } }
      );
    });

    it('should create reminder for commercial sell property', async () => {
      const reminderDetails = {
        category_type: 'Commercial',
        category_for: 'Sell',
        category_ids: ['prop123'],
        client_id: 'cust123'
      };

      Reminder.create = jest.fn().mockResolvedValue({});
      CommercialPropertySell.updateOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });
      CommercialPropertyCustomerBuy.updateOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({})
      });

      const result = await reminderService.addNewReminder(reminderDetails);

      expect(result.reminderId).toBe('unique-reminder-id');
      expect(CommercialPropertySell.updateOne).toHaveBeenCalled();
    });
  });
});
