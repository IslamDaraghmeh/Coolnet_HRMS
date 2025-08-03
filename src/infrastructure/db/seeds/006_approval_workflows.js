"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create approval workflows
    await queryInterface.bulkInsert("approval_workflows", [
      {
        id: "770e8400-e29b-41d4-a716-446655440001",
        name: "Standard Leave Approval",
        description: "Standard leave approval workflow for all employees",
        entityType: "leave",
        departmentId: null, // Applies to all departments
        positionId: null, // Applies to all positions
        minAmount: null,
        maxAmount: null,
        isActive: true,
        settings: JSON.stringify({
          autoApproveAfterDays: 3,
          requireDocumentation: false,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440002",
        name: "Extended Leave Approval",
        description:
          "Extended leave approval workflow for leaves longer than 5 days",
        entityType: "leave",
        departmentId: null,
        positionId: null,
        minAmount: 5, // 5 days or more
        maxAmount: null,
        isActive: true,
        settings: JSON.stringify({
          autoApproveAfterDays: 5,
          requireDocumentation: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440003",
        name: "Loan Approval",
        description: "Loan approval workflow for employee loan requests",
        entityType: "loan",
        departmentId: null,
        positionId: null,
        minAmount: 1000, // $1000 or more
        maxAmount: null,
        isActive: true,
        settings: JSON.stringify({
          requireFinancialReview: true,
          maxLoanAmount: 50000,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440004",
        name: "HR Department Leave Approval",
        description: "Special approval workflow for HR department employees",
        entityType: "leave",
        departmentId: "550e8400-e29b-41d4-a716-446655440001", // HR Department
        positionId: null,
        minAmount: null,
        maxAmount: null,
        isActive: true,
        settings: JSON.stringify({
          requireHRDirectorApproval: true,
          autoApproveAfterDays: 2,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440005",
        name: "Executive Leave Approval",
        description: "Executive leave approval workflow for senior positions",
        entityType: "leave",
        departmentId: null,
        positionId: null,
        minAmount: null,
        maxAmount: null,
        isActive: true,
        settings: JSON.stringify({
          requireCEOApproval: true,
          autoApproveAfterDays: 7,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create approval steps for Standard Leave Approval
    await queryInterface.bulkInsert("approval_steps", [
      {
        id: "880e8400-e29b-41d4-a716-446655440001",
        workflowId: "770e8400-e29b-41d4-a716-446655440001",
        stepOrder: 1,
        name: "Department Head Approval",
        description: "First level approval by department head",
        approverType: "department_head",
        approverId: null,
        positionId: null,
        roleId: null,
        departmentId: null,
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        autoApprove: false,
        autoApproveAfterHours: null,
        settings: JSON.stringify({
          maxDelegationLevel: 1,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440002",
        workflowId: "770e8400-e29b-41d4-a716-446655440001",
        stepOrder: 2,
        name: "HR Manager Approval",
        description: "Second level approval by HR manager",
        approverType: "role_based",
        approverId: null,
        positionId: null,
        roleId: "550e8400-e29b-41d4-a716-446655440002", // HR Manager role
        departmentId: null,
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        autoApprove: true,
        autoApproveAfterHours: 72, // 3 days
        settings: JSON.stringify({
          maxDelegationLevel: 1,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create approval steps for Extended Leave Approval
    await queryInterface.bulkInsert("approval_steps", [
      {
        id: "880e8400-e29b-41d4-a716-446655440003",
        workflowId: "770e8400-e29b-41d4-a716-446655440002",
        stepOrder: 1,
        name: "Department Head Approval",
        description: "First level approval by department head",
        approverType: "department_head",
        approverId: null,
        positionId: null,
        roleId: null,
        departmentId: null,
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        autoApprove: false,
        autoApproveAfterHours: null,
        settings: JSON.stringify({
          maxDelegationLevel: 1,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440004",
        workflowId: "770e8400-e29b-41d4-a716-446655440002",
        stepOrder: 2,
        name: "HR Director Approval",
        description: "Second level approval by HR director",
        approverType: "position_based",
        approverId: null,
        positionId: "660e8400-e29b-41d4-a716-446655440004", // HR Director
        roleId: null,
        departmentId: null,
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        autoApprove: true,
        autoApproveAfterHours: 120, // 5 days
        settings: JSON.stringify({
          maxDelegationLevel: 1,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440005",
        workflowId: "770e8400-e29b-41d4-a716-446655440002",
        stepOrder: 3,
        name: "Finance Manager Approval",
        description:
          "Third level approval by finance manager for extended leaves",
        approverType: "role_based",
        approverId: null,
        positionId: null,
        roleId: "550e8400-e29b-41d4-a716-446655440003", // Finance Manager role (using admin role for now)
        departmentId: null,
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        autoApprove: true,
        autoApproveAfterHours: 168, // 7 days
        settings: JSON.stringify({
          maxDelegationLevel: 1,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create approval steps for Loan Approval
    await queryInterface.bulkInsert("approval_steps", [
      {
        id: "880e8400-e29b-41d4-a716-446655440006",
        workflowId: "770e8400-e29b-41d4-a716-446655440003",
        stepOrder: 1,
        name: "Department Head Approval",
        description: "First level approval by department head",
        approverType: "department_head",
        approverId: null,
        positionId: null,
        roleId: null,
        departmentId: null,
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        autoApprove: false,
        autoApproveAfterHours: null,
        settings: JSON.stringify({
          maxDelegationLevel: 1,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440007",
        workflowId: "770e8400-e29b-41d4-a716-446655440003",
        stepOrder: 2,
        name: "HR Manager Approval",
        description: "Second level approval by HR manager",
        approverType: "role_based",
        approverId: null,
        positionId: null,
        roleId: "550e8400-e29b-41d4-a716-446655440002",
        departmentId: null,
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        autoApprove: true,
        autoApproveAfterHours: 72, // 3 days
        settings: JSON.stringify({
          maxDelegationLevel: 1,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440008",
        workflowId: "770e8400-e29b-41d4-a716-446655440003",
        stepOrder: 3,
        name: "Finance Manager Approval",
        description: "Third level approval by finance manager",
        approverType: "role_based",
        approverId: null,
        positionId: null,
        roleId: "550e8400-e29b-41d4-a716-446655440001", // Admin role
        departmentId: null,
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        autoApprove: true,
        autoApproveAfterHours: 120, // 5 days
        settings: JSON.stringify({
          maxDelegationLevel: 1,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create approval steps for HR Department Leave Approval
    await queryInterface.bulkInsert("approval_steps", [
      {
        id: "880e8400-e29b-41d4-a716-446655440009",
        workflowId: "770e8400-e29b-41d4-a716-446655440004",
        stepOrder: 1,
        name: "HR Director Approval",
        description:
          "Direct approval by HR director for HR department employees",
        approverType: "position_based",
        approverId: null,
        positionId: "660e8400-e29b-41d4-a716-446655440004", // HR Director
        roleId: null,
        departmentId: null,
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        autoApprove: true,
        autoApproveAfterHours: 48, // 2 days
        settings: JSON.stringify({
          maxDelegationLevel: 1,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create approval steps for Executive Leave Approval
    await queryInterface.bulkInsert("approval_steps", [
      {
        id: "880e8400-e29b-41d4-a716-446655440010",
        workflowId: "770e8400-e29b-41d4-a716-446655440005",
        stepOrder: 1,
        name: "HR Director Approval",
        description: "First level approval by HR director",
        approverType: "position_based",
        approverId: null,
        positionId: "660e8400-e29b-41d4-a716-446655440004", // HR Director
        roleId: null,
        departmentId: null,
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        autoApprove: false,
        autoApproveAfterHours: null,
        settings: JSON.stringify({
          maxDelegationLevel: 1,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440011",
        workflowId: "770e8400-e29b-41d4-a716-446655440005",
        stepOrder: 2,
        name: "CEO Approval",
        description: "Final approval by CEO for executive leaves",
        approverType: "position_based",
        approverId: null,
        positionId: "660e8400-e29b-41d4-a716-446655440001", // CEO
        roleId: null,
        departmentId: null,
        isRequired: true,
        canDelegate: true,
        canSkip: false,
        autoApprove: true,
        autoApproveAfterHours: 168, // 7 days
        settings: JSON.stringify({
          maxDelegationLevel: 1,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("approval_steps", null, {});
    await queryInterface.bulkDelete("approval_workflows", null, {});
  },
};
