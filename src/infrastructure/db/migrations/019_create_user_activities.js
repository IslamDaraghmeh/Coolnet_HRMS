"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserActivities", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      sessionId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Sessions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      activityType: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment:
          "Type of activity (login, logout, create, update, delete, etc.)",
      },
      activityCategory: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "Category of activity (auth, payroll, employee, etc.)",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      details: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: "Additional details about the activity",
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      resourceType: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "Type of resource affected (User, Employee, Payroll, etc.)",
      },
      resourceId: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: "ID of the resource affected",
      },
      status: {
        type: Sequelize.ENUM("success", "failure", "pending"),
        defaultValue: "success",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex("UserActivities", ["userId"]);
    await queryInterface.addIndex("UserActivities", ["sessionId"]);
    await queryInterface.addIndex("UserActivities", ["activityType"]);
    await queryInterface.addIndex("UserActivities", ["activityCategory"]);
    await queryInterface.addIndex("UserActivities", [
      "resourceType",
      "resourceId",
    ]);
    await queryInterface.addIndex("UserActivities", ["createdAt"]);
    await queryInterface.addIndex("UserActivities", ["status"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserActivities");
  },
};
