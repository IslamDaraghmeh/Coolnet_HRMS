"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("LeaveApprovals", {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      leaveId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Leaves",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      approverId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      isRequired: {
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
    await queryInterface.addIndex("LeaveApprovals", ["leaveId"]);
    await queryInterface.addIndex("LeaveApprovals", ["approverId"]);
    await queryInterface.addIndex("LeaveApprovals", ["status"]);
    await queryInterface.addIndex("LeaveApprovals", ["level"]);
    await queryInterface.addIndex("LeaveApprovals", ["approvedAt"]);

    // Add unique constraint for leave and approver
    await queryInterface.addConstraint("LeaveApprovals", {
      fields: ["leaveId", "approverId"],
      type: "unique",
      name: "leave_approval_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("LeaveApprovals");
  },
};
