"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("branches", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: "Unique branch code (e.g., HQ, NY, LA)",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      address: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: "Complete address information",
      },
      contactInfo: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: "Contact information for the branch",
      },
      managerId: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: "Branch manager employee ID",
      },
      parentBranchId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "branches",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Parent branch for hierarchical structure",
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "UTC",
        comment: "Branch timezone",
      },
      workingHours: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {
          monday: { start: "09:00", end: "17:00", isWorking: true },
          tuesday: { start: "09:00", end: "17:00", isWorking: true },
          wednesday: { start: "09:00", end: "17:00", isWorking: true },
          thursday: { start: "09:00", end: "17:00", isWorking: true },
          friday: { start: "09:00", end: "17:00", isWorking: true },
          saturday: { start: "09:00", end: "13:00", isWorking: false },
          sunday: { start: "00:00", end: "00:00", isWorking: false },
        },
        comment: "Working hours for each day of the week",
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Maximum number of employees for this branch",
      },
      currentEmployees: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Current number of employees in this branch",
      },
      facilities: {
        type: Sequelize.JSONB,
        defaultValue: [],
        comment: "Available facilities in this branch",
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "maintenance", "closed"),
        defaultValue: "active",
        allowNull: false,
      },
      isHeadquarters: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Whether this is the company headquarters",
      },
      establishedDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "Date when the branch was established",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create indexes
    await queryInterface.addIndex("branches", ["code"]);
    await queryInterface.addIndex("branches", ["status"]);
    await queryInterface.addIndex("branches", ["managerId"]);
    await queryInterface.addIndex("branches", ["parentBranchId"]);
    await queryInterface.addIndex("branches", ["isHeadquarters"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("branches");
  },
};
