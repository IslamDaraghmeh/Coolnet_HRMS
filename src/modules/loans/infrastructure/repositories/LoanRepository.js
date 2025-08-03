const { Op } = require("sequelize");
const Loan = require("../../../domain/entities/Loan");
const ILoanRepository = require("../../../domain/interfaces/ILoanRepository");

/**
 * Loan Repository Implementation
 * Sequelize-based implementation of loan data access
 */
class LoanRepository extends ILoanRepository {
  /**
   * Create a new loan
   * @param {Object} loanData - Loan data
   * @returns {Promise<Object>} Created loan
   */
  async create(loanData) {
    try {
      const loan = await Loan.create(loanData);
      return loan;
    } catch (error) {
      throw new Error(`Failed to create loan: ${error.message}`);
    }
  }

  /**
   * Find loan by ID
   * @param {string} id - Loan ID
   * @returns {Promise<Object|null>} Loan or null
   */
  async findById(id) {
    try {
      const loan = await Loan.findByPk(id);
      return loan;
    } catch (error) {
      throw new Error(`Failed to find loan by ID: ${error.message}`);
    }
  }

  /**
   * Find all loans with optional filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of loans
   */
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "DESC",
        search,
        employeeId,
        loanType,
        status,
        minAmount,
        maxAmount,
      } = options;

      const where = {};

      // Apply filters
      if (employeeId) where.employeeId = employeeId;
      if (loanType) where.loanType = loanType;
      if (status) where.status = status;

      // Apply amount range filter
      if (minAmount || maxAmount) {
        where.amount = {};
        if (minAmount) where.amount[Op.gte] = minAmount;
        if (maxAmount) where.amount[Op.lte] = maxAmount;
      }

      // Apply search filter
      if (search) {
        where[Op.or] = [
          { purpose: { [Op.iLike]: `%${search}%` } },
          { guarantorName: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Apply additional filters
      Object.assign(where, filters);

      const offset = (page - 1) * limit;
      const order = [[sortBy, sortOrder]];

      const { count, rows } = await Loan.findAndCountAll({
        where,
        order,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        loans: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to find loans: ${error.message}`);
    }
  }

  /**
   * Find loans by employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of loans
   */
  async findByEmployee(employeeId, options = {}) {
    try {
      const { limit = 20, sortBy = "createdAt", sortOrder = "DESC" } = options;

      const loans = await Loan.findAll({
        where: { employeeId },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return loans;
    } catch (error) {
      throw new Error(`Failed to find loans by employee: ${error.message}`);
    }
  }

  /**
   * Find pending loans
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of pending loans
   */
  async findPending(options = {}) {
    try {
      const { limit = 50, sortBy = "createdAt", sortOrder = "ASC" } = options;

      const loans = await Loan.findAll({
        where: { status: "pending" },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return loans;
    } catch (error) {
      throw new Error(`Failed to find pending loans: ${error.message}`);
    }
  }

  /**
   * Find active loans
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of active loans
   */
  async findActive(options = {}) {
    try {
      const { limit = 50, sortBy = "startDate", sortOrder = "ASC" } = options;

      const loans = await Loan.findAll({
        where: { status: "active" },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return loans;
    } catch (error) {
      throw new Error(`Failed to find active loans: ${error.message}`);
    }
  }

  /**
   * Find loans by type
   * @param {string} loanType - Loan type
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of loans
   */
  async findByType(loanType, options = {}) {
    try {
      const { limit = 50, sortBy = "createdAt", sortOrder = "DESC" } = options;

      const loans = await Loan.findAll({
        where: { loanType },
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
      });

      return loans;
    } catch (error) {
      throw new Error(`Failed to find loans by type: ${error.message}`);
    }
  }

  /**
   * Update loan
   * @param {string} id - Loan ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated loan
   */
  async update(id, updateData) {
    try {
      const loan = await Loan.findByPk(id);
      if (!loan) {
        throw new Error("Loan not found");
      }

      await loan.update(updateData);
      return loan;
    } catch (error) {
      throw new Error(`Failed to update loan: ${error.message}`);
    }
  }

  /**
   * Delete loan
   * @param {string} id - Loan ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const loan = await Loan.findByPk(id);
      if (!loan) {
        throw new Error("Loan not found");
      }

      await loan.destroy();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete loan: ${error.message}`);
    }
  }

  /**
   * Count loans
   * @param {Object} filters - Filter criteria
   * @returns {Promise<number>} Total count
   */
  async count(filters = {}) {
    try {
      const count = await Loan.count({ where: filters });
      return count;
    } catch (error) {
      throw new Error(`Failed to count loans: ${error.message}`);
    }
  }

  /**
   * Get loan with employee details
   * @param {string} id - Loan ID
   * @returns {Promise<Object>} Loan with employee
   */
  async findByIdWithEmployee(id) {
    try {
      const loan = await Loan.findByPk(id, {
        include: [
          {
            model: require("../../../domain/entities/Employee"),
            as: "employee",
          },
        ],
      });
      return loan;
    } catch (error) {
      throw new Error(`Failed to find loan with employee: ${error.message}`);
    }
  }

  /**
   * Get loan statistics
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Loan statistics
   */
  async getStatistics(employeeId) {
    try {
      const loans = await this.findByEmployee(employeeId, { limit: 1000 });

      const stats = {
        totalLoans: loans.length,
        activeLoans: loans.filter((l) => l.status === "active").length,
        pendingLoans: loans.filter((l) => l.status === "pending").length,
        completedLoans: loans.filter((l) => l.status === "completed").length,
        totalBorrowed: loans.reduce((sum, l) => sum + parseFloat(l.amount), 0),
        totalRepaid: loans
          .filter((l) => l.status === "completed")
          .reduce((sum, l) => sum + parseFloat(l.amount), 0),
        outstandingAmount: loans
          .filter((l) => l.status === "active")
          .reduce((sum, l) => sum + parseFloat(l.amount), 0),
        byType: {},
      };

      // Group by loan type
      loans.forEach((loan) => {
        const type = loan.loanType;
        if (!stats.byType[type]) {
          stats.byType[type] = {
            count: 0,
            totalAmount: 0,
            activeAmount: 0,
          };
        }
        stats.byType[type].count++;
        stats.byType[type].totalAmount += parseFloat(loan.amount);
        if (loan.status === "active") {
          stats.byType[type].activeAmount += parseFloat(loan.amount);
        }
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to get loan statistics: ${error.message}`);
    }
  }

  /**
   * Get loan balance
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Loan balance
   */
  async getLoanBalance(employeeId) {
    try {
      const activeLoans = await this.findActive({ limit: 1000 });
      const employeeActiveLoans = activeLoans.filter(
        (loan) => loan.employeeId === employeeId
      );

      const balance = {
        totalOutstanding: employeeActiveLoans.reduce(
          (sum, loan) => sum + parseFloat(loan.amount),
          0
        ),
        numberOfActiveLoans: employeeActiveLoans.length,
        monthlyPayments: employeeActiveLoans.reduce(
          (sum, loan) => sum + parseFloat(loan.monthlyPayment),
          0
        ),
        loans: employeeActiveLoans.map((loan) => ({
          id: loan.id,
          loanType: loan.loanType,
          amount: loan.amount,
          monthlyPayment: loan.monthlyPayment,
          remainingMonths: loan.termMonths,
        })),
      };

      return balance;
    } catch (error) {
      throw new Error(`Failed to get loan balance: ${error.message}`);
    }
  }
}

module.exports = LoanRepository;
