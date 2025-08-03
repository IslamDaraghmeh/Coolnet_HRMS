const { Op } = require("sequelize");
const Department = require("../../domain/entities/Department");
const Employee = require("../../../employees/domain/entities/Employee");

class DepartmentRepository {
  /**
   * Create a new department
   * @param {Object} departmentData - Department data
   * @returns {Promise<Department>} Created department
   */
  async create(departmentData) {
    try {
      const department = await Department.create(departmentData);
      return department;
    } catch (error) {
      throw new Error(`Failed to create department: ${error.message}`);
    }
  }

  /**
   * Find department by ID
   * @param {string} id - Department ID
   * @returns {Promise<Department|null>} Department or null
   */
  async findById(id) {
    try {
      const department = await Department.findByPk(id, {
        include: [
          {
            model: Department,
            as: "parent",
            attributes: ["id", "name", "code"],
          },
          {
            model: Employee,
            as: "head",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: Department,
            as: "children",
            attributes: ["id", "name", "code"],
          },
        ],
      });
      return department;
    } catch (error) {
      throw new Error(`Failed to find department: ${error.message}`);
    }
  }

  /**
   * Find department by code
   * @param {string} code - Department code
   * @returns {Promise<Department|null>} Department or null
   */
  async findByCode(code) {
    try {
      const department = await Department.findOne({
        where: { code },
        include: [
          {
            model: Department,
            as: "parent",
            attributes: ["id", "name", "code"],
          },
          {
            model: Employee,
            as: "head",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      });
      return department;
    } catch (error) {
      throw new Error(`Failed to find department by code: ${error.message}`);
    }
  }

  /**
   * Get all departments with optional filtering
   * @param {Object} options - Query options
   * @returns {Promise<Array<Department>>} List of departments
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        parentDepartmentId = null,
        isActive = null,
        includeEmployees = false,
      } = options;

      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (parentDepartmentId !== null) {
        whereClause.parentDepartmentId = parentDepartmentId;
      }

      if (isActive !== null) {
        whereClause.isActive = isActive;
      }

      const includeOptions = [
        {
          model: Department,
          as: "parent",
          attributes: ["id", "name", "code"],
        },
        {
          model: Employee,
          as: "head",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ];

      if (includeEmployees) {
        includeOptions.push({
          model: Employee,
          as: "employees",
          attributes: ["id", "firstName", "lastName", "email", "position"],
          through: { attributes: [] },
        });
      }

      const departments = await Department.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        order: [["name", "ASC"]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      });

      return {
        departments: departments.rows,
        total: departments.count,
        page: parseInt(page),
        totalPages: Math.ceil(departments.count / parseInt(limit)),
      };
    } catch (error) {
      throw new Error(`Failed to find departments: ${error.message}`);
    }
  }

  /**
   * Update department
   * @param {string} id - Department ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Department>} Updated department
   */
  async update(id, updateData) {
    try {
      const department = await Department.findByPk(id);
      if (!department) {
        throw new Error("Department not found");
      }

      await department.update(updateData);
      return department;
    } catch (error) {
      throw new Error(`Failed to update department: ${error.message}`);
    }
  }

  /**
   * Delete department
   * @param {string} id - Department ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const department = await Department.findByPk(id);
      if (!department) {
        throw new Error("Department not found");
      }

      // Check if department has employees
      const employeeCount = await department.countEmployees();
      if (employeeCount > 0) {
        throw new Error("Cannot delete department with assigned employees");
      }

      // Check if department has sub-departments
      const subDepartmentCount = await department.countSubDepartments();
      if (subDepartmentCount > 0) {
        throw new Error("Cannot delete department with sub-departments");
      }

      await department.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete department: ${error.message}`);
    }
  }

  /**
   * Get department hierarchy
   * @param {string} id - Department ID
   * @returns {Promise<Object>} Department hierarchy
   */
  async getHierarchy(id) {
    try {
      const department = await Department.findByPk(id, {
        include: [
          {
            model: Department,
            as: "parentDepartment",
            include: [
              {
                model: Department,
                as: "parentDepartment",
                attributes: ["id", "name", "code"],
              },
            ],
          },
          {
            model: Department,
            as: "subDepartments",
            include: [
              {
                model: Department,
                as: "subDepartments",
                attributes: ["id", "name", "code"],
              },
            ],
          },
        ],
      });

      if (!department) {
        throw new Error("Department not found");
      }

      return department;
    } catch (error) {
      throw new Error(`Failed to get department hierarchy: ${error.message}`);
    }
  }

  /**
   * Get all root departments (no parent)
   * @returns {Promise<Array<Department>>} Root departments
   */
  async getRootDepartments() {
    try {
      const departments = await Department.findAll({
        where: { parentDepartmentId: null },
        include: [
          {
            model: Department,
            as: "subDepartments",
            attributes: ["id", "name", "code"],
          },
          {
            model: Employee,
            as: "head",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        order: [["name", "ASC"]],
      });

      return departments;
    } catch (error) {
      throw new Error(`Failed to get root departments: ${error.message}`);
    }
  }

  /**
   * Assign employee to department
   * @param {string} departmentId - Department ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<boolean>} Success status
   */
  async assignEmployee(departmentId, employeeId) {
    try {
      const department = await Department.findByPk(departmentId);
      if (!department) {
        throw new Error("Department not found");
      }

      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw new Error("Employee not found");
      }

      await department.addEmployee(employee);
      return true;
    } catch (error) {
      throw new Error(
        `Failed to assign employee to department: ${error.message}`
      );
    }
  }

  /**
   * Remove employee from department
   * @param {string} departmentId - Department ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<boolean>} Success status
   */
  async removeEmployee(departmentId, employeeId) {
    try {
      const department = await Department.findByPk(departmentId);
      if (!department) {
        throw new Error("Department not found");
      }

      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw new Error("Employee not found");
      }

      await department.removeEmployee(employee);
      return true;
    } catch (error) {
      throw new Error(
        `Failed to remove employee from department: ${error.message}`
      );
    }
  }

  /**
   * Get department employees
   * @param {string} departmentId - Department ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Department employees
   */
  async getEmployees(departmentId, options = {}) {
    try {
      const { page = 1, limit = 10, search = "", position = null } = options;

      const department = await Department.findByPk(departmentId);
      if (!department) {
        throw new Error("Department not found");
      }

      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (position) {
        whereClause.position = position;
      }

      const employees = await department.getEmployees({
        where: whereClause,
        attributes: [
          "id",
          "firstName",
          "lastName",
          "email",
          "position",
          "hireDate",
        ],
        order: [
          ["firstName", "ASC"],
          ["lastName", "ASC"],
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      });

      const total = await department.countEmployees({ where: whereClause });

      return {
        employees,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
      };
    } catch (error) {
      throw new Error(`Failed to get department employees: ${error.message}`);
    }
  }
}

module.exports = DepartmentRepository;
