const { Op } = require("sequelize");
const User = require("../../../domain/entities/User");
const IUserRepository = require("../../../domain/interfaces/IUserRepository");

/**
 * User Repository Implementation
 * Sequelize-based implementation of user data access
 */
class UserRepository extends IUserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    try {
      const user = await User.create(userData);
      return user;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User or null
   */
  async findById(id) {
    try {
      const user = await User.findByPk(id);
      return user;
    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  /**
   * Find user by phone number
   * @param {string} phoneNumber - Phone number
   * @returns {Promise<Object|null>} User or null
   */
  async findByPhone(phoneNumber) {
    try {
      const user = await User.findByPhone(phoneNumber);
      return user;
    } catch (error) {
      // Log the specific database error for debugging
      console.error("Database error in findByPhone:", {
        phoneNumber,
        error: error.message,
        stack: error.stack,
      });

      // Provide a more user-friendly error message
      if (
        error.message.includes("column") &&
        error.message.includes("does not exist")
      ) {
        throw new Error(
          "Database schema mismatch. Please contact system administrator."
        );
      }

      throw new Error(`Failed to find user by phone: ${error.message}`);
    }
  }

  /**
   * Find user by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} User or null
   */
  async findByEmail(email) {
    try {
      const user = await User.findByEmail(email);
      return user;
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  /**
   * Find user by employee ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object|null>} User or null
   */
  async findByEmployeeId(employeeId) {
    try {
      const user = await User.findOne({
        where: { employeeId },
      });
      return user;
    } catch (error) {
      throw new Error(`Failed to find user by employee ID: ${error.message}`);
    }
  }

  /**
   * Find all users with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of users
   */
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "DESC",
        search,
        isActive,
      } = options;

      const where = {};

      // Apply filters
      if (isActive !== undefined) where.isActive = isActive;

      // Apply search filter
      if (search) {
        where[Op.or] = [
          { phoneNumber: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Apply additional filters
      Object.assign(where, filters);

      const offset = (page - 1) * limit;
      const order = [[sortBy, sortOrder]];

      const { count, rows } = await User.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        users: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find users: ${error.message}`);
    }
  }

  /**
   * Find active users
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of active users
   */
  async findActive(filters = {}) {
    try {
      const where = { isActive: true, ...filters };
      const users = await User.findAll({ where });
      return users;
    } catch (error) {
      throw new Error(`Failed to find active users: ${error.message}`);
    }
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async update(id, updateData) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }

      await user.update(updateData);
      return user;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Update user refresh token
   * @param {string} id - User ID
   * @param {string} refreshToken - Refresh token
   * @param {Date} expiresAt - Expiration date
   * @returns {Promise<Object>} Updated user
   */
  async updateRefreshToken(id, refreshToken, expiresAt) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }

      await user.update({
        refreshToken,
        refreshTokenExpiresAt: expiresAt,
      });
      return user;
    } catch (error) {
      throw new Error(`Failed to update refresh token: ${error.message}`);
    }
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }

      await user.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Soft delete user (mark as inactive)
   * @param {string} id - User ID
   * @returns {Promise<Object>} Updated user
   */
  async softDelete(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }

      await user.update({ isActive: false });
      return user;
    } catch (error) {
      throw new Error(`Failed to soft delete user: ${error.message}`);
    }
  }

  /**
   * Count total users
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    try {
      const count = await User.count({ where: filters });
      return count;
    } catch (error) {
      throw new Error(`Failed to count users: ${error.message}`);
    }
  }

  /**
   * Get user with roles
   * @param {string} id - User ID
   * @returns {Promise<Object>} User with roles
   */
  async findByIdWithRoles(id) {
    try {
      const user = await User.findByPk(id, {
        include: [
          {
            model: require("../../../domain/entities/Role"),
            through: { attributes: [] },
            as: "roles",
          },
        ],
      });
      return user;
    } catch (error) {
      throw new Error(`Failed to find user with roles: ${error.message}`);
    }
  }

  /**
   * Get user with permissions
   * @param {string} id - User ID
   * @returns {Promise<Object>} User with permissions
   */
  async findByIdWithPermissions(id) {
    try {
      const user = await this.findByIdWithRoles(id);
      if (!user) return null;

      // Extract permissions from roles
      const permissions = new Set();
      if (user.roles) {
        user.roles.forEach((role) => {
          if (role.permissions) {
            role.permissions.forEach((permission) => {
              permissions.add(permission);
            });
          }
        });
      }

      user.permissions = Array.from(permissions);
      return user;
    } catch (error) {
      throw new Error(`Failed to find user with permissions: ${error.message}`);
    }
  }
}

module.exports = UserRepository;
