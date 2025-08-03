"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "admin",
        description: "System Administrator with full access",
        permissions: JSON.stringify([
          // User management
          "users:read",
          "users:create",
          "users:update",
          "users:delete",

          // Employee management
          "employees:read",
          "employees:create",
          "employees:update",
          "employees:delete",

          // Branch management
          "branches:read",
          "branches:create",
          "branches:update",
          "branches:delete",

          // Attendance management
          "attendance:read",
          "attendance:create",
          "attendance:update",
          "attendance:delete",

          // Leave management
          "leaves:read",
          "leaves:create",
          "leaves:update",
          "leaves:delete",
          "leaves:approve",

          // Shift management
          "shifts:read",
          "shifts:create",
          "shifts:update",
          "shifts:delete",

          // Loan management
          "loans:read",
          "loans:create",
          "loans:update",
          "loans:delete",
          "loans:approve",

          // Payroll management
          "payroll:read",
          "payroll:create",
          "payroll:update",
          "payroll:delete",

          // Performance management
          "performance:read",
          "performance:create",
          "performance:update",
          "performance:delete",

          // Notification management
          "notifications:read",
          "notifications:create",
          "notifications:update",
          "notifications:delete",

          // Role management
          "roles:read",
          "roles:create",
          "roles:update",
          "roles:delete",

          // Session management
          "sessions:read",
          "sessions:create",
          "sessions:update",
          "sessions:delete",

          // Activity management
          "activities:read",
          "activities:create",
          "activities:update",
          "activities:delete",

          // Audit management
          "audit:read",
          "audit:create",
          "audit:update",
          "audit:delete",

          // Identity management
          "identities:read",
          "identities:create",
          "identities:update",
          "identities:delete",

          // Additional permissions that might be used
          "me:read",
          "me:update",
          "auth:login",
          "auth:logout",
          "auth:refresh",
          "auth:forgot-password",
          "auth:reset-password",
          "health:read",
          "files:read",
          "files:create",
          "files:update",
          "files:delete",
          "reports:read",
          "reports:create",
          "reports:update",
          "reports:delete",
          "settings:read",
          "settings:create",
          "settings:update",
          "settings:delete",
          "dashboard:read",
          "statistics:read",
          "exports:create",
          "imports:create",
          "backup:create",
          "backup:restore",
          "logs:read",
          "system:admin",
          "*:read",
          "*:create",
          "*:update",
          "*:delete",
          "*:approve",
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "hr_manager",
        description: "HR Manager with employee management access",
        permissions: JSON.stringify([
          "users:read",
          "employees:read",
          "employees:create",
          "employees:update",
          "attendance:read",
          "attendance:create",
          "attendance:update",
          "leaves:read",
          "leaves:create",
          "leaves:update",
          "leaves:approve",
          "shifts:read",
          "shifts:create",
          "shifts:update",
          "loans:read",
          "loans:create",
          "loans:update",
          "loans:approve",
          "payroll:read",
          "payroll:create",
          "payroll:update",
          "performance:read",
          "performance:create",
          "performance:update",
          "notifications:read",
          "notifications:create",
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "manager",
        description: "Department Manager with team management access",
        permissions: JSON.stringify([
          "employees:read",
          "attendance:read",
          "attendance:create",
          "attendance:update",
          "leaves:read",
          "leaves:approve",
          "shifts:read",
          "performance:read",
          "performance:create",
          "performance:update",
          "notifications:read",
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        name: "employee",
        description: "Regular employee with basic access",
        permissions: JSON.stringify([
          "employees:read",
          "attendance:read",
          "attendance:create",
          "leaves:read",
          "leaves:create",
          "leaves:update",
          "shifts:read",
          "performance:read",
          "notifications:read",
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440005",
        name: "hr_specialist",
        description: "HR Specialist with limited HR access",
        permissions: JSON.stringify([
          "employees:read",
          "attendance:read",
          "attendance:create",
          "leaves:read",
          "leaves:create",
          "leaves:update",
          "shifts:read",
          "performance:read",
          "notifications:read",
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440006",
        name: "developer",
        description: "Developer with technical access",
        permissions: JSON.stringify([
          "employees:read",
          "attendance:read",
          "attendance:create",
          "leaves:read",
          "leaves:create",
          "leaves:update",
          "shifts:read",
          "performance:read",
          "notifications:read",
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Roles", roles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Roles", null, {});
  },
};
