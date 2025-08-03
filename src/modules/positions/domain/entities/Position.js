const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../../infrastructure/db/connection");

const Position = sequelize.define(
  "Position",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
      comment: "Default department for this position",
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "Position level in organizational hierarchy",
    },
    category: {
      type: DataTypes.ENUM(
        "entry",
        "junior",
        "senior",
        "lead",
        "manager",
        "director",
        "executive",
        "specialist",
        "consultant"
      ),
      allowNull: false,
      defaultValue: "entry",
    },
    minSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    maxSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    requirements: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Job requirements and qualifications",
    },
    responsibilities: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: "Job responsibilities and duties",
    },
    skills: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: "Required skills for this position",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "archived"),
      defaultValue: "active",
    },
    isRemote: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isFullTime: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Position-specific settings and configurations",
    },
  },
  {
    tableName: "positions",
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ["title"],
      },
      {
        fields: ["code"],
      },
      {
        fields: ["departmentId"],
      },
      {
        fields: ["level"],
      },
      {
        fields: ["category"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

// Instance methods
Position.prototype.isActive = function () {
  return this.status === "active";
};

Position.prototype.isSenior = function () {
  return ["senior", "lead", "manager", "director", "executive"].includes(
    this.category
  );
};

Position.prototype.isManagement = function () {
  return ["lead", "manager", "director", "executive"].includes(this.category);
};

Position.prototype.isEntryLevel = function () {
  return ["entry", "junior"].includes(this.category);
};

Position.prototype.hasSalaryRange = function () {
  return this.minSalary && this.maxSalary;
};

// Class methods
Position.findActive = function () {
  return this.findAll({ where: { status: "active" } });
};

Position.findByDepartment = function (departmentId) {
  return this.findAll({ where: { departmentId } });
};

Position.findByCategory = function (category) {
  return this.findAll({ where: { category } });
};

Position.findByLevel = function (level) {
  return this.findAll({ where: { level } });
};

Position.findManagement = function () {
  return this.findAll({
    where: {
      category: ["lead", "manager", "director", "executive"],
    },
  });
};

module.exports = Position;
