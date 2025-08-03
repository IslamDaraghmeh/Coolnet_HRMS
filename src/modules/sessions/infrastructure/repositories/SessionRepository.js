const Session = require("../../../domain/entities/Session");
const User = require("../../../domain/entities/User");

class SessionRepository {
  async create(sessionData) {
    try {
      return await Session.create(sessionData);
    } catch (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await Session.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "phoneNumber", "email", "employeeId"],
          },
        ],
      });
    } catch (error) {
      throw new Error(`Failed to find session by ID: ${error.message}`);
    }
  }

  async findByToken(token) {
    try {
      return await Session.findByToken(token);
    } catch (error) {
      throw new Error(`Failed to find session by token: ${error.message}`);
    }
  }

  async findByRefreshToken(refreshToken) {
    try {
      return await Session.findByRefreshToken(refreshToken);
    } catch (error) {
      throw new Error(
        `Failed to find session by refresh token: ${error.message}`
      );
    }
  }

  async findActiveByUserId(userId) {
    try {
      return await Session.findActiveByUserId(userId);
    } catch (error) {
      throw new Error(
        `Failed to find active sessions for user: ${error.message}`
      );
    }
  }

  async findAll(options = {}) {
    try {
      const { page = 1, limit = 10, userId, isActive } = options;
      const offset = (page - 1) * limit;

      const where = {};
      if (userId) where.userId = userId;
      if (isActive !== undefined) where.isActive = isActive;

      const { count, rows } = await Session.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "phoneNumber", "email", "employeeId"],
          },
        ],
        order: [["lastActivityAt", "DESC"]],
        limit,
        offset,
      });

      return {
        sessions: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find sessions: ${error.message}`);
    }
  }

  async update(id, updateData) {
    try {
      const session = await Session.findByPk(id);
      if (!session) {
        throw new Error("Session not found");
      }
      return await session.update(updateData);
    } catch (error) {
      throw new Error(`Failed to update session: ${error.message}`);
    }
  }

  async deactivate(id) {
    try {
      const session = await Session.findByPk(id);
      if (!session) {
        throw new Error("Session not found");
      }
      return await session.deactivate();
    } catch (error) {
      throw new Error(`Failed to deactivate session: ${error.message}`);
    }
  }

  async deactivateByUserId(userId, excludeSessionId = null) {
    try {
      const where = { userId, isActive: true };
      if (excludeSessionId) {
        where.id = { [Session.sequelize.Op.ne]: excludeSessionId };
      }

      return await Session.update({ isActive: false }, { where });
    } catch (error) {
      throw new Error(
        `Failed to deactivate sessions for user: ${error.message}`
      );
    }
  }

  async delete(id) {
    try {
      const session = await Session.findByPk(id);
      if (!session) {
        throw new Error("Session not found");
      }
      await session.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }

  async cleanupExpired() {
    try {
      return await Session.cleanupExpired();
    } catch (error) {
      throw new Error(`Failed to cleanup expired sessions: ${error.message}`);
    }
  }

  async updateActivity(id) {
    try {
      const session = await Session.findByPk(id);
      if (!session) {
        throw new Error("Session not found");
      }
      return await session.updateActivity();
    } catch (error) {
      throw new Error(`Failed to update session activity: ${error.message}`);
    }
  }

  async getSessionStats(userId = null) {
    try {
      const where = {};
      if (userId) where.userId = userId;

      const totalSessions = await Session.count({ where });
      const activeSessions = await Session.count({
        where: { ...where, isActive: true },
      });
      const expiredSessions = await Session.count({
        where: {
          ...where,
          expiresAt: { [Session.sequelize.Op.lt]: new Date() },
        },
      });

      return {
        total: totalSessions,
        active: activeSessions,
        expired: expiredSessions,
      };
    } catch (error) {
      throw new Error(`Failed to get session stats: ${error.message}`);
    }
  }
}

module.exports = SessionRepository;
