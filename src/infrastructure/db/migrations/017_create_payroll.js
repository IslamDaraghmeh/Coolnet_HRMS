"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Payroll", {
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
      payPeriod: {
        type: Sequelize.STRING, // e.g., "January 2024", "Q1 2024"
        allowNull: false,
      },
      payDate: {
        type: Sequelize.DATEONLY,
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
      basicSalary: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      allowances: {
        type: Sequelize.JSONB, // Array of allowance objects
        allowNull: true,
      },
      totalAllowances: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      overtimePay: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      bonuses: {
        type: Sequelize.JSONB, // Array of bonus objects
        allowNull: true,
      },
      totalBonuses: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      deductions: {
        type: Sequelize.JSONB, // Array of deduction objects
        allowNull: true,
      },
      totalDeductions: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      taxAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      insuranceAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      pensionAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      loanDeductions: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      grossPay: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      netPay: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      workingDays: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      overtimeHours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      leaveDays: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM(
          "draft",
          "pending",
          "approved",
          "paid",
          "cancelled"
        ),
        defaultValue: "draft",
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
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      paymentMethod: {
        type: Sequelize.ENUM("bank_transfer", "check", "cash"),
        allowNull: true,
      },
      referenceNumber: {
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
    await queryInterface.addIndex("Payroll", ["employeeId"]);
    await queryInterface.addIndex("Payroll", ["payPeriod"]);
    await queryInterface.addIndex("Payroll", ["payDate"]);
    await queryInterface.addIndex("Payroll", ["startDate"]);
    await queryInterface.addIndex("Payroll", ["endDate"]);
    await queryInterface.addIndex("Payroll", ["status"]);
    await queryInterface.addIndex("Payroll", ["approvedBy"]);
    await queryInterface.addIndex("Payroll", ["grossPay"]);
    await queryInterface.addIndex("Payroll", ["netPay"]);
    await queryInterface.addIndex("Payroll", ["referenceNumber"]);

    // Add unique constraint for employee and pay period
    await queryInterface.addConstraint("Payroll", {
      fields: ["employeeId", "payPeriod"],
      type: "unique",
      name: "payroll_employee_period_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Payroll");
  },
};
