"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("departments", [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Human Resources",
        code: "HR",
        description:
          "Human Resources Department responsible for employee management, recruitment, and HR policies",
        headId: null, // Will be set when HR manager is created
        parentDepartmentId: null,
        location: "Main Office",
        budget: 500000.0,
        status: "active",
        color: "#FF6B6B",
        settings: JSON.stringify({
          allowRemoteWork: true,
          maxTeamSize: 50,
          approvalRequired: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Information Technology",
        code: "IT",
        description:
          "IT Department responsible for technology infrastructure and software development",
        headId: null,
        parentDepartmentId: null,
        location: "Tech Building",
        budget: 1000000.0,
        status: "active",
        color: "#4ECDC4",
        settings: JSON.stringify({
          allowRemoteWork: true,
          maxTeamSize: 100,
          approvalRequired: false,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Finance",
        code: "FIN",
        description:
          "Finance Department responsible for accounting, budgeting, and financial planning",
        headId: null,
        parentDepartmentId: null,
        location: "Main Office",
        budget: 300000.0,
        status: "active",
        color: "#45B7D1",
        settings: JSON.stringify({
          allowRemoteWork: false,
          maxTeamSize: 30,
          approvalRequired: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        name: "Marketing",
        code: "MKT",
        description:
          "Marketing Department responsible for brand management and promotional activities",
        headId: null,
        parentDepartmentId: null,
        location: "Creative Hub",
        budget: 800000.0,
        status: "active",
        color: "#96CEB4",
        settings: JSON.stringify({
          allowRemoteWork: true,
          maxTeamSize: 40,
          approvalRequired: false,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440005",
        name: "Sales",
        code: "SALES",
        description:
          "Sales Department responsible for customer acquisition and revenue generation",
        headId: null,
        parentDepartmentId: null,
        location: "Sales Center",
        budget: 1200000.0,
        status: "active",
        color: "#FFEAA7",
        settings: JSON.stringify({
          allowRemoteWork: true,
          maxTeamSize: 80,
          approvalRequired: false,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440006",
        name: "Operations",
        code: "OPS",
        description:
          "Operations Department responsible for day-to-day business operations",
        headId: null,
        parentDepartmentId: null,
        location: "Operations Center",
        budget: 600000.0,
        status: "active",
        color: "#DDA0DD",
        settings: JSON.stringify({
          allowRemoteWork: false,
          maxTeamSize: 60,
          approvalRequired: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440007",
        name: "Customer Support",
        code: "CS",
        description:
          "Customer Support Department responsible for customer service and support",
        headId: null,
        parentDepartmentId: null,
        location: "Support Center",
        budget: 400000.0,
        status: "active",
        color: "#FFB347",
        settings: JSON.stringify({
          allowRemoteWork: true,
          maxTeamSize: 70,
          approvalRequired: false,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440008",
        name: "Research & Development",
        code: "R&D",
        description:
          "R&D Department responsible for product development and innovation",
        headId: null,
        parentDepartmentId: null,
        location: "Innovation Lab",
        budget: 1500000.0,
        status: "active",
        color: "#98D8C8",
        settings: JSON.stringify({
          allowRemoteWork: true,
          maxTeamSize: 90,
          approvalRequired: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("departments", null, {});
  },
};
