const { Op } = require("sequelize");
const Shift = require("../../../domain/entities/Shift");
const IShiftRepository = require("../../../domain/interfaces/IShiftRepository");

/**
 * Shift Repository Implementation
 * Sequelize-based implementation of shift data access
 */
class ShiftRepository extends IShiftRepository {
  /**
   * Create a new shift
   * @param {Object} shiftData - Shift data
   * @returns {Promise<Object>} Created shift
   */
  async create(shiftData) {
    try {
      const shift = await Shift.create(shiftData);
      return shift;
    } catch (error) {
      throw new Error(`Failed to create shift: ${error.message}`);
    }
  }

  /**
   * Find shift by ID
   * @param {string} id - Shift ID
   * @returns {Promise<Object|null>} Shift or null
   */
  async findById(id) {
    try {
      const shift = await Shift.findByPk(id);
      return shift;
    } catch (error) {
      throw new Error(`Failed to find shift by ID: ${error.message}`);
    }
  }

  /**
   * Find all shifts with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of shifts
   */
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "name",
        sortOrder = "ASC",
        search,
        isActive,
      } = options;

      const where = {};

      // Apply filters
      if (isActive !== undefined) where.isActive = isActive;

      // Apply search filter
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Apply additional filters
      Object.assign(where, filters);

      const offset = (page - 1) * limit;
      const order = [[sortBy, sortOrder]];

      const { count, rows } = await Shift.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        shifts: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find shifts: ${error.message}`);
    }
  }

  /**
   * Find active shifts
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of active shifts
   */
  async findActive(options = {}) {
    try {
      const { sortBy = "name", sortOrder = "ASC" } = options;

      const shifts = await Shift.findAll({
        where: { isActive: true },
        order: [[sortBy, sortOrder]],
      });

      return shifts;
    } catch (error) {
      throw new Error(`Failed to find active shifts: ${error.message}`);
    }
  }

  /**
   * Update shift
   * @param {string} id - Shift ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated shift
   */
  async update(id, updateData) {
    try {
      const shift = await Shift.findByPk(id);
      if (!shift) {
        throw new Error("Shift not found");
      }

      await shift.update(updateData);
      return shift;
    } catch (error) {
      throw new Error(`Failed to update shift: ${error.message}`);
    }
  }

  /**
   * Delete shift
   * @param {string} id - Shift ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const shift = await Shift.findByPk(id);
      if (!shift) {
        throw new Error("Shift not found");
      }

      await shift.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete shift: ${error.message}`);
    }
  }

  /**
   * Count shifts
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    try {
      const count = await Shift.count({ where: filters });
      return count;
    } catch (error) {
      throw new Error(`Failed to count shifts: ${error.message}`);
    }
  }

  /**
   * Get shift with assignments
   * @param {string} id - Shift ID
   * @returns {Promise<Object>} Shift with assignments
   */
  async findByIdWithAssignments(id) {
    try {
      const shift = await Shift.findByPk(id, {
        include: [
          {
            model: require("../../../domain/entities/ShiftAssignment"),
            as: "assignments",
            include: [
              {
                model: require("../../../domain/entities/Employee"),
                as: "employee",
              },
            ],
          },
        ],
      });
      return shift;
    } catch (error) {
      throw new Error(
        `Failed to find shift with assignments: ${error.message}`
      );
    }
  }
}

module.exports = ShiftRepository;
