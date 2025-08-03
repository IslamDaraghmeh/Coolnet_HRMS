"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PerformanceReviews", {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      employeeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "employees",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reviewerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reviewPeriod: {
        type: Sequelize.STRING, // e.g., "Q1 2024", "Annual 2024"
        allowNull: false,
      },
      reviewDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      nextReviewDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("draft", "in_progress", "completed", "approved"),
        defaultValue: "draft",
      },
      overallRating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5,
        },
      },
      performanceScore: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      goals: {
        type: Sequelize.JSONB, // Array of goal objects
        allowNull: true,
      },
      achievements: {
        type: Sequelize.JSONB, // Array of achievement objects
        allowNull: true,
      },
      areasOfImprovement: {
        type: Sequelize.JSONB, // Array of improvement areas
        allowNull: true,
      },
      strengths: {
        type: Sequelize.JSONB, // Array of strengths
        allowNull: true,
      },
      weaknesses: {
        type: Sequelize.JSONB, // Array of weaknesses
        allowNull: true,
      },
      recommendations: {
        type: Sequelize.JSONB, // Array of recommendations
        allowNull: true,
      },
      employeeComments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reviewerComments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      hrComments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      attachments: {
        type: Sequelize.JSONB, // Array of file URLs
        allowNull: true,
      },
      isConfidential: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      submittedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      approvedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add indexes
    await queryInterface.addIndex("PerformanceReviews", ["employeeId"]);
    await queryInterface.addIndex("PerformanceReviews", ["reviewerId"]);
    await queryInterface.addIndex("PerformanceReviews", ["status"]);
    await queryInterface.addIndex("PerformanceReviews", ["reviewPeriod"]);
    await queryInterface.addIndex("PerformanceReviews", ["reviewDate"]);
    await queryInterface.addIndex("PerformanceReviews", ["nextReviewDate"]);
    await queryInterface.addIndex("PerformanceReviews", ["overallRating"]);
    await queryInterface.addIndex("PerformanceReviews", ["approvedBy"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("PerformanceReviews");
  },
};
