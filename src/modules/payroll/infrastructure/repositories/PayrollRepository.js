const { Op } = require("sequelize");
const Payroll = require("../../../domain/entities/Payroll");
const IPayrollRepository = require("../../../domain/interfaces/IPayrollRepository");

/**
 * Payroll Repository Implementation
 * Sequelize-based implementation of payroll data access
 */
class PayrollRepository extends IPayrollRepository {
  /**
   * Create a new payroll record
   * @param {Object} payrollData - Payroll data
   * @returns {Promise<Object>} Created payroll
   */
  async create(payrollData) {
    try {
      const payroll = await Payroll.create(payrollData);
      return payroll;
    } catch (error) {
      throw new Error(`Failed to create payroll: ${error.message}`);
    }
  }

  /**
   * Find payroll by ID
   * @param {string} id - Payroll ID
   * @returns {Promise<Object|null>} Payroll or null
   */
  async findById(id) {
    try {
      const payroll = await Payroll.findByPk(id);
      return payroll;
    } catch (error) {
      throw new Error(`Failed to find payroll by ID: ${error.message}`);
    }
  }

  /**
   * Find all payroll records with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of payroll records
   */
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "payDate",
        sortOrder = "DESC",
        search,
        employeeId,
        payPeriod,
        status,
        minAmount,
        maxAmount,
        startDate,
        endDate,
      } = options;

      const where = {};

      // Apply filters
      if (employeeId) where.employeeId = employeeId;
      if (payPeriod) where.payPeriod = payPeriod;
      if (status) where.status = status;

      // Apply amount range filter
      if (minAmount || maxAmount) {
        where.netPay = {};
        if (minAmount) where.netPay[Op.gte] = minAmount;
        if (maxAmount) where.netPay[Op.lte] = maxAmount;
      }

      // Apply date range filter
      if (startDate || endDate) {
        where.payDate = {};
        if (startDate) where.payDate[Op.gte] = startDate;
        if (endDate) where.payDate[Op.lte] = endDate;
      }

      // Apply search filter
      if (search) {
        where[Op.or] = [
          { payPeriod: { [Op.iLike]: `%${search}%` } },
          { referenceNumber: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Apply additional filters
      Object.assign(where, filters);

      const offset = (page - 1) * limit;
      const order = [[sortBy, sortOrder]];

      const { count, rows } = await Payroll.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        payroll: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find payroll records: ${error.message}`);
    }
  }

  /**
   * Find payroll by employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of payroll records
   */
  async findByEmployee(employeeId, options = {}) {
    try {
      const { limit = 20, sortBy = "payDate", sortOrder = "DESC" } = options;

      const payroll = await Payroll.findAll({
        where: { employeeId },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return payroll;
    } catch (error) {
      throw new Error(`Failed to find payroll by employee: ${error.message}`);
    }
  }

  /**
   * Find payroll by period
   * @param {string} payPeriod - Pay period
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of payroll records
   */
  async findByPeriod(payPeriod, options = {}) {
    try {
      const { limit = 100, sortBy = "employeeId", sortOrder = "ASC" } = options;

      const payroll = await Payroll.findAll({
        where: { payPeriod },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return payroll;
    } catch (error) {
      throw new Error(`Failed to find payroll by period: ${error.message}`);
    }
  }

  /**
   * Find payroll by date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of payroll records
   */
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const { employeeId, sortBy = "payDate", sortOrder = "ASC" } = options;

      const where = {
        payDate: {
          [Op.between]: [startDate, endDate],
        },
      };

      if (employeeId) where.employeeId = employeeId;

      const payroll = await Payroll.findAll({
        where,
        order: [[sortBy, sortOrder]],
      });

      return payroll;
    } catch (error) {
      throw new Error(`Failed to find payroll by date range: ${error.message}`);
    }
  }

  /**
   * Find pending payroll
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of pending payroll
   */
  async findPending(options = {}) {
    try {
      const { limit = 50, sortBy = "payDate", sortOrder = "ASC" } = options;

      const payroll = await Payroll.findAll({
        where: { status: "pending" },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return payroll;
    } catch (error) {
      throw new Error(`Failed to find pending payroll: ${error.message}`);
    }
  }

  /**
   * Find approved payroll
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of approved payroll
   */
  async findApproved(options = {}) {
    try {
      const { limit = 50, sortBy = "payDate", sortOrder = "DESC" } = options;

      const payroll = await Payroll.findAll({
        where: { status: "approved" },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return payroll;
    } catch (error) {
      throw new Error(`Failed to find approved payroll: ${error.message}`);
    }
  }

  /**
   * Update payroll
   * @param {string} id - Payroll ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated payroll
   */
  async update(id, updateData) {
    try {
      const payroll = await Payroll.findByPk(id);
      if (!payroll) {
        throw new Error("Payroll record not found");
      }

      await payroll.update(updateData);
      return payroll;
    } catch (error) {
      throw new Error(`Failed to update payroll: ${error.message}`);
    }
  }

  /**
   * Delete payroll
   * @param {string} id - Payroll ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const payroll = await Payroll.findByPk(id);
      if (!payroll) {
        throw new Error("Payroll record not found");
      }

      await payroll.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete payroll: ${error.message}`);
    }
  }

  /**
   * Count payroll records
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    try {
      const count = await Payroll.count({ where: filters });
      return count;
    } catch (error) {
      throw new Error(`Failed to count payroll records: ${error.message}`);
    }
  }

  /**
   * Get payroll with employee details
   * @param {string} id - Payroll ID
   * @returns {Promise<Object>} Payroll with employee
   */
  async findByIdWithEmployee(id) {
    try {
      const payroll = await Payroll.findByPk(id, {
        include: [
          {
            model: require("../../../domain/entities/Employee"),
            as: "employee",
          },
        ],
      });
      return payroll;
    } catch (error) {
      throw new Error(`Failed to find payroll with employee: ${error.message}`);
    }
  }

  /**
   * Get payroll statistics
   * @param {string} payPeriod - Pay period
   * @returns {Promise<Object>} Payroll statistics
   */
  async getStatistics(payPeriod) {
    try {
      const payroll = await this.findByPeriod(payPeriod, { limit: 1000 });

      const stats = {
        payPeriod,
        totalEmployees: payroll.length,
        totalGrossPay: payroll.reduce(
          (sum, p) => sum + parseFloat(p.grossPay),
          0
        ),
        totalNetPay: payroll.reduce((sum, p) => sum + parseFloat(p.netPay), 0),
        totalTax: payroll.reduce((sum, p) => sum + parseFloat(p.taxAmount), 0),
        totalDeductions: payroll.reduce(
          (sum, p) => sum + parseFloat(p.totalDeductions),
          0
        ),
        totalOvertime: payroll.reduce(
          (sum, p) => sum + parseFloat(p.overtimePay),
          0
        ),
        totalBonuses: payroll.reduce(
          (sum, p) => sum + parseFloat(p.totalBonuses),
          0
        ),
        byStatus: {},
        byDepartment: {},
      };

      // Group by status
      payroll.forEach((p) => {
        const status = p.status;
        if (!stats.byStatus[status]) {
          stats.byStatus[status] = {
            count: 0,
            totalAmount: 0,
          };
        }
        stats.byStatus[status].count++;
        stats.byStatus[status].totalAmount += parseFloat(p.netPay);
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to get payroll statistics: ${error.message}`);
    }
  }

  /**
   * Get employee payroll summary
   * @param {string} employeeId - Employee ID
   * @param {string} year - Year
   * @returns {Promise<Object>} Payroll summary
   */
  async getEmployeeSummary(employeeId, year) {
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const payroll = await this.findByDateRange(startDate, endDate, {
        employeeId,
      });

      const summary = {
        year,
        totalPayrolls: payroll.length,
        totalGrossPay: payroll.reduce(
          (sum, p) => sum + parseFloat(p.grossPay),
          0
        ),
        totalNetPay: payroll.reduce((sum, p) => sum + parseFloat(p.netPay), 0),
        totalTax: payroll.reduce((sum, p) => sum + parseFloat(p.taxAmount), 0),
        totalDeductions: payroll.reduce(
          (sum, p) => sum + parseFloat(p.totalDeductions),
          0
        ),
        totalOvertime: payroll.reduce(
          (sum, p) => sum + parseFloat(p.overtimePay),
          0
        ),
        totalBonuses: payroll.reduce(
          (sum, p) => sum + parseFloat(p.totalBonuses),
          0
        ),
        averageMonthlyPay:
          payroll.length > 0
            ? payroll.reduce((sum, p) => sum + parseFloat(p.netPay), 0) /
              payroll.length
            : 0,
        byMonth: {},
      };

      // Group by month
      payroll.forEach((p) => {
        const month = new Date(p.payDate).getMonth() + 1;
        if (!summary.byMonth[month]) {
          summary.byMonth[month] = {
            grossPay: 0,
            netPay: 0,
            tax: 0,
            deductions: 0,
            overtime: 0,
            bonuses: 0,
          };
        }
        summary.byMonth[month].grossPay += parseFloat(p.grossPay);
        summary.byMonth[month].netPay += parseFloat(p.netPay);
        summary.byMonth[month].tax += parseFloat(p.taxAmount);
        summary.byMonth[month].deductions += parseFloat(p.totalDeductions);
        summary.byMonth[month].overtime += parseFloat(p.overtimePay);
        summary.byMonth[month].bonuses += parseFloat(p.totalBonuses);
      });

      return summary;
    } catch (error) {
      throw new Error(
        `Failed to get employee payroll summary: ${error.message}`
      );
    }
  }

  /**
   * Generate payroll for period
   * @param {string} payPeriod - Pay period
   * @param {Array} employeeIds - Array of employee IDs
   * @returns {Promise<Array>} Generated payroll records
   */
  async generatePayroll(payPeriod, employeeIds) {
    try {
      // This is a placeholder for payroll generation logic
      // In a real implementation, this would calculate payroll based on attendance, leaves, etc.
      const generatedPayroll = [];

      for (const employeeId of employeeIds) {
        // Check if payroll already exists for this employee and period
        const existingPayroll = await Payroll.findOne({
          where: { employeeId, payPeriod },
        });

        if (!existingPayroll) {
          // Generate payroll record (simplified logic)
          const payrollData = {
            employeeId,
            payPeriod,
            payDate: new Date(),
            startDate: new Date(),
            endDate: new Date(),
            basicSalary: 0, // Would be calculated from employee data
            allowances: [],
            totalAllowances: 0,
            overtimePay: 0,
            bonuses: [],
            totalBonuses: 0,
            deductions: [],
            totalDeductions: 0,
            taxAmount: 0,
            insuranceAmount: 0,
            pensionAmount: 0,
            loanDeductions: 0,
            grossPay: 0,
            netPay: 0,
            workingDays: 0,
            overtimeHours: 0,
            leaveDays: 0,
            status: "draft",
          };

          const payroll = await this.create(payrollData);
          generatedPayroll.push(payroll);
        }
      }

      return generatedPayroll;
    } catch (error) {
      throw new Error(`Failed to generate payroll: ${error.message}`);
    }
  }
}

module.exports = PayrollRepository;
