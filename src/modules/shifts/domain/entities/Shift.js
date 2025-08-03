const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const Shift = sequelize.define(
  "Shift",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    breakDuration: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 0,
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: "#007bff",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maxEmployees: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    overtimeAllowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    overtimeRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 1.5,
    },
  },
  {
    tableName: "shifts",
    timestamps: true,
  }
);

// Instance methods
Shift.prototype.getDuration = function () {
  const start = new Date(`2000-01-01 ${this.startTime}`);
  const end = new Date(`2000-01-01 ${this.endTime}`);
  return (end - start) / (1000 * 60 * 60); // hours
};

Shift.prototype.getBreakDurationHours = function () {
  return this.breakDuration / 60;
};

// Class methods
Shift.findActive = function () {
  return this.findAll({ where: { isActive: true } });
};

Shift.findByDepartment = function (department) {
  return this.findAll({ where: { department, isActive: true } });
};

module.exports = Shift;
