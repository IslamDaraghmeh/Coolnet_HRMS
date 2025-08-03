"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ShiftAssignments", {
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
      shiftId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Shifts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      isRecurring: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      recurringDays: {
        type: Sequelize.JSONB, // Array of days [1,2,3,4,5,6,7]
        allowNull: true,
      },
      assignedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      assignedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.addIndex("ShiftAssignments", ["employeeId"]);
    await queryInterface.addIndex("ShiftAssignments", ["shiftId"]);
    await queryInterface.addIndex("ShiftAssignments", ["startDate"]);
    await queryInterface.addIndex("ShiftAssignments", ["endDate"]);
    await queryInterface.addIndex("ShiftAssignments", ["isActive"]);
    await queryInterface.addIndex("ShiftAssignments", ["assignedBy"]);

    // Add unique constraint for employee and date
    await queryInterface.addConstraint("ShiftAssignments", {
      fields: ["employeeId", "startDate"],
      type: "unique",
      name: "shift_assignment_employee_date_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ShiftAssignments");
  },
};
