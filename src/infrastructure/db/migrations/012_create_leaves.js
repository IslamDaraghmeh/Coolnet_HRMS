"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Leaves", {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      employeeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      leaveType: {
        type: Sequelize.ENUM(
          "annual",
          "sick",
          "personal",
          "maternity",
          "paternity",
          "bereavement",
          "unpaid"
        ),
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      totalDays: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected", "cancelled"),
        defaultValue: "pending",
      },
      attachments: {
        type: Sequelize.JSONB, // Array of file URLs
        allowNull: true,
      },
      emergencyContact: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      submittedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      approvedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancelledBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      cancellationReason: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex("Leaves", ["employeeId"]);
    await queryInterface.addIndex("Leaves", ["leaveType"]);
    await queryInterface.addIndex("Leaves", ["status"]);
    await queryInterface.addIndex("Leaves", ["startDate"]);
    await queryInterface.addIndex("Leaves", ["endDate"]);
    await queryInterface.addIndex("Leaves", ["approvedBy"]);
    await queryInterface.addIndex("Leaves", ["cancelledBy"]);
    await queryInterface.addIndex("Leaves", ["submittedAt"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Leaves");
  },
};
