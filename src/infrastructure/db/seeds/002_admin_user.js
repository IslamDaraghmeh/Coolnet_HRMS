"use strict";

const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create admin employee
    const adminEmployee = {
      id: "550e8400-e29b-41d4-a716-446655440101",
      employeeId: "ADMIN001",
      firstName: "System",
      lastName: "Administrator",
      dateOfBirth: "1990-01-01",
      gender: "other",
      email: "admin@company.com",
      phoneNumber: "0566008007",
      address: JSON.stringify({
        street: "123 Admin Street",
        city: "Admin City",
        state: "Admin State",
        zipCode: "12345",
        country: "Admin Country",
      }),
      emergencyContact: JSON.stringify({
        name: "Emergency Contact",
        phoneNumber: "+1234567891",
        relationship: "Emergency",
        email: "emergency@company.com",
      }),
      hireDate: "2020-01-01",
      position: "System Administrator",
      department: "IT",
      salary: 100000.0,
      managerId: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert("employees", [adminEmployee], {});

    // Create admin user
    const hashedPassword = await bcrypt.hash("Admin@123", 12);
    const adminUser = {
      id: "550e8400-e29b-41d4-a716-446655440102",
      phoneNumber: "0566008007",
      email: "admin@company.com",
      password: hashedPassword,
      employeeId: "550e8400-e29b-41d4-a716-446655440101",
      isActive: true,
      lastLoginAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert("Users", [adminUser], {});

    // Assign admin role to admin user
    const adminUserRole = {
      id: "550e8400-e29b-41d4-a716-446655440103",
      userId: "550e8400-e29b-41d4-a716-446655440102",
      roleId: "550e8400-e29b-41d4-a716-446655440001", // admin role
      assignedBy: "550e8400-e29b-41d4-a716-446655440102",
      assignedAt: new Date(),
      expiresAt: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert("UserRoles", [adminUserRole], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("UserRoles", null, {});
    await queryInterface.bulkDelete("Users", null, {});
    await queryInterface.bulkDelete("employees", null, {});
  },
};
