class GetDepartmentUseCase {
  constructor(departmentRepository) {
    this.departmentRepository = departmentRepository;
  }

  /**
   * Execute the get department use case
   * @param {string} id - Department ID
   * @returns {Promise<Object>} Department data
   */
  async execute(id) {
    try {
      // Validate input
      if (!id) {
        throw new Error("Department ID is required");
      }

      // Get department by ID
      const department = await this.departmentRepository.findById(id);

      if (!department) {
        throw new Error("Department not found");
      }

      return department;
    } catch (error) {
      throw new Error(`Failed to get department: ${error.message}`);
    }
  }
}

module.exports = GetDepartmentUseCase;
