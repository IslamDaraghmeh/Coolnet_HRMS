/**
 * Payroll Module Index
 * Exports all payroll-related functionality
 */

// Domain
const Payroll = require('./domain/entities/Payroll');
const IPayrollRepository = require('./domain/interfaces/IPayrollRepository');

// Application Use Cases
const CreatePayrollUseCase = require('./application/use-cases/CreatePayrollUseCase');
const UpdatePayrollUseCase = require('./application/use-cases/UpdatePayrollUseCase');
const GetPayrollUseCase = require('./application/use-cases/GetPayrollUseCase');
const ListPayrollsUseCase = require('./application/use-cases/ListPayrollsUseCase');
const DeletePayrollUseCase = require('./application/use-cases/DeletePayrollUseCase');

// Infrastructure
const PayrollRepository = require('./infrastructure/repositories/PayrollRepository');

// Presentation
const payrollRoutes = require('./presentation/routes/payroll');
const payrollValidators = require('./presentation/validators/payroll');

module.exports = {
  // Domain Entities
  Payroll,
  IPayrollRepository,
  
  // Application Use Cases
  CreatePayrollUseCase,
  UpdatePayrollUseCase,
  GetPayrollUseCase,
  ListPayrollsUseCase,
  DeletePayrollUseCase,
  
  // Infrastructure
  PayrollRepository,
  
  // Presentation
  payrollRoutes,
  payrollValidators,
}; 