/**
 * Shifts Module Index
 * Exports all shifts-related functionality
 */

// Domain
const Shift = require("./domain/entities/Shift");
const ShiftAssignment = require("./domain/entities/ShiftAssignment");
const IShiftRepository = require("./domain/interfaces/IShiftRepository");
const IShiftAssignmentRepository = require("./domain/interfaces/IShiftAssignmentRepository");

// Application Use Cases
const CreateShiftUseCase = require("./application/use-cases/CreateShiftUseCase");
const UpdateShiftUseCase = require("./application/use-cases/UpdateShiftUseCase");
const GetShiftUseCase = require("./application/use-cases/GetShiftUseCase");
const ListShiftsUseCase = require("./application/use-cases/ListShiftsUseCase");
const DeleteShiftUseCase = require("./application/use-cases/DeleteShiftUseCase");

// Infrastructure
const ShiftRepository = require("./infrastructure/repositories/ShiftRepository");
const ShiftAssignmentRepository = require("./infrastructure/repositories/ShiftAssignmentRepository");

// Presentation
const shiftRoutes = require("./presentation/routes/shifts");
const shiftValidators = require("./presentation/validators/shifts");

module.exports = {
  // Domain Entities
  Shift,
  ShiftAssignment,
  IShiftRepository,
  IShiftAssignmentRepository,

  // Application Use Cases
  CreateShiftUseCase,
  UpdateShiftUseCase,
  GetShiftUseCase,
  ListShiftsUseCase,
  DeleteShiftUseCase,

  // Infrastructure
  ShiftRepository,
  ShiftAssignmentRepository,

  // Presentation
  shiftRoutes,
  shiftValidators,
};
