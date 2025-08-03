const UserIdentityService = require("./UserIdentityService");
const UserIdentityRepository = require("../../infrastructure/db/repositories/UserIdentityRepository");
const UserActivityRepository = require("../../infrastructure/db/repositories/UserActivityRepository");

class UserIdentityTrackingService {
  constructor() {
    this.identityService = new UserIdentityService();
    this.identityRepository = new UserIdentityRepository();
    this.activityRepository = new UserActivityRepository();
  }

  /**
   * Track user identity during login
   * @param {Object} req - Express request object
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID
   * @returns {Object} Identity tracking result
   */
  async trackLoginIdentity(req, userId, sessionId) {
    try {
      // Generate device fingerprint
      const fingerprint = this.identityService.generateDeviceFingerprint(req);

      // Check if this identity already exists
      let existingIdentity =
        await this.identityRepository.findByFingerprintHash(fingerprint.hash);

      if (existingIdentity) {
        // Update existing identity
        await existingIdentity.updateActivity();

        // Check for suspicious activity
        const previousIdentities =
          await this.identityRepository.findActiveByUserId(userId);
        const suspiciousActivity =
          this.identityService.detectSuspiciousActivity(
            fingerprint,
            previousIdentities.map((id) => id.deviceFingerprint)
          );

        if (suspiciousActivity.isSuspicious) {
          await existingIdentity.updateRiskScore(
            existingIdentity.riskScore + suspiciousActivity.riskScore
          );
        }

        return {
          identity: existingIdentity,
          isNew: false,
          suspiciousActivity,
          fingerprint,
        };
      } else {
        // Create new identity
        const identityData = {
          userId,
          sessionId,
          deviceFingerprint: fingerprint.fingerprint,
          fingerprintHash: fingerprint.hash,
          confidence: fingerprint.confidence,
          location: fingerprint.fingerprint.location,
          networkInfo: fingerprint.fingerprint.network,
          firstSeen: new Date(),
          lastSeen: new Date(),
          activityCount: 1,
        };

        const newIdentity = await this.identityRepository.create(identityData);

        // Check for suspicious activity with new identity
        const previousIdentities =
          await this.identityRepository.findActiveByUserId(userId);
        const suspiciousActivity =
          this.identityService.detectSuspiciousActivity(
            fingerprint,
            previousIdentities.map((id) => id.deviceFingerprint)
          );

        if (suspiciousActivity.isSuspicious) {
          await newIdentity.updateRiskScore(suspiciousActivity.riskScore);
        }

        return {
          identity: newIdentity,
          isNew: true,
          suspiciousActivity,
          fingerprint,
        };
      }
    } catch (error) {
      console.error("Error tracking login identity:", error);
      throw new Error(`Failed to track login identity: ${error.message}`);
    }
  }

  /**
   * Track user activity
   * @param {Object} req - Express request object
   * @param {string} userId - User ID
   * @param {string} activityType - Type of activity
   * @returns {Object} Activity tracking result
   */
  async trackActivity(req, userId, activityType) {
    try {
      const fingerprint = this.identityService.generateDeviceFingerprint(req);

      // Find the identity for this fingerprint
      const identity = await this.identityRepository.findByFingerprintHash(
        fingerprint.hash
      );

      if (identity) {
        // Update activity count and last seen
        await identity.updateActivity();

        // Log the activity
        await this.activityRepository.logActivity(
          userId,
          identity.id,
          activityType,
          req.ip,
          req.headers["user-agent"],
          {
            fingerprint: fingerprint.fingerprint,
            location: fingerprint.fingerprint.location,
          }
        );

        return {
          identity,
          fingerprint,
          activityLogged: true,
        };
      } else {
        // Log activity without identity (shouldn't happen in normal flow)
        await this.activityRepository.logActivity(
          userId,
          null,
          activityType,
          req.ip,
          req.headers["user-agent"],
          {
            fingerprint: fingerprint.fingerprint,
            location: fingerprint.fingerprint.location,
          }
        );

        return {
          identity: null,
          fingerprint,
          activityLogged: true,
        };
      }
    } catch (error) {
      console.error("Error tracking activity:", error);
      throw new Error(`Failed to track activity: ${error.message}`);
    }
  }

  /**
   * Get user identity analysis
   * @param {string} userId - User ID
   * @returns {Object} Identity analysis
   */
  async getUserIdentityAnalysis(userId) {
    try {
      const [behaviorAnalysis, identityStats, recentActivities] =
        await Promise.all([
          this.identityRepository.getBehaviorAnalysis(userId),
          this.identityRepository.getIdentityStats(userId),
          this.activityRepository.findRecentByUserId(userId, 7), // Get last 7 days of activities
        ]);

      // Generate behavior profile
      const behaviorProfile =
        this.identityService.generateBehaviorProfile(recentActivities);

      return {
        behaviorAnalysis,
        identityStats,
        behaviorProfile,
        recentActivities,
        recommendations: this.generateUserRecommendations(
          behaviorAnalysis,
          behaviorProfile
        ),
      };
    } catch (error) {
      console.error("Error getting user identity analysis:", error);
      throw new Error(`Failed to get user identity analysis: ${error.message}`);
    }
  }

