const { ValidationError } = require("../../../utils/errors");
const EmployeeRepository = require("../../../infrastructure/db/repositories/EmployeeRepository");

/**
 * List Employees Use Case
 * Handles employee listing business logic
 */
class ListEmployeesUseCase {
  constructor() {
    this.employeeRepository = new EmployeeRepository();
  }

  /**
   * Execute employee listing
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Employee list
   */
  async execute(filters = {}, options = {}) {
    try {
      // Validate and sanitize filters
      const sanitizedFilters = this.sanitizeFilters(filters);

      // Validate and sanitize options
      const sanitizedOptions = this.sanitizeOptions(options);

      // Get employees
      const result = await this.employeeRepository.findAll(
        sanitizedFilters,
        sanitizedOptions
      );

      return {
        success: true,
        data: result.employees,
        pagination: result.pagination,
        filters: sanitizedFilters,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sanitize filters
   * @param {Object} filters - Raw filters
   * @returns {Object} Sanitized filters
   */
  sanitizeFilters(filters) {
    const sanitized = {};

    // Department filter
    if (filters.department && typeof filters.department === "string") {
      sanitized.department = filters.department.trim();
    }

    // Position filter
    if (filters.position && typeof filters.position === "string") {
      sanitized.position = filters.position.trim();
    }

    // Status filter
    if (filters.status && ["active", "inactive"].includes(filters.status)) {
      sanitized.isActive = filters.status === "active";
    }

    // Gender filter
    if (
      filters.gender &&
      ["male", "female", "other"].includes(filters.gender)
    ) {
      sanitized.gender = filters.gender;
    }

    // Hire date range
    if (filters.hireDateFrom || filters.hireDateTo) {
      sanitized.hireDate = {};
      if (filters.hireDateFrom) {
        sanitized.hireDate.from = new Date(filters.hireDateFrom);
      }
      if (filters.hireDateTo) {
        sanitized.hireDate.to = new Date(filters.hireDateTo);
      }
    }

    // Salary range
    if (filters.minSalary || filters.maxSalary) {
      sanitized.salary = {};
      if (filters.minSalary) {
        sanitized.salary.min = parseFloat(filters.minSalary);
      }
      if (filters.maxSalary) {
        sanitized.salary.max = parseFloat(filters.maxSalary);
      }
    }

    return sanitized;
  }

  /**
   * Sanitize options
   * @param {Object} options - Raw options
   * @returns {Object} Sanitized options
   */
  sanitizeOptions(options) {
    const sanitized = {
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "DESC",
    };

    // Page
    if (options.page) {
      const page = parseInt(options.page);
      if (page > 0) {
        sanitized.page = page;
      }
    }

    // Limit
    if (options.limit) {
      const limit = parseInt(options.limit);
      if (limit > 0 && limit <= 100) {
        sanitized.limit = limit;
      }
    }

    // Sort by
    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "firstName",
      "lastName",
      "employeeId",
      "hireDate",
      "salary",
      "department",
      "position",
    ];

    if (options.sortBy && allowedSortFields.includes(options.sortBy)) {
      sanitized.sortBy = options.sortBy;
    }

    // Sort order
    if (
      options.sortOrder &&
      ["ASC", "DESC"].includes(options.sortOrder.toUpperCase())
    ) {
      sanitized.sortOrder = options.sortOrder.toUpperCase();
    }

    // Search
    if (options.search && typeof options.search === "string") {
      sanitized.search = options.search.trim();
    }

    return sanitized;
  }
}

module.exports = ListEmployeesUseCase;
