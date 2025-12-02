const request = require('supertest');
const express = require('express');
const userRoutes = require('../../routes/user.routes');
const userController = require('../../controllers/user.controller');

// Mock the controller
jest.mock('../../controllers/user.controller');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/user', userRoutes);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/user/checkLoginRole', () => {
    it('should call checkLoginRole controller', async () => {
      userController.checkLoginRole.mockImplementation((req, res) => {
        res.status(201).json({ id: 'user-1', mobile: '+919876543210' });
      });

      const response = await request(app)
        .post('/api/user/checkLoginRole')
        .send({ mobile: '+919876543210' })
        .expect(201);

      expect(userController.checkLoginRole).toHaveBeenCalled();
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('POST /api/user/updateUserProfile', () => {
    it('should call updateUserProfile controller', async () => {
      userController.updateUserProfile.mockImplementation((req, res) => {
        res.status(201).json({ id: 'user-1', name: 'Updated Name' });
      });

      const response = await request(app)
        .post('/api/user/updateUserProfile')
        .send({ id: 'user-1', name: 'Updated Name' })
        .expect(201);

      expect(userController.updateUserProfile).toHaveBeenCalled();
      expect(response.body.name).toBe('Updated Name');
    });
  });

  describe('POST /api/user/deleteAgentAccount', () => {
    it('should call deleteAgentAccount controller', async () => {
      userController.deleteAgentAccount.mockImplementation((req, res) => {
        res.status(201).json('Agent account deleted successfully.');
      });

      const response = await request(app)
        .post('/api/user/deleteAgentAccount')
        .send({ agent_id: 'agent-1', req_user_id: 'agent-1' })
        .expect(201);

      expect(userController.deleteAgentAccount).toHaveBeenCalled();
      expect(response.body).toBe('Agent account deleted successfully.');
    });
  });

  describe('POST /api/user/reactivateAccount', () => {
    it('should call reactivateAccount controller', async () => {
      userController.reactivateAccount.mockImplementation((req, res) => {
        res.status(201).json({ id: 'user-1', is_active: 1 });
      });

      const response = await request(app)
        .post('/api/user/reactivateAccount')
        .send({ id: 'user-1' })
        .expect(201);

      expect(userController.reactivateAccount).toHaveBeenCalled();
    });
  });

  describe('POST /api/user/insertNewUserAsAgent', () => {
    it('should call insertNewUserAsAgent controller', async () => {
      userController.insertNewUserAsAgent.mockImplementation((req, res) => {
        res.status(201).json({ id: 'user-1', role: 'Agent' });
      });

      const response = await request(app)
        .post('/api/user/insertNewUserAsAgent')
        .send({ mobile: '+919876543210', name: 'New Agent' })
        .expect(201);

      expect(userController.insertNewUserAsAgent).toHaveBeenCalled();
    });
  });

  describe('POST /api/user/getUserDetails', () => {
    it('should call getUserDetails controller', async () => {
      userController.getUserDetails.mockImplementation((req, res) => {
        res.status(201).json({ id: 'user-1', mobile: '+919876543210' });
      });

      const response = await request(app)
        .post('/api/user/getUserDetails')
        .send({ id: 'user-1' })
        .expect(201);

      expect(userController.getUserDetails).toHaveBeenCalled();
    });
  });

  describe('POST /api/user/getUserProfileDeatails', () => {
    it('should call getUserProfileDeatails controller', async () => {
      userController.getUserProfileDeatails.mockImplementation((req, res) => {
        res.status(201).json({ id: 'user-1', name: 'Test User' });
      });

      const response = await request(app)
        .post('/api/user/getUserProfileDeatails')
        .send({ id: 'user-1', mobile: '+919876543210' })
        .expect(201);

      expect(userController.getUserProfileDeatails).toHaveBeenCalled();
    });
  });
});
