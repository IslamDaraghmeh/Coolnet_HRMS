"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserIdentities", {
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
      // Device fingerprint
      deviceFingerprint: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment:
          "Complete device fingerprint including browser, OS, device info",
      },
      fingerprintHash: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
        comment: "SHA256 hash of the device fingerprint",
      },
      confidence: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Confidence score for the fingerprint (0-100)",
      },
      // Location information
      location: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: "Geographic location information",
      },
      // Network information
      networkInfo: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: "Network connection information",
      },
      // Behavioral data
      behaviorProfile: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: "User behavior patterns and analysis",
      },
      // Risk assessment
      riskScore: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Risk score based on behavior and patterns (0-100)",
      },
      riskLevel: {
        type: Sequelize.ENUM("low", "medium", "high", "critical"),
        allowNull: false,
        defaultValue: "low",
        comment: "Risk level classification",
      },
      // Suspicious activity detection
      suspiciousActivity: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: "Suspicious activity detection results",
      },
      // Trust score
      trustScore: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100,
        comment: "Trust score for this identity (0-100)",
      },
      // Verification status
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Whether this identity has been verified",
      },
      verificationMethod: {
        type: Sequelize.ENUM("email", "sms", "2fa", "biometric", "manual"),
        allowNull: true,
        comment: "Method used to verify this identity",
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "When this identity was verified",
      },
      // Activity tracking
      firstSeen: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: "First time this identity was seen",
      },
      lastSeen: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: "Last time this identity was seen",
      },
      activityCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Number of activities from this identity",
      },
      // Status
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Whether this identity is currently active",
      },
      isBlocked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Whether this identity is blocked due to suspicious activity",
      },
      blockedReason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Reason for blocking this identity",
      },
      blockedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "When this identity was blocked",
      },
      // Metadata
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: "Additional metadata and notes",
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

    // Create indexes
    await queryInterface.addIndex("UserIdentities", ["userId"]);
    await queryInterface.addIndex("UserIdentities", ["sessionId"]);
    await queryInterface.addIndex("UserIdentities", ["fingerprintHash"]);
    await queryInterface.addIndex("UserIdentities", ["riskLevel"]);
    await queryInterface.addIndex("UserIdentities", ["isActive"]);
    await queryInterface.addIndex("UserIdentities", ["isBlocked"]);
    await queryInterface.addIndex("UserIdentities", ["firstSeen"]);
    await queryInterface.addIndex("UserIdentities", ["lastSeen"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserIdentities");
  },
};
