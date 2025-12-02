// Mock all dependencies before requiring the service
jest.mock('../../models/commercialPropertyRent');
jest.mock('../../models/commercialPropertySell');
jest.mock('../../models/residentialPropertyRent');
jest.mock('../../models/residentialPropertySell');
jest.mock('../../models/user');
jest.mock('../../models/residentialPropertyCustomerRent');
jest.mock('../../models/residentialPropertyCustomerBuy');
jest.mock('../../models/commercialPropertyCustomerRent');
jest.mock('../../models/commercialPropertyCustomerBuy');
jest.mock('../../utils/logger');

const CommercialPropertyRent = require('../../models/commercialPropertyRent');
const CommercialPropertySell = require('../../models/commercialPropertySell');
const ResidentialPropertyRent = require('../../models/residentialPropertyRent');
const ResidentialPropertySell = require('../../models/residentialPropertySell');
const User = require('../../models/user');
const ResidentialPropertyCustomerRent = require('../../models/residentialPropertyCustomerRent');
const ResidentialPropertyCustomerBuy = require('../../models/residentialPropertyCustomerBuy');
const CommercialPropertyCustomerRent = require('../../models/commercialPropertyCustomerRent');
const CommercialPropertyCustomerBuy = require('../../models/commercialPropertyCustomerBuy');
const logger = require('../../utils/logger');

// Mock uniqueId globally before requiring the service
global.uniqueId = jest.fn(() => 'emp-12345');

const {
  addEmployee,
  updateEmployeeDetails,
  removeEmployee,
  updateEmployeeEditRights,
  getEmployeeList,
  updatePropertiesForEmployee
} = require('../../services/employee.service');

