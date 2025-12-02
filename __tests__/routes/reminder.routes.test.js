const request = require('supertest');
const express = require('express');
const reminderRoutes = require('../../routes/reminder.routes');
const reminderController = require('../../controllers/reminder.controller');

jest.mock('../../controllers/reminder.controller');

const app = express();
app.use(express.json());
app.use('/api/reminder', reminderRoutes);

describe('Reminder Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/reminder/getReminderList', () => {
    it('should route to getReminderList controller', async () => {
      reminderController.getReminderList.mockImplementation((req, res) => {
        res.status(201).json([{ id: 'reminder-1' }, { id: 'reminder-2' }]);
      });

      await request(app)
        .post('/api/reminder/getReminderList')
        .send({ agent_id: 'agent-1', req_user_id: 'agent-1' })
        .expect(201);

      expect(reminderController.getReminderList).toHaveBeenCalled();
    });
  });

  describe('POST /api/reminder/getPropReminderList', () => {
    it('should route to getPropReminderList controller', async () => {
      reminderController.getPropReminderList.mockImplementation((req, res) => {
        res.status(201).json([{ id: 'reminder-1', property_id: 'prop-1' }]);
      });

      await request(app)
        .post('/api/reminder/getPropReminderList')
        .send({ agent_id: 'agent-1' })
        .expect(201);

      expect(reminderController.getPropReminderList).toHaveBeenCalled();
    });
  });

  describe('POST /api/reminder/addNewReminder', () => {
    it('should route to addNewReminder controller', async () => {
      reminderController.addNewReminder.mockImplementation((req, res) => {
        res.status(201).json({ id: 'reminder-1', client_id: 'cust-1' });
      });

      await request(app)
        .post('/api/reminder/addNewReminder')
        .send({ client_id: 'cust-1', property_id: 'prop-1' })
        .expect(201);

      expect(reminderController.addNewReminder).toHaveBeenCalled();
    });
  });

  describe('POST /api/reminder/getCustomerReminderList', () => {
    it('should route to getCustomerReminderList controller', async () => {
      reminderController.getCustomerReminderList.mockImplementation((req, res) => {
        res.status(201).json([{ id: 'reminder-1' }]);
      });

      await request(app)
        .post('/api/reminder/getCustomerReminderList')
        .send({ client_id: 'cust-1' })
        .expect(201);

      expect(reminderController.getCustomerReminderList).toHaveBeenCalled();
    });
  });

  describe('POST /api/reminder/getReminderListByCustomerId', () => {
    it('should route to getReminderListByCustomerId controller', async () => {
      reminderController.getReminderListByCustomerId.mockImplementation((req, res) => {
        res.status(201).json([{ id: 'reminder-1', property_type: 'Residential' }]);
      });

      await request(app)
        .post('/api/reminder/getReminderListByCustomerId')
        .send({ client_id: 'cust-1', property_type: 'Residential' })
        .expect(201);

      expect(reminderController.getReminderListByCustomerId).toHaveBeenCalled();
    });
  });
});
