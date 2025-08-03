/**
 * Employees Module Index
 * Exports all employees-related functionality
 */

// Domain
const Employee = require('./domain/entities/Employee');
const IEmployeeRepository = require('./domain/interfaces/IEmployeeRepository');

// Application Use Cases
const CreateEmployeeUseCase = require('./application/use-cases/CreateEmployeeUseCase');
const UpdateEmployeeUseCase = require('./application/use-cases/UpdateEmployeeUseCase');
const GetEmployeeUseCase = require('./application/use-cases/GetEmployeeUseCase');
const ListEmployeesUseCase = require('./application/use-cases/ListEmployeesUseCase');
const DeleteEmployeeUseCase = require('./application/use-cases/DeleteEmployeeUseCase');

// Infrastructure
const EmployeeRepository = require('./infrastructure/repositories/EmployeeRepository');

// Presentation
const employeeRoutes = require('./presentation/routes/employees');
const employeeValidators = require('./presentation/validators/employees');

module.exports = {
  // Domain Entities
  Employee,
  IEmployeeRepository,
  
  // Application Use Cases
  CreateEmployeeUseCase,
  UpdateEmployeeUseCase,
  GetEmployeeUseCase,
  ListEmployeesUseCase,
  DeleteEmployeeUseCase,
  
  // Infrastructure
  EmployeeRepository,
  
  // Presentation
  employeeRoutes,
  employeeValidators,
}; 