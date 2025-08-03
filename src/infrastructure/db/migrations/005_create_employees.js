"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("employees", {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      employeeId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dateOfBirth: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      gender: {
        type: Sequelize.ENUM("male", "female", "other"),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      emergencyContact: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      hireDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      position: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      department: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      salary: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      managerId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add indexes
    await queryInterface.addIndex("employees", ["employeeId"]);
    await queryInterface.addIndex("employees", ["email"]);
    await queryInterface.addIndex("employees", ["phoneNumber"]);
    await queryInterface.addIndex("employees", ["department"]);
    await queryInterface.addIndex("employees", ["position"]);
    await queryInterface.addIndex("employees", ["isActive"]);
    await queryInterface.addIndex("employees", ["managerId"]);
    await queryInterface.addIndex("employees", ["hireDate"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("employees");
  },
};
