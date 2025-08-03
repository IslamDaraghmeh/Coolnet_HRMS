/**
 * Branches Module Index
 * Exports all branches-related functionality
 */

// Domain
const Branch = require('./domain/entities/Branch');
const IBranchRepository = require('./domain/interfaces/IBranchRepository');

// Application Use Cases
const CreateBranchUseCase = require('./application/use-cases/CreateBranchUseCase');
const UpdateBranchUseCase = require('./application/use-cases/UpdateBranchUseCase');
const GetBranchUseCase = require('./application/use-cases/GetBranchUseCase');
const ListBranchesUseCase = require('./application/use-cases/ListBranchesUseCase');
const DeleteBranchUseCase = require('./application/use-cases/DeleteBranchUseCase');

// Infrastructure
const BranchRepository = require('./infrastructure/repositories/BranchRepository');

// Presentation
const branchRoutes = require('./presentation/routes/branches');
const branchValidators = require('./presentation/validators/branches');

module.exports = {
  // Domain Entities
  Branch,
  IBranchRepository,
  
  // Application Use Cases
  CreateBranchUseCase,
  UpdateBranchUseCase,
  GetBranchUseCase,
  ListBranchesUseCase,
  DeleteBranchUseCase,
  
  // Infrastructure
  BranchRepository,
  
  // Presentation
  branchRoutes,
  branchValidators,
}; 