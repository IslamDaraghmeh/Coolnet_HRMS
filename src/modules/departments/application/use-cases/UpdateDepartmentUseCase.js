class UpdateDepartmentUseCase {
  constructor(departmentRepository) {
    this.departmentRepository = departmentRepository;
  }

  /**
   * Execute the update department use case
   * @param {string} id - Department ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated department
   */
  async execute(id, updateData) {
    try {
      // Check if department exists
      const existingDepartment = await this.departmentRepository.findById(id);
      if (!existingDepartment) {
        throw new Error("Department not found");
      }

      // Validate department code if being updated
      if (updateData.code && updateData.code !== existingDepartment.code) {
        const departmentWithSameCode =
          await this.departmentRepository.findByCode(updateData.code);
        if (departmentWithSameCode && departmentWithSameCode.id !== id) {
          throw new Error("Department code already exists");
        }
      }

      // Validate parent department if being updated
      if (updateData.parentDepartmentId !== undefined) {
        // If setting a parent department
        if (updateData.parentDepartmentId) {
          const parentDepartment = await this.departmentRepository.findById(
            updateData.parentDepartmentId
          );
          if (!parentDepartment) {
            throw new Error("Parent department not found");
          }

          // Check for circular reference
          if (updateData.parentDepartmentId === id) {
            throw new Error("Department cannot be its own parent");
          }

          // Check if the new parent is a child of this department (would create circular reference)
          const isChildOfThisDepartment = await this.isChildDepartment(
            id,
            updateData.parentDepartmentId
          );
          if (isChildOfThisDepartment) {
            throw new Error(
              "Cannot set parent to a child department (would create circular reference)"
            );
          }
        }
      }

      // Validate department head if being updated
      if (updateData.headId !== undefined) {
        // Note: This would require Employee repository to validate
        // For now, we'll assume the employee exists
        // In a real implementation, you'd inject EmployeeRepository and validate
      }

      // Prepare update data
      const dataToUpdate = {};

      if (updateData.name !== undefined) {
        dataToUpdate.name = updateData.name.trim();
      }

      if (updateData.code !== undefined) {
        dataToUpdate.code = updateData.code.toUpperCase().trim();
      }

      if (updateData.description !== undefined) {
        dataToUpdate.description = updateData.description?.trim() || null;
      }

      if (updateData.parentDepartmentId !== undefined) {
        dataToUpdate.parentDepartmentId = updateData.parentDepartmentId || null;
      }

      if (updateData.headId !== undefined) {
        dataToUpdate.headId = updateData.headId || null;
      }

      if (updateData.isActive !== undefined) {
        dataToUpdate.isActive = updateData.isActive;
      }

      if (updateData.settings !== undefined) {
        dataToUpdate.settings = updateData.settings;
      }

      dataToUpdate.updatedAt = new Date();

      // Update the department
      const updatedDepartment = await this.departmentRepository.update(
        id,
        dataToUpdate
      );

      return updatedDepartment;
    } catch (error) {
      throw new Error(`Failed to update department: ${error.message}`);
    }
  }

  /**
   * Check if a department is a child of another department
   * @param {string} parentId - Parent department ID
   * @param {string} childId - Child department ID
   * @returns {Promise<boolean>} True if child is a descendant of parent
   */
  async isChildDepartment(parentId, childId) {
    try {
      const childDepartment = await this.departmentRepository.findById(childId);
      if (!childDepartment) {
        return false;
      }

      let currentParentId = childDepartment.parentDepartmentId;

      while (currentParentId) {
        if (currentParentId === parentId) {
          return true;
        }

        const parent = await this.departmentRepository.findById(
          currentParentId
        );
        if (!parent) {
          break;
        }

        currentParentId = parent.parentDepartmentId;
      }

      return false;
    } catch (error) {
      throw new Error(`Failed to check department hierarchy: ${error.message}`);
    }
  }
}

module.exports = UpdateDepartmentUseCase;
