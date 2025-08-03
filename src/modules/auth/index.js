/**
 * Auth Module Index
 * Exports all auth-related functionality
 */

// Domain
const User = require("./domain/entities/User");
const Session = require("./domain/entities/Session");
const Role = require("./domain/entities/Role");
const UserRole = require("./domain/entities/UserRole");

// Application Services
const AuthService = require("./application/services/AuthService");
const SessionService = require("./application/services/SessionService");
const DeviceFingerprintService = require("./application/services/DeviceFingerprintService");

// Application Use Cases
const LoginUseCase = require("./application/use-cases/LoginUseCase");
const LogoutUseCase = require("./application/use-cases/LogoutUseCase");
const RegisterUseCase = require("./application/use-cases/RegisterUseCase");
const RefreshTokenUseCase = require("./application/use-cases/RefreshTokenUseCase");
const ForgotPasswordUseCase = require("./application/use-cases/ForgotPasswordUseCase");
const ResetPasswordUseCase = require("./application/use-cases/ResetPasswordUseCase");
const ChangePasswordUseCase = require("./application/use-cases/ChangePasswordUseCase");

// Infrastructure
const UserRepository = require("./infrastructure/repositories/UserRepository");
const SessionRepository = require("./infrastructure/repositories/SessionRepository");

// Presentation
const authRoutes = require("./presentation/routes/auth");
const authValidators = require("./presentation/validators/auth");

module.exports = {
  // Domain Entities
  User,
  Session,
  Role,
  UserRole,

  // Application Services
  AuthService,
  SessionService,
  DeviceFingerprintService,

  // Application Use Cases
  LoginUseCase,
  LogoutUseCase,
  RegisterUseCase,
  RefreshTokenUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  ChangePasswordUseCase,

  // Infrastructure
  UserRepository,
  SessionRepository,

  // Presentation
  authRoutes,
  authValidators,
};
