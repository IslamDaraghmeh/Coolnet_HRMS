const User = require("../../domain/entities/User");
const Employee = require("../../domain/entities/Employee");
const Session = require("../../domain/entities/Session");
const UserActivity = require("../../domain/entities/UserActivity");
const AuditLog = require("../../domain/entities/AuditLog");
const Role = require("../../domain/entities/Role");
const UserRole = require("../../domain/entities/UserRole");
const UserIdentity = require("../../domain/entities/UserIdentity");

// New modules
const Department = require("../../modules/departments/domain/entities/Department");
const Position = require("../../modules/positions/domain/entities/Position");
const ApprovalWorkflow = require("../../modules/approvals/domain/entities/ApprovalWorkflow");
const ApprovalStep = require("../../modules/approvals/domain/entities/ApprovalStep");

/**
 * Define all model associations
 */
function defineAssociations() {
  // User associations
  User.belongsTo(Employee, {
    foreignKey: "employeeId",
    as: "employee",
  });

  User.hasMany(Session, {
    foreignKey: "userId",
    as: "sessions",
  });

  User.hasMany(UserActivity, {
    foreignKey: "userId",
    as: "activities",
  });

  User.hasMany(AuditLog, {
    foreignKey: "userId",
    as: "auditLogs",
  });

  User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "userId",
    otherKey: "roleId",
    as: "roles",
  });

  // Employee associations
  Employee.hasOne(User, {
    foreignKey: "employeeId",
    as: "user",
  });

  // Session associations
  Session.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  Session.hasMany(UserActivity, {
    foreignKey: "sessionId",
    as: "activities",
  });

  Session.hasMany(AuditLog, {
    foreignKey: "sessionId",
    as: "auditLogs",
  });

  // UserActivity associations
  UserActivity.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  UserActivity.belongsTo(Session, {
    foreignKey: "sessionId",
    as: "session",
  });

  // AuditLog associations
  AuditLog.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  AuditLog.belongsTo(Session, {
    foreignKey: "sessionId",
    as: "session",
  });

  // Role associations
  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "roleId",
    otherKey: "userId",
    as: "users",
  });

  // UserRole associations
  UserRole.belongsTo(User, {
    foreignKey: "userId",
  });

  UserRole.belongsTo(Role, {
    foreignKey: "roleId",
  });

  // UserIdentity associations
  User.hasMany(UserIdentity, {
    foreignKey: "userId",
    as: "identities",
  });

  UserIdentity.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  Session.hasMany(UserIdentity, {
    foreignKey: "sessionId",
    as: "identities",
  });

  UserIdentity.belongsTo(Session, {
    foreignKey: "sessionId",
    as: "session",
  });

  // Department associations
  Department.belongsTo(Department, {
    as: "parent",
    foreignKey: "parentDepartmentId",
  });

  Department.hasMany(Department, {
    as: "children",
    foreignKey: "parentDepartmentId",
  });

  Department.belongsTo(Employee, {
    as: "head",
    foreignKey: "headId",
  });

  Department.hasMany(Employee, {
    as: "employees",
    foreignKey: "departmentId",
  });

  // Position associations
  Position.belongsTo(Department, {
    as: "department",
    foreignKey: "departmentId",
  });

  Position.hasMany(Employee, {
    as: "employees",
    foreignKey: "positionId",
  });

  // Employee associations with new entities
  Employee.belongsTo(Department, {
    as: "departmentInfo",
    foreignKey: "departmentId",
  });

  Employee.belongsTo(Position, {
    as: "positionInfo",
    foreignKey: "positionId",
  });

  // Approval Workflow associations
  ApprovalWorkflow.belongsTo(Department, {
    as: "department",
    foreignKey: "departmentId",
  });

  ApprovalWorkflow.belongsTo(Position, {
    as: "position",
    foreignKey: "positionId",
  });

  ApprovalWorkflow.hasMany(ApprovalStep, {
    as: "steps",
    foreignKey: "workflowId",
  });

  // Approval Step associations
  ApprovalStep.belongsTo(ApprovalWorkflow, {
    as: "workflow",
    foreignKey: "workflowId",
  });

  ApprovalStep.belongsTo(User, {
    as: "approver",
    foreignKey: "approverId",
  });

  ApprovalStep.belongsTo(Position, {
    as: "position",
    foreignKey: "positionId",
  });

  ApprovalStep.belongsTo(Role, {
    as: "role",
    foreignKey: "roleId",
  });

  ApprovalStep.belongsTo(Department, {
    as: "department",
    foreignKey: "departmentId",
  });
}

module.exports = defineAssociations;
