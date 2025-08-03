"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Shifts", {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      breakDuration: {
        type: Sequelize.INTEGER, // in minutes
        allowNull: false,
        defaultValue: 0,
      },
      totalHours: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.addIndex("Shifts", ["name"]);
    await queryInterface.addIndex("Shifts", ["isActive"]);
    await queryInterface.addIndex("Shifts", ["startTime"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Shifts");
  },
};
