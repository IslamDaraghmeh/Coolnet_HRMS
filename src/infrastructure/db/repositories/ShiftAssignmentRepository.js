const { Op } = require("sequelize");
const ShiftAssignment = require("../../../domain/entities/ShiftAssignment");
const IShiftAssignmentRepository = require("../../../domain/interfaces/IShiftAssignmentRepository");

/**
 * Shift Assignment Repository Implementation
 * Sequelize-based implementation of shift assignment data access
 */
class ShiftAssignmentRepository extends IShiftAssignmentRepository {
  /**
   * Create a new shift assignment
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise<Object>} Created assignment
   */
  async create(assignmentData) {
    try {
      const assignment = await ShiftAssignment.create(assignmentData);
      return assignment;
    } catch (error) {
      throw new Error(`Failed to create shift assignment: ${error.message}`);
    }
  }

  /**
   * Find assignment by ID
   * @param {string} id - Assignment ID
   * @returns {Promise<Object|null>} Assignment or null
   */
  async findById(id) {
    try {
      const assignment = await ShiftAssignment.findByPk(id);
      return assignment;
    } catch (error) {
      throw new Error(
        `Failed to find shift assignment by ID: ${error.message}`
      );
    }
  }

  /**
   * Find all assignments with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of assignments
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
        shiftId,
        startDate,
        endDate,
        isActive,
        isRecurring,
      } = options;

      const where = {};

      // Apply filters
      if (employeeId) where.employeeId = employeeId;
      if (shiftId) where.shiftId = shiftId;
      if (isActive !== undefined) where.isActive = isActive;
      if (isRecurring !== undefined) where.isRecurring = isRecurring;

      // Apply date range filter
      if (startDate || endDate) {
        where.startDate = {};
        if (startDate) where.startDate[Op.gte] = startDate;
        if (endDate) where.startDate[Op.lte] = endDate;
      }

      // Apply search filter
      if (search) {
        where[Op.or] = [{ notes: { [Op.iLike]: `%${search}%` } }];
      }

      // Apply additional filters
      Object.assign(where, filters);

      const offset = (page - 1) * limit;
      const order = [[sortBy, sortOrder]];

      const { count, rows } = await ShiftAssignment.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        assignments: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find shift assignments: ${error.message}`);
    }
  }

  /**
   * Find assignments by employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of assignments
   */
  async findByEmployee(employeeId, options = {}) {
    try {
      const { limit = 30, sortBy = "startDate", sortOrder = "DESC" } = options;

      const assignments = await ShiftAssignment.findAll({
        where: { employeeId },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return assignments;
    } catch (error) {
      throw new Error(
        `Failed to find shift assignments by employee: ${error.message}`
      );
    }
  }

  /**
   * Find assignments by shift
   * @param {string} shiftId - Shift ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of assignments
   */
  async findByShift(shiftId, options = {}) {
    try {
      const { limit = 50, sortBy = "startDate", sortOrder = "ASC" } = options;

      const assignments = await ShiftAssignment.findAll({
        where: { shiftId },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return assignments;
    } catch (error) {
      throw new Error(
        `Failed to find shift assignments by shift: ${error.message}`
      );
    }
  }

  /**
   * Find active assignments
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of active assignments
   */
  async findActive(options = {}) {
    try {
      const { limit = 50, sortBy = "startDate", sortOrder = "ASC" } = options;

      const assignments = await ShiftAssignment.findAll({
        where: { isActive: true },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return assignments;
    } catch (error) {
      throw new Error(
        `Failed to find active shift assignments: ${error.message}`
      );
    }
  }

  /**
   * Find assignments by date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of assignments
   */
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const { employeeId, sortBy = "startDate", sortOrder = "ASC" } = options;

      const where = {
        startDate: {
          [Op.between]: [startDate, endDate],
        },
      };

      if (employeeId) where.employeeId = employeeId;

      const assignments = await ShiftAssignment.findAll({
        where,
        order: [[sortBy, sortOrder]],
      });

      return assignments;
    } catch (error) {
      throw new Error(
        `Failed to find shift assignments by date range: ${error.message}`
      );
    }
  }

  /**
   * Update assignment
   * @param {string} id - Assignment ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated assignment
   */
  async update(id, updateData) {
    try {
      const assignment = await ShiftAssignment.findByPk(id);
      if (!assignment) {
        throw new Error("Shift assignment not found");
      }

      await assignment.update(updateData);
      return assignment;
    } catch (error) {
      throw new Error(`Failed to update shift assignment: ${error.message}`);
    }
  }

  /**
   * Delete assignment
   * @param {string} id - Assignment ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const assignment = await ShiftAssignment.findByPk(id);
      if (!assignment) {
        throw new Error("Shift assignment not found");
      }

      await assignment.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete shift assignment: ${error.message}`);
    }
  }

  /**
   * Count assignments
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    try {
      const count = await ShiftAssignment.count({ where: filters });
      return count;
    } catch (error) {
      throw new Error(`Failed to count shift assignments: ${error.message}`);
    }
  }

  /**
   * Get assignment with employee and shift details
   * @param {string} id - Assignment ID
   * @returns {Promise<Object>} Assignment with details
   */
  async findByIdWithDetails(id) {
    try {
      const assignment = await ShiftAssignment.findByPk(id, {
        include: [
          {
            model: require("../../../domain/entities/Employee"),
            as: "employee",
          },
          {
            model: require("../../../domain/entities/Shift"),
            as: "shift",
          },
        ],
      });
      return assignment;
    } catch (error) {
      throw new Error(
        `Failed to find shift assignment with details: ${error.message}`
      );
    }
  }

  /**
   * Check for assignment conflicts
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {string} excludeId - Assignment ID to exclude
   * @returns {Promise<Array>} Conflicting assignments
   */
  async checkConflicts(employeeId, startDate, endDate, excludeId = null) {
    try {
      const where = {
        employeeId,
        isActive: true,
        [Op.or]: [
          {
            startDate: { [Op.lte]: endDate },
            endDate: { [Op.gte]: startDate },
          },
          {
            startDate: { [Op.between]: [startDate, endDate] },
          },
        ],
      };

      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }

      const conflicts = await ShiftAssignment.findAll({ where });
      return conflicts;
    } catch (error) {
      throw new Error(`Failed to check assignment conflicts: ${error.message}`);
    }
  }
}

module.exports = ShiftAssignmentRepository;
