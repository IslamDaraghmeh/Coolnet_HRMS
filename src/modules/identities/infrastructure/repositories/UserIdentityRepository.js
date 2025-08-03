const UserIdentity = require("../../../domain/entities/UserIdentity");
const User = require("../../../domain/entities/User");
const Session = require("../../../domain/entities/Session");

class UserIdentityRepository {
  async create(identityData) {
    try {
      return await UserIdentity.create(identityData);
    } catch (error) {
      throw new Error(`Failed to create user identity: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await UserIdentity.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "phoneNumber", "email", "employeeId"],
          },
          {
            model: Session,
            as: "session",
            attributes: ["id", "sessionToken", "lastActivityAt"],
          },
        ],
      });
    } catch (error) {
      throw new Error(`Failed to find user identity by ID: ${error.message}`);
    }
  }

  async findByFingerprintHash(hash) {
    try {
      return await UserIdentity.findByFingerprintHash(hash);
    } catch (error) {
      throw new Error(
        `Failed to find user identity by fingerprint hash: ${error.message}`
      );
    }
  }

  async findByUserId(userId, options = {}) {
    try {
      return await UserIdentity.findByUserId(userId, options);
    } catch (error) {
      throw new Error(
        `Failed to find user identities by user ID: ${error.message}`
      );
    }
  }

  async findActiveByUserId(userId) {
    try {
      return await UserIdentity.findActiveByUserId(userId);
    } catch (error) {
      throw new Error(
        `Failed to find active user identities: ${error.message}`
      );
    }
  }

  async findSuspicious(options = {}) {
    try {
      return await UserIdentity.findSuspicious(options);
    } catch (error) {
      throw new Error(`Failed to find suspicious identities: ${error.message}`);
    }
  }

  async update(id, updateData) {
    try {
      const identity = await UserIdentity.findByPk(id);
      if (!identity) {
        throw new Error("User identity not found");
      }
      return await identity.update(updateData);
    } catch (error) {
      throw new Error(`Failed to update user identity: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const identity = await UserIdentity.findByPk(id);
      if (!identity) {
        throw new Error("User identity not found");
      }
      await identity.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete user identity: ${error.message}`);
    }
  }

  async verify(id, method = "manual") {
    try {
      const identity = await UserIdentity.findByPk(id);
      if (!identity) {
        throw new Error("User identity not found");
      }
      return await identity.verify(method);
    } catch (error) {
      throw new Error(`Failed to verify user identity: ${error.message}`);
    }
  }

  async block(id, reason) {
    try {
      const identity = await UserIdentity.findByPk(id);
      if (!identity) {
        throw new Error("User identity not found");
      }
      return await identity.block(reason);
    } catch (error) {
      throw new Error(`Failed to block user identity: ${error.message}`);
    }
  }

  async unblock(id) {
    try {
      const identity = await UserIdentity.findByPk(id);
      if (!identity) {
        throw new Error("User identity not found");
      }
      return await identity.unblock();
    } catch (error) {
      throw new Error(`Failed to unblock user identity: ${error.message}`);
    }
  }

  async updateRiskScore(id, score) {
    try {
      const identity = await UserIdentity.findByPk(id);
      if (!identity) {
        throw new Error("User identity not found");
      }
      return await identity.updateRiskScore(score);
    } catch (error) {
      throw new Error(`Failed to update risk score: ${error.message}`);
    }
  }

  async updateActivity(id) {
    try {
      const identity = await UserIdentity.findByPk(id);
      if (!identity) {
        throw new Error("User identity not found");
      }
      return await identity.updateActivity();
    } catch (error) {
      throw new Error(`Failed to update activity: ${error.message}`);
    }
  }

  async getIdentityStats(userId = null) {
    try {
      return await UserIdentity.getIdentityStats(userId);
    } catch (error) {
      throw new Error(`Failed to get identity stats: ${error.message}`);
    }
  }

  async cleanupInactive(daysInactive = 30) {
    try {
      return await UserIdentity.cleanupInactive(daysInactive);
    } catch (error) {
      throw new Error(
        `Failed to cleanup inactive identities: ${error.message}`
      );
    }
  }

  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        userId,
        riskLevel,
        isActive,
        isBlocked,
      } = options;
      const offset = (page - 1) * limit;

      const where = {};
      if (userId) where.userId = userId;
      if (riskLevel) where.riskLevel = riskLevel;
      if (isActive !== undefined) where.isActive = isActive;
      if (isBlocked !== undefined) where.isBlocked = isBlocked;

      const { count, rows } = await UserIdentity.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "phoneNumber", "email", "employeeId"],
          },
        ],
        order: [["lastSeen", "DESC"]],
        limit,
        offset,
      });

      return {
        identities: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find user identities: ${error.message}`);
    }
  }

