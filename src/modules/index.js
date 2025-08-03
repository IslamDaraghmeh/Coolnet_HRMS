/**
 * Modules Index
 * Central export for all business modules
 */

const authModule = require("./auth");
const branchesModule = require("./branches");
const employeesModule = require("./employees");
const attendanceModule = require("./attendance");
const leavesModule = require("./leaves");
const payrollModule = require("./payroll");
const performanceModule = require("./performance");
const notificationsModule = require("./notifications");
const auditModule = require("./audit");
const shiftsModule = require("./shifts");
const loansModule = require("./loans");
const identitiesModule = require("./identities");
const activitiesModule = require("./activities");
const sessionsModule = require("./sessions");
const healthModule = require("./health");
const departmentsModule = require("./departments");
const positionsModule = require("./positions");
const approvalsModule = require("./approvals");

module.exports = {
  auth: authModule,
  branches: branchesModule,
  employees: employeesModule,
  attendance: attendanceModule,
  leaves: leavesModule,
  payroll: payrollModule,
  performance: performanceModule,
  notifications: notificationsModule,
  audit: auditModule,
  shifts: shiftsModule,
  loans: loansModule,
  identities: identitiesModule,
  activities: activitiesModule,
  sessions: sessionsModule,
  health: healthModule,
  departments: departmentsModule,
  positions: positionsModule,
  approvals: approvalsModule,
};
