const EmployeeService = require('../../services/employee.service');
const employeeController = require('../../controllers/employee.controller');

jest.mock('../../services/employee.service');

describe('Employee Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('addEmployee', () => {
    it('should add employee successfully', async () => {
      const mockEmployee = { id: 'emp-1', name: 'John Doe', mobile: '+919876543210' };
      req.body = { name: 'John Doe', mobile: '9876543210', agent_id: 'agent-1' };
      EmployeeService.addEmployee.mockResolvedValue(mockEmployee);

      await employeeController.addEmployee(req, res, next);

      expect(EmployeeService.addEmployee).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockEmployee);
    });

    it('should handle duplicate employee error', async () => {
      const error = new Error('Employee already exists');
      EmployeeService.addEmployee.mockRejectedValue(error);

      await employeeController.addEmployee(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateEmployeeDetails', () => {
    it('should update employee details successfully', async () => {
      const mockEmployee = { id: 'emp-1', name: 'Updated Name' };
      req.body = { id: 'emp-1', name: 'Updated Name' };
      EmployeeService.updateEmployeeDetails.mockResolvedValue(mockEmployee);

      await employeeController.updateEmployeeDetails(req, res, next);

      expect(EmployeeService.updateEmployeeDetails).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockEmployee);
    });

    it('should handle update errors', async () => {
      const error = new Error('Employee not found');
      EmployeeService.updateEmployeeDetails.mockRejectedValue(error);

      await employeeController.updateEmployeeDetails(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteEmployee', () => {
    it('should delete employee successfully', async () => {
      req.params = { id: 'emp-1' };
      EmployeeService.deleteEmployee.mockResolvedValue();

      await employeeController.deleteEmployee(req, res, next);

      expect(EmployeeService.deleteEmployee).toHaveBeenCalledWith(req.params);
      expect(res.json).toHaveBeenCalledWith('Employee deleted successfully.');
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Deletion failed');
      EmployeeService.deleteEmployee.mockRejectedValue(error);

      await employeeController.deleteEmployee(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('removeEmployee', () => {
    it('should remove employee successfully', async () => {
      req.params = { id: 'emp-1' };
      EmployeeService.removeEmployee.mockResolvedValue();

      await employeeController.removeEmployee(req, res, next);

      expect(EmployeeService.removeEmployee).toHaveBeenCalledWith(req.params);
      expect(res.json).toHaveBeenCalledWith('Employee removed successfully.');
    });

    it('should handle removal errors', async () => {
      const error = new Error('Removal failed');
      EmployeeService.removeEmployee.mockRejectedValue(error);

      await employeeController.removeEmployee(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateEmployeeEditRights', () => {
    it('should update employee edit rights successfully', async () => {
      const mockEmployee = { id: 'emp-1', can_edit: true };
      req.body = { id: 'emp-1', can_edit: true };
      EmployeeService.updateEmployeeEditRights.mockResolvedValue(mockEmployee);

      await employeeController.updateEmployeeEditRights(req, res, next);

      expect(EmployeeService.updateEmployeeEditRights).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockEmployee);
    });

    it('should handle errors', async () => {
      const error = new Error('Update failed');
      EmployeeService.updateEmployeeEditRights.mockRejectedValue(error);

      await employeeController.updateEmployeeEditRights(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getEmployeeList', () => {
    it('should return employee list for agent', async () => {
      const mockEmployees = [
        { id: 'emp-1', name: 'Employee 1' },
        { id: 'emp-2', name: 'Employee 2' }
      ];
      req.body = { agent_id: 'agent-1' };
      EmployeeService.getEmployeeList.mockResolvedValue(mockEmployees);

      await employeeController.getEmployeeList(req, res, next);

      expect(EmployeeService.getEmployeeList).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockEmployees);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      EmployeeService.getEmployeeList.mockRejectedValue(error);

      await employeeController.getEmployeeList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updatePropertiesForEmployee', () => {
    it('should update properties for employee', async () => {
      const mockEmployee = { id: 'emp-1', properties: ['prop-1'] };
      req.body = { employee_id: 'emp-1', property_id: 'prop-1', action: 'add' };
      EmployeeService.updatePropertiesForEmployee.mockResolvedValue(mockEmployee);

      await employeeController.updatePropertiesForEmployee(req, res, next);

      expect(EmployeeService.updatePropertiesForEmployee).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockEmployee);
    });

    it('should handle errors', async () => {
      const error = new Error('Update failed');
      EmployeeService.updatePropertiesForEmployee.mockRejectedValue(error);

      await employeeController.updatePropertiesForEmployee(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('insertNewUserAsEmployee', () => {
    it('should insert new user as employee', async () => {
      const mockEmployee = { id: 'emp-1', mobile: '+919876543210', role: 'Employee' };
      req.body = { mobile: '+919876543210', agent_id: 'agent-1' };
      EmployeeService.insertNewUserAsEmployee.mockResolvedValue(mockEmployee);

      await employeeController.insertNewUserAsEmployee(req, res, next);

      expect(EmployeeService.insertNewUserAsEmployee).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockEmployee);
    });

    it('should handle errors', async () => {
      const error = new Error('Insertion failed');
      EmployeeService.insertNewUserAsEmployee.mockRejectedValue(error);

      await employeeController.insertNewUserAsEmployee(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getEmployerDetails', () => {
    it('should get employer details successfully', async () => {
      const mockEmployer = { id: 'agent-1', name: 'Agent Name' };
      req.params = { works_for: 'agent-1' };
      EmployeeService.getEmployerDetails.mockResolvedValue(mockEmployer);

      await employeeController.getEmployerDetails(req, res, next);

      expect(EmployeeService.getEmployerDetails).toHaveBeenCalledWith(req.params);
      expect(res.json).toHaveBeenCalledWith(mockEmployer);
    });

    it('should handle errors', async () => {
      const error = new Error('Employer not found');
      EmployeeService.getEmployerDetails.mockRejectedValue(error);

      await employeeController.getEmployerDetails(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUserEmployeeList', () => {
    it('should update user employee list successfully', async () => {
      const mockUser = { id: 'agent-1', employees: ['emp-1'] };
      req.body = { agentId: 'agent-1', employeeId: 'emp-1' };
      EmployeeService.updateUserEmployeeList.mockResolvedValue(mockUser);

      await employeeController.updateUserEmployeeList(req, res, next);

      expect(EmployeeService.updateUserEmployeeList).toHaveBeenCalledWith('agent-1', 'emp-1');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle errors', async () => {
      const error = new Error('Update failed');
      req.body = { agentId: 'agent-1', employeeId: 'emp-1' };
      EmployeeService.updateUserEmployeeList.mockRejectedValue(error);

      await employeeController.updateUserEmployeeList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
