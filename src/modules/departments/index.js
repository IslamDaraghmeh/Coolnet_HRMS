/**
 * Departments Module Index
 * Exports all departments-related functionality
 */

// Domain
const Department = require("./domain/entities/Department");
const IDepartmentRepository = require("./domain/interfaces/IDepartmentRepository");

// Application Use Cases
const CreateDepartmentUseCase = require("./application/use-cases/CreateDepartmentUseCase");
const UpdateDepartmentUseCase = require("./application/use-cases/UpdateDepartmentUseCase");
const GetDepartmentUseCase = require("./application/use-cases/GetDepartmentUseCase");
const ListDepartmentsUseCase = require("./application/use-cases/ListDepartmentsUseCase");
const DeleteDepartmentUseCase = require("./application/use-cases/DeleteDepartmentUseCase");
const AssignEmployeeToDepartmentUseCase = require("./application/use-cases/AssignEmployeeToDepartmentUseCase");

// Infrastructure
const DepartmentRepository = require("./infrastructure/repositories/DepartmentRepository");

// Presentation
const departmentRoutes = require("./presentation/routes/departments");
const departmentValidators = require("./presentation/validators/departments");

module.exports = {
  // Domain Entities
  Department,
  IDepartmentRepository,

  // Application Use Cases
  CreateDepartmentUseCase,
  UpdateDepartmentUseCase,
  GetDepartmentUseCase,
  ListDepartmentsUseCase,
  DeleteDepartmentUseCase,
  AssignEmployeeToDepartmentUseCase,

  // Infrastructure
  DepartmentRepository,

  // Presentation
  departmentRoutes,
  departmentValidators,
};
