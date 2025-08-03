"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns for department and position IDs
    await queryInterface.addColumn("employees", "departmentId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      comment: "Department ID (replaces department string)",
    });

    await queryInterface.addColumn("employees", "positionId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "positions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      comment: "Position ID (replaces position string)",
    });

    // Add indexes for the new foreign keys
    await queryInterface.addIndex("employees", ["departmentId"]);
    await queryInterface.addIndex("employees", ["positionId"]);

    // Keep the old columns for backward compatibility during migration
    // They will be removed in a future migration after data migration is complete
  },

  async down(queryInterface, Sequelize) {
    // Remove the new columns
    await queryInterface.removeColumn("employees", "departmentId");
    await queryInterface.removeColumn("employees", "positionId");
  },
};
