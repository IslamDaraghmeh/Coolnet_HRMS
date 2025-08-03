"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AuditLogs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "Action performed (CREATE, READ, UPDATE, DELETE)",
      },
      tableName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Name of the table affected",
      },
      recordId: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: "ID of the record affected",
      },
      oldValues: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: "Previous values before the change",
      },
      newValues: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: "New values after the change",
      },
      changedFields: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: "Array of field names that were changed",
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      requestId: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "Unique request identifier for tracing",
      },
      endpoint: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: "API endpoint that triggered the action",
      },
      method: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: "HTTP method (GET, POST, PUT, DELETE)",
      },
      statusCode: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "HTTP status code of the response",
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Error message if the action failed",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex("AuditLogs", ["userId"]);
    await queryInterface.addIndex("AuditLogs", ["sessionId"]);
    await queryInterface.addIndex("AuditLogs", ["action"]);
    await queryInterface.addIndex("AuditLogs", ["tableName"]);
    await queryInterface.addIndex("AuditLogs", ["recordId"]);
    await queryInterface.addIndex("AuditLogs", ["createdAt"]);
    await queryInterface.addIndex("AuditLogs", ["requestId"]);
    await queryInterface.addIndex("AuditLogs", ["statusCode"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("AuditLogs");
  },
};
