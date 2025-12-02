const UserService = require('../../services/user.service');
const userController = require('../../controllers/user.controller');
const AppError = require('../../utils/appError');

// Mock the UserService
jest.mock('../../services/user.service');

describe('User Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('checkLoginRole', () => {
    it('should return user details with 201 status', async () => {
      const mockUser = { id: 'user-1', mobile: '+919876543210', name: 'Test User' };
      req.body = { mobile: '+919876543210' };
      UserService.checkLoginRole.mockResolvedValue(mockUser);

      await userController.checkLoginRole(req, res, next);

      expect(UserService.checkLoginRole).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should call service with request body', async () => {
      const mockUser = { id: 'user-1', mobile: '+919876543210' };
      req.body = { mobile: '+919876543210', name: 'Test User' };
      UserService.checkLoginRole.mockResolvedValue(mockUser);

      await userController.checkLoginRole(req, res, next);

      expect(UserService.checkLoginRole).toHaveBeenCalledWith(req.body);
      expect(UserService.checkLoginRole).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUser = { id: 'user-1', name: 'Updated Name' };
      req.body = { id: 'user-1', name: 'Updated Name' };
      UserService.updateUserProfile.mockResolvedValue(mockUser);

      await userController.updateUserProfile(req, res, next);

      expect(UserService.updateUserProfile).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      req.body = { id: 'user-1' };
      UserService.updateUserProfile.mockRejectedValue(error);

      await userController.updateUserProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteAgentAccount', () => {
    it('should delete agent account successfully', async () => {
      req.body = { agent_id: 'agent-1', req_user_id: 'agent-1' };
      UserService.deleteAgentAccount.mockResolvedValue();

      await userController.deleteAgentAccount(req, res, next);

      expect(UserService.deleteAgentAccount).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith('Agent account deleted successfully.');
    });

    it('should handle deletion errors', async () => {
      const error = new AppError('Unauthorized', 401);
      req.body = { agent_id: 'agent-1', req_user_id: 'other-agent' };
      UserService.deleteAgentAccount.mockRejectedValue(error);

      await userController.deleteAgentAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('reactivateAccount', () => {
    it('should reactivate account successfully', async () => {
      const mockUser = { id: 'user-1', is_active: 1 };
      req.body = { id: 'user-1' };
      UserService.reactivateAccount.mockResolvedValue(mockUser);

      await userController.reactivateAccount(req, res, next);

      expect(UserService.reactivateAccount).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle reactivation errors', async () => {
      const error = new Error('Reactivation failed');
      UserService.reactivateAccount.mockRejectedValue(error);

      await userController.reactivateAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('insertNewUserAsAgent', () => {
    it('should insert new agent successfully', async () => {
      const mockUser = { id: 'user-1', mobile: '+919876543210', role: 'Agent' };
      req.body = { mobile: '+919876543210', name: 'New Agent' };
      UserService.insertNewUserAsAgent.mockResolvedValue(mockUser);

      await userController.insertNewUserAsAgent(req, res, next);

      expect(UserService.insertNewUserAsAgent).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle insertion errors', async () => {
      const error = new Error('Insertion failed');
      UserService.insertNewUserAsAgent.mockRejectedValue(error);

      await userController.insertNewUserAsAgent(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserDetails', () => {
    it('should get user details successfully', async () => {
      const mockUser = { id: 'user-1', mobile: '+919876543210' };
      req.body = { id: 'user-1' };
      UserService.getUserDetails.mockResolvedValue(mockUser);

      await userController.getUserDetails(req, res, next);

      expect(UserService.getUserDetails).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle errors when getting user details', async () => {
      const error = new Error('User not found');
      UserService.getUserDetails.mockRejectedValue(error);

      await userController.getUserDetails(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserProfileDeatails', () => {
    it('should get user profile details successfully', async () => {
      const mockUser = { id: 'user-1', name: 'Test User', mobile: '+919876543210' };
      req.body = { id: 'user-1', mobile: '+919876543210' };
      UserService.getUserProfileDeatails.mockResolvedValue(mockUser);

      await userController.getUserProfileDeatails(req, res, next);

      expect(UserService.getUserProfileDeatails).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle null user when not found', async () => {
      req.body = { id: 'nonexistent' };
      UserService.getUserProfileDeatails.mockResolvedValue(null);

      await userController.getUserProfileDeatails(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(null);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      UserService.getUserProfileDeatails.mockRejectedValue(error);

      await userController.getUserProfileDeatails(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
