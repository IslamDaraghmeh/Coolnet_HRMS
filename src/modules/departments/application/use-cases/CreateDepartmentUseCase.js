const { v4: uuidv4 } = require("uuid");

class CreateDepartmentUseCase {
  constructor(departmentRepository) {
    this.departmentRepository = departmentRepository;
  }

  /**
   * Execute the create department use case
   * @param {Object} departmentData - Department data
   * @returns {Promise<Object>} Created department
   */
  async execute(departmentData) {
    try {
      // Validate required fields
      if (!departmentData.name || !departmentData.code) {
        throw new Error("Department name and code are required");
      }

      // Check if department code already exists
      const existingDepartment = await this.departmentRepository.findByCode(
        departmentData.code
      );
      if (existingDepartment) {
        throw new Error("Department code already exists");
      }

      // Validate parent department if provided
      if (departmentData.parentDepartmentId) {
        const parentDepartment = await this.departmentRepository.findById(
          departmentData.parentDepartmentId
        );
        if (!parentDepartment) {
          throw new Error("Parent department not found");
        }

        // Check for circular reference
        if (departmentData.parentDepartmentId === departmentData.id) {
          throw new Error("Department cannot be its own parent");
        }
      }

      // Validate department head if provided
      if (departmentData.headId) {
        // Note: This would require Employee repository to validate
        // For now, we'll assume the employee exists
        // In a real implementation, you'd inject EmployeeRepository and validate
      }

      // Prepare department data
      const departmentToCreate = {
        id: uuidv4(),
        name: departmentData.name.trim(),
        code: departmentData.code.toUpperCase().trim(),
        description: departmentData.description?.trim() || null,
        parentDepartmentId: departmentData.parentDepartmentId || null,
        headId: departmentData.headId || null,
        isActive:
          departmentData.isActive !== undefined
            ? departmentData.isActive
            : true,
        settings: departmentData.settings || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create the department
      const createdDepartment = await this.departmentRepository.create(
        departmentToCreate
      );

      return createdDepartment;
    } catch (error) {
      throw new Error(`Failed to create department: ${error.message}`);
    }
  }
}

module.exports = CreateDepartmentUseCase;
