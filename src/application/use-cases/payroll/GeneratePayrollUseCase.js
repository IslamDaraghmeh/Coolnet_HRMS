const IPayrollRepository = require("../../../domain/interfaces/IPayrollRepository");
const IEmployeeRepository = require("../../../domain/interfaces/IEmployeeRepository");
const IAttendanceRepository = require("../../../domain/interfaces/IAttendanceRepository");
const ILeaveRepository = require("../../../domain/interfaces/ILeaveRepository");
const ILoanRepository = require("../../../domain/interfaces/ILoanRepository");
const { ValidationError } = require("../../../utils/errors");

/**
 * Generate Payroll Use Case
 * Handles the business logic for generating payroll for employees
 */
class GeneratePayrollUseCase {
  constructor(
    payrollRepository,
    employeeRepository,
    attendanceRepository,
    leaveRepository,
    loanRepository
  ) {
    if (!(payrollRepository instanceof IPayrollRepository)) {
      throw new Error("Invalid payroll repository");
    }
    if (!(employeeRepository instanceof IEmployeeRepository)) {
      throw new Error("Invalid employee repository");
    }
    if (!(attendanceRepository instanceof IAttendanceRepository)) {
      throw new Error("Invalid attendance repository");
    }
    if (!(leaveRepository instanceof ILeaveRepository)) {
      throw new Error("Invalid leave repository");
    }
    if (!(loanRepository instanceof ILoanRepository)) {
      throw new Error("Invalid loan repository");
    }

    this.payrollRepository = payrollRepository;
    this.employeeRepository = employeeRepository;
    this.attendanceRepository = attendanceRepository;
    this.leaveRepository = leaveRepository;
    this.loanRepository = loanRepository;
  }

