"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("attendance", {
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
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      checkInTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      checkOutTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      location: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM("regular", "overtime", "holiday", "weekend"),
        defaultValue: "regular",
      },
      status: {
        type: Sequelize.ENUM(
          "present",
          "absent",
          "late",
          "early_departure",
          "half_day"
        ),
        defaultValue: "present",
      },
      totalHours: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
      },
      overtimeHours: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
        defaultValue: 0,
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
    await queryInterface.addIndex("attendance", ["employeeId"]);
    await queryInterface.addIndex("attendance", ["date"]);
    await queryInterface.addIndex("attendance", ["checkInTime"]);
    await queryInterface.addIndex("attendance", ["checkOutTime"]);
    await queryInterface.addIndex("attendance", ["status"]);
    await queryInterface.addIndex("attendance", ["type"]);

    // Add unique constraint for employee and date
    await queryInterface.addConstraint("attendance", {
      fields: ["employeeId", "date"],
      type: "unique",
      name: "attendance_employee_date_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("attendance");
  },
};
