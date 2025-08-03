const IBranchRepository = require("../../../domain/interfaces/IBranchRepository");
const { ValidationError } = require("../../../utils/errors");

/**
 * Create Branch Use Case
 * Handles the business logic for creating a new branch
 */
class CreateBranchUseCase {
  constructor(branchRepository) {
    if (!(branchRepository instanceof IBranchRepository)) {
      throw new Error("Invalid branch repository");
    }
    this.branchRepository = branchRepository;
  }

  /**
   * Execute the use case
   * @param {Object} branchData - Branch data
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Created branch
   */
  async execute(branchData, user) {
    try {
      // Validate user permissions
      if (
        !user ||
        !user.roles ||
        !user.roles.some((role) => ["admin", "hr_manager"].includes(role.name))
      ) {
        throw new ValidationError(
          "Insufficient permissions to create branches"
        );
      }

      // Validate branch data
      await this.validateBranchData(branchData);

      // Check for duplicate branch code
      await this.checkDuplicateCode(branchData.code);

      // Validate parent branch if provided
      if (branchData.parentBranchId) {
        await this.validateParentBranch(branchData.parentBranchId);
      }

      // Validate manager if provided
      if (branchData.managerId) {
        await this.validateManager(branchData.managerId);
      }

      // Handle headquarters logic
      if (branchData.isHeadquarters) {
        await this.handleHeadquartersCreation();
      }

      // Create branch data
      const branchToCreate = {
        ...branchData,
        currentEmployees: 0,
        status: "active",
        createdBy: user.id,
      };

      // Create branch
      const branch = await this.branchRepository.create(branchToCreate);

      return {
        success: true,
        data: branch,
        message: "Branch created successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate branch data
   * @param {Object} branchData - Branch data
   */
  async validateBranchData(branchData) {
    const { name, code, address, contactInfo, capacity, timezone } = branchData;

    // Validate required fields
    if (!name || name.trim().length < 2) {
      throw new ValidationError(
        "Branch name must be at least 2 characters long"
      );
    }

    if (!code || code.trim().length < 2) {
      throw new ValidationError(
        "Branch code must be at least 2 characters long"
      );
    }

    // Validate code format (alphanumeric and uppercase)
    const codeRegex = /^[A-Z0-9]+$/;
    if (!codeRegex.test(code)) {
      throw new ValidationError(
        "Branch code must contain only uppercase letters and numbers"
      );
    }

    // Validate address
    if (!address || !address.street || !address.city || !address.country) {
      throw new ValidationError("Complete address information is required");
    }

    // Validate contact info
    if (!contactInfo || !contactInfo.email || !contactInfo.phone) {
      throw new ValidationError(
        "Contact information (email and phone) is required"
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      throw new ValidationError("Invalid email format in contact information");
    }

    // Validate capacity
    if (capacity && (capacity < 1 || capacity > 10000)) {
      throw new ValidationError("Branch capacity must be between 1 and 10,000");
    }

    // Validate timezone
    if (timezone && !this.isValidTimezone(timezone)) {
      throw new ValidationError("Invalid timezone");
    }

    // Validate working hours if provided
    if (branchData.workingHours) {
      await this.validateWorkingHours(branchData.workingHours);
    }
  }

  /**
   * Check for duplicate branch code
   * @param {string} code - Branch code
   */
  async checkDuplicateCode(code) {
    const exists = await this.branchRepository.codeExists(code);
    if (exists) {
      throw new ValidationError("Branch code already exists");
    }
  }

  /**
   * Validate parent branch
   * @param {string} parentBranchId - Parent branch ID
   */
  async validateParentBranch(parentBranchId) {
    const parentBranch = await this.branchRepository.findById(parentBranchId);
    if (!parentBranch) {
      throw new ValidationError("Parent branch not found");
    }

    if (!parentBranch.isActive()) {
      throw new ValidationError("Parent branch must be active");
    }
  }

  /**
   * Validate manager
   * @param {string} managerId - Manager employee ID
   */
  async validateManager(managerId) {
    // This would typically check against employee repository
    // For now, we'll assume the manager exists and is valid
    if (!managerId) {
      throw new ValidationError("Invalid manager ID");
    }
  }

  /**
   * Handle headquarters creation
   */
  async handleHeadquartersCreation() {
    const existingHeadquarters = await this.branchRepository.findHeadquarters();
    if (existingHeadquarters) {
      throw new ValidationError(
        "A headquarters branch already exists. Only one headquarters is allowed."
      );
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

module.exports = CreateBranchUseCase;
