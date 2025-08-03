"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("positions", {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      title: {
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
      departmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "departments",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Default department for this position",
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "Position level in organizational hierarchy",
      },
      category: {
        type: Sequelize.ENUM(
          "entry",
          "junior",
          "senior",
          "lead",
          "manager",
          "director",
          "executive",
          "specialist",
          "consultant"
        ),
        allowNull: false,
        defaultValue: "entry",
      },
      minSalary: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      maxSalary: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      requirements: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: "Job requirements and qualifications",
      },
      responsibilities: {
        type: Sequelize.JSONB,
        defaultValue: [],
        comment: "Job responsibilities and duties",
      },
      skills: {
        type: Sequelize.JSONB,
        defaultValue: [],
        comment: "Required skills for this position",
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "archived"),
        defaultValue: "active",
      },
      isRemote: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isFullTime: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: "Position-specific settings and configurations",
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
    await queryInterface.addIndex("positions", ["title"]);
    await queryInterface.addIndex("positions", ["code"]);
    await queryInterface.addIndex("positions", ["departmentId"]);
    await queryInterface.addIndex("positions", ["level"]);
    await queryInterface.addIndex("positions", ["category"]);
    await queryInterface.addIndex("positions", ["status"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("positions");
  },
};
