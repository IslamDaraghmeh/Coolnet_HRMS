"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("departments", {
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
        unique: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      headId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "employees",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Department head/manager",
      },
      parentDepartmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "departments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Parent department for hierarchical structure",
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      budget: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "archived"),
        defaultValue: "active",
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: "Hex color code",
      },
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: "Department-specific settings and configurations",
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
    await queryInterface.addIndex("departments", ["name"]);
    await queryInterface.addIndex("departments", ["code"]);
    await queryInterface.addIndex("departments", ["headId"]);
    await queryInterface.addIndex("departments", ["parentDepartmentId"]);
    await queryInterface.addIndex("departments", ["status"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("departments");
  },
};
