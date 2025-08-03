class AssignEmployeeToDepartmentUseCase {
  constructor(departmentRepository) {
    this.departmentRepository = departmentRepository;
  }

  /**
   * Execute the assign employee to department use case
   * @param {string} departmentId - Department ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<boolean>} Success status
   */
  async execute(departmentId, employeeId) {
    try {
      // Validate inputs
      if (!departmentId) {
        throw new Error("Department ID is required");
      }

      if (!employeeId) {
        throw new Error("Employee ID is required");
      }

      // Check if department exists and is active
      const department = await this.departmentRepository.findById(departmentId);
      if (!department) {
        throw new Error("Department not found");
      }

      if (!department.isActive) {
        throw new Error("Cannot assign employee to inactive department");
      }

      // Check if employee exists
      // Note: This would require Employee repository to validate
      // For now, we'll assume the employee exists
      // In a real implementation, you'd inject EmployeeRepository and validate

      // Check if employee is already assigned to this department
      const existingEmployees = await this.departmentRepository.getEmployees(
        departmentId,
        {
          limit: 1000, // Get all employees to check for existing assignment
        }
      );

      const isAlreadyAssigned = existingEmployees.employees.some(
        (emp) => emp.id === employeeId
      );
      if (isAlreadyAssigned) {
        throw new Error("Employee is already assigned to this department");
      }

      // Check if employee is assigned to another department
      // Note: This would require checking the employee's current department assignment
      // For now, we'll assume this check is handled at the repository level

      // Assign employee to department
      const result = await this.departmentRepository.assignEmployee(
        departmentId,
        employeeId
      );

      return result;
    } catch (error) {
      throw new Error(
        `Failed to assign employee to department: ${error.message}`
      );
    }
  }
}

module.exports = AssignEmployeeToDepartmentUseCase;
