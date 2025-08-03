const AuditLogRepository = require("../../infrastructure/db/repositories/AuditLogRepository");
const crypto = require("crypto");

class AuditMiddleware {
  constructor() {
    this.auditLogRepository = new AuditLogRepository();
  }

  // Middleware to generate request ID
  generateRequestId = (req, res, next) => {
    req.requestId = crypto.randomUUID();
    next();
  };

  // Middleware to log request data
  logRequestData = (req, res, next) => {
    req.auditData = {
      requestId: req.requestId,
      endpoint: req.originalUrl,
      method: req.method,
      ipAddress: req.clientInfo?.ipAddress,
      userAgent: req.clientInfo?.userAgent,
      userId: req.userId,
      sessionId: req.sessionId,
    };
    next();
  };

  // Middleware to log audit trail
  logAuditTrail = (action, tableName, getRecordId = null) => {
    return async (req, res, next) => {
      try {
        const recordId = getRecordId ? getRecordId(req) : req.params.id;

        await this.auditLogRepository.logAudit({
          userId: req.userId,
          sessionId: req.sessionId,
          action,
          tableName,
          recordId,
          ipAddress: req.auditData?.ipAddress,
          userAgent: req.auditData?.userAgent,
          requestId: req.auditData?.requestId,
          endpoint: req.auditData?.endpoint,
          method: req.auditData?.method,
          statusCode: res.statusCode,
        });
      } catch (error) {
        // Don't fail the request if audit logging fails
        console.error("Audit logging failed:", error.message);
      }
      next();
    };
  };

  // Middleware to log CREATE operations
  logCreate = (tableName, getRecordId = null) => {
    return async (req, res, next) => {
      try {
        const recordId = getRecordId
          ? getRecordId(req, res)
          : res.locals.createdRecord?.id;

        if (recordId) {
          await this.auditLogRepository.logCreate(
            req.userId,
            req.sessionId,
            tableName,
            recordId,
            req.body,
            {
              ipAddress: req.auditData?.ipAddress,
              userAgent: req.auditData?.userAgent,
              requestId: req.auditData?.requestId,
              endpoint: req.auditData?.endpoint,
              method: req.auditData?.method,
              statusCode: res.statusCode,
            }
          );
        }
      } catch (error) {
        console.error("Create audit logging failed:", error.message);
      }
      next();
    };
  };

  // Middleware to log READ operations
  logRead = (tableName, getRecordId = null) => {
    return async (req, res, next) => {
      try {
        const recordId = getRecordId ? getRecordId(req) : req.params.id;

        if (recordId) {
          await this.auditLogRepository.logRead(
            req.userId,
            req.sessionId,
            tableName,
            recordId,
            {
              ipAddress: req.auditData?.ipAddress,
              userAgent: req.auditData?.userAgent,
              requestId: req.auditData?.requestId,
              endpoint: req.auditData?.endpoint,
              method: req.auditData?.method,
              statusCode: res.statusCode,
            }
          );
        }
      } catch (error) {
        console.error("Read audit logging failed:", error.message);
      }
      next();
    };
  };

  // Middleware to log UPDATE operations
  logUpdate = (tableName, getRecordId = null, getOldValues = null) => {
    return async (req, res, next) => {
      try {
        const recordId = getRecordId ? getRecordId(req) : req.params.id;
        const oldValues = getOldValues
          ? getOldValues(req)
          : req.locals?.oldValues;

        if (recordId) {
          const changedFields = this.getChangedFields(oldValues, req.body);

          await this.auditLogRepository.logUpdate(
            req.userId,
            req.sessionId,
            tableName,
            recordId,
            oldValues,
            req.body,
            changedFields,
            {
              ipAddress: req.auditData?.ipAddress,
              userAgent: req.auditData?.userAgent,
              requestId: req.auditData?.requestId,
              endpoint: req.auditData?.endpoint,
              method: req.auditData?.method,
              statusCode: res.statusCode,
            }
          );
        }
      } catch (error) {
        console.error("Update audit logging failed:", error.message);
      }
      next();
    };
  };

  // Middleware to log DELETE operations
  logDelete = (tableName, getRecordId = null, getOldValues = null) => {
    return async (req, res, next) => {
      try {
        const recordId = getRecordId ? getRecordId(req) : req.params.id;
        const oldValues = getOldValues
          ? getOldValues(req)
          : req.locals?.oldValues;

        if (recordId) {
          await this.auditLogRepository.logDelete(
            req.userId,
            req.sessionId,
            tableName,
            recordId,
            oldValues,
            {
              ipAddress: req.auditData?.ipAddress,
              userAgent: req.auditData?.userAgent,
              requestId: req.auditData?.requestId,
              endpoint: req.auditData?.endpoint,
              method: req.auditData?.method,
              statusCode: res.statusCode,
            }
          );
        }
      } catch (error) {
        console.error("Delete audit logging failed:", error.message);
      }
      next();
    };
  };

  // Middleware to log errors
  logError = (action, tableName, getRecordId = null) => {
    return async (req, res, next) => {
      try {
        const recordId = getRecordId ? getRecordId(req) : req.params.id;

        await this.auditLogRepository.logError(
          req.userId,
          req.sessionId,
          action,
          tableName,
          recordId,
          req.error?.message || "Unknown error",
          {
            ipAddress: req.auditData?.ipAddress,
            userAgent: req.auditData?.userAgent,
            requestId: req.auditData?.requestId,
            endpoint: req.auditData?.endpoint,
            method: req.auditData?.method,
            statusCode: res.statusCode,
          }
        );
      } catch (error) {
        console.error("Error audit logging failed:", error.message);
      }
      next();
    };
  };

  // Helper method to get changed fields
  getChangedFields = (oldValues, newValues) => {
    if (!oldValues || !newValues) return [];

    const changedFields = [];
    for (const key in newValues) {
      if (oldValues[key] !== newValues[key]) {
        changedFields.push(key);
      }
    }
    return changedFields;
  };

  // Middleware to capture old values before update
  captureOldValues = (getRecord) => {
    return async (req, res, next) => {
      try {
        const record = getRecord ? await getRecord(req) : null;
        if (record) {
          req.locals = req.locals || {};
          req.locals.oldValues = record.toJSON ? record.toJSON() : record;
        }
        next();
      } catch (error) {
        next();
      }
    };
  };

  // Middleware to capture created record
  captureCreatedRecord = (req, res, next) => {
    res.locals.createdRecord = req.body;
    next();
  };
}

module.exports = new AuditMiddleware();
