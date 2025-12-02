const ReminderService = require('../../services/reminder.service');
const reminderController = require('../../controllers/reminder.controller');

jest.mock('../../services/reminder.service');

describe('Reminder Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getReminderList', () => {
    it('should return reminder list for agent', async () => {
      const mockReminders = [
        { id: 'reminder-1', client_id: 'customer-1', property_id: 'prop-1' },
        { id: 'reminder-2', client_id: 'customer-2', property_id: 'prop-2' }
      ];
      req.body = { agent_id: 'agent-1', req_user_id: 'agent-1' };
      ReminderService.getReminderList.mockResolvedValue(mockReminders);

      await reminderController.getReminderList(req, res, next);

      expect(ReminderService.getReminderList).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockReminders);
    });

    it('should return filtered reminders for employee', async () => {
      const mockReminders = [{ id: 'reminder-1', client_id: 'customer-1' }];
      req.body = { agent_id: 'agent-1', req_user_id: 'employee-1' };
      ReminderService.getReminderList.mockResolvedValue(mockReminders);

      await reminderController.getReminderList(req, res, next);

      expect(ReminderService.getReminderList).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockReminders);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      ReminderService.getReminderList.mockRejectedValue(error);

      await reminderController.getReminderList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPropReminderList', () => {
    it('should return property reminder list', async () => {
      const mockReminders = [
        { id: 'reminder-1', property_id: 'prop-1' },
        { id: 'reminder-2', property_id: 'prop-2' }
      ];
      req.body = { agent_id: 'agent-1', req_user_id: 'agent-1' };
      ReminderService.getPropReminderList.mockResolvedValue(mockReminders);

      await reminderController.getPropReminderList(req, res, next);

      expect(ReminderService.getPropReminderList).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockReminders);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      ReminderService.getPropReminderList.mockRejectedValue(error);

      await reminderController.getPropReminderList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('addNewReminder', () => {
    it('should add new reminder successfully', async () => {
      const mockReminder = {
        id: 'reminder-1',
        client_id: 'customer-1',
        property_id: 'prop-1',
        reminder_date: '2025-12-10'
      };
      req.body = {
        client_id: 'customer-1',
        property_id: 'prop-1',
        property_type: 'Residential',
        reminder_date: '2025-12-10'
      };
      ReminderService.addNewReminder.mockResolvedValue(mockReminder);

      await reminderController.addNewReminder(req, res, next);

      expect(ReminderService.addNewReminder).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockReminder);
    });

    it('should handle errors', async () => {
      const error = new Error('Failed to create reminder');
      ReminderService.addNewReminder.mockRejectedValue(error);

      await reminderController.addNewReminder(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getCustomerReminderList', () => {
    it('should return customer reminder list', async () => {
      const mockReminders = [
        { id: 'reminder-1', client_id: 'customer-1' },
        { id: 'reminder-2', client_id: 'customer-1' }
      ];
      req.body = { client_id: 'customer-1' };
      ReminderService.getCustomerReminderList.mockResolvedValue(mockReminders);

      await reminderController.getCustomerReminderList(req, res, next);

      expect(ReminderService.getCustomerReminderList).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockReminders);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      ReminderService.getCustomerReminderList.mockRejectedValue(error);

      await reminderController.getCustomerReminderList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getReminderListByCustomerId', () => {
    it('should return reminders by customer id', async () => {
      const mockReminders = [
        { id: 'reminder-1', client_id: 'customer-1', property_type: 'Residential' },
        { id: 'reminder-2', client_id: 'customer-1', property_type: 'Commercial' }
      ];
      req.body = { client_id: 'customer-1', property_type: 'Residential' };
      ReminderService.getReminderListByCustomerId.mockResolvedValue(mockReminders);

      await reminderController.getReminderListByCustomerId(req, res, next);

      expect(ReminderService.getReminderListByCustomerId).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockReminders);
    });

    it('should return empty array when no reminders found', async () => {
      req.body = { client_id: 'nonexistent' };
      ReminderService.getReminderListByCustomerId.mockResolvedValue([]);

      await reminderController.getReminderListByCustomerId(req, res, next);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      ReminderService.getReminderListByCustomerId.mockRejectedValue(error);

      await reminderController.getReminderListByCustomerId(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
