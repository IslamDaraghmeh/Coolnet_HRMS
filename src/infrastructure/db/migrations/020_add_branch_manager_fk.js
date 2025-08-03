"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add foreign key constraint for branches.managerId -> employees.id
    await queryInterface.addConstraint("branches", {
      fields: ["managerId"],
      type: "foreign key",
      name: "branches_managerId_fkey",
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
      "branches",
      "branches_managerId_fkey"
    );
  },
};
