/**
 * Positions Module Index
 * Exports all positions-related functionality
 */

// Domain
const Position = require("./domain/entities/Position");
const IPositionRepository = require("./domain/interfaces/IPositionRepository");

// Application Use Cases
const CreatePositionUseCase = require("./application/use-cases/CreatePositionUseCase");
const UpdatePositionUseCase = require("./application/use-cases/UpdatePositionUseCase");
const GetPositionUseCase = require("./application/use-cases/GetPositionUseCase");
const ListPositionsUseCase = require("./application/use-cases/ListPositionsUseCase");
const DeletePositionUseCase = require("./application/use-cases/DeletePositionUseCase");
const AssignEmployeeToPositionUseCase = require("./application/use-cases/AssignEmployeeToPositionUseCase");

// Infrastructure
const PositionRepository = require("./infrastructure/repositories/PositionRepository");

// Presentation
const positionRoutes = require("./presentation/routes/positions");
const positionValidators = require("./presentation/validators/positions");

module.exports = {
  // Domain Entities
  Position,
  IPositionRepository,

  // Application Use Cases
  CreatePositionUseCase,
  UpdatePositionUseCase,
  GetPositionUseCase,
  ListPositionsUseCase,
  DeletePositionUseCase,
  AssignEmployeeToPositionUseCase,

  // Infrastructure
  PositionRepository,

  // Presentation
  positionRoutes,
  positionValidators,
};
