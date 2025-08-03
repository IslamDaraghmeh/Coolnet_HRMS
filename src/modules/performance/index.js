/**
 * Performance Module Index
 * Exports all performance-related functionality
 */

// Domain
const PerformanceReview = require("./domain/entities/PerformanceReview");
const IPerformanceRepository = require("./domain/interfaces/IPerformanceRepository");

// Application Use Cases
const CreatePerformanceUseCase = require("./application/use-cases/CreatePerformanceUseCase");
const UpdatePerformanceUseCase = require("./application/use-cases/UpdatePerformanceUseCase");
const GetPerformanceUseCase = require("./application/use-cases/GetPerformanceUseCase");
const ListPerformancesUseCase = require("./application/use-cases/ListPerformancesUseCase");
const DeletePerformanceUseCase = require("./application/use-cases/DeletePerformanceUseCase");

// Infrastructure
const PerformanceRepository = require("./infrastructure/repositories/PerformanceRepository");

// Presentation
const performanceRoutes = require("./presentation/routes/performance");
const performanceValidators = require("./presentation/validators/performance");

module.exports = {
  // Domain Entities
  PerformanceReview,
  IPerformanceRepository,

  // Application Use Cases
  CreatePerformanceUseCase,
  UpdatePerformanceUseCase,
  GetPerformanceUseCase,
  ListPerformancesUseCase,
  DeletePerformanceUseCase,

  // Infrastructure
  PerformanceRepository,

  // Presentation
  performanceRoutes,
  performanceValidators,
};
