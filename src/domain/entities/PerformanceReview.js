const { DataTypes } = require("sequelize");
const { sequelize } = require("../../infrastructure/db/connection");

const PerformanceReview = sequelize.define(
  "PerformanceReview",
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
    reviewerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    reviewPeriodStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reviewPeriodEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reviewType: {
      type: DataTypes.ENUM(
        "quarterly",
        "semi-annual",
        "annual",
        "probation",
        "project"
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "draft",
        "submitted",
        "in-review",
        "completed",
        "cancelled"
      ),
      defaultValue: "draft",
    },
    overallRating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      validate: {
        min: 1.0,
        max: 5.0,
      },
    },
    categories: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: "Stores category-wise ratings and comments",
    },
    strengths: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    areasForImprovement: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    goals: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    achievements: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    managerComments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    employeeComments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hrComments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recommendations: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    nextReviewDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    isSelfReview: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    selfReviewCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    selfReviewCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "performance_reviews",
    timestamps: true,
    indexes: [
      {
        fields: ["employeeId"],
      },
      {
        fields: ["reviewerId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["reviewType"],
      },
      {
        fields: ["overallRating"],
      },
    ],
  }
);

// Instance methods
PerformanceReview.prototype.isDraft = function () {
  return this.status === "draft";
};

PerformanceReview.prototype.isSubmitted = function () {
  return this.status === "submitted";
};

PerformanceReview.prototype.isInReview = function () {
  return this.status === "in-review";
};

PerformanceReview.prototype.isCompleted = function () {
  return this.status === "completed";
};

PerformanceReview.prototype.canEdit = function () {
  return this.status === "draft";
};

PerformanceReview.prototype.canSubmit = function () {
  return this.status === "draft" && this.overallRating;
};

PerformanceReview.prototype.submit = async function () {
  if (!this.canSubmit()) {
    throw new Error(
      "Cannot submit review. Please ensure all required fields are filled."
    );
  }

  this.status = "submitted";
  await this.save();
};

PerformanceReview.prototype.complete = async function () {
  this.status = "completed";
  this.reviewCompletedAt = new Date();
  await this.save();
};

PerformanceReview.prototype.getRatingLevel = function () {
  if (!this.overallRating) return null;

  if (this.overallRating >= 4.5) return "excellent";
  if (this.overallRating >= 4.0) return "very-good";
  if (this.overallRating >= 3.5) return "good";
  if (this.overallRating >= 3.0) return "satisfactory";
  if (this.overallRating >= 2.0) return "needs-improvement";
  return "unsatisfactory";
};

PerformanceReview.prototype.addCategoryRating = function (
  category,
  rating,
  comments = ""
) {
  if (!this.categories) {
    this.categories = {};
  }

  this.categories[category] = {
    rating,
    comments,
    date: new Date(),
  };
};

PerformanceReview.prototype.getCategoryRating = function (category) {
  return this.categories?.[category]?.rating || null;
};

PerformanceReview.prototype.addStrength = function (strength) {
  if (!this.strengths) {
    this.strengths = [];
  }
  this.strengths.push(strength);
};

PerformanceReview.prototype.addImprovementArea = function (area) {
  if (!this.areasForImprovement) {
    this.areasForImprovement = [];
  }
  this.areasForImprovement.push(area);
};

PerformanceReview.prototype.addGoal = function (goal) {
  if (!this.goals) {
    this.goals = [];
  }
  this.goals.push({
    ...goal,
    createdAt: new Date(),
  });
};

PerformanceReview.prototype.addAchievement = function (achievement) {
  if (!this.achievements) {
    this.achievements = [];
  }
  this.achievements.push({
    ...achievement,
    createdAt: new Date(),
  });
};

// Class methods
PerformanceReview.findByEmployee = function (employeeId, year = null) {
  const where = { employeeId };
  if (year) {
    where["reviewPeriod.startDate"] = {
      [sequelize.Op.gte]: `${year}-01-01`,
      [sequelize.Op.lte]: `${year}-12-31`,
    };
  }
  return this.findAll({ where, order: [["createdAt", "DESC"]] });
};

PerformanceReview.findByReviewer = function (reviewerId) {
  return this.findAll({
    where: { reviewerId },
    order: [["createdAt", "DESC"]],
  });
};

PerformanceReview.findPending = function () {
  return this.findAll({ where: { status: "submitted" } });
};

PerformanceReview.findCompleted = function () {
  return this.findAll({ where: { status: "completed" } });
};

PerformanceReview.findByStatus = function (status) {
  return this.findAll({ where: { status } });
};

PerformanceReview.findByType = function (reviewType) {
  return this.findAll({ where: { reviewType } });
};

PerformanceReview.findOverdue = function () {
  const today = new Date().toISOString().split("T")[0];
  return this.findAll({
    where: {
      nextReviewDate: {
        [sequelize.Op.lt]: today,
      },
      status: {
        [sequelize.Op.ne]: "completed",
      },
    },
  });
};

module.exports = PerformanceReview;
