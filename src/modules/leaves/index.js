/**
 * Leaves Module Index
 * Exports all leaves-related functionality
 */

// Domain
const Leave = require('./domain/entities/Leave');
const ILeaveRepository = require('./domain/interfaces/ILeaveRepository');

// Application Use Cases
const CreateLeaveUseCase = require('./application/use-cases/CreateLeaveUseCase');
const UpdateLeaveUseCase = require('./application/use-cases/UpdateLeaveUseCase');
const GetLeaveUseCase = require('./application/use-cases/GetLeaveUseCase');
const ListLeavesUseCase = require('./application/use-cases/ListLeavesUseCase');
const DeleteLeaveUseCase = require('./application/use-cases/DeleteLeaveUseCase');

// Infrastructure
const LeaveRepository = require('./infrastructure/repositories/LeaveRepository');

// Presentation
const leaveRoutes = require('./presentation/routes/leaves');
const leaveValidators = require('./presentation/validators/leaves');

module.exports = {
  // Domain Entities
  Leave,
  ILeaveRepository,
  
  // Application Use Cases
  CreateLeaveUseCase,
  UpdateLeaveUseCase,
  GetLeaveUseCase,
  ListLeavesUseCase,
  DeleteLeaveUseCase,
  
  // Infrastructure
  LeaveRepository,
  
  // Presentation
  leaveRoutes,
  leaveValidators,
}; 