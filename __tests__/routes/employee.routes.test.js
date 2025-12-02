const request = require('supertest');
const express = require('express');
const employeeRoutes = require('../../routes/employee.routes');
const employeeController = require('../../controllers/employee.controller');

jest.mock('../../controllers/employee.controller');

const app = express();
app.use(express.json());
app.use('/api/employee', employeeRoutes);

describe('Employee Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/employee/addEmployee', () => {
    it('should route to addEmployee controller', async () => {
      employeeController.addEmployee.mockImplementation((req, res) => {
        res.status(201).json({ id: 'emp-1', name: 'John Doe' });
      });

      await request(app)
        .post('/api/employee/addEmployee')
        .send({ name: 'John Doe', mobile: '9876543210' })
        .expect(201);

      expect(employeeController.addEmployee).toHaveBeenCalled();
    });
  });

  describe('POST /api/employee/updateEmployeeDetails', () => {
    it('should route to updateEmployeeDetails controller', async () => {
      employeeController.updateEmployeeDetails.mockImplementation((req, res) => {
        res.status(201).json({ id: 'emp-1', name: 'Updated Name' });
      });

      await request(app)
        .post('/api/employee/updateEmployeeDetails')
        .send({ id: 'emp-1', name: 'Updated Name' })
        .expect(201);

      expect(employeeController.updateEmployeeDetails).toHaveBeenCalled();
    });
  });

  describe('POST /api/employee/deleteEmployee', () => {
    it('should route to deleteEmployee controller', async () => {
      employeeController.deleteEmployee.mockImplementation((req, res) => {
        res.status(201).json('Employee deleted successfully.');
      });

      await request(app)
        .post('/api/employee/deleteEmployee')
        .send({ id: 'emp-1' })
        .expect(201);

      expect(employeeController.deleteEmployee).toHaveBeenCalled();
    });
  });

  describe('POST /api/employee/removeEmployee', () => {
    it('should route to removeEmployee controller', async () => {
      employeeController.removeEmployee.mockImplementation((req, res) => {
        res.status(201).json('Employee removed successfully.');
      });

      await request(app)
        .post('/api/employee/removeEmployee')
        .send({ id: 'emp-1' })
        .expect(201);

      expect(employeeController.removeEmployee).toHaveBeenCalled();
    });
  });

  describe('POST /api/employee/updateEmployeeEditRights', () => {
    it('should route to updateEmployeeEditRights controller', async () => {
      employeeController.updateEmployeeEditRights.mockImplementation((req, res) => {
        res.status(201).json({ id: 'emp-1', can_edit: true });
      });

      await request(app)
        .post('/api/employee/updateEmployeeEditRights')
        .send({ id: 'emp-1', can_edit: true })
        .expect(201);

      expect(employeeController.updateEmployeeEditRights).toHaveBeenCalled();
    });
  });

  describe('POST /api/employee/getEmployeeList', () => {
    it('should route to getEmployeeList controller', async () => {
      employeeController.getEmployeeList.mockImplementation((req, res) => {
        res.status(201).json([{ id: 'emp-1' }, { id: 'emp-2' }]);
      });

      await request(app)
        .post('/api/employee/getEmployeeList')
        .send({ agent_id: 'agent-1' })
        .expect(201);

      expect(employeeController.getEmployeeList).toHaveBeenCalled();
    });
  });

  describe('POST /api/employee/updatePropertiesForEmployee', () => {
    it('should route to updatePropertiesForEmployee controller', async () => {
      employeeController.updatePropertiesForEmployee.mockImplementation((req, res) => {
        res.status(201).json({ id: 'emp-1', properties: ['prop-1'] });
      });

      await request(app)
        .post('/api/employee/updatePropertiesForEmployee')
        .send({ employee_id: 'emp-1', property_id: 'prop-1' })
        .expect(201);

      expect(employeeController.updatePropertiesForEmployee).toHaveBeenCalled();
    });
  });

  describe('POST /api/employee/insertNewUserAsEmployee', () => {
    it('should route to insertNewUserAsEmployee controller', async () => {
      employeeController.insertNewUserAsEmployee.mockImplementation((req, res) => {
        res.status(201).json({ id: 'emp-1', role: 'Employee' });
      });

      await request(app)
        .post('/api/employee/insertNewUserAsEmployee')
        .send({ mobile: '+919876543210' })
        .expect(201);

      expect(employeeController.insertNewUserAsEmployee).toHaveBeenCalled();
    });
  });

  describe('POST /api/employee/getEmployerDetails', () => {
    it('should route to getEmployerDetails controller', async () => {
      employeeController.getEmployerDetails.mockImplementation((req, res) => {
        res.status(201).json({ id: 'agent-1', name: 'Agent Name' });
      });

      await request(app)
        .post('/api/employee/getEmployerDetails')
        .send({ works_for: 'agent-1' })
        .expect(201);

      expect(employeeController.getEmployerDetails).toHaveBeenCalled();
    });
  });

  describe('POST /api/employee/updateUserEmployeeList', () => {
    it('should route to updateUserEmployeeList controller', async () => {
      employeeController.updateUserEmployeeList.mockImplementation((req, res) => {
        res.status(201).json({ id: 'agent-1', employees: ['emp-1'] });
      });

      await request(app)
        .post('/api/employee/updateUserEmployeeList')
        .send({ agentId: 'agent-1', employeeId: 'emp-1' })
        .expect(201);

      expect(employeeController.updateUserEmployeeList).toHaveBeenCalled();
    });
  });
});
