const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const Payroll = sequelize.define(
  "Payroll",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "employees",
        key: "id",
      },
    },
    payPeriod: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    payDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "draft",
        "calculated",
        "approved",
        "paid",
        "cancelled"
      ),
      defaultValue: "draft",
    },
    // Earnings
    basicSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    totalHours: {
      type: DataTypes.DECIMAL(6, 2),
      defaultValue: 0,
    },
    regularHours: {
      type: DataTypes.DECIMAL(6, 2),
      defaultValue: 0,
    },
    overtimeHours: {
      type: DataTypes.DECIMAL(6, 2),
      defaultValue: 0,
    },
    overtimeRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 1.5,
    },
    grossPay: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    // Deductions
    deductions: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Stores various deductions like tax, insurance, loans, etc.",
    },
    totalDeductions: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    // Net Pay
    netPay: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    // Additional Information
    allowances: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Stores various allowances like housing, transport, etc.",
    },
    totalAllowances: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    bonuses: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Stores various bonuses and incentives",
    },
    totalBonuses: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    // Tax Information
    taxInfo: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    // Loan Deductions
    loanDeductions: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: "Array of loan payments deducted",
    },
    totalLoanDeductions: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    // Leave Information
    leaveInfo: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    // Approval Information
    calculatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    calculatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Payment Information
    paymentMethod: {
      type: DataTypes.ENUM("bank_transfer", "check", "cash", "mobile_money"),
      allowNull: true,
    },
    paymentReference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Notes and Comments
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "payrolls",
    timestamps: true,
    indexes: [
      {
        fields: ["employeeId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["payDate"],
      },
      {
        fields: ["payPeriod.startDate", "payPeriod.endDate"],
      },
    ],
  },
  {
    tableName: "Payroll",
    freezeTableName: true,
    underscored: false,
  }
);

// Instance methods
Payroll.prototype.isDraft = function () {
  return this.status === "draft";
};

Payroll.prototype.isCalculated = function () {
  return this.status === "calculated";
};

Payroll.prototype.isApproved = function () {
  return this.status === "approved";
};

Payroll.prototype.isPaid = function () {
  return this.status === "paid";
};

Payroll.prototype.canCalculate = function () {
  return this.status === "draft";
};

Payroll.prototype.canApprove = function () {
  return this.status === "calculated";
};

Payroll.prototype.canPay = function () {
  return this.status === "approved";
};

Payroll.prototype.calculate = async function () {
  if (!this.canCalculate()) {
    throw new Error("Cannot calculate payroll in current status");
  }

  // Calculate gross pay
  if (this.hourlyRate) {
    // Hourly employee
    this.grossPay =
      this.regularHours * this.hourlyRate +
      this.overtimeHours * this.hourlyRate * this.overtimeRate;
  } else {
    // Full-time employee
    this.grossPay = this.basicSalary;
  }

  // Add allowances
  this.grossPay += this.totalAllowances;

  // Add bonuses
  this.grossPay += this.totalBonuses;

  // Calculate net pay
  this.netPay = this.grossPay - this.totalDeductions;

  this.status = "calculated";
  this.calculatedAt = new Date();

  await this.save();
};

Payroll.prototype.approve = async function (approvedBy) {
  if (!this.canApprove()) {
    throw new Error("Cannot approve payroll in current status");
  }

  this.status = "approved";
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();

  await this.save();
};

Payroll.prototype.pay = async function (
  paymentMethod,
  paymentReference = null
) {
  if (!this.canPay()) {
    throw new Error("Cannot pay payroll in current status");
  }

  this.status = "paid";
  this.paymentMethod = paymentMethod;
  this.paymentReference = paymentReference;
  this.paidAt = new Date();

  await this.save();
};

Payroll.prototype.addDeduction = function (type, amount, description = "") {
  if (!this.deductions) {
    this.deductions = {};
  }

  this.deductions[type] = {
    amount,
    description,
    date: new Date(),
  };

  this.totalDeductions += amount;
};

Payroll.prototype.addAllowance = function (type, amount, description = "") {
  if (!this.allowances) {
    this.allowances = {};
  }

  this.allowances[type] = {
    amount,
    description,
    date: new Date(),
  };

  this.totalAllowances += amount;
};

Payroll.prototype.addBonus = function (type, amount, description = "") {
  if (!this.bonuses) {
    this.bonuses = {};
  }

  this.bonuses[type] = {
    amount,
    description,
    date: new Date(),
  };

  this.totalBonuses += amount;
};

Payroll.prototype.addLoanDeduction = function (loanId, amount, loanType) {
  if (!this.loanDeductions) {
    this.loanDeductions = [];
  }

  this.loanDeductions.push({
    loanId,
    amount,
    loanType,
    date: new Date(),
  });

  this.totalLoanDeductions += amount;
  this.addDeduction(
    `loan_${loanType}`,
    amount,
    `Loan payment for ${loanType} loan`
  );
};

// Class methods
Payroll.findByEmployee = function (employeeId, year = null) {
  const where = { employeeId };
  if (year) {
    where["payPeriod.startDate"] = {
      [sequelize.Op.gte]: `${year}-01-01`,
      [sequelize.Op.lte]: `${year}-12-31`,
    };
  }
  return this.findAll({ where, order: [["payDate", "DESC"]] });
};

Payroll.findByPeriod = function (startDate, endDate) {
  return this.findAll({
    where: {
      "payPeriod.startDate": {
        [sequelize.Op.gte]: startDate,
      },
      "payPeriod.endDate": {
        [sequelize.Op.lte]: endDate,
      },
    },
    order: [["payDate", "ASC"]],
  });
};

Payroll.findByStatus = function (status) {
  return this.findAll({ where: { status } });
};

Payroll.findPending = function () {
  return this.findAll({ where: { status: "calculated" } });
};

Payroll.findApproved = function () {
  return this.findAll({ where: { status: "approved" } });
};

Payroll.findByPayDate = function (payDate) {
  return this.findAll({ where: { payDate } });
};

module.exports = Payroll;
