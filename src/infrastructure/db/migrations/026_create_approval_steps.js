"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("approval_steps", {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      workflowId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "approval_workflows",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      stepOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Order of this step in the workflow",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      approverType: {
        type: Sequelize.ENUM(
          "specific_user",
          "department_head",
          "position_based",
          "role_based",
          "any_manager",
          "hr_manager",
          "finance_manager"
        ),
        allowNull: false,
        comment: "Type of approver for this step",
      },
      approverId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Specific user ID if approverType is specific_user",
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
        comment: "Position ID if approverType is position_based",
      },
      roleId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Roles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Role ID if approverType is role_based",
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
        comment: "Department ID for department_head or position_based",
      },
      isRequired: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "Whether this step is required for approval",
      },
      canDelegate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Whether approver can delegate to someone else",
      },
      canSkip: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Whether this step can be skipped",
      },
      autoApprove: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "Whether this step auto-approves after a certain time",
      },
      autoApproveAfterHours: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Hours after which to auto-approve",
      },
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: "Step-specific settings and configurations",
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
    await queryInterface.addIndex("approval_steps", ["workflowId"]);
    await queryInterface.addIndex("approval_steps", ["stepOrder"]);
    await queryInterface.addIndex("approval_steps", ["approverType"]);
    await queryInterface.addIndex("approval_steps", ["approverId"]);
    await queryInterface.addIndex("approval_steps", ["positionId"]);
    await queryInterface.addIndex("approval_steps", ["roleId"]);
    await queryInterface.addIndex("approval_steps", ["departmentId"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("approval_steps");
  },
};
