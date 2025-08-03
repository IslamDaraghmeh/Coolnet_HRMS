const { Op } = require("sequelize");
const Leave = require("../../../domain/entities/Leave");
const ILeaveRepository = require("../../../domain/interfaces/ILeaveRepository");

/**
 * Leave Repository Implementation
 * Sequelize-based implementation of leave data access
 */
class LeaveRepository extends ILeaveRepository {
  /**
   * Create a new leave request
   * @param {Object} leaveData - Leave data
   * @returns {Promise<Object>} Created leave request
   */
  async create(leaveData) {
    try {
      const leave = await Leave.create(leaveData);
      return leave;
    } catch (error) {
      throw new Error(`Failed to create leave request: ${error.message}`);
    }
  }

  /**
   * Find leave by ID
   * @param {string} id - Leave ID
   * @returns {Promise<Object|null>} Leave request or null
   */
  async findById(id) {
    try {
      const leave = await Leave.findByPk(id);
      return leave;
    } catch (error) {
      throw new Error(`Failed to find leave by ID: ${error.message}`);
    }
  }

  /**
   * Find all leave requests with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of leave requests
   */
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "startDate",
        sortOrder = "DESC",
        search,
        employeeId,
        leaveType,
        status,
        startDateFrom,
        startDateTo,
        endDateFrom,
        endDateTo,
        department,
      } = options;

      const where = {};

      // Apply filters
      if (employeeId) where.employeeId = employeeId;
      if (leaveType) where.leaveType = leaveType;
      if (status) where.status = status;

      // Apply date range filters
      if (startDateFrom || startDateTo) {
        where.startDate = {};
        if (startDateFrom) where.startDate[Op.gte] = startDateFrom;
        if (startDateTo) where.startDate[Op.lte] = startDateTo;
      }

      if (endDateFrom || endDateTo) {
        where.endDate = {};
        if (endDateFrom) where.endDate[Op.gte] = endDateFrom;
        if (endDateTo) where.endDate[Op.lte] = endDateTo;
      }

      // Apply search filter
      if (search) {
        where[Op.or] = [{ reason: { [Op.iLike]: `%${search}%` } }];
      }

      // Apply additional filters
      Object.assign(where, filters);

      const offset = (page - 1) * limit;
      const order = [[sortBy, sortOrder]];

      let includeOptions = [];
      if (department) {
        includeOptions.push({
          model: require("../../../domain/entities/Employee"),
          as: "employee",
          where: { department },
        });
      }

      const { count, rows } = await Leave.findAndCountAll({
        where,
        include: includeOptions,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        leaves: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find leave requests: ${error.message}`);
    }
  }

  /**
   * Find leave requests by employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of leave requests
   */
  async findByEmployee(employeeId, options = {}) {
    try {
      const { limit = 20, sortBy = "startDate", sortOrder = "DESC" } = options;

      const leaves = await Leave.findAll({
        where: { employeeId },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return leaves;
    } catch (error) {
      throw new Error(
        `Failed to find leave requests by employee: ${error.message}`
      );
    }
  }

  /**
   * Find pending leave requests
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of pending leave requests
   */
  async findPending(options = {}) {
    try {
      const { limit = 50, sortBy = "createdAt", sortOrder = "ASC" } = options;

      const leaves = await Leave.findAll({
        where: { status: "pending" },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return leaves;
    } catch (error) {
      throw new Error(
        `Failed to find pending leave requests: ${error.message}`
      );
    }
  }

  /**
   * Find approved leave requests
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of approved leave requests
   */
  async findApproved(options = {}) {
    try {
      const { limit = 50, sortBy = "startDate", sortOrder = "ASC" } = options;

      const leaves = await Leave.findAll({
        where: { status: "approved" },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return leaves;
    } catch (error) {
      throw new Error(
        `Failed to find approved leave requests: ${error.message}`
      );
    }
  }

  /**
   * Update leave request
   * @param {string} id - Leave ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated leave request
   */
  async update(id, updateData) {
    try {
      const leave = await Leave.findByPk(id);
      if (!leave) {
        throw new Error("Leave request not found");
      }

      await leave.update(updateData);
      return leave;
    } catch (error) {
      throw new Error(`Failed to update leave request: ${error.message}`);
    }
  }

  /**
   * Delete leave request
   * @param {string} id - Leave ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const leave = await Leave.findByPk(id);
      if (!leave) {
        throw new Error("Leave request not found");
      }

      await leave.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete leave request: ${error.message}`);
    }
  }

  /**
   * Count leave requests
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    try {
      const count = await Leave.count({ where: filters });
      return count;
    } catch (error) {
      throw new Error(`Failed to count leave requests: ${error.message}`);
    }
  }

  /**
   * Get leave balance for employee
   * @param {string} employeeId - Employee ID
   * @param {number} year - Year
   * @returns {Promise<Object>} Leave balance
   */
  async getLeaveBalance(employeeId, year) {
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const leaves = await Leave.findAll({
        where: {
          employeeId,
          startDate: {
            [Op.between]: [startDate, endDate],
          },
          status: "approved",
        },
      });

      const balance = {
        year,
        annual: { total: 20, used: 0, remaining: 20 },
        sick: { total: 10, used: 0, remaining: 10 },
        personal: { total: 5, used: 0, remaining: 5 },
        maternity: { total: 90, used: 0, remaining: 90 },
        paternity: { total: 14, used: 0, remaining: 14 },
        bereavement: { total: 5, used: 0, remaining: 5 },
        unpaid: { total: 0, used: 0, remaining: 0 },
      };

      leaves.forEach((leave) => {
        const days = this.calculateLeaveDays(leave.startDate, leave.endDate);
        if (balance[leave.leaveType]) {
          balance[leave.leaveType].used += days;
          balance[leave.leaveType].remaining = Math.max(
            0,
            balance[leave.leaveType].total - balance[leave.leaveType].used
          );
        }
      });

      return balance;
    } catch (error) {
      throw new Error(`Failed to get leave balance: ${error.message}`);
    }
  }

  /**
   * Get leave with employee details
   * @param {string} id - Leave ID
   * @returns {Promise<Object>} Leave with employee
   */
  async findByIdWithEmployee(id) {
    try {
      const leave = await Leave.findByPk(id, {
        include: [
          {
            model: require("../../../domain/entities/Employee"),
            as: "employee",
          },
        ],
      });
      return leave;
    } catch (error) {
      throw new Error(`Failed to find leave with employee: ${error.message}`);
    }
  }

  /**
   * Get leave with approval details
   * @param {string} id - Leave ID
   * @returns {Promise<Object>} Leave with approvals
   */
  async findByIdWithApprovals(id) {
    try {
      const leave = await Leave.findByPk(id, {
        include: [
          {
            model: require("../../../domain/entities/LeaveApproval"),
            as: "approvals",
          },
        ],
      });
      return leave;
    } catch (error) {
      throw new Error(`Failed to find leave with approvals: ${error.message}`);
    }
  }

  /**
   * Get leave statistics
   * @param {string} employeeId - Employee ID
   * @param {number} year - Year
   * @returns {Promise<Object>} Leave statistics
   */
  async getStatistics(employeeId, year) {
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const leaves = await Leave.findAll({
        where: {
          employeeId,
          startDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      const stats = {
        year,
        totalRequests: leaves.length,
        approved: leaves.filter((l) => l.status === "approved").length,
        rejected: leaves.filter((l) => l.status === "rejected").length,
        pending: leaves.filter((l) => l.status === "pending").length,
        cancelled: leaves.filter((l) => l.status === "cancelled").length,
        totalDays: leaves.reduce(
          (sum, l) => sum + this.calculateLeaveDays(l.startDate, l.endDate),
          0
        ),
        byType: {},
      };

      // Group by leave type
      leaves.forEach((leave) => {
        const type = leave.leaveType;
        if (!stats.byType[type]) {
          stats.byType[type] = {
            count: 0,
            days: 0,
            approved: 0,
            rejected: 0,
            pending: 0,
          };
        }
        stats.byType[type].count++;
        stats.byType[type].days += this.calculateLeaveDays(
          leave.startDate,
          leave.endDate
        );
        stats.byType[type][leave.status]++;
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to get leave statistics: ${error.message}`);
    }
  }

  /**
   * Check leave conflicts
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {string} excludeId - Leave ID to exclude
   * @returns {Promise<Array>} Conflicting leaves
   */
  async checkConflicts(employeeId, startDate, endDate, excludeId = null) {
    try {
      const where = {
        employeeId,
        status: ["approved", "pending"],
        [Op.or]: [
          {
            startDate: { [Op.lte]: endDate },
            endDate: { [Op.gte]: startDate },
          },
        ],
      };

      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }

      const conflicts = await Leave.findAll({ where });
      return conflicts;
    } catch (error) {
      throw new Error(`Failed to check leave conflicts: ${error.message}`);
    }
  }

  /**
   * Calculate leave days
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {number} Number of days
   */
  calculateLeaveDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  }
}

module.exports = LeaveRepository;
