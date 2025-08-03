"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      employeeId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      lastLoginAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      refreshToken: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      refreshTokenExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      resetPasswordToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      resetPasswordExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      passwordChangedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.addIndex("Users", ["phoneNumber"]);
    await queryInterface.addIndex("Users", ["email"]);
    await queryInterface.addIndex("Users", ["employeeId"]);
    await queryInterface.addIndex("Users", ["isActive"]);
    await queryInterface.addIndex("Users", ["resetPasswordToken"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
