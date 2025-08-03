const UserActivity = require("../../../domain/entities/UserActivity");
const User = require("../../../domain/entities/User");
const Session = require("../../../domain/entities/Session");

class UserActivityRepository {
  async create(activityData) {
    try {
      return await UserActivity.create(activityData);
    } catch (error) {
      throw new Error(`Failed to create user activity: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await UserActivity.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "phoneNumber", "email", "employeeId"],
          },
          {
            model: Session,
            as: "session",
            attributes: ["id", "sessionToken", "ipAddress", "userAgent"],
          },
        ],
      });
    } catch (error) {
      throw new Error(`Failed to find user activity by ID: ${error.message}`);
    }
  }

  async findByUserId(userId, options = {}) {
    try {
      return await UserActivity.findByUserId(userId, options);
    } catch (error) {
      throw new Error(`Failed to find user activities: ${error.message}`);
    }
  }

  async findBySessionId(sessionId, options = {}) {
    try {
      return await UserActivity.findBySessionId(sessionId, options);
    } catch (error) {
      throw new Error(`Failed to find session activities: ${error.message}`);
    }
  }

  async findByResource(resourceType, resourceId, options = {}) {
    try {
      return await UserActivity.findByResource(
        resourceType,
        resourceId,
        options
      );
    } catch (error) {
      throw new Error(`Failed to find resource activities: ${error.message}`);
    }
  }

  async findRecentByUserId(userId, days = 7) {
    try {
      return await UserActivity.findRecentByUserId(userId, days);
    } catch (error) {
      throw new Error(
        `Failed to find recent user activities: ${error.message}`
      );
    }
  }

  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        userId,
        sessionId,
        activityType,
        activityCategory,
        status,
        resourceType,
        resourceId,
      } = options;
      const offset = (page - 1) * limit;

      const where = {};
      if (userId) where.userId = userId;
      if (sessionId) where.sessionId = sessionId;
      if (activityType) where.activityType = activityType;
      if (activityCategory) where.activityCategory = activityCategory;
      if (status) where.status = status;
      if (resourceType) where.resourceType = resourceType;
      if (resourceId) where.resourceId = resourceId;

      const { count, rows } = await UserActivity.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "phoneNumber", "email", "employeeId"],
          },
          {
            model: Session,
            as: "session",
            attributes: ["id", "sessionToken", "ipAddress", "userAgent"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return {
        activities: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find user activities: ${error.message}`);
    }
  }

  async getActivityStats(userId, days = 30) {
    try {
      return await UserActivity.getActivityStats(userId, days);
    } catch (error) {
      throw new Error(`Failed to get activity stats: ${error.message}`);
    }
  }

  async logActivity(activityData) {
    try {
      const {
        userId,
        sessionId,
        activityType,
        activityCategory,
        description,
        details = {},
        ipAddress,
        userAgent,
        resourceType,
        resourceId,
        status = "success",
      } = activityData;

      return await this.create({
        userId,
        sessionId,
        activityType,
        activityCategory,
        description,
        details,
        ipAddress,
        userAgent,
        resourceType,
        resourceId,
        status,
      });
    } catch (error) {
      throw new Error(`Failed to log activity: ${error.message}`);
    }
  }

  async logLogin(userId, sessionId, ipAddress, userAgent) {
    return await this.logActivity({
      userId,
      sessionId,
      activityType: "login",
      activityCategory: "auth",
      description: "User logged in successfully",
      details: { ipAddress, userAgent },
      ipAddress,
      userAgent,
    });
  }

  async logLogout(userId, sessionId, ipAddress, userAgent) {
    return await this.logActivity({
      userId,
      sessionId,
      activityType: "logout",
      activityCategory: "auth",
      description: "User logged out",
      details: { ipAddress, userAgent },
      ipAddress,
      userAgent,
    });
  }

  async logSessionTerminated(userId, sessionId, ipAddress, userAgent) {
    return await this.logActivity({
      userId,
      sessionId,
      activityType: "session_terminated",
      activityCategory: "auth",
      description: "User session terminated",
      details: { ipAddress, userAgent },
      ipAddress,
      userAgent,
    });
  }

  async logResourceAction(
    userId,
    sessionId,
    action,
    resourceType,
    resourceId,
    details = {}
  ) {
    return await this.logActivity({
      userId,
      sessionId,
      activityType: action,
      activityCategory: resourceType.toLowerCase(),
      description: `${action} ${resourceType} ${resourceId}`,
      details,
      resourceType,
      resourceId,
    });
  }

  async deleteOldActivities(days = 90) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);

      const result = await UserActivity.destroy({
        where: {
          createdAt: {
            [UserActivity.sequelize.Op.lt]: date,
          },
        },
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to delete old activities: ${error.message}`);
    }
  }
}

module.exports = UserActivityRepository;
