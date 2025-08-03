const { Op } = require("sequelize");
const Branch = require("../../../domain/entities/Branch");
const IBranchRepository = require("../../../domain/interfaces/IBranchRepository");

/**
 * Branch Repository Implementation
 * Sequelize-based implementation of branch data access
 */
class BranchRepository extends IBranchRepository {
  /**
   * Create a new branch
   * @param {Object} branchData - Branch data
   * @returns {Promise<Object>} Created branch
   */
  async create(branchData) {
    try {
      const branch = await Branch.create(branchData);
      return branch;
    } catch (error) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  /**
   * Find branch by ID
   * @param {string} id - Branch ID
   * @returns {Promise<Object|null>} Branch or null
   */
  async findById(id) {
    try {
      const branch = await Branch.findByPk(id);
      return branch;
    } catch (error) {
      throw new Error(`Failed to find branch: ${error.message}`);
    }
  }

  /**
   * Find branch by code
   * @param {string} code - Branch code
   * @returns {Promise<Object|null>} Branch or null
   */
  async findByCode(code) {
    try {
      const branch = await Branch.findOne({ where: { code } });
      return branch;
    } catch (error) {
      throw new Error(`Failed to find branch by code: ${error.message}`);
    }
  }

  /**
   * Find all branches with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Object with branches and pagination
   */
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "name",
        sortOrder = "ASC",
        search,
        status,
        isHeadquarters,
        managerId,
        parentBranchId,
      } = options;

      const where = {};

      // Apply filters
      if (status) where.status = status;
      if (isHeadquarters !== undefined) where.isHeadquarters = isHeadquarters;
      if (managerId) where.managerId = managerId;
      if (parentBranchId) where.parentBranchId = parentBranchId;

