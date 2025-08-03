"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add missing fields that are in the model but not in the database
    await queryInterface.addColumn("employees", "employmentType", {
      type: Sequelize.ENUM("full-time", "part-time", "contract", "intern"),
      allowNull: false,
      defaultValue: "full-time",
    });

    await queryInterface.addColumn("employees", "hourlyRate", {
      type: Sequelize.DECIMAL(8, 2),
      allowNull: true,
    });

    await queryInterface.addColumn("employees", "status", {
      type: Sequelize.ENUM("active", "inactive", "terminated", "on-leave"),
      allowNull: false,
      defaultValue: "active",
    });

    await queryInterface.addColumn("employees", "documents", {
      type: Sequelize.JSONB,
      defaultValue: {},
    });

    await queryInterface.addColumn("employees", "notes", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("employees", "bankDetails", {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    // Add index for status field
    await queryInterface.addIndex("employees", ["status"]);
  },

  async down(queryInterface, Sequelize) {
    // Remove the added fields
    await queryInterface.removeColumn("employees", "employmentType");
    await queryInterface.removeColumn("employees", "hourlyRate");
    await queryInterface.removeColumn("employees", "status");
    await queryInterface.removeColumn("employees", "documents");
    await queryInterface.removeColumn("employees", "notes");
    await queryInterface.removeColumn("employees", "bankDetails");
  },
};