  /**
   * Execute the use case
   * @param {Object} payrollData - Payroll generation data
   * @param {Object} user - Current user
   * @returns {Promise<Object>} Generated payroll records
   */
  async execute(payrollData, user) {
    try {
      // Validate user permissions
      if (
        !user ||
        !user.roles ||
        !user.roles.some((role) =>
          ["admin", "hr_manager", "finance_manager"].includes(role.name)
        )
      ) {
        throw new ValidationError(
          "Insufficient permissions to generate payroll"
        );
      }

      // Validate payroll data
      await this.validatePayrollData(payrollData);

      // Get employees to process
      const employees = await this.getEmployeesToProcess(
        payrollData.employeeIds
      );

      // Generate payroll for each employee
      const generatedPayrolls = [];
      for (const employee of employees) {
        try {
          const payroll = await this.generateEmployeePayroll(
            employee,
            payrollData,
            user
          );
          generatedPayrolls.push(payroll);
        } catch (error) {
          console.error(
            `Failed to generate payroll for employee ${employee.id}:`,
            error.message
          );
          // Continue with other employees
        }
      }

      return {
        success: true,
        data: generatedPayrolls,
        message: `Generated payroll for ${generatedPayrolls.length} employees`,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate payroll data
   * @param {Object} payrollData - Payroll data
   */
  async validatePayrollData(payrollData) {
    const { payPeriod, startDate, endDate } = payrollData;

    if (!payPeriod) {
      throw new ValidationError("Pay period is required");
    }

    if (!startDate || !endDate) {
      throw new ValidationError("Start date and end date are required");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new ValidationError("End date must be after start date");
    }

    // Check if payroll already exists for this period
    const existingPayrolls = await this.payrollRepository.findByPeriod(
      startDate,
      endDate
    );
    if (existingPayrolls.length > 0) {
      throw new ValidationError("Payroll already exists for this period");
    }
  }

  /**
   * Get employees to process
   * @param {Array} employeeIds - Employee IDs (optional)
   * @returns {Array} Employees to process
   */
  async getEmployeesToProcess(employeeIds) {
    if (employeeIds && employeeIds.length > 0) {
      const employees = [];
      for (const id of employeeIds) {
        const employee = await this.employeeRepository.findById(id);
        if (employee && employee.status === "active") {
          employees.push(employee);
        }
      }
      return employees;
    } else {
      // Get all active employees
      const result = await this.employeeRepository.findAll({
        status: "active",
      });
      return result.employees || [];
    }
  }

  /**
   * Generate payroll for a single employee
   * @param {Object} employee - Employee data
   * @param {Object} payrollData - Payroll data
   * @param {Object} user - Current user
   * @returns {Object} Generated payroll
   */
  async generateEmployeePayroll(employee, payrollData, user) {
    const { payPeriod, startDate, endDate } = payrollData;

    // Get attendance data
    const attendanceData = await this.getAttendanceData(
      employee.id,
      startDate,
      endDate
    );

    // Get leave data
    const leaveData = await this.getLeaveData(employee.id, startDate, endDate);

    // Get loan deductions
    const loanDeductions = await this.getLoanDeductions(employee.id);

    // Calculate payroll components
    const payrollComponents = this.calculatePayrollComponents(
      employee,
      attendanceData,
      leaveData,
      loanDeductions
    );

    // Create payroll record
    const payrollRecord = {
      employeeId: employee.id,
      payPeriod,
      payDate: new Date(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      basicSalary: employee.salary,
      ...payrollComponents,
      status: "draft",
      calculatedBy: user.id,
      calculatedAt: new Date(),
    };

    return await this.payrollRepository.create(payrollRecord);
  }

  /**
   * Get attendance data for employee
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Object} Attendance data
   */
  async getAttendanceData(employeeId, startDate, endDate) {
    const attendance =
      await this.attendanceRepository.findByEmployeeAndDateRange(
        employeeId,
        startDate,
        endDate
      );

    const totalHours = attendance.reduce((sum, record) => {
      if (record.checkIn && record.checkOut) {
        const hours =
          (new Date(record.checkOut) - new Date(record.checkIn)) /
          (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);

    const overtimeHours = Math.max(0, totalHours - 8 * 22); // Assuming 8 hours per day, 22 working days

    return {
      totalHours,
      overtimeHours,
      workingDays: attendance.length,
    };
  }

  /**
   * Get leave data for employee
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Object} Leave data
   */
  async getLeaveData(employeeId, startDate, endDate) {
    const leaves = await this.leaveRepository.findByEmployeeAndDateRange(
      employeeId,
      startDate,
      endDate
    );

    const approvedLeaves = leaves.filter(
      (leave) => leave.status === "approved"
    );
    const paidLeaves = approvedLeaves.filter(
      (leave) => leave.leaveType === "paid"
    ).length;
    const unpaidLeaves = approvedLeaves.filter(
      (leave) => leave.leaveType === "unpaid"
    ).length;

    return {
      totalLeaves: approvedLeaves.length,
      paidLeaves,
      unpaidLeaves,
    };
  }

  /**
   * Get loan deductions for employee
   * @param {string} employeeId - Employee ID
   * @returns {Object} Loan deductions
   */
  async getLoanDeductions(employeeId) {
    const loanBalance = await this.loanRepository.getLoanBalance(employeeId);
    return {
      totalDeductions: loanBalance.monthlyPayments || 0,
      activeLoans: loanBalance.numberOfActiveLoans || 0,
    };
  }

  /**
   * Calculate payroll components
   * @param {Object} employee - Employee data
   * @param {Object} attendanceData - Attendance data
   * @param {Object} leaveData - Leave data
   * @param {Object} loanDeductions - Loan deductions
   * @returns {Object} Payroll components
   */
  calculatePayrollComponents(
    employee,
    attendanceData,
    leaveData,
    loanDeductions
  ) {
    const { totalHours, overtimeHours, workingDays } = attendanceData;
    const { paidLeaves, unpaidLeaves } = leaveData;

    // Basic salary calculation
    const dailyRate = employee.salary / 22; // Assuming 22 working days per month
    const actualWorkingDays = workingDays - unpaidLeaves;
    const basicSalary = dailyRate * actualWorkingDays;

    // Overtime calculation
    const overtimeRate = 1.5; // 1.5x for overtime
    const overtimePay =
      overtimeHours * (employee.salary / (8 * 22)) * overtimeRate;

    // Allowances (example calculations)
    const allowances = {
      housing: employee.salary * 0.1, // 10% housing allowance
      transport: 500, // Fixed transport allowance
      meal: 300, // Fixed meal allowance
    };
    const totalAllowances = Object.values(allowances).reduce(
      (sum, val) => sum + val,
      0
    );

    // Deductions
    const taxRate = 0.15; // 15% tax rate
    const insuranceRate = 0.05; // 5% insurance
    const pensionRate = 0.08; // 8% pension

    const grossPay = basicSalary + overtimePay + totalAllowances;
    const taxAmount = grossPay * taxRate;
    const insuranceAmount = grossPay * insuranceRate;
    const pensionAmount = grossPay * pensionRate;
    const totalDeductions =
      taxAmount +
      insuranceAmount +
      pensionAmount +
      loanDeductions.totalDeductions;

    const netPay = grossPay - totalDeductions;

    return {
      basicSalary,
      overtimePay,
      allowances,
      totalAllowances,
      taxAmount,
      insuranceAmount,
      pensionAmount,
      totalDeductions,
      grossPay,
      netPay,
      workingDays: actualWorkingDays,
      overtimeHours,
      leaveDays: paidLeaves + unpaidLeaves,
      loanDeductions: loanDeductions.totalDeductions,
    };
  }
}

module.exports = GeneratePayrollUseCase;