      // Apply search filter
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Apply additional filters (filter out undefined values)
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([key, value]) => value !== undefined && value !== null
        )
      );
      Object.assign(where, cleanFilters);

      const offset = (page - 1) * limit;
      const order = [[sortBy, sortOrder]];

      const { count, rows } = await Branch.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        branches: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find branches: ${error.message}`);
    }
  }

  /**
   * Find active branches
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of active branches
   */
  async findActive(options = {}) {
    try {
      const result = await this.findAll({ status: "active" }, options);
      return result.branches;
    } catch (error) {
      throw new Error(`Failed to find active branches: ${error.message}`);
    }
  }

  /**
   * Find headquarters branch
   * @returns {Promise<Object|null>} Headquarters branch or null
   */
  async findHeadquarters() {
    try {
      const branch = await Branch.findOne({ where: { isHeadquarters: true } });
      return branch;
    } catch (error) {
      throw new Error(`Failed to find headquarters: ${error.message}`);
    }
  }

  /**
   * Find branches by manager
   * @param {string} managerId - Manager employee ID
   * @returns {Promise<Array>} Array of branches
   */
  async findByManager(managerId) {
    try {
      const branches = await Branch.findAll({ where: { managerId } });
      return branches;
    } catch (error) {
      throw new Error(`Failed to find branches by manager: ${error.message}`);
    }
  }

  /**
   * Find sub-branches
   * @param {string} parentBranchId - Parent branch ID
   * @returns {Promise<Array>} Array of sub-branches
   */
  async findSubBranches(parentBranchId) {
    try {
      const branches = await Branch.findAll({ where: { parentBranchId } });
      return branches;
    } catch (error) {
      throw new Error(`Failed to find sub-branches: ${error.message}`);
    }
  }

  /**
   * Find branch hierarchy
   * @param {string} branchId - Branch ID
   * @returns {Promise<Object>} Branch with hierarchy information
   */
  async findHierarchy(branchId) {
    try {
      const branch = await Branch.findByPk(branchId);
      if (!branch) return null;

      const hierarchy = {
        branch,
        parent: null,
        children: [],
        ancestors: [],
      };

      // Get parent branch
      if (branch.parentBranchId) {
        hierarchy.parent = await Branch.findByPk(branch.parentBranchId);
      }

      // Get child branches
      hierarchy.children = await this.findSubBranches(branchId);

      // Get ancestor branches (recursive)
      if (branch.parentBranchId) {
        const parentHierarchy = await this.findHierarchy(branch.parentBranchId);
        if (parentHierarchy) {
          hierarchy.ancestors = [
            parentHierarchy.branch,
            ...parentHierarchy.ancestors,
          ];
        }
      }

      return hierarchy;
    } catch (error) {
      throw new Error(`Failed to find branch hierarchy: ${error.message}`);
    }
  }

  /**
   * Update branch
   * @param {string} id - Branch ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated branch
   */
  async update(id, updateData) {
    try {
      const branch = await Branch.findByPk(id);
      if (!branch) {
        throw new Error("Branch not found");
      }

      await branch.update(updateData);
      return branch;
    } catch (error) {
      throw new Error(`Failed to update branch: ${error.message}`);
    }
  }

  /**
   * Delete branch
   * @param {string} id - Branch ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const branch = await Branch.findByPk(id);
      if (!branch) {
        throw new Error("Branch not found");
      }

      // Check if branch has employees
      if (branch.currentEmployees > 0) {
        throw new Error("Cannot delete branch with active employees");
      }

      // Check if branch has sub-branches
      const subBranches = await this.findSubBranches(id);
      if (subBranches.length > 0) {
        throw new Error("Cannot delete branch with sub-branches");
      }

      await branch.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete branch: ${error.message}`);
    }
  }

  /**
   * Count branches
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    try {
      const count = await Branch.count({ where: filters });
      return count;
    } catch (error) {
      throw new Error(`Failed to count branches: ${error.message}`);
    }
  }

  /**
   * Get branch statistics
   * @param {string} branchId - Branch ID
   * @returns {Promise<Object>} Branch statistics
   */
  async getStatistics(branchId) {
    try {
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        throw new Error("Branch not found");
      }

      const subBranches = await this.findSubBranches(branchId);
      const totalEmployees = branch.currentEmployees;
      const totalSubBranches = subBranches.length;

      // Calculate capacity utilization
      const capacityUtilization = branch.capacity
        ? (totalEmployees / branch.capacity) * 100
        : 0;

      return {
        branchId,
        totalEmployees,
        totalSubBranches,
        capacityUtilization: Math.round(capacityUtilization * 100) / 100,
        status: branch.status,
        isHeadquarters: branch.isHeadquarters,
      };
    } catch (error) {
      throw new Error(`Failed to get branch statistics: ${error.message}`);
    }
  }

  /**
   * Get branch with employees
   * @param {string} id - Branch ID
   * @returns {Promise<Object>} Branch with employees
   */
  async findByIdWithEmployees(id) {
    try {
      const branch = await Branch.findByPk(id, {
        include: [
          {
            model: require("../../../domain/entities/Employee"),
            as: "employees",
            where: { status: "active" },
            required: false,
          },
        ],
      });
      return branch;
    } catch (error) {
      throw new Error(`Failed to find branch with employees: ${error.message}`);
    }
  }

  /**
   * Get branch with manager
   * @param {string} id - Branch ID
   * @returns {Promise<Object>} Branch with manager details
   */
  async findByIdWithManager(id) {
    try {
      const branch = await Branch.findByPk(id, {
        include: [
          {
            model: require("../../../domain/entities/Employee"),
            as: "manager",
            required: false,
          },
        ],
      });
      return branch;
    } catch (error) {
      throw new Error(`Failed to find branch with manager: ${error.message}`);
    }
  }

  /**
   * Check if branch code exists
   * @param {string} code - Branch code
   * @param {string} excludeId - Branch ID to exclude from check
   * @returns {Promise<boolean>} Whether code exists
   */
  async codeExists(code, excludeId = null) {
    try {
      const where = { code };
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }

      const count = await Branch.count({ where });
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check branch code: ${error.message}`);
    }
  }

  /**
   * Update employee count
   * @param {string} branchId - Branch ID
   * @param {number} change - Change in employee count (+1 or -1)
   * @returns {Promise<boolean>} Success status
   */
  async updateEmployeeCount(branchId, change) {
    try {
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        throw new Error("Branch not found");
      }

      const newCount = branch.currentEmployees + change;
      if (newCount < 0) {
        throw new Error("Employee count cannot be negative");
      }

      if (branch.capacity && newCount > branch.capacity) {
        throw new Error("Employee count exceeds branch capacity");
      }

      await branch.update({ currentEmployees: newCount });
      return true;
    } catch (error) {
      throw new Error(`Failed to update employee count: ${error.message}`);
    }
  }
}

module.exports = BranchRepository;
