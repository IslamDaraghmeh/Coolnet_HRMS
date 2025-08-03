const IBranchRepository = require("../../../domain/interfaces/IBranchRepository");
const { ValidationError, NotFoundError } = require("../../../utils/errors");

/**
 * Delete Branch Use Case
 * Handles the business logic for deleting a branch
 */
class DeleteBranchUseCase {
  constructor(branchRepository) {
    if (!(branchRepository instanceof IBranchRepository)) {
      throw new Error("Invalid branch repository");
    }
    this.branchRepository = branchRepository;
  }

  /**
   * Execute the use case
   * @param {string} branchId - Branch ID
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Deletion result
   */
  async execute(branchId, user) {
    try {
      // Validate user permissions
      if (
        !user ||
        !user.roles ||
        !user.roles.some((role) => ["admin"].includes(role.name))
      ) {
        throw new ValidationError("Only administrators can delete branches");
      }

      // Check if branch exists
      const existingBranch = await this.branchRepository.findById(branchId);
      if (!existingBranch) {
        throw new NotFoundError("Branch not found");
      }

      // Check for active employees
      await this.checkActiveEmployees(branchId);

      // Check for sub-branches
      await this.checkSubBranches(branchId);

      // Check if it's headquarters
      if (existingBranch.isHeadquarters) {
        throw new ValidationError("Cannot delete headquarters branch");
      }

      // Delete branch
      const deleted = await this.branchRepository.delete(branchId);

      if (!deleted) {
        throw new Error("Failed to delete branch");
      }

      return {
        success: true,
        message: "Branch deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check for active employees
   * @param {string} branchId - Branch ID
   */
  async checkActiveEmployees(branchId) {
    const branchWithEmployees =
      await this.branchRepository.findByIdWithEmployees(branchId);

    if (branchWithEmployees && branchWithEmployees.employees) {
      const activeEmployees = branchWithEmployees.employees.filter(
        (employee) => employee.status === "active"
      );

      if (activeEmployees.length > 0) {
        throw new ValidationError(
          `Cannot delete branch with ${activeEmployees.length} active employees. Please reassign or terminate employees first.`
        );
      }
    }
  }

  /**
   * Check for sub-branches
   * @param {string} branchId - Branch ID
   */
  async checkSubBranches(branchId) {
    const subBranches = await this.branchRepository.findSubBranches(branchId);

    if (subBranches.length > 0) {
      throw new ValidationError(
        `Cannot delete branch with ${subBranches.length} sub-branches. Please reassign or delete sub-branches first.`
      );
    }
  }
}

module.exports = DeleteBranchUseCase;