  /**
   * Get suspicious activity report
   * @param {Object} options - Report options
   * @returns {Object} Suspicious activity report
   */
  async getSuspiciousActivityReport(options = {}) {
    try {
      return await this.identityRepository.getSuspiciousActivityReport(options);
    } catch (error) {
      console.error("Error getting suspicious activity report:", error);
      throw new Error(
        `Failed to get suspicious activity report: ${error.message}`
      );
    }
  }

  /**
   * Verify user identity
   * @param {string} identityId - Identity ID
   * @param {string} method - Verification method
   * @returns {Object} Verification result
   */
  async verifyIdentity(identityId, method = "manual") {
    try {
      const identity = await this.identityRepository.verify(identityId, method);

      // Update trust score
      await identity.update({
        trustScore: Math.min(100, identity.trustScore + 20),
      });

      return {
        identity,
        verified: true,
        method,
        trustScoreIncreased: true,
      };
    } catch (error) {
      console.error("Error verifying identity:", error);
      throw new Error(`Failed to verify identity: ${error.message}`);
    }
  }

  /**
   * Block suspicious identity
   * @param {string} identityId - Identity ID
   * @param {string} reason - Block reason
   * @returns {Object} Block result
   */
  async blockIdentity(identityId, reason) {
    try {
      const identity = await this.identityRepository.block(identityId, reason);

      return {
        identity,
        blocked: true,
        reason,
        blockedAt: identity.blockedAt,
      };
    } catch (error) {
      console.error("Error blocking identity:", error);
      throw new Error(`Failed to block identity: ${error.message}`);
    }
  }

  /**
   * Unblock identity
   * @param {string} identityId - Identity ID
   * @returns {Object} Unblock result
   */
  async unblockIdentity(identityId) {
    try {
      const identity = await this.identityRepository.unblock(identityId);

      return {
        identity,
        unblocked: true,
        unblockedAt: new Date(),
      };
    } catch (error) {
      console.error("Error unblocking identity:", error);
      throw new Error(`Failed to unblock identity: ${error.message}`);
    }
  }

  /**
   * Compare identities
   * @param {string} identityId1 - First identity ID
   * @param {string} identityId2 - Second identity ID
   * @returns {Object} Comparison result
   */
  async compareIdentities(identityId1, identityId2) {
    try {
      const [identity1, identity2] = await Promise.all([
        this.identityRepository.findById(identityId1),
        this.identityRepository.findById(identityId2),
      ]);

      if (!identity1 || !identity2) {
        throw new Error("One or both identities not found");
      }

      const comparison = this.identityService.compareFingerprints(
        identity1.deviceFingerprint,
        identity2.deviceFingerprint
      );

      return {
        identity1,
        identity2,
        comparison,
        similarity: comparison.score,
        risk: comparison.risk,
      };
    } catch (error) {
      console.error("Error comparing identities:", error);
      throw new Error(`Failed to compare identities: ${error.message}`);
    }
  }

  /**
   * Generate user recommendations
   * @param {Object} behaviorAnalysis - Behavior analysis
   * @param {Object} behaviorProfile - Behavior profile
   * @returns {Array} Recommendations
   */
  generateUserRecommendations(behaviorAnalysis, behaviorProfile) {
    const recommendations = [];

    // High risk score
    if (behaviorProfile.riskScore > 70) {
      recommendations.push(
        "High risk behavior detected. Consider additional security measures."
      );
    }

    // Multiple devices
    if (behaviorAnalysis.uniqueDevices > 3) {
      recommendations.push(
        `User has ${behaviorAnalysis.uniqueDevices} different devices. Consider device verification.`
      );
    }

    // Multiple locations
    if (behaviorAnalysis.locations.length > 2) {
      recommendations.push(
        `User has accessed from ${behaviorAnalysis.locations.length} different locations. Monitor for unusual activity.`
      );
    }

    // Unusual login times
    if (
      behaviorProfile.timePatterns.averageHour < 6 ||
      behaviorProfile.timePatterns.averageHour > 22
    ) {
      recommendations.push(
        "User has unusual login time patterns. Consider time-based restrictions."
      );
    }

    // High login frequency
    if (behaviorProfile.loginPatterns.averagePerDay > 5) {
      recommendations.push(
        "High login frequency detected. Consider implementing rate limiting."
      );
    }

    // Unverified identities
    if (behaviorAnalysis.verifiedCount < behaviorAnalysis.totalIdentities) {
      recommendations.push(
        "Some user identities are unverified. Consider identity verification."
      );
    }

    return recommendations;
  }

  /**
   * Cleanup old identities
   * @param {number} daysInactive - Days of inactivity
   * @returns {Object} Cleanup result
   */
  async cleanupOldIdentities(daysInactive = 30) {
    try {
      const result = await this.identityRepository.cleanupInactive(
        daysInactive
      );

      return {
        cleanedUp: result[0],
        daysInactive,
        message: `Cleaned up ${result[0]} inactive identities`,
      };
    } catch (error) {
      console.error("Error cleaning up old identities:", error);
      throw new Error(`Failed to cleanup old identities: ${error.message}`);
    }
  }
}

module.exports = UserIdentityTrackingService;
