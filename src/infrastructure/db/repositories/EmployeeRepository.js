const { Op } = require("sequelize");
const Employee = require("../../../domain/entities/Employee");
const IEmployeeRepository = require("../../../domain/interfaces/IEmployeeRepository");

/**
 * Employee Repository Implementation
 * Sequelize-based implementation of employee data access
 */
class EmployeeRepository extends IEmployeeRepository {
  /**
   * Create a new employee
   * @param {Object} employeeData - Employee data
   * @returns {Promise<Object>} Created employee
   */
  async create(employeeData) {
    try {
      const employee = await Employee.create(employeeData);
      return employee;
    } catch (error) {
      throw new Error(`Failed to create employee: ${error.message}`);
    }
  }

  /**
   * Find employee by ID
   * @param {string} id - Employee ID
   * @returns {Promise<Object|null>} Employee or null
   */
  async findById(id) {
    try {
      const employee = await Employee.findByPk(id);
      return employee;
    } catch (error) {
      throw new Error(`Failed to find employee by ID: ${error.message}`);
    }
  }

  /**
   * Find employee by employee ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object|null>} Employee or null
   */
  async findByEmployeeId(employeeId) {
    try {
      const employee = await Employee.findOne({
        where: { employeeId },
      });
      return employee;
    } catch (error) {
      throw new Error(
        `Failed to find employee by employee ID: ${error.message}`
      );
    }
  }

  /**
   * Find employee by email
   * @param {string} email - Employee email
   * @returns {Promise<Object|null>} Employee or null
   */
  async findByEmail(email) {
    try {
      const employee = await Employee.findByEmail(email);
      return employee;
    } catch (error) {
      throw new Error(`Failed to find employee by email: ${error.message}`);
    }
  }

  /**
   * Find employee by phone number
   * @param {string} phoneNumber - Employee phone number
   * @returns {Promise<Object|null>} Employee or null
   */
  async findByPhone(phoneNumber) {
    try {
      const employee = await Employee.findByPhone(phoneNumber);
      return employee;
    } catch (error) {
      throw new Error(`Failed to find employee by phone: ${error.message}`);
    }
  }

