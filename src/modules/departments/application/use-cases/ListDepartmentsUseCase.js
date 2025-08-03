class ListDepartmentsUseCase {
  constructor(departmentRepository) {
    this.departmentRepository = departmentRepository;
  }

  /**
   * Execute the list departments use case
   * @param {Object} options - Query options
   * @returns {Promise<Object>} List of departments with pagination
   */
  async execute(options = {}) {
    try {
      // Validate and sanitize options
      const sanitizedOptions = this.sanitizeOptions(options);

      // Get departments from repository
      const result = await this.departmentRepository.findAll(sanitizedOptions);

      return result;
    } catch (error) {
      throw new Error(`Failed to list departments: ${error.message}`);
    }
  }

  /**
   * Sanitize and validate query options
   * @param {Object} options - Raw options
   * @returns {Object} Sanitized options
   */
  sanitizeOptions(options) {
    const sanitized = {};

    // Pagination
    if (options.page) {
      const page = parseInt(options.page);
      sanitized.page = isNaN(page) || page < 1 ? 1 : page;
    } else {
      sanitized.page = 1;
    }

    if (options.limit) {
      const limit = parseInt(options.limit);
      sanitized.limit = isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100);
    } else {
      sanitized.limit = 10;
    }

    // Search
    if (options.search && typeof options.search === "string") {
      sanitized.search = options.search.trim();
    }

    // Parent department filter
    if (options.parentDepartmentId) {
      sanitized.parentDepartmentId = options.parentDepartmentId;
    }

    // Active status filter
    if (options.isActive !== undefined) {
      sanitized.isActive =
        options.isActive === "true" || options.isActive === true;
    }

    // Include employees flag
    if (options.includeEmployees !== undefined) {
      sanitized.includeEmployees =
        options.includeEmployees === "true" ||
        options.includeEmployees === true;
    }

    return sanitized;
  }
}

module.exports = ListDepartmentsUseCase;
