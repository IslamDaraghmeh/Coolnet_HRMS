/**
 * Approvals Module Index
 * Exports all approvals-related functionality
 */

// Domain
const ApprovalWorkflow = require("./domain/entities/ApprovalWorkflow");
const ApprovalStep = require("./domain/entities/ApprovalStep");
const IApprovalWorkflowRepository = require("./domain/interfaces/IApprovalWorkflowRepository");

// Application Use Cases
const CreateApprovalWorkflowUseCase = require("./application/use-cases/CreateApprovalWorkflowUseCase");
const UpdateApprovalWorkflowUseCase = require("./application/use-cases/UpdateApprovalWorkflowUseCase");
const GetApprovalWorkflowUseCase = require("./application/use-cases/GetApprovalWorkflowUseCase");
const ListApprovalWorkflowsUseCase = require("./application/use-cases/ListApprovalWorkflowsUseCase");
const DeleteApprovalWorkflowUseCase = require("./application/use-cases/DeleteApprovalWorkflowUseCase");
const ProcessApprovalUseCase = require("./application/use-cases/ProcessApprovalUseCase");
const GetPendingApprovalsUseCase = require("./application/use-cases/GetPendingApprovalsUseCase");

// Infrastructure
const ApprovalWorkflowRepository = require("./infrastructure/repositories/ApprovalWorkflowRepository");

// Presentation
const approvalRoutes = require("./presentation/routes/approvals");
const approvalValidators = require("./presentation/validators/approvals");

module.exports = {
  // Domain Entities
  ApprovalWorkflow,
  ApprovalStep,
  IApprovalWorkflowRepository,

  // Application Use Cases
  CreateApprovalWorkflowUseCase,
  UpdateApprovalWorkflowUseCase,
  GetApprovalWorkflowUseCase,
  ListApprovalWorkflowsUseCase,
  DeleteApprovalWorkflowUseCase,
  ProcessApprovalUseCase,
  GetPendingApprovalsUseCase,

  // Infrastructure
  ApprovalWorkflowRepository,

  // Presentation
  approvalRoutes,
  approvalValidators,
};