describe('Employee Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addEmployee', () => {
    
    it('should create a new employee successfully', async () => {
      const employeeDetails = {
        emp_name: 'John Doe',
        emp_mobile: '9876543210',
        company_name: 'Real Estate Co',
        address: '123 Main St',
        city: 'Mumbai',
        agent_id: 'agent-123',
        employee_role: 'sales'
      };

      User.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([])
        })
      });

      User.create.mockResolvedValue({
        id: 'emp-12345',
        name: 'John Doe',
        mobile: '+919876543210'
      });

      const result = await addEmployee(employeeDetails);

      expect(result.id).toBe('emp-12345');
      expect(result.name).toBe('John Doe');
      expect(User.find).toHaveBeenCalledWith({ mobile: '+919876543210' });
      expect(User.create).toHaveBeenCalled();
    });

    it('should add +91 prefix if mobile number does not have it', async () => {
      const employeeDetails = {
        emp_name: 'Jane Smith',
        emp_mobile: '8765432109',
        company_name: 'Realty Corp',
        address: '456 Park Ave',
        city: 'Delhi',
        agent_id: 'agent-456',
        employee_role: 'admin'
      };

      User.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([])
        })
      });

      User.create.mockResolvedValue({
        id: 'emp-12345',
        mobile: '+918765432109'
      });

      await addEmployee(employeeDetails);

      expect(User.find).toHaveBeenCalledWith({ mobile: '+918765432109' });
    });

    it('should not add +91 prefix if mobile number already has it', async () => {
      const employeeDetails = {
        emp_name: 'Bob Johnson',
        emp_mobile: '+917654321098',
        company_name: 'Properties Inc',
        address: '789 Oak St',
        city: 'Bangalore',
        agent_id: 'agent-789',
        employee_role: 'sales'
      };

      User.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([])
        })
      });

      User.create.mockResolvedValue({
        id: 'emp-12345',
        mobile: '+917654321098'
      });

      await addEmployee(employeeDetails);

      expect(User.find).toHaveBeenCalledWith({ mobile: '+917654321098' });
    });

    it('should return error if employee already exists with mobile number', async () => {
      const employeeDetails = {
        emp_name: 'Existing Employee',
        emp_mobile: '9999999999',
        company_name: 'Test Co',
        address: '111 Test St',
        city: 'Chennai',
        agent_id: 'agent-111',
        employee_role: 'sales'
      };

      User.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([{ id: 'existing-emp', mobile: '+919999999999' }])
        })
      });

      const result = await addEmployee(employeeDetails);

      expect(result.errorCode).toBe('EMPLOYEE_EXISTS');
      expect(result.message).toBe('This mobile number is already registered');
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const employeeDetails = {
        emp_name: 'Error Test',
        emp_mobile: '8888888888',
        company_name: 'Error Co',
        address: '222 Error St',
        city: 'Hyderabad',
        agent_id: 'agent-222',
        employee_role: 'sales'
      };

      User.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([])
        })
      });

      User.create.mockRejectedValue(new Error('Database error'));

      const result = await addEmployee(employeeDetails);

      expect(result).toBeNull();
    });
  });

  describe('updateEmployeeDetails', () => {
    
    it('should update employee details successfully', async () => {
      const employeeDetails = {
        emp_id: 'emp-123',
        emp_name: 'Updated Name',
        emp_mobile: '9876543210',
        employee_role: 'admin'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ id: 'emp-123', name: 'Old Name' })
        })
      });

      User.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await updateEmployeeDetails(employeeDetails);

      expect(result.successCode).toBe('EMPLOYEE_UPDATED');
      expect(result.message).toBe('Employee details updated successfully');
      expect(User.updateOne).toHaveBeenCalledWith(
        { id: 'emp-123' },
        expect.objectContaining({
          $set: expect.objectContaining({
            name: 'Updated Name',
            mobile: '+919876543210',
            employee_role: 'admin'
          })
        })
      );
    });

    it('should return error if employee not found during update', async () => {
      const employeeDetails = {
        emp_id: 'emp-nonexistent',
        emp_name: 'Test Name',
        emp_mobile: '9999999999',
        employee_role: 'sales'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await updateEmployeeDetails(employeeDetails);

      expect(result.errorCode).toBe('EMPLOYEE_EXISTS');
      expect(User.updateOne).not.toHaveBeenCalled();
    });

    it('should return error if no modifications were made', async () => {
      const employeeDetails = {
        emp_id: 'emp-456',
        emp_name: 'Same Name',
        emp_mobile: '8888888888',
        employee_role: 'sales'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ id: 'emp-456' })
        })
      });

      User.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const result = await updateEmployeeDetails(employeeDetails);

      expect(result.errorCode).toBe('EMPLOYEE_NOT_FOUND');
      expect(result.message).toBe('Employee not found');
    });

    it('should handle database errors during update', async () => {
      const employeeDetails = {
        emp_id: 'emp-error',
        emp_name: 'Error Name',
        emp_mobile: '7777777777',
        employee_role: 'admin'
      };

      User.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ id: 'emp-error' })
        })
      });

      User.updateOne.mockRejectedValue(new Error('Database error'));

      const result = await updateEmployeeDetails(employeeDetails);

      expect(result.errorCode).toBe('INTERNAL_SERVER_ERROR');
      expect(result.message).toBe('Failed to update employee details');
    });
  });

  describe('removeEmployee', () => {
    
    it('should remove employee successfully', async () => {
      const removeEmpObj = {
        agent_id: 'agent-123',
        employee_id: 'emp-123'
      };

      User.collection = {
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
      };

      const result = await removeEmployee(removeEmpObj);

      expect(result).toBe('success');
      expect(User.collection.deleteOne).toHaveBeenCalledWith({ id: 'emp-123' });
      expect(User.collection.updateOne).toHaveBeenCalledWith(
        { id: 'agent-123' },
        { $pull: { employees: 'emp-123' } }
      );
    });

    it('should handle errors during removal', async () => {
      const removeEmpObj = {
        agent_id: 'agent-456',
        employee_id: 'emp-456'
      };

      User.collection = {
        deleteOne: jest.fn().mockRejectedValue(new Error('Delete error')),
        updateOne: jest.fn()
      };

      const result = await removeEmployee(removeEmpObj);

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('updateEmployeeEditRights', () => {
    
    it('should update employee access rights successfully', async () => {
      const editRightEmpObj = {
        employee_id: 'emp-123',
        access_rights: ['read', 'write', 'delete']
      };

      User.collection = {
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
      };

      const result = await updateEmployeeEditRights(editRightEmpObj);

      expect(result).toBe('success');
      expect(User.collection.updateOne).toHaveBeenCalledWith(
        { id: 'emp-123' },
        { $set: { access_rights: ['read', 'write', 'delete'] } }
      );
    });

    it('should handle errors during access rights update', async () => {
      const editRightEmpObj = {
        employee_id: 'emp-456',
        access_rights: ['read']
      };

      User.collection = {
        updateOne: jest.fn().mockRejectedValue(new Error('Update error'))
      };

      const result = await updateEmployeeEditRights(editRightEmpObj);

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('getEmployeeList', () => {
    
    it('should return list of employees for an agent', async () => {
      const userObj = {
        req_user_id: 'agent-123'
      };

      const mockEmployees = [
        { id: 'emp-1', name: 'Employee One', works_for: 'agent-123' },
        { id: 'emp-2', name: 'Employee Two', works_for: 'agent-123' }
      ];

      User.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockEmployees)
          })
        })
      });

      const result = await getEmployeeList(userObj);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('emp-1');
      expect(result[1].id).toBe('emp-2');
      expect(User.find).toHaveBeenCalledWith({
        works_for: 'agent-123',
        user_type: 'employee'
      });
    });

    it('should return empty list if no employees found', async () => {
      const userObj = {
        req_user_id: 'agent-new'
      };

      User.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([])
          })
        })
      });

      const result = await getEmployeeList(userObj);

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const userObj = {
        req_user_id: 'agent-error'
      };

      User.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new Error('Database error'))
          })
        })
      });

      const result = await getEmployeeList(userObj);

      expect(result).toBeNull();
    });
  });

  describe('updatePropertiesForEmployee', () => {
    
    it('should add residential rent property to employee', async () => {
      const userObj = {
        req_user_id: 'agent-123',
        employee_id: 'emp-123',
        employee_name: 'John Doe',
        operation: 'add',
        user_data: {},
        what_to_update_data: {
          isProperty: true,
          isCustomer: false,
          isResidential: true,
          isCommercial: false,
          isForRent: true,
          isForSell: false,
          property_id: 'prop-123'
        }
      };

      User.findOneAndUpdate.mockResolvedValue({
        id: 'emp-123',
        assigned_residential_rent_properties: ['prop-123']
      });

      ResidentialPropertyRent.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await updatePropertiesForEmployee(userObj);

      expect(result).toBe('success');
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'emp-123', works_for: 'agent-123' },
        expect.objectContaining({
          $addToSet: { assigned_residential_rent_properties: 'prop-123' }
        }),
        { new: true, lean: true }
      );
      expect(ResidentialPropertyRent.updateOne).toHaveBeenCalled();
    });

    it('should remove commercial sell property from employee', async () => {
      const userObj = {
        req_user_id: 'agent-456',
        employee_id: 'emp-456',
        employee_name: 'Jane Smith',
        operation: 'remove',
        user_data: {},
        what_to_update_data: {
          isProperty: true,
          isCustomer: false,
          isResidential: false,
          isCommercial: true,
          isForRent: false,
          isForSell: true,
          property_id: 'prop-456'
        }
      };

      User.findOneAndUpdate.mockResolvedValue({
        id: 'emp-456',
        assigned_commercial_sell_properties: []
      });

      CommercialPropertySell.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await updatePropertiesForEmployee(userObj);

      expect(result).toBe('success');
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'emp-456', works_for: 'agent-456' },
        expect.objectContaining({
          $pull: { assigned_commercial_sell_properties: 'prop-456' }
        }),
        { new: true, lean: true }
      );
    });

    it('should add residential buy customer to employee', async () => {
      const userObj = {
        req_user_id: 'agent-789',
        employee_id: 'emp-789',
        employee_name: 'Bob Johnson',
        operation: 'add',
        user_data: {},
        what_to_update_data: {
          isProperty: false,
          isCustomer: true,
          isResidential: true,
          isCommercial: false,
          isForRent: false,
          isForSell: true,
          customer_id: 'cust-789'
        }
      };

      User.findOneAndUpdate.mockResolvedValue({
        id: 'emp-789',
        assigned_residential_buy_customers: ['cust-789']
      });

      ResidentialPropertyCustomerBuy.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await updatePropertiesForEmployee(userObj);

      expect(result).toBe('success');
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'emp-789', works_for: 'agent-789' },
        expect.objectContaining({
          $addToSet: { assigned_residential_buy_customers: 'cust-789' }
        }),
        { new: true, lean: true }
      );
      expect(ResidentialPropertyCustomerBuy.updateOne).toHaveBeenCalled();
    });

    it('should remove commercial rent customer from employee', async () => {
      const userObj = {
        req_user_id: 'agent-111',
        employee_id: 'emp-111',
        employee_name: 'Alice Brown',
        operation: 'remove',
        user_data: {},
        what_to_update_data: {
          isProperty: false,
          isCustomer: true,
          isResidential: false,
          isCommercial: true,
          isForRent: true,
          isForSell: false,
          customer_id: 'cust-111'
        }
      };

      User.findOneAndUpdate.mockResolvedValue({
        id: 'emp-111',
        assigned_commercial_rent_customers: []
      });

      CommercialPropertyCustomerRent.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await updatePropertiesForEmployee(userObj);

      expect(result).toBe('success');
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'emp-111', works_for: 'agent-111' },
        expect.objectContaining({
          $pull: { assigned_commercial_rent_customers: 'cust-111' }
        }),
        { new: true, lean: true }
      );
    });

    it('should return unauthorized if employee not found', async () => {
      const userObj = {
        req_user_id: 'agent-999',
        employee_id: 'emp-nonexistent',
        employee_name: 'Not Found',
        operation: 'add',
        user_data: {},
        what_to_update_data: {
          isProperty: true,
          isCustomer: false,
          isResidential: true,
          isCommercial: false,
          isForRent: true,
          isForSell: false,
          property_id: 'prop-999'
        }
      };

      User.findOneAndUpdate.mockResolvedValue(null);

      const result = await updatePropertiesForEmployee(userObj);

      expect(result).toBe('Unauthorized or employee not found');
    });

    it('should handle database errors', async () => {
      const userObj = {
        req_user_id: 'agent-error',
        employee_id: 'emp-error',
        employee_name: 'Error User',
        operation: 'add',
        user_data: {},
        what_to_update_data: {
          isProperty: true,
          isCustomer: false,
          isResidential: true,
          isCommercial: false,
          isForRent: true,
          isForSell: false,
          property_id: 'prop-error'
        }
      };

      User.findOneAndUpdate.mockRejectedValue(new Error('Database error'));

      const result = await updatePropertiesForEmployee(userObj);

      expect(result).toHaveProperty('error');
      expect(result.error).toBe('Internal Server Error');
    });
  });
});
