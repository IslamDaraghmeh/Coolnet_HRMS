const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const Loan = sequelize.define(
  "Loan",
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
    loanType: {
      type: DataTypes.ENUM(
        "personal",
        "emergency",
        "education",
        "housing",
        "vehicle"
      ),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    interestRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    monthlyPayment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    termMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "rejected",
        "active",
        "completed",
        "defaulted"
      ),
      defaultValue: "pending",
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
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    collateral: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    guarantor: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    documents: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    autoDeduct: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    remainingBalance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    paidAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    lastPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextPaymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    missedPayments: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "loans",
    timestamps: true,
    indexes: [
      {
        fields: ["employeeId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["loanType"],
      },
      {
        fields: ["nextPaymentDate"],
      },
    ],
  }
);

// Instance methods
Loan.prototype.getRemainingMonths = function () {
  if (this.status !== "active") return 0;
  const today = new Date();
  const endDate = new Date(this.endDate);
  const diffTime = endDate - today;
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  return Math.max(0, diffMonths);
};

Loan.prototype.getProgress = function () {
  return (this.paidAmount / this.totalAmount) * 100;
};

Loan.prototype.isOverdue = function () {
  if (this.status !== "active") return false;
  if (!this.nextPaymentDate) return false;
  return new Date() > new Date(this.nextPaymentDate);
};

Loan.prototype.canMakePayment = function () {
  return this.status === "active" && this.remainingBalance > 0;
};

Loan.prototype.makePayment = async function (amount, paymentDate = new Date()) {
  if (!this.canMakePayment()) {
    throw new Error("Cannot make payment on this loan");
  }

  this.paidAmount += amount;
  this.remainingBalance -= amount;
  this.lastPaymentDate = paymentDate;

  // Calculate next payment date (monthly)
  const nextDate = new Date(paymentDate);
  nextDate.setMonth(nextDate.getMonth() + 1);
  this.nextPaymentDate = nextDate.toISOString().split("T")[0];

  // Check if loan is completed
  if (this.remainingBalance <= 0) {
    this.status = "completed";
    this.remainingBalance = 0;
  }

  await this.save();
};

Loan.prototype.isPending = function () {
  return this.status === "pending";
};

Loan.prototype.isApproved = function () {
  return this.status === "approved";
};

Loan.prototype.isActive = function () {
  return this.status === "active";
};

// Class methods
Loan.findByEmployee = function (employeeId) {
  return this.findAll({
    where: { employeeId },
    order: [["createdAt", "DESC"]],
  });
};

Loan.findActive = function () {
  return this.findAll({ where: { status: "active" } });
};

Loan.findPending = function () {
  return this.findAll({ where: { status: "pending" } });
};

Loan.findOverdue = function () {
  const today = new Date().toISOString().split("T")[0];
  return this.findAll({
    where: {
      status: "active",
      nextPaymentDate: {
        [sequelize.Op.lt]: today,
      },
    },
  });
};

Loan.findDueThisMonth = function () {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return this.findAll({
    where: {
      status: "active",
      nextPaymentDate: {
        [sequelize.Op.between]: [startOfMonth, endOfMonth],
      },
    },
  });
};

module.exports = Loan;