  /**
   * Find all employees with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options (pagination, sorting, etc.)
   * @returns {Promise<Array>} Array of employees
   */
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "DESC",
        search,
        department,
        position,
        employmentType,
        status,
        managerId,
      } = options;

      const where = {};

      // Apply filters
      if (department) where.department = department;
      if (position) where.position = position;
      if (employmentType) where.employmentType = employmentType;
      if (status) where.status = status;
      if (managerId) where.managerId = managerId;

      // Apply search filter
      if (search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { employeeId: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Apply additional filters
      Object.assign(where, filters);

      const offset = (page - 1) * limit;
      const order = [[sortBy, sortOrder]];

      const { count, rows } = await Employee.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        employees: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find employees: ${error.message}`);
    }
  }

  /**
   * Find active employees
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Array of active employees
   */
  async findActive(filters = {}) {
    try {
      const where = { status: "active", ...filters };
      const employees = await Employee.findAll({ where });
      return employees;
    } catch (error) {
      throw new Error(`Failed to find active employees: ${error.message}`);
    }
  }

  /**
   * Find employees by department
   * @param {string} department - Department name
   * @returns {Promise<Array>} Array of employees
   */
  async findByDepartment(department) {
    try {
      const employees = await Employee.findAll({
        where: { department, status: "active" },
      });
      return employees;
    } catch (error) {
      throw new Error(
        `Failed to find employees by department: ${error.message}`
      );
    }
  }

  /**
   * Find employees by position
   * @param {string} position - Position title
   * @returns {Promise<Array>} Array of employees
   */
  async findByPosition(position) {
    try {
      const employees = await Employee.findAll({
        where: { position, status: "active" },
      });
      return employees;
    } catch (error) {
      throw new Error(`Failed to find employees by position: ${error.message}`);
    }
  }

  /**
   * Find employees by employment type
   * @param {string} employmentType - Employment type
   * @returns {Promise<Array>} Array of employees
   */
  async findByEmploymentType(employmentType) {
    try {
      const employees = await Employee.findAll({
        where: { employmentType, status: "active" },
      });
      return employees;
    } catch (error) {
      throw new Error(
        `Failed to find employees by employment type: ${error.message}`
      );
    }
  }

  /**
   * Find employees by manager
   * @param {string} managerId - Manager ID
   * @returns {Promise<Array>} Array of employees
   */
  async findByManager(managerId) {
    try {
      const employees = await Employee.findAll({
        where: { managerId, status: "active" },
      });
      return employees;
    } catch (error) {
      throw new Error(`Failed to find employees by manager: ${error.message}`);
    }
  }

  /**
   * Update employee
   * @param {string} id - Employee ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated employee
   */
  async update(id, updateData) {
    try {
      const employee = await Employee.findByPk(id);
      if (!employee) {
        throw new Error("Employee not found");
      }

      await employee.update(updateData);
      return employee;
    } catch (error) {
      throw new Error(`Failed to update employee: ${error.message}`);
    }
  }

  /**
   * Delete employee
   * @param {string} id - Employee ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const employee = await Employee.findByPk(id);
      if (!employee) {
        throw new Error("Employee not found");
      }

      await employee.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
  }

  /**
   * Soft delete employee (mark as inactive)
   * @param {string} id - Employee ID
   * @returns {Promise<Object>} Updated employee
   */
  async softDelete(id) {
    try {
      const employee = await Employee.findByPk(id);
      if (!employee) {
        throw new Error("Employee not found");
      }

      await employee.update({ status: "terminated" });
      return employee;
    } catch (error) {
      throw new Error(`Failed to soft delete employee: ${error.message}`);
    }
  }

  /**
   * Count total employees
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    try {
      const count = await Employee.count({ where: filters });
      return count;
    } catch (error) {
      throw new Error(`Failed to count employees: ${error.message}`);
    }
  }

  /**
   * Search employees by text
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of matching employees
   */
  async search(searchTerm, options = {}) {
    try {
      const { limit = 20, department, status = "active" } = options;

      const where = {
        status,
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${searchTerm}%` } },
          { lastName: { [Op.iLike]: `%${searchTerm}%` } },
          { email: { [Op.iLike]: `%${searchTerm}%` } },
          { employeeId: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      };

      if (department) {
        where.department = department;
      }

      const employees = await Employee.findAll({
        where,
        limit: parseInt(limit),
        order: [
          ["firstName", "ASC"],
          ["lastName", "ASC"],
        ],
      });

      return employees;
    } catch (error) {
      throw new Error(`Failed to search employees: ${error.message}`);
    }
  }

  /**
   * Get employee statistics
   * @returns {Promise<Object>} Employee statistics
   */
  async getStatistics() {
    try {
      const [
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        terminatedEmployees,
        departmentStats,
        employmentTypeStats,
      ] = await Promise.all([
        Employee.count(),
        Employee.count({ where: { status: "active" } }),
        Employee.count({ where: { status: "inactive" } }),
        Employee.count({ where: { status: "terminated" } }),
        Employee.findAll({
          attributes: [
            "department",
            [
              Employee.sequelize.fn("COUNT", Employee.sequelize.col("id")),
              "count",
            ],
          ],
          where: { status: "active" },
          group: ["department"],
        }),
        Employee.findAll({
          attributes: [
            "employmentType",
            [
              Employee.sequelize.fn("COUNT", Employee.sequelize.col("id")),
              "count",
            ],
          ],
          where: { status: "active" },
          group: ["employmentType"],
        }),
      ]);

      return {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
        terminated: terminatedEmployees,
        departments: departmentStats,
        employmentTypes: employmentTypeStats,
      };
    } catch (error) {
      throw new Error(`Failed to get employee statistics: ${error.message}`);
    }
  }

  /**
   * Bulk create employees
   * @param {Array} employeesData - Array of employee data
   * @returns {Promise<Array>} Array of created employees
   */
  async bulkCreate(employeesData) {
    try {
      const employees = await Employee.bulkCreate(employeesData, {
        validate: true,
        returning: true,
      });
      return employees;
    } catch (error) {
      throw new Error(`Failed to bulk create employees: ${error.message}`);
    }
  }

  /**
   * Bulk update employees
   * @param {Array} updates - Array of update objects with id and data
   * @returns {Promise<Array>} Array of updated employees
   */
  async bulkUpdate(updates) {
    try {
      const updatedEmployees = [];

      for (const update of updates) {
        const employee = await this.update(update.id, update.data);
        updatedEmployees.push(employee);
      }

      return updatedEmployees;
    } catch (error) {
      throw new Error(`Failed to bulk update employees: ${error.message}`);
    }
  }

  /**
   * Find employees by branch
   * @param {string} branchId - Branch ID
   * @returns {Promise<Array>} Array of employees
   */
  async findByBranch(branchId) {
    try {
      const employees = await Employee.findAll({
        where: { branchId, status: "active" },
      });
      return employees;
    } catch (error) {
      throw new Error(`Failed to find employees by branch: ${error.message}`);
    }
  }

  /**
   * Find employees by work location
   * @param {string} workLocation - Work location type
   * @returns {Promise<Array>} Array of employees
   */
  async findByWorkLocation(workLocation) {
    try {
      const employees = await Employee.findAll({
        where: { workLocation, status: "active" },
      });
      return employees;
    } catch (error) {
      throw new Error(
        `Failed to find employees by work location: ${error.message}`
      );
    }
  }

  /**
   * Assign employee to branch
   * @param {string} employeeId - Employee ID
   * @param {string} branchId - Branch ID
   * @returns {Promise<Object>} Updated employee
   */
  async assignToBranch(employeeId, branchId) {
    try {
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw new Error("Employee not found");
      }

      // Update employee branch assignment
      await employee.update({
        branchId,
        assignedDate: new Date(),
      });

      return employee;
    } catch (error) {
      throw new Error(`Failed to assign employee to branch: ${error.message}`);
    }
  }

  /**
   * Remove employee from branch
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Updated employee
   */
  async removeFromBranch(employeeId) {
    try {
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw new Error("Employee not found");
      }

      // Remove branch assignment
      await employee.update({
        branchId: null,
        assignedDate: null,
      });

      return employee;
    } catch (error) {
      throw new Error(
        `Failed to remove employee from branch: ${error.message}`
      );
    }
  }

  /**
   * Get branch statistics
   * @param {string} branchId - Branch ID
   * @returns {Promise<Object>} Branch employee statistics
   */
  async getBranchStatistics(branchId) {
    try {
      const employees = await this.findByBranch(branchId);

      const stats = {
        totalEmployees: employees.length,
        byDepartment: {},
        byPosition: {},
        byEmploymentType: {},
        byWorkLocation: {},
        averageSalary: 0,
        totalSalary: 0,
      };

      let totalSalary = 0;
      let salaryCount = 0;

      employees.forEach((employee) => {
        // Department stats
        stats.byDepartment[employee.department] =
          (stats.byDepartment[employee.department] || 0) + 1;

        // Position stats
        stats.byPosition[employee.position] =
          (stats.byPosition[employee.position] || 0) + 1;

        // Employment type stats
        stats.byEmploymentType[employee.employmentType] =
          (stats.byEmploymentType[employee.employmentType] || 0) + 1;

        // Work location stats
        stats.byWorkLocation[employee.workLocation] =
          (stats.byWorkLocation[employee.workLocation] || 0) + 1;

        // Salary stats
        if (employee.salary) {
          totalSalary += parseFloat(employee.salary);
          salaryCount++;
        }
      });

      stats.totalSalary = totalSalary;
      stats.averageSalary = salaryCount > 0 ? totalSalary / salaryCount : 0;

      return stats;
    } catch (error) {
      throw new Error(`Failed to get branch statistics: ${error.message}`);
    }
  }
}

module.exports = EmployeeRepository;
