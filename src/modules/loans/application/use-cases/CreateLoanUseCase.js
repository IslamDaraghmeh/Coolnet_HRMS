const ILoanRepository = require("../../../domain/interfaces/ILoanRepository");
const IEmployeeRepository = require("../../../domain/interfaces/IEmployeeRepository");
const { ValidationError } = require("../../../utils/errors");

/**
 * Create Loan Use Case
 * Handles the business logic for creating a new loan request
 */
class CreateLoanUseCase {
  constructor(loanRepository, employeeRepository) {
    if (!(loanRepository instanceof ILoanRepository)) {
      throw new Error("Invalid loan repository");
    }
    if (!(employeeRepository instanceof IEmployeeRepository)) {
      throw new Error("Invalid employee repository");
    }
    this.loanRepository = loanRepository;
    this.employeeRepository = employeeRepository;
  }

  /**
   * Execute the use case
   * @param {Object} loanData - Loan data
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Created loan
   */
  async execute(loanData, user) {
    try {
      // Validate user permissions
      if (
        !user ||
        !user.roles ||
        !user.roles.some((role) =>
          ["admin", "hr_manager", "employee"].includes(role.name)
        )
      ) {
        throw new ValidationError(
          "Insufficient permissions to create loan requests"
        );
      }

      // Validate loan data
      await this.validateLoanData(loanData);

      // Check employee eligibility
      await this.checkEmployeeEligibility(loanData.employeeId);

      // Check existing loan balance
      await this.checkExistingLoanBalance(loanData.employeeId, loanData.amount);

      // Calculate loan details
      const calculatedLoan = await this.calculateLoanDetails(loanData);

      // Create loan data
      const loanToCreate = {
        ...calculatedLoan,
        status: "pending",
        requestedBy: user.id,
        requestedAt: new Date(),
      };

      // Create loan
      const loan = await this.loanRepository.create(loanToCreate);

      return {
        success: true,
        data: loan,
        message: "Loan request created successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate loan data
   * @param {Object} loanData - Loan data
   */
  async validateLoanData(loanData) {
    const { employeeId, loanType, amount, purpose, termMonths } = loanData;

    // Validate required fields
    if (!employeeId) {
      throw new ValidationError("Employee ID is required");
    }

    if (
      !loanType ||
      !["personal", "housing", "education", "medical", "vehicle"].includes(
        loanType
      )
    ) {
      throw new ValidationError("Valid loan type is required");
    }

    if (!amount || amount <= 0) {
      throw new ValidationError("Valid loan amount is required");
    }

    if (!purpose || purpose.trim().length < 10) {
      throw new ValidationError(
        "Loan purpose must be at least 10 characters long"
      );
    }

    if (!termMonths || termMonths < 1 || termMonths > 60) {
      throw new ValidationError("Loan term must be between 1 and 60 months");
    }

    // Validate amount limits based on loan type
    const maxAmounts = {
      personal: 50000,
      housing: 500000,
      education: 100000,
      medical: 75000,
      vehicle: 200000,
    };

    if (amount > maxAmounts[loanType]) {
      throw new ValidationError(
        `Maximum loan amount for ${loanType} loans is $${maxAmounts[loanType]}`
      );
    }
  }

  /**
   * Check employee eligibility
   * @param {string} employeeId - Employee ID
   */
  async checkEmployeeEligibility(employeeId) {
    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw new ValidationError("Employee not found");
    }

    if (employee.status !== "active") {
      throw new ValidationError("Only active employees can request loans");
    }

    // Check minimum employment period (6 months)
    const employmentDate = new Date(employee.hireDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (employmentDate > sixMonthsAgo) {
      throw new ValidationError(
        "Employee must be employed for at least 6 months to request a loan"
      );
    }
  }

  /**
   * Check existing loan balance
   * @param {string} employeeId - Employee ID
   * @param {number} newAmount - New loan amount
   */
  async checkExistingLoanBalance(employeeId, newAmount) {
    const loanBalance = await this.loanRepository.getLoanBalance(employeeId);
    const totalOutstanding = loanBalance.totalOutstanding + newAmount;

    // Maximum total loan balance is 12 months salary
    const employee = await this.employeeRepository.findById(employeeId);
    const maxAllowed = employee.salary * 12;

    if (totalOutstanding > maxAllowed) {
      throw new ValidationError(
        `Total loan balance cannot exceed 12 months salary ($${maxAllowed})`
      );
    }
  }

  /**
   * Calculate loan details
   * @param {Object} loanData - Loan data
   * @returns {Object} Calculated loan details
   */
  async calculateLoanDetails(loanData) {
    const { amount, termMonths, loanType } = loanData;

    // Interest rates based on loan type
    const interestRates = {
      personal: 0.12, // 12% per annum
      housing: 0.08, // 8% per annum
      education: 0.06, // 6% per annum
      medical: 0.1, // 10% per annum
      vehicle: 0.09, // 9% per annum
    };

    const annualRate = interestRates[loanType];
    const monthlyRate = annualRate / 12;

    // Calculate monthly payment using loan amortization formula
    const monthlyPayment =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);

    const totalInterest = monthlyPayment * termMonths - amount;
    const totalAmount = amount + totalInterest;

    return {
      ...loanData,
      interestRate: annualRate,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }
}

module.exports = CreateLoanUseCase;
