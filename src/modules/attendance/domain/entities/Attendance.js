const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const Attendance = sequelize.define(
  "Attendance",
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    shiftAssignmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "shift_assignments",
        key: "id",
      },
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checkOutTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "present",
        "absent",
        "late",
        "half-day",
        "leave",
        "holiday"
      ),
      defaultValue: "absent",
    },
    workHours: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    overtimeHours: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    breakStartTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    breakEndTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    breakDuration: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 0,
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    checkInLocation: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    checkOutLocation: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    deviceInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isManualEntry: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
  },
  {
    tableName: "attendances",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["employeeId", "date"],
      },
      {
        fields: ["date"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["checkInTime"],
      },
    ],
  }
);

// Instance methods
Attendance.prototype.isCheckedIn = function () {
  return !!this.checkInTime;
};

Attendance.prototype.isCheckedOut = function () {
  return !!this.checkOutTime;
};

Attendance.prototype.isPresent = function () {
  return this.status === "present";
};

Attendance.prototype.isAbsent = function () {
  return this.status === "absent";
};

Attendance.prototype.isLate = function () {
  return this.status === "late";
};

Attendance.prototype.checkIn = async function (
  time = new Date(),
  location = null,
  deviceInfo = null
) {
  if (this.isCheckedIn()) {
    throw new Error("Already checked in for today");
  }

  this.checkInTime = time;
  this.status = "present";

  if (location) {
    this.checkInLocation = location;
  }

  if (deviceInfo) {
    this.deviceInfo = deviceInfo;
  }

  await this.save();
};

Attendance.prototype.checkOut = async function (
  time = new Date(),
  location = null
) {
  if (!this.isCheckedIn()) {
    throw new Error("Must check in before checking out");
  }

  if (this.isCheckedOut()) {
    throw new Error("Already checked out for today");
  }

  this.checkOutTime = time;

  if (location) {
    this.checkOutLocation = location;
  }

  // Calculate work hours
  const checkIn = new Date(this.checkInTime);
  const checkOut = new Date(time);
  const workHours = (checkOut - checkIn) / (1000 * 60 * 60);

  this.workHours = Math.max(0, workHours - this.breakDuration / 60);

  // Calculate overtime (assuming 8 hours is standard work day)
  if (this.workHours > 8) {
    this.overtimeHours = this.workHours - 8;
  }

  await this.save();
};

Attendance.prototype.startBreak = async function (time = new Date()) {
  if (!this.isCheckedIn() || this.isCheckedOut()) {
    throw new Error("Must be checked in and not checked out to start break");
  }

  this.breakStartTime = time;
  await this.save();
};

Attendance.prototype.endBreak = async function (time = new Date()) {
  if (!this.breakStartTime) {
    throw new Error("No break started");
  }

  this.breakEndTime = time;
  const breakDuration =
    (new Date(time) - new Date(this.breakStartTime)) / (1000 * 60);
  this.breakDuration += breakDuration;

  await this.save();
};

Attendance.prototype.getWorkHours = function () {
  if (!this.checkInTime || !this.checkOutTime) return 0;

  const checkIn = new Date(this.checkInTime);
  const checkOut = new Date(this.checkOutTime);
  const totalHours = (checkOut - checkIn) / (1000 * 60 * 60);

  return Math.max(0, totalHours - this.breakDuration / 60);
};

// Class methods
Attendance.findByEmployee = function (employeeId, startDate, endDate) {
  const where = { employeeId };
  if (startDate && endDate) {
    where.date = {
      [sequelize.Op.between]: [startDate, endDate],
    };
  }
  return this.findAll({ where, order: [["date", "DESC"]] });
};

Attendance.findByDate = function (date) {
  return this.findAll({ where: { date } });
};

Attendance.findToday = function () {
  const today = new Date().toISOString().split("T")[0];
  return this.findAll({ where: { date: today } });
};

Attendance.findPresent = function (date) {
  const where = { status: "present" };
  if (date) {
    where.date = date;
  }
  return this.findAll({ where });
};

Attendance.findAbsent = function (date) {
  const where = { status: "absent" };
  if (date) {
    where.date = date;
  }
  return this.findAll({ where });
};

Attendance.findLate = function (date) {
  const where = { status: "late" };
  if (date) {
    where.date = date;
  }
  return this.findAll({ where });
};

module.exports = Attendance;
