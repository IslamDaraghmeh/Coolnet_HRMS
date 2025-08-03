const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const Branch = sequelize.define(
  "Branch",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Unique branch code (e.g., HQ, NY, LA)",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: "Complete address information",
    },
    contactInfo: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: "Contact information for the branch",
    },
    managerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "employees",
        key: "id",
      },
      comment: "Branch manager employee ID",
    },
    parentBranchId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "branches",
        key: "id",
      },
      comment: "Parent branch for hierarchical structure",
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "UTC",
      comment: "Branch timezone",
    },
    workingHours: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        monday: { start: "09:00", end: "17:00", isWorking: true },
        tuesday: { start: "09:00", end: "17:00", isWorking: true },
        wednesday: { start: "09:00", end: "17:00", isWorking: true },
        thursday: { start: "09:00", end: "17:00", isWorking: true },
        friday: { start: "09:00", end: "17:00", isWorking: true },
        saturday: { start: "09:00", end: "13:00", isWorking: false },
        sunday: { start: "00:00", end: "00:00", isWorking: false },
      },
      comment: "Working hours for each day of the week",
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Maximum number of employees for this branch",
    },
    currentEmployees: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Current number of employees in this branch",
    },
    facilities: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: "Available facilities in this branch",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "maintenance", "closed"),
      defaultValue: "active",
      allowNull: false,
    },
    isHeadquarters: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether this is the company headquarters",
    },
    establishedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date when the branch was established",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "branches",
    timestamps: true,
    underscored: false, // Disable underscored since DB uses camelCase
    indexes: [
      {
        fields: ["code"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["managerId"],
      },
      {
        fields: ["parentBranchId"],
      },
      {
        fields: ["isHeadquarters"],
      },
    ],
  }
);

// Instance methods
Branch.prototype.isActive = function () {
  return this.status === "active";
};

Branch.prototype.isHeadquartersBranch = function () {
  return this.isHeadquarters === true;
};

Branch.prototype.hasCapacity = function () {
  return !this.capacity || this.currentEmployees < this.capacity;
};

Branch.prototype.canAddEmployee = function () {
  return this.isActive() && this.hasCapacity();
};

Branch.prototype.getWorkingHours = function (dayOfWeek) {
  const day = dayOfWeek.toLowerCase();
  return this.workingHours[day] || null;
};

Branch.prototype.isWorkingDay = function (dayOfWeek) {
  const hours = this.getWorkingHours(dayOfWeek);
  return hours && hours.isWorking;
};

// Class methods
Branch.findActive = function () {
  return this.findAll({ where: { status: "active" } });
};

Branch.findHeadquarters = function () {
  return this.findOne({ where: { isHeadquarters: true } });
};

Branch.findByManager = function (managerId) {
  return this.findAll({ where: { managerId } });
};

Branch.findSubBranches = function (parentBranchId) {
  return this.findAll({ where: { parentBranchId } });
};

Branch.findByCode = function (code) {
  return this.findOne({ where: { code } });
};

module.exports = Branch;
