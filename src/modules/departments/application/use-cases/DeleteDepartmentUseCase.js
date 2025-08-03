class DeleteDepartmentUseCase {
  constructor(departmentRepository) {
    this.departmentRepository = departmentRepository;
  }

  /**
   * Execute the delete department use case
   * @param {string} id - Department ID
   * @returns {Promise<boolean>} Success status
   */
  async execute(id) {
    try {
      // Validate input
      if (!id) {
        throw new Error("Department ID is required");
      }

      // Check if department exists
      const department = await this.departmentRepository.findById(id);
      if (!department) {
        throw new Error("Department not found");
      }

      // Check if department has employees
      const employeeCount = await this.departmentRepository.getEmployees(id, {
        limit: 1,
      });
      if (employeeCount.total > 0) {
        throw new Error(
          "Cannot delete department with assigned employees. Please reassign or remove employees first."
        );
      }

      // Check if department has sub-departments
      const subDepartments = await this.departmentRepository.findAll({
        parentDepartmentId: id,
        limit: 1,
      });
      if (subDepartments.total > 0) {
        throw new Error(
          "Cannot delete department with sub-departments. Please reassign or delete sub-departments first."
        );
      }

      // Check if department is referenced as a parent in approval workflows
      // Note: This would require checking approval workflows if they reference departments
      // For now, we'll assume this check is handled at the repository level

      // Delete the department
      const result = await this.departmentRepository.delete(id);

      return result;
    } catch (error) {
      throw new Error(`Failed to delete department: ${error.message}`);
    }
  }
}

module.exports = DeleteDepartmentUseCase;