  async getBehaviorAnalysis(userId) {
    try {
      const identities = await UserIdentity.findActiveByUserId(userId);

      const analysis = {
        totalIdentities: identities.length,
        uniqueDevices: [...new Set(identities.map((id) => id.fingerprintHash))]
          .length,
        locations: [
          ...new Set(identities.map((id) => id.location?.city).filter(Boolean)),
        ],
        countries: [
          ...new Set(
            identities.map((id) => id.location?.country).filter(Boolean)
          ),
        ],
        riskLevels: identities.reduce((acc, id) => {
          acc[id.riskLevel] = (acc[id.riskLevel] || 0) + 1;
          return acc;
        }, {}),
        averageRiskScore:
          identities.reduce((sum, id) => sum + id.riskScore, 0) /
            identities.length || 0,
        averageTrustScore:
          identities.reduce((sum, id) => sum + id.trustScore, 0) /
            identities.length || 100,
        verifiedCount: identities.filter((id) => id.isVerified).length,
        blockedCount: identities.filter((id) => id.isBlocked).length,
        recentActivity: identities.filter(
          (id) => id.lastSeen > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
      };

      return analysis;
    } catch (error) {
      throw new Error(`Failed to get behavior analysis: ${error.message}`);
    }
  }

  async getSuspiciousActivityReport(options = {}) {
    try {
      const { days = 7, riskLevel = "high" } = options;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const suspicious = await UserIdentity.findSuspicious({
        riskLevel,
        limit: 100,
      });

      const report = {
        totalSuspicious: suspicious.count,
        byRiskLevel: suspicious.rows.reduce((acc, identity) => {
          acc[identity.riskLevel] = (acc[identity.riskLevel] || 0) + 1;
          return acc;
        }, {}),
        byLocation: suspicious.rows.reduce((acc, identity) => {
          const country = identity.location?.country || "Unknown";
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {}),
        recentActivity: suspicious.rows.filter((id) => id.lastSeen > cutoffDate)
          .length,
        recommendations: this.generateRecommendations(suspicious.rows),
      };

      return report;
    } catch (error) {
      throw new Error(
        `Failed to get suspicious activity report: ${error.message}`
      );
    }
  }

  generateRecommendations(suspiciousIdentities) {
    const recommendations = [];

    const highRiskCount = suspiciousIdentities.filter(
      (id) => id.riskLevel === "critical"
    ).length;
    if (highRiskCount > 0) {
      recommendations.push(
        `Immediate action required: ${highRiskCount} critical risk identities detected`
      );
    }

    const blockedCount = suspiciousIdentities.filter(
      (id) => id.isBlocked
    ).length;
    if (blockedCount > 0) {
      recommendations.push(`${blockedCount} identities are currently blocked`);
    }

    const unverifiedCount = suspiciousIdentities.filter(
      (id) => !id.isVerified
    ).length;
    if (unverifiedCount > 0) {
      recommendations.push(
        `Consider verifying ${unverifiedCount} unverified identities`
      );
    }

    const locationChanges = suspiciousIdentities.filter((id) =>
      id.suspiciousActivity?.reasons?.includes("Location change detected")
    ).length;
    if (locationChanges > 0) {
      recommendations.push(
        `Monitor ${locationChanges} identities with location changes`
      );
    }

    return recommendations;
  }
}

module.exports = UserIdentityRepository;
