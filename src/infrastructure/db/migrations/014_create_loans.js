"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Loans", {
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
      loanType: {
        type: Sequelize.ENUM(
          "personal",
          "emergency",
          "education",
          "medical",
          "housing"
        ),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      purpose: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      interestRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      termMonths: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      monthlyPayment: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "approved",
          "rejected",
          "active",
          "completed",
          "defaulted"
        ),
        defaultValue: "pending",
      },
      approvedAmount: {
        type: Sequelize.DECIMAL(10, 2),
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
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      attachments: {
        type: Sequelize.JSONB, // Array of file URLs
        allowNull: true,
      },
      guarantorName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      guarantorPhone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      guarantorRelationship: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      notes: {
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
    await queryInterface.addIndex("Loans", ["employeeId"]);
    await queryInterface.addIndex("Loans", ["loanType"]);
    await queryInterface.addIndex("Loans", ["status"]);
    await queryInterface.addIndex("Loans", ["approvedBy"]);
    await queryInterface.addIndex("Loans", ["startDate"]);
    await queryInterface.addIndex("Loans", ["endDate"]);
    await queryInterface.addIndex("Loans", ["amount"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Loans");
  },
};
