"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Sessions", {
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
      sessionToken: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      refreshToken: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      deviceInfo: {
        type: Sequelize.JSONB,
        defaultValue: {},
        comment: "Device information (browser, OS, IP, etc.)",
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: "IPv4 or IPv6 address",
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lastActivityAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex("Sessions", ["userId"]);
    await queryInterface.addIndex("Sessions", ["sessionToken"]);
    await queryInterface.addIndex("Sessions", ["refreshToken"]);
    await queryInterface.addIndex("Sessions", ["isActive"]);
    await queryInterface.addIndex("Sessions", ["expiresAt"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Sessions");
  },
};
