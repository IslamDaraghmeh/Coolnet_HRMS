const IBranchRepository = require("../../../domain/interfaces/IBranchRepository");
const { ValidationError, NotFoundError } = require("../../../utils/errors");

/**
 * Update Branch Use Case
 * Handles the business logic for updating an existing branch
 */
class UpdateBranchUseCase {
  constructor(branchRepository) {
    if (!(branchRepository instanceof IBranchRepository)) {
      throw new Error("Invalid branch repository");
    }
    this.branchRepository = branchRepository;
  }

  /**
   * Execute the use case
   * @param {string} branchId - Branch ID
   * @param {Object} updateData - Update data
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Updated branch
   */
  async execute(branchId, updateData, user) {
    try {
      // Validate user permissions
      if (
        !user ||
        !user.roles ||
        !user.roles.some((role) => ["admin", "hr_manager"].includes(role.name))
      ) {
        throw new ValidationError(
          "Insufficient permissions to update branches"
        );
      }

      // Check if branch exists
      const existingBranch = await this.branchRepository.findById(branchId);
      if (!existingBranch) {
        throw new NotFoundError("Branch not found");
      }

      // Validate update data
      await this.validateUpdateData(updateData);

      // Check for duplicate code if code is being updated
      if (updateData.code && updateData.code !== existingBranch.code) {
        await this.checkDuplicateCode(updateData.code, branchId);
      }

      // Validate parent branch if being updated
      if (
        updateData.parentBranchId &&
        updateData.parentBranchId !== existingBranch.parentBranchId
      ) {
        await this.validateParentBranch(updateData.parentBranchId, branchId);
      }

      // Validate manager if being updated
      if (
        updateData.managerId &&
        updateData.managerId !== existingBranch.managerId
      ) {
        await this.validateManager(updateData.managerId);
      }

      // Handle headquarters logic
      if (updateData.isHeadquarters && !existingBranch.isHeadquarters) {
        await this.handleHeadquartersUpdate(branchId);
      }

      // Handle status changes
      if (updateData.status && updateData.status !== existingBranch.status) {
        await this.validateStatusChange(existingBranch, updateData.status);
      }

      // Update branch
      const updatedBranch = await this.branchRepository.update(
        branchId,
        updateData
      );

      return {
        success: true,
        data: updatedBranch,
        message: "Branch updated successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate update data
   * @param {Object} updateData - Update data
   */
  async validateUpdateData(updateData) {
    const { name, code, address, contactInfo, capacity, timezone } = updateData;

    // Validate name if provided
    if (name && name.trim().length < 2) {
      throw new ValidationError(
        "Branch name must be at least 2 characters long"
      );
    }

    // Validate code if provided
    if (code) {
      if (code.trim().length < 2) {
        throw new ValidationError(
          "Branch code must be at least 2 characters long"
        );
      }

      const codeRegex = /^[A-Z0-9]+$/;
      if (!codeRegex.test(code)) {
        throw new ValidationError(
          "Branch code must contain only uppercase letters and numbers"
        );
      }
    }

    // Validate address if provided
    if (address) {
      if (!address.street || !address.city || !address.country) {
        throw new ValidationError("Complete address information is required");
      }
    }

    // Validate contact info if provided
    if (contactInfo) {
      if (!contactInfo.email || !contactInfo.phone) {
        throw new ValidationError(
          "Contact information (email and phone) is required"
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactInfo.email)) {
        throw new ValidationError(
          "Invalid email format in contact information"
        );
      }
    }

    // Validate capacity if provided
    if (capacity !== undefined) {
      if (capacity < 1 || capacity > 10000) {
        throw new ValidationError(
          "Branch capacity must be between 1 and 10,000"
        );
      }
    }

    // Validate timezone if provided
    if (timezone && !this.isValidTimezone(timezone)) {
      throw new ValidationError("Invalid timezone");
    }

    // Validate working hours if provided
    if (updateData.workingHours) {
      await this.validateWorkingHours(updateData.workingHours);
    }
  }

  /**
   * Check for duplicate branch code
   * @param {string} code - Branch code
   * @param {string} excludeId - Branch ID to exclude
   */
  async checkDuplicateCode(code, excludeId) {
    const exists = await this.branchRepository.codeExists(code, excludeId);
    if (exists) {
      throw new ValidationError("Branch code already exists");
    }
  }

  /**
   * Validate parent branch
   * @param {string} parentBranchId - Parent branch ID
   * @param {string} currentBranchId - Current branch ID
   */
  async validateParentBranch(parentBranchId, currentBranchId) {
    // Check if trying to set self as parent
    if (parentBranchId === currentBranchId) {
      throw new ValidationError("Branch cannot be its own parent");
    }

    const parentBranch = await this.branchRepository.findById(parentBranchId);
    if (!parentBranch) {
      throw new ValidationError("Parent branch not found");
    }

    if (!parentBranch.isActive()) {
      throw new ValidationError("Parent branch must be active");
    }

    // Check for circular references
    const hierarchy = await this.branchRepository.findHierarchy(parentBranchId);
    if (hierarchy.ancestors.some((branch) => branch.id === currentBranchId)) {
      throw new ValidationError(
        "Cannot create circular reference in branch hierarchy"
      );
    }
  }

  /**
   * Validate manager
   * @param {string} managerId - Manager employee ID
   */
  async validateManager(managerId) {
    if (!managerId) {
      throw new ValidationError("Invalid manager ID");
    }
    // Additional validation would check against employee repository
  }

  /**
   * Handle headquarters update
   * @param {string} branchId - Branch ID being updated
   */
  async handleHeadquartersUpdate(branchId) {
    const existingHeadquarters = await this.branchRepository.findHeadquarters();
    if (existingHeadquarters && existingHeadquarters.id !== branchId) {
      throw new ValidationError(
        "A headquarters branch already exists. Only one headquarters is allowed."
      );
    }
  }

  /**
   * Validate status change
   * @param {Object} existingBranch - Existing branch
   * @param {string} newStatus - New status
   */
  async validateStatusChange(existingBranch, newStatus) {
    if (newStatus === "closed" && existingBranch.currentEmployees > 0) {
      throw new ValidationError("Cannot close branch with active employees");
    }

    if (newStatus === "closed" && existingBranch.isHeadquarters) {
      throw new ValidationError("Cannot close headquarters branch");
    }
  }

  /**
   * Validate timezone
   * @param {string} timezone - Timezone string
   * @returns {boolean} Whether timezone is valid
   */
  isValidTimezone(timezone) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate working hours
   * @param {Object} workingHours - Working hours object
   */
  async validateWorkingHours(workingHours) {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    for (const day of days) {
      if (workingHours[day]) {
        const hours = workingHours[day];

        if (typeof hours.isWorking !== "boolean") {
          throw new ValidationError(`isWorking must be boolean for ${day}`);
        }

        if (hours.isWorking) {
          if (!hours.start || !hours.end) {
            throw new ValidationError(
              `Start and end times required for ${day}`
            );
          }

          if (!timeRegex.test(hours.start) || !timeRegex.test(hours.end)) {
            throw new ValidationError(`Invalid time format for ${day}`);
          }

          const start = new Date(`2000-01-01 ${hours.start}`);
          const end = new Date(`2000-01-01 ${hours.end}`);

          if (start >= end) {
            throw new ValidationError(
              `End time must be after start time for ${day}`
            );
          }
        }
      }
    }
  }
}

module.exports = UpdateBranchUseCase;
