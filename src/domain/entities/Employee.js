const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const Employee = sequelize.define(
  "Employee",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "branches",
        key: "id",
      },
      comment: "Branch where employee is assigned",
    },
    workLocation: {
      type: DataTypes.ENUM("office", "remote", "hybrid"),
      allowNull: false,
      defaultValue: "office",
      comment: "Employee work location type",
    },
    assignedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Date when employee was assigned to current branch",
    },
    employmentType: {
      type: DataTypes.ENUM("full-time", "part-time", "contract", "intern"),
      allowNull: false,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // For hourly employees
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true, // For hourly employees
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "terminated", "on-leave"),
      defaultValue: "active",
    },
    managerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "employees",
        key: "id",
      },
    },
    emergencyContact: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    bankDetails: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    documents: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "employees",
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ["branchId"],
      },
      {
        fields: ["workLocation"],
      },
    ],
  }
);

// Instance methods
Employee.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

Employee.prototype.isFullTime = function () {
  return this.employmentType === "full-time";
};

Employee.prototype.isHourly = function () {
  return this.hourlyRate && this.hourlyRate > 0;
};

Employee.prototype.isActive = function () {
  return this.status === "active";
};

Employee.prototype.isRemote = function () {
  return this.workLocation === "remote";
};

Employee.prototype.isHybrid = function () {
  return this.workLocation === "hybrid";
};

// Class methods
Employee.findByEmail = function (email) {
  return this.findOne({ where: { email } });
};

Employee.findByPhone = function (phoneNumber) {
  return this.findOne({ where: { phoneNumber } });
};

Employee.findActive = function () {
  return this.findAll({ where: { status: "active" } });
};

Employee.findByBranch = function (branchId) {
  return this.findAll({ where: { branchId, status: "active" } });
};

Employee.findByWorkLocation = function (workLocation) {
  return this.findAll({ where: { workLocation, status: "active" } });
};

module.exports = Employee;
