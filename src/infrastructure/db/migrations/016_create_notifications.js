"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Notifications", {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      recipientId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      senderId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      data: {
        type: Sequelize.JSONB, // Additional data for the notification
        allowNull: true,
      },
      priority: {
        type: Sequelize.ENUM("low", "medium", "high", "urgent"),
        defaultValue: "medium",
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deliveryMethod: {
        type: Sequelize.ENUM("in_app", "email", "sms", "push"),
        defaultValue: "in_app",
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.addIndex("Notifications", ["recipientId"]);
    await queryInterface.addIndex("Notifications", ["senderId"]);
    await queryInterface.addIndex("Notifications", ["type"]);
    await queryInterface.addIndex("Notifications", ["isRead"]);
    await queryInterface.addIndex("Notifications", ["priority"]);
    await queryInterface.addIndex("Notifications", ["isSent"]);
    await queryInterface.addIndex("Notifications", ["deliveryMethod"]);
    await queryInterface.addIndex("Notifications", ["expiresAt"]);
    await queryInterface.addIndex("Notifications", ["createdAt"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Notifications");
  },
};
