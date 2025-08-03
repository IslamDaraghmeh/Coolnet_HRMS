const { Op } = require("sequelize");
const Attendance = require("../../../domain/entities/Attendance");
const IAttendanceRepository = require("../../../domain/interfaces/IAttendanceRepository");

/**
 * Attendance Repository Implementation
 * Sequelize-based implementation of attendance data access
 */
class AttendanceRepository extends IAttendanceRepository {
  /**
   * Create a new attendance record
   * @param {Object} attendanceData - Attendance data
   * @returns {Promise<Object>} Created attendance record
   */
  async create(attendanceData) {
    try {
      const attendance = await Attendance.create(attendanceData);
      return attendance;
    } catch (error) {
      throw new Error(`Failed to create attendance: ${error.message}`);
    }
  }

  /**
   * Find attendance by ID
   * @param {string} id - Attendance ID
   * @returns {Promise<Object|null>} Attendance record or null
   */
  async findById(id) {
    try {
      const attendance = await Attendance.findByPk(id);
      return attendance;
    } catch (error) {
      throw new Error(`Failed to find attendance by ID: ${error.message}`);
    }
  }

  /**
   * Find attendance by employee and date
   * @param {string} employeeId - Employee ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Object|null>} Attendance record or null
   */
  async findByEmployeeAndDate(employeeId, date) {
    try {
      const attendance = await Attendance.findOne({
        where: {
          employeeId,
          date,
        },
      });
      return attendance;
    } catch (error) {
      throw new Error(
        `Failed to find attendance by employee and date: ${error.message}`
      );
    }
  }

  /**
   * Find all attendance records with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of attendance records
   */
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "date",
        sortOrder = "DESC",
        search,
        employeeId,
        dateFrom,
        dateTo,
        status,
        type,
        department,
      } = options;

      const where = {};

      // Apply filters
      if (employeeId) where.employeeId = employeeId;
      if (status) where.status = status;
      if (type) where.type = type;

      // Apply date range filter
      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date[Op.gte] = dateFrom;
        if (dateTo) where.date[Op.lte] = dateTo;
      }

      // Apply search filter
      if (search) {
        where[Op.or] = [{ notes: { [Op.iLike]: `%${search}%` } }];
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

      const { count, rows } = await Attendance.findAndCountAll({
        where,
        include: includeOptions,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        attendance: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find attendance records: ${error.message}`);
    }
  }

  /**
   * Find attendance by employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of attendance records
   */
  async findByEmployee(employeeId, options = {}) {
    try {
      const { limit = 30, sortBy = "date", sortOrder = "DESC" } = options;

      const attendance = await Attendance.findAll({
        where: { employeeId },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return attendance;
    } catch (error) {
      throw new Error(
        `Failed to find attendance by employee: ${error.message}`
      );
    }
  }

  /**
   * Find attendance by date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of attendance records
   */
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const { employeeId, sortBy = "date", sortOrder = "ASC" } = options;

      const where = {
        date: {
          [Op.between]: [startDate, endDate],
        },
      };

      if (employeeId) where.employeeId = employeeId;

      const attendance = await Attendance.findAll({
        where,
        order: [[sortBy, sortOrder]],
      });

      return attendance;
    } catch (error) {
      throw new Error(
        `Failed to find attendance by date range: ${error.message}`
      );
    }
  }

  /**
   * Update attendance record
   * @param {string} id - Attendance ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated attendance record
   */
  async update(id, updateData) {
    try {
      const attendance = await Attendance.findByPk(id);
      if (!attendance) {
        throw new Error("Attendance record not found");
      }

      await attendance.update(updateData);
      return attendance;
    } catch (error) {
      throw new Error(`Failed to update attendance: ${error.message}`);
    }
  }

  /**
   * Delete attendance record
   * @param {string} id - Attendance ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const attendance = await Attendance.findByPk(id);
      if (!attendance) {
        throw new Error("Attendance record not found");
      }

      await attendance.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete attendance: ${error.message}`);
    }
  }

  /**
   * Count attendance records
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    try {
      const count = await Attendance.count({ where: filters });
      return count;
    } catch (error) {
      throw new Error(`Failed to count attendance records: ${error.message}`);
    }
  }

  /**
   * Get attendance statistics
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>} Attendance statistics
   */
  async getStatistics(employeeId, startDate, endDate) {
    try {
      const attendance = await this.findByDateRange(startDate, endDate, {
        employeeId,
      });

      const totalDays = attendance.length;
      const presentDays = attendance.filter(
        (a) => a.status === "present"
      ).length;
      const absentDays = attendance.filter((a) => a.status === "absent").length;
      const lateDays = attendance.filter((a) => a.status === "late").length;
      const totalHours = attendance.reduce(
        (sum, a) => sum + (a.totalHours || 0),
        0
      );
      const overtimeHours = attendance.reduce(
        (sum, a) => sum + (a.overtimeHours || 0),
        0
      );

      return {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        totalHours,
        overtimeHours,
        attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
      };
    } catch (error) {
      throw new Error(`Failed to get attendance statistics: ${error.message}`);
    }
  }

  /**
   * Get attendance with employee details
   * @param {string} id - Attendance ID
   * @returns {Promise<Object>} Attendance with employee
   */
  async findByIdWithEmployee(id) {
    try {
      const attendance = await Attendance.findByPk(id, {
        include: [
          {
            model: require("../../../domain/entities/Employee"),
            as: "employee",
          },
        ],
      });
      return attendance;
    } catch (error) {
      throw new Error(
        `Failed to find attendance with employee: ${error.message}`
      );
    }
  }

  /**
   * Get attendance summary for employee
   * @param {string} employeeId - Employee ID
   * @param {string} month - Month (YYYY-MM)
   * @returns {Promise<Object>} Attendance summary
   */
  async getMonthlySummary(employeeId, month) {
    try {
      const startDate = `${month}-01`;
      const endDate = new Date(
        new Date(startDate).getFullYear(),
        new Date(startDate).getMonth() + 1,
        0
      )
        .toISOString()
        .split("T")[0];

      const attendance = await this.findByDateRange(startDate, endDate, {
        employeeId,
      });

      const summary = {
        month,
        totalDays: attendance.length,
        presentDays: attendance.filter((a) => a.status === "present").length,
        absentDays: attendance.filter((a) => a.status === "absent").length,
        lateDays: attendance.filter((a) => a.status === "late").length,
        totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
        overtimeHours: attendance.reduce(
          (sum, a) => sum + (a.overtimeHours || 0),
          0
        ),
        attendanceRate:
          attendance.length > 0
            ? (attendance.filter((a) => a.status === "present").length /
                attendance.length) *
              100
            : 0,
      };

      return summary;
    } catch (error) {
      throw new Error(`Failed to get monthly summary: ${error.message}`);
    }
  }
}

module.exports = AttendanceRepository;
