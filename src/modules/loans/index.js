/**
 * Loans Module Index
 * Exports all loans-related functionality
 */

// Domain
const Loan = require("./domain/entities/Loan");
const ILoanRepository = require("./domain/interfaces/ILoanRepository");

// Application Use Cases
const CreateLoanUseCase = require("./application/use-cases/CreateLoanUseCase");
const UpdateLoanUseCase = require("./application/use-cases/UpdateLoanUseCase");
const GetLoanUseCase = require("./application/use-cases/GetLoanUseCase");
const ListLoansUseCase = require("./application/use-cases/ListLoansUseCase");
const DeleteLoanUseCase = require("./application/use-cases/DeleteLoanUseCase");

// Infrastructure
const LoanRepository = require("./infrastructure/repositories/LoanRepository");

// Presentation
const loanRoutes = require("./presentation/routes/loans");
const loanValidators = require("./presentation/validators/loans");

module.exports = {
  // Domain Entities
  Loan,
  ILoanRepository,

  // Application Use Cases
  CreateLoanUseCase,
  UpdateLoanUseCase,
  GetLoanUseCase,
  ListLoansUseCase,
  DeleteLoanUseCase,

  // Infrastructure
  LoanRepository,

  // Presentation
  loanRoutes,
  loanValidators,
};
