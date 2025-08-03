"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("positions", [
      // Executive Level
      {
        id: "660e8400-e29b-41d4-a716-446655440001",
        title: "Chief Executive Officer",
        code: "CEO",
        description:
          "Chief Executive Officer responsible for overall company strategy and leadership",
        departmentId: null, // CEO is not tied to a specific department
        level: 10,
        category: "executive",
        minSalary: 200000.0,
        maxSalary: 500000.0,
        requirements: JSON.stringify({
          education: "Master's degree or higher",
          experience: "15+ years in leadership roles",
          skills: JSON.stringify([
            "Strategic Planning",
            "Leadership",
            "Business Development",
          ]),
        }),
        responsibilities: JSON.stringify([
          "Develop and implement company strategy",
          "Lead executive team",
          "Represent company to stakeholders",
        ]),
        skills: JSON.stringify([
          "Leadership",
          "Strategic Planning",
          "Business Development",
          "Financial Management",
        ]),
        status: "active",
        isRemote: false,
        isFullTime: true,
        settings: JSON.stringify({
          requiresBoardApproval: true,
          canApproveAllRequests: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440002",
        title: "Chief Financial Officer",
        code: "CFO",
        description:
          "Chief Financial Officer responsible for financial strategy and management",
        departmentId: "550e8400-e29b-41d4-a716-446655440003", // Finance
        level: 9,
        category: "executive",
        minSalary: 150000.0,
        maxSalary: 300000.0,
        requirements: JSON.stringify({
          education: "Master's degree in Finance or Accounting",
          experience: "12+ years in financial leadership",
          skills: JSON.stringify([
            "Financial Management",
            "Strategic Planning",
            "Risk Management",
          ]),
        }),
        responsibilities: JSON.stringify([
          "Oversee financial operations",
          "Develop financial strategy",
          "Manage investor relations",
        ]),
        skills: JSON.stringify([
          "Financial Management",
          "Strategic Planning",
          "Risk Management",
          "Accounting",
        ]),
        status: "active",
        isRemote: false,
        isFullTime: true,
        settings: JSON.stringify({
          requiresBoardApproval: true,
          canApproveFinancialRequests: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440003",
        title: "Chief Technology Officer",
        code: "CTO",
        description:
          "Chief Technology Officer responsible for technology strategy and innovation",
        departmentId: "550e8400-e29b-41d4-a716-446655440002", // IT
        level: 9,
        category: "executive",
        minSalary: 140000.0,
        maxSalary: 280000.0,
        requirements: JSON.stringify({
          education: "Master's degree in Computer Science or related field",
          experience: "12+ years in technology leadership",
          skills: JSON.stringify([
            "Technology Strategy",
            "Innovation",
            "Team Leadership",
          ]),
        }),
        responsibilities: JSON.stringify([
          "Lead technology strategy",
          "Oversee product development",
          "Manage technology team",
        ]),
        skills: JSON.stringify([
          "Technology Strategy",
          "Innovation",
          "Team Leadership",
          "Software Development",
        ]),
        status: "active",
        isRemote: true,
        isFullTime: true,
        settings: JSON.stringify({
          requiresBoardApproval: true,
          canApproveTechnicalRequests: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Director Level
      {
        id: "660e8400-e29b-41d4-a716-446655440004",
        title: "HR Director",
        code: "HR_DIR",
        description:
          "HR Director responsible for human resources strategy and operations",
        departmentId: "550e8400-e29b-41d4-a716-446655440001", // HR
        level: 8,
        category: "director",
        minSalary: 100000.0,
        maxSalary: 180000.0,
        requirements: JSON.stringify({
          education: "Master's degree in HR or Business Administration",
          experience: "8+ years in HR leadership",
          skills: JSON.stringify([
            "HR Strategy",
            "Employee Relations",
            "Talent Management",
          ]),
        }),
        responsibilities: JSON.stringify([
          "Develop HR strategy",
          "Oversee recruitment and retention",
          "Manage employee relations",
        ]),
        skills: JSON.stringify([
          "HR Strategy",
          "Employee Relations",
          "Talent Management",
          "Labor Law",
        ]),
        status: "active",
        isRemote: true,
        isFullTime: true,
        settings: JSON.stringify({
          canApproveHRRequests: true,
          canManageEmployees: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440005",
        title: "IT Director",
        code: "IT_DIR",
        description:
          "IT Director responsible for technology operations and infrastructure",
        departmentId: "550e8400-e29b-41d4-a716-446655440002", // IT
        level: 8,
        category: "director",
        minSalary: 110000.0,
        maxSalary: 190000.0,
        requirements: JSON.stringify({
          education: "Bachelor's degree in Computer Science or related field",
          experience: "8+ years in IT leadership",
          skills: JSON.stringify([
            "IT Operations",
            "Infrastructure Management",
            "Team Leadership",
          ]),
        }),
        responsibilities: JSON.stringify([
          "Manage IT operations",
          "Oversee infrastructure",
          "Lead development teams",
        ]),
        skills: JSON.stringify([
          "IT Operations",
          "Infrastructure Management",
          "Team Leadership",
          "Project Management",
        ]),
        status: "active",
        isRemote: true,
        isFullTime: true,
        settings: JSON.stringify({
          canApproveTechnicalRequests: true,
          canManageITProjects: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Manager Level
      {
        id: "660e8400-e29b-41d4-a716-446655440006",
        title: "HR Manager",
        code: "HR_MGR",
        description: "HR Manager responsible for day-to-day HR operations",
        departmentId: "550e8400-e29b-41d4-a716-446655440001", // HR
        level: 7,
        category: "manager",
        minSalary: 70000.0,
        maxSalary: 120000.0,
        requirements: JSON.stringify({
          education: "Bachelor's degree in HR or related field",
          experience: "5+ years in HR",
          skills: JSON.stringify([
            "Employee Relations",
            "Recruitment",
            "HR Operations",
          ]),
        }),
        responsibilities: JSON.stringify([
          "Manage HR operations",
          "Handle employee relations",
          "Oversee recruitment",
        ]),
        skills: JSON.stringify([
          "Employee Relations",
          "Recruitment",
          "HR Operations",
          "Labor Law",
        ]),
        status: "active",
        isRemote: true,
        isFullTime: true,
        settings: JSON.stringify({
          canApproveLeaveRequests: true,
          canManageTeam: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440007",
        title: "Software Development Manager",
        code: "DEV_MGR",
        description:
          "Software Development Manager responsible for development team leadership",
        departmentId: "550e8400-e29b-41d4-a716-446655440002", // IT
        level: 7,
        category: "manager",
        minSalary: 90000.0,
        maxSalary: 140000.0,
        requirements: JSON.stringify({
          education: "Bachelor's degree in Computer Science or related field",
          experience: "5+ years in software development",
          skills: JSON.stringify([
            "Team Leadership",
            "Software Development",
            "Project Management",
          ]),
        }),
        responsibilities: JSON.stringify([
          "Lead development team",
          "Manage software projects",
          "Ensure code quality",
        ]),
        skills: JSON.stringify([
          "Team Leadership",
          "Software Development",
          "Project Management",
          "Agile",
        ]),
        status: "active",
        isRemote: true,
        isFullTime: true,
        settings: JSON.stringify({
          canApproveTechnicalRequests: true,
          canManageTeam: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Senior Level
      {
        id: "660e8400-e29b-41d4-a716-446655440008",
        title: "Senior Software Engineer",
        code: "SENIOR_DEV",
        description:
          "Senior Software Engineer responsible for complex software development",
        departmentId: "550e8400-e29b-41d4-a716-446655440002", // IT
        level: 6,
        category: "senior",
        minSalary: 80000.0,
        maxSalary: 120000.0,
        requirements: JSON.stringify({
          education: "Bachelor's degree in Computer Science or related field",
          experience: "5+ years in software development",
          skills: JSON.stringify([
            "Programming",
            "System Design",
            "Problem Solving",
          ]),
        }),
        responsibilities: JSON.stringify([
          "Develop complex software solutions",
          "Mentor junior developers",
          "Design system architecture",
        ]),
        skills: JSON.stringify([
          "Programming",
          "System Design",
          "Problem Solving",
          "Code Review",
        ]),
        status: "active",
        isRemote: true,
        isFullTime: true,
        settings: JSON.stringify({
          canReviewCode: true,
          canMentorJuniors: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440009",
        title: "Senior HR Specialist",
        code: "SENIOR_HR",
        description:
          "Senior HR Specialist responsible for specialized HR functions",
        departmentId: "550e8400-e29b-41d4-a716-446655440001", // HR
        level: 6,
        category: "senior",
        minSalary: 60000.0,
        maxSalary: 90000.0,
        requirements: JSON.stringify({
          education: "Bachelor's degree in HR or related field",
          experience: "4+ years in HR",
          skills: JSON.stringify([
            "HR Operations",
            "Employee Relations",
            "Compliance",
          ]),
        }),
        responsibilities: JSON.stringify([
          "Handle complex HR cases",
          "Ensure compliance",
          "Support HR initiatives",
        ]),
        skills: JSON.stringify([
          "HR Operations",
          "Employee Relations",
          "Compliance",
          "Policy Development",
        ]),
        status: "active",
        isRemote: true,
        isFullTime: true,
        settings: JSON.stringify({
          canHandleComplexCases: true,
          canTrainOthers: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Junior Level
      {
        id: "660e8400-e29b-41d4-a716-446655440010",
        title: "Software Engineer",
        code: "DEV",
        description:
          "Software Engineer responsible for software development and maintenance",
        departmentId: "550e8400-e29b-41d4-a716-446655440002", // IT
        level: 5,
        category: "junior",
        minSalary: 60000.0,
        maxSalary: 90000.0,
        requirements: JSON.stringify({
          education: "Bachelor's degree in Computer Science or related field",
          experience: "2+ years in software development",
          skills: JSON.stringify([
            "Programming",
            "Problem Solving",
            "Teamwork",
          ]),
        }),
        responsibilities: JSON.stringify([
          "Develop software features",
          "Write clean code",
          "Participate in code reviews",
        ]),
        skills: JSON.stringify([
          "Programming",
          "Problem Solving",
          "Teamwork",
          "Version Control",
        ]),
        status: "active",
        isRemote: true,
        isFullTime: true,
        settings: JSON.stringify({
          canContributeToProjects: true,
          needsMentoring: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440011",
        title: "HR Specialist",
        code: "HR_SPEC",
        description:
          "HR Specialist responsible for HR operations and employee support",
        departmentId: "550e8400-e29b-41d4-a716-446655440001", // HR
        level: 5,
        category: "junior",
        minSalary: 45000.0,
        maxSalary: 65000.0,
        requirements: JSON.stringify({
          education: "Bachelor's degree in HR or related field",
          experience: "2+ years in HR",
          skills: JSON.stringify([
            "HR Operations",
            "Communication",
            "Organization",
          ]),
        }),
        responsibilities: JSON.stringify([
          "Support HR operations",
          "Handle employee inquiries",
          "Assist with recruitment",
        ]),
        skills: JSON.stringify([
          "HR Operations",
          "Communication",
          "Organization",
          "Employee Relations",
        ]),
        status: "active",
        isRemote: true,
        isFullTime: true,
        settings: JSON.stringify({
          canHandleBasicCases: true,
          needsSupervision: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Entry Level
      {
        id: "660e8400-e29b-41d4-a716-446655440012",
        title: "Junior Software Engineer",
        code: "JUNIOR_DEV",
        description:
          "Junior Software Engineer responsible for learning and contributing to development",
        departmentId: "550e8400-e29b-41d4-a716-446655440002", // IT
        level: 4,
        category: "entry",
        minSalary: 45000.0,
        maxSalary: 65000.0,
        requirements: JSON.stringify({
          education: "Bachelor's degree in Computer Science or related field",
          experience: "0-2 years in software development",
          skills: JSON.stringify(["Programming", "Learning", "Teamwork"]),
        }),
        responsibilities: JSON.stringify([
          "Learn development practices",
          "Contribute to projects",
          "Participate in team activities",
        ]),
        skills: JSON.stringify([
          "Programming",
          "Learning",
          "Teamwork",
          "Problem Solving",
        ]),
        status: "active",
        isRemote: true,
        isFullTime: true,
        settings: JSON.stringify({
          needsMentoring: true,
          canLearnOnJob: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440013",
        title: "HR Assistant",
        code: "HR_ASSIST",
        description: "HR Assistant responsible for administrative HR tasks",
        departmentId: "550e8400-e29b-41d4-a716-446655440001", // HR
        level: 4,
        category: "entry",
        minSalary: 35000.0,
        maxSalary: 50000.0,
        requirements: JSON.stringify({
          education: "Bachelor's degree in HR or related field",
          experience: "0-2 years in HR",
          skills: JSON.stringify([
            "Administration",
            "Communication",
            "Organization",
          ]),
        }),
        responsibilities: JSON.stringify([
          "Support HR administration",
          "Handle basic inquiries",
          "Assist with documentation",
        ]),
        skills: JSON.stringify([
          "Administration",
          "Communication",
          "Organization",
          "Data Entry",
        ]),
        status: "active",
        isRemote: true,
        isFullTime: true,
        settings: JSON.stringify({
          needsSupervision: true,
          canLearnOnJob: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("positions", null, {});
  },
};
