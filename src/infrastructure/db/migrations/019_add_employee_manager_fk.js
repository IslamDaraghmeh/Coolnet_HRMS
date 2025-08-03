"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add foreign key constraint for employees.managerId -> employees.id
    await queryInterface.addConstraint("employees", {
      fields: ["managerId"],
      type: "foreign key",
      name: "employees_managerId_fkey",
      references: {
        table: "employees",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "employees",
      "employees_managerId_fkey"
    );
  },
};
