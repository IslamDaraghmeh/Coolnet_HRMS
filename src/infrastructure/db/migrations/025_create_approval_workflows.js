"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("approval_workflows", {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      entityType: {
        type: Sequelize.ENUM("leave", "loan", "expense", "purchase", "custom"),
        allowNull: false,
        comment: "Type of entity this workflow applies to",
      },
      departmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "departments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment:
          "Department this workflow applies to (null for all departments)",
      },
      positionId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "positions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Position this workflow applies to (null for all positions)",
      },
      minAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: "Minimum amount that triggers this workflow",
      },
      maxAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: "Maximum amount that triggers this workflow",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: "Workflow-specific settings and configurations",
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
    await queryInterface.addIndex("approval_workflows", ["name"]);
    await queryInterface.addIndex("approval_workflows", ["entityType"]);
    await queryInterface.addIndex("approval_workflows", ["departmentId"]);
    await queryInterface.addIndex("approval_workflows", ["positionId"]);
    await queryInterface.addIndex("approval_workflows", ["isActive"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("approval_workflows");
  },
};
