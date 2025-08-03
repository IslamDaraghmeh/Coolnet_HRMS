"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add foreign key constraint for Users.employeeId -> Employees.id
    await queryInterface.addConstraint("Users", {
      fields: ["employeeId"],
      type: "foreign key",
      name: "Users_employeeId_fkey",
      references: {
        table: "employees",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Users", "Users_employeeId_fkey");
  },
};
