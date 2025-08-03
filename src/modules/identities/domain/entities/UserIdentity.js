const { DataTypes, Op } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const UserIdentity = sequelize.define(
  "UserIdentity",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Sessions",
        key: "id",
      },
    },
    // Device fingerprint
    deviceFingerprint: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: "Complete device fingerprint including browser, OS, device info",
    },
    fingerprintHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      comment: "SHA256 hash of the device fingerprint",
    },
    confidence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Confidence score for the fingerprint (0-100)",
    },
    // Location information
    location: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: "Geographic location information",
    },
    // Network information
    networkInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Network connection information",
    },
    // Behavioral data
    behaviorProfile: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "User behavior patterns and analysis",
    },
    // Risk assessment
    riskScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Risk score based on behavior and patterns (0-100)",
    },
    riskLevel: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      allowNull: false,
      defaultValue: "low",
      comment: "Risk level classification",
    },
    // Suspicious activity detection
    suspiciousActivity: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Suspicious activity detection results",
    },
    // Trust score
    trustScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
      comment: "Trust score for this identity (0-100)",
    },
    // Verification status
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether this identity has been verified",
    },
    verificationMethod: {
      type: DataTypes.ENUM("email", "sms", "2fa", "biometric", "manual"),
      allowNull: true,
      comment: "Method used to verify this identity",
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "When this identity was verified",
    },
    // Activity tracking
    firstSeen: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "First time this identity was seen",
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Last time this identity was seen",
    },
    activityCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Number of activities from this identity",
    },
    // Status
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "Whether this identity is currently active",
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether this identity is blocked due to suspicious activity",
    },
    blockedReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Reason for blocking this identity",
    },
    blockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "When this identity was blocked",
    },
    // Metadata
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Additional metadata and notes",
    },
  },
  {
    tableName: "UserIdentities",
    freezeTableName: true,
    underscored: false,
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["sessionId"],
      },
      {
        fields: ["fingerprintHash"],
      },
      {
        fields: ["riskLevel"],
      },
      {
        fields: ["isActive"],
      },
      {
        fields: ["isBlocked"],
      },
      {
        fields: ["firstSeen"],
      },
      {
        fields: ["lastSeen"],
      },
    ],
  }
);

// Instance methods
UserIdentity.prototype.updateActivity = async function () {
  this.lastSeen = new Date();
  this.activityCount += 1;
  await this.save();
};

UserIdentity.prototype.verify = async function (method = "manual") {
  this.isVerified = true;
  this.verificationMethod = method;
  this.verifiedAt = new Date();
  await this.save();
};

UserIdentity.prototype.block = async function (reason) {
  this.isBlocked = true;
  this.isActive = false;
  this.blockedReason = reason;
  this.blockedAt = new Date();
  await this.save();
};

UserIdentity.prototype.unblock = async function () {
  this.isBlocked = false;
  this.isActive = true;
  this.blockedReason = null;
  this.blockedAt = null;
  await this.save();
};

UserIdentity.prototype.updateRiskScore = async function (score) {
  this.riskScore = Math.max(0, Math.min(100, score));

  // Update risk level based on score
  if (this.riskScore >= 80) {
    this.riskLevel = "critical";
  } else if (this.riskScore >= 60) {
    this.riskLevel = "high";
  } else if (this.riskScore >= 30) {
    this.riskLevel = "medium";
  } else {
    this.riskLevel = "low";
  }

  await this.save();
};

// Class methods
UserIdentity.findByFingerprintHash = function (hash) {
  return this.findOne({
    where: {
      fingerprintHash: hash,
      isActive: true,
    },
  });
};

UserIdentity.findByUserId = function (userId, options = {}) {
  const { limit = 10, offset = 0, isActive = true } = options;

  return this.findAndCountAll({
    where: {
      userId,
      ...(isActive !== undefined && { isActive }),
    },
    order: [["lastSeen", "DESC"]],
    limit,
    offset,
  });
};

UserIdentity.findActiveByUserId = function (userId) {
  return this.findAll({
    where: {
      userId,
      isActive: true,
      isBlocked: false,
    },
    order: [["lastSeen", "DESC"]],
  });
};

UserIdentity.findSuspicious = function (options = {}) {
  const { riskLevel = "high", limit = 50, offset = 0 } = options;

  return this.findAndCountAll({
    where: {
      riskLevel: {
        [Op.in]:
          riskLevel === "all" ? ["medium", "high", "critical"] : [riskLevel],
      },
      isActive: true,
    },
    order: [
      ["riskScore", "DESC"],
      ["lastSeen", "DESC"],
    ],
    limit,
    offset,
  });
};

UserIdentity.getIdentityStats = async function (userId = null) {
  const where = userId ? { userId } : {};

  const stats = await this.findAll({
    where,
    attributes: [
      [sequelize.fn("COUNT", sequelize.col("id")), "totalIdentities"],
      [
        sequelize.fn(
          "COUNT",
          sequelize.literal('CASE WHEN "isActive" = true THEN 1 END')
        ),
        "activeIdentities",
      ],
      [
        sequelize.fn(
          "COUNT",
          sequelize.literal('CASE WHEN "isBlocked" = true THEN 1 END')
        ),
        "blockedIdentities",
      ],
      [
        sequelize.fn(
          "COUNT",
          sequelize.literal('CASE WHEN "isVerified" = true THEN 1 END')
        ),
        "verifiedIdentities",
      ],
      [sequelize.fn("AVG", sequelize.col("riskScore")), "averageRiskScore"],
      [sequelize.fn("AVG", sequelize.col("trustScore")), "averageTrustScore"],
    ],
    raw: true,
  });

  return (
    stats[0] || {
      totalIdentities: 0,
      activeIdentities: 0,
      blockedIdentities: 0,
      verifiedIdentities: 0,
      averageRiskScore: 0,
      averageTrustScore: 100,
    }
  );
};

UserIdentity.cleanupInactive = async function (daysInactive = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

  return this.update(
    { isActive: false },
    {
      where: {
        lastSeen: {
          [Op.lt]: cutoffDate,
        },
        isActive: true,
      },
    }
  );
};

module.exports = UserIdentity;
