"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("employees", "branchId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "branches",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      comment: "Branch where employee is assigned",
    });

    await queryInterface.addColumn("employees", "workLocation", {
      type: Sequelize.ENUM("office", "remote", "hybrid"),
      allowNull: false,
      defaultValue: "office",
      comment: "Employee work location type",
    });

    await queryInterface.addColumn("employees", "assignedDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: "Date when employee was assigned to current branch",
    });

    // Create index for branch lookups
    await queryInterface.addIndex("employees", ["branchId"]);
    await queryInterface.addIndex("employees", ["workLocation"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("employees", "branchId");
    await queryInterface.removeColumn("employees", "workLocation");
    await queryInterface.removeColumn("employees", "assignedDate");
  },
};
