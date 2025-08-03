const AuditLog = require("../../../domain/entities/AuditLog");
const User = require("../../../domain/entities/User");
const Session = require("../../../domain/entities/Session");

class AuditLogRepository {
  async create(auditData) {
    try {
      return await AuditLog.create(auditData);
    } catch (error) {
      throw new Error(`Failed to create audit log: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await AuditLog.findByPk(id, {
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
      throw new Error(`Failed to find audit log by ID: ${error.message}`);
    }
  }

  async findByUserId(userId, options = {}) {
    try {
      return await AuditLog.findByUserId(userId, options);
    } catch (error) {
      throw new Error(`Failed to find user audit logs: ${error.message}`);
    }
  }

  async findByTable(tableName, options = {}) {
    try {
      return await AuditLog.findByTable(tableName, options);
    } catch (error) {
      throw new Error(`Failed to find table audit logs: ${error.message}`);
    }
  }

  async findByRecord(tableName, recordId, options = {}) {
    try {
      return await AuditLog.findByRecord(tableName, recordId, options);
    } catch (error) {
      throw new Error(`Failed to find record audit logs: ${error.message}`);
    }
  }

  async findByRequestId(requestId) {
    try {
      return await AuditLog.findByRequestId(requestId);
    } catch (error) {
      throw new Error(`Failed to find request audit logs: ${error.message}`);
    }
  }

  async findRecent(days = 7, options = {}) {
    try {
      return await AuditLog.findRecent(days, options);
    } catch (error) {
      throw new Error(`Failed to find recent audit logs: ${error.message}`);
    }
  }

  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 100,
        userId,
        sessionId,
        action,
        tableName,
        recordId,
        statusCode,
        requestId,
      } = options;
      const offset = (page - 1) * limit;

      const where = {};
      if (userId) where.userId = userId;
      if (sessionId) where.sessionId = sessionId;
      if (action) where.action = action;
      if (tableName) where.tableName = tableName;
      if (recordId) where.recordId = recordId;
      if (statusCode) where.statusCode = statusCode;
      if (requestId) where.requestId = requestId;

      const { count, rows } = await AuditLog.findAndCountAll({
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
        auditLogs: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find audit logs: ${error.message}`);
    }
  }

  async getAuditStats(days = 30) {
    try {
      return await AuditLog.getAuditStats(days);
    } catch (error) {
      throw new Error(`Failed to get audit stats: ${error.message}`);
    }
  }

  async logAudit(auditData) {
    try {
      const {
        userId,
        sessionId,
        action,
        tableName,
        recordId,
        oldValues,
        newValues,
        changedFields,
        ipAddress,
        userAgent,
        requestId,
        endpoint,
        method,
        statusCode,
        errorMessage,
      } = auditData;

      return await this.create({
        userId,
        sessionId,
        action,
        tableName,
        recordId,
        oldValues,
        newValues,
        changedFields,
        ipAddress,
        userAgent,
        requestId,
        endpoint,
        method,
        statusCode,
        errorMessage,
      });
    } catch (error) {
      throw new Error(`Failed to log audit: ${error.message}`);
    }
  }

  async logCreate(
    userId,
    sessionId,
    tableName,
    recordId,
    newValues,
    requestData = {}
  ) {
    return await this.logAudit({
      userId,
      sessionId,
      action: "CREATE",
      tableName,
      recordId,
      newValues,
      ...requestData,
    });
  }

  async logRead(userId, sessionId, tableName, recordId, requestData = {}) {
    return await this.logAudit({
      userId,
      sessionId,
      action: "READ",
      tableName,
      recordId,
      ...requestData,
    });
  }

  async logUpdate(
    userId,
    sessionId,
    tableName,
    recordId,
    oldValues,
    newValues,
    changedFields,
    requestData = {}
  ) {
    return await this.logAudit({
      userId,
      sessionId,
      action: "UPDATE",
      tableName,
      recordId,
      oldValues,
      newValues,
      changedFields,
      ...requestData,
    });
  }

  async logDelete(
    userId,
    sessionId,
    tableName,
    recordId,
    oldValues,
    requestData = {}
  ) {
    return await this.logAudit({
      userId,
      sessionId,
      action: "DELETE",
      tableName,
      recordId,
      oldValues,
      ...requestData,
    });
  }

  async logError(
    userId,
    sessionId,
    action,
    tableName,
    recordId,
    errorMessage,
    requestData = {}
  ) {
    return await this.logAudit({
      userId,
      sessionId,
      action,
      tableName,
      recordId,
      errorMessage,
      statusCode: 500,
      ...requestData,
    });
  }

  async deleteOldAuditLogs(days = 365) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);

      const result = await AuditLog.destroy({
        where: {
          createdAt: {
            [AuditLog.sequelize.Op.lt]: date,
          },
        },
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to delete old audit logs: ${error.message}`);
    }
  }
}

module.exports = AuditLogRepository;
