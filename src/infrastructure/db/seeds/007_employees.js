"use strict";

const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create employees with different roles and management levels
    const employees = [
      // CEO - Top Level Management
      {
        id: "550e8400-e29b-41d4-a716-446655440201",
        employeeId: "EMP001",
        firstName: "Islam",
        lastName: "Tubasi",
        dateOfBirth: "1997-03-15",
        gender: "male",
        email: "Islam.Tubasi@company.com",
        phoneNumber: "0598476520",
        address: JSON.stringify({
          street: "123 Executive Drive",
          city: "Ramallah",
          state: "Ramallah",
          zipCode: "11111",
          country: "PS",
        }),
        emergencyContact: JSON.stringify({
          name: "Tubasi  Tubasi ",
          phoneNumber: "0598476520",
          relationship: "Spouse",
          email: "Islam.Tubasi@email.com",
        }),
        hireDate: "2020-01-01",
        position: "CEO",
        department: "Executive",
        salary: 1000000.0,
        managerId: null, // CEO has no manager
        isActive: true,
        employmentType: "full-time",
        status: "active",
        workLocation: "office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // HR Director
      {
        id: "550e8400-e29b-41d4-a716-446655440202",
        employeeId: "EMP002",
        firstName: "أحمد",
        lastName: "محمد",
        dateOfBirth: "1985-07-22",
        gender: "male",
        email: "ahmed.mohammed@company.com",
        phoneNumber: "0598476521",
        address: JSON.stringify({
          street: "شارع الموارد البشرية 456",
          city: "القدس",
          state: "القدس",
          zipCode: "91100",
          country: "PS",
        }),
        emergencyContact: JSON.stringify({
          name: "فاطمة محمد",
          phoneNumber: "0598476522",
          relationship: "زوجة",
          email: "fatima.mohammed@email.com",
        }),
        hireDate: "2020-02-15",
        position: "مدير الموارد البشرية",
        department: "Human Resources",
        salary: 120000.0,
        managerId: "550e8400-e29b-41d4-a716-446655440201", // Reports to CEO
        isActive: true,
        employmentType: "full-time",
        status: "active",
        workLocation: "office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // IT Director
      {
        id: "550e8400-e29b-41d4-a716-446655440203",
        employeeId: "EMP003",
        firstName: "علي",
        lastName: "حسن",
        dateOfBirth: "1982-11-08",
        gender: "male",
        email: "ali.hassan@company.com",
        phoneNumber: "0598476523",
        address: JSON.stringify({
          street: "شارع التكنولوجيا 789",
          city: "نابلس",
          state: "نابلس",
          zipCode: "91200",
          country: "PS",
        }),
        emergencyContact: JSON.stringify({
          name: "مريم حسن",
          phoneNumber: "0598476524",
          relationship: "زوجة",
          email: "maryam.hassan@email.com",
        }),
        hireDate: "2020-03-01",
        position: "مدير تقنية المعلومات",
        department: "Information Technology",
        salary: 140000.0,
        managerId: "550e8400-e29b-41d4-a716-446655440201", // Reports to CEO
        isActive: true,
        employmentType: "full-time",
        status: "active",
        workLocation: "office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Finance Director
      {
        id: "550e8400-e29b-41d4-a716-446655440204",
        employeeId: "EMP004",
        firstName: "سارة",
        lastName: "عبدالله",
        dateOfBirth: "1978-05-12",
        gender: "female",
        email: "sara.abdullah@company.com",
        phoneNumber: "0598476525",
        address: JSON.stringify({
          street: "شارع المالية 321",
          city: "الخليل",
          state: "الخليل",
          zipCode: "91300",
          country: "PS",
        }),
        emergencyContact: JSON.stringify({
          name: "محمد عبدالله",
          phoneNumber: "0598476526",
          relationship: "زوج",
          email: "mohammed.abdullah@email.com",
        }),
        hireDate: "2020-04-15",
        position: "مدير المالية",
        department: "Finance",
        salary: 130000.0,
        managerId: "550e8400-e29b-41d4-a716-446655440201", // Reports to CEO
        isActive: true,
        employmentType: "full-time",
        status: "active",
        workLocation: "office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // HR Manager
      {
        id: "550e8400-e29b-41d4-a716-446655440205",
        employeeId: "EMP005",
        firstName: "نور",
        lastName: "أحمد",
        dateOfBirth: "1985-09-30",
        gender: "female",
        email: "noor.ahmed@company.com",
        phoneNumber: "0598476527",
        address: JSON.stringify({
          street: "شارع الموارد البشرية 654",
          city: "بيت لحم",
          state: "بيت لحم",
          zipCode: "91400",
          country: "PS",
        }),
        emergencyContact: JSON.stringify({
          name: "أحمد نور",
          phoneNumber: "0598476528",
          relationship: "زوج",
          email: "ahmed.noor@email.com",
        }),
        hireDate: "2020-06-01",
        position: "مدير الموارد البشرية",
        department: "Human Resources",
        salary: 85000.0,
        managerId: "550e8400-e29b-41d4-a716-446655440202", // Reports to HR Director
        isActive: true,
        employmentType: "full-time",
        status: "active",
        workLocation: "office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Senior Software Engineer
      {
        id: "550e8400-e29b-41d4-a716-446655440206",
        employeeId: "EMP006",
        firstName: "يوسف",
        lastName: "خالد",
        dateOfBirth: "1990-12-03",
        gender: "male",
        email: "youssef.khalid@company.com",
        phoneNumber: "0598476529",
        address: JSON.stringify({
          street: "شارع المطورين 987",
          city: "غزة",
          state: "غزة",
          zipCode: "91500",
          country: "PS",
        }),
        emergencyContact: JSON.stringify({
          name: "ليلى خالد",
          phoneNumber: "0598476530",
          relationship: "زوجة",
          email: "layla.khalid@email.com",
        }),
        hireDate: "2020-07-15",
        position: "مهندس برمجيات كبير",
        department: "Information Technology",
        salary: 110000.0,
        managerId: "550e8400-e29b-41d4-a716-446655440203", // Reports to IT Director
        isActive: true,
        employmentType: "full-time",
        status: "active",
        workLocation: "office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Junior Software Engineer
      {
        id: "550e8400-e29b-41d4-a716-446655440207",
        employeeId: "EMP007",
        firstName: "عمر",
        lastName: "علي",
        dateOfBirth: "1995-04-18",
        gender: "male",
        email: "omar.ali@company.com",
        phoneNumber: "0598476531",
        address: JSON.stringify({
          street: "شارع المطور الصغير 147",
          city: "طولكرم",
          state: "طولكرم",
          zipCode: "91600",
          country: "PS",
        }),
        emergencyContact: JSON.stringify({
          name: "سارة علي",
          phoneNumber: "0598476532",
          relationship: "زوجة",
          email: "sara.ali@email.com",
        }),
        hireDate: "2021-01-10",
        position: "مهندس برمجيات مبتدئ",
        department: "Information Technology",
        salary: 75000.0,
        managerId: "550e8400-e29b-41d4-a716-446655440206", // Reports to Senior Engineer
        isActive: true,
        employmentType: "full-time",
        status: "active",
        workLocation: "office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // HR Specialist
      {
        id: "550e8400-e29b-41d4-a716-446655440208",
        employeeId: "EMP008",
        firstName: "رنا",
        lastName: "محمود",
        dateOfBirth: "1988-08-25",
        gender: "female",
        email: "rana.mahmoud@company.com",
        phoneNumber: "0598476533",
        address: JSON.stringify({
          street: "شارع متخصص الموارد البشرية 258",
          city: "جنين",
          state: "جنين",
          zipCode: "91700",
          country: "PS",
        }),
        emergencyContact: JSON.stringify({
          name: "أحمد محمود",
          phoneNumber: "0598476534",
          relationship: "زوج",
          email: "ahmed.mahmoud@email.com",
        }),
        hireDate: "2020-08-20",
        position: "متخصصة الموارد البشرية",
        department: "Human Resources",
        salary: 65000.0,
        managerId: "550e8400-e29b-41d4-a716-446655440205", // Reports to HR Manager
        isActive: true,
        employmentType: "full-time",
        status: "active",
        workLocation: "office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Financial Analyst
      {
        id: "550e8400-e29b-41d4-a716-446655440209",
        employeeId: "EMP009",
        firstName: "كريم",
        lastName: "سعيد",
        dateOfBirth: "1987-02-14",
        gender: "male",
        email: "kareem.saeed@company.com",
        phoneNumber: "0598476535",
        address: JSON.stringify({
          street: "شارع محلل المالية 369",
          city: "قلقيلية",
          state: "قلقيلية",
          zipCode: "91800",
          country: "PS",
        }),
        emergencyContact: JSON.stringify({
          name: "نور سعيد",
          phoneNumber: "0598476536",
          relationship: "زوجة",
          email: "noor.saeed@email.com",
        }),
        hireDate: "2020-09-15",
        position: "محلل مالي",
        department: "Finance",
        salary: 70000.0,
        managerId: "550e8400-e29b-41d4-a716-446655440204", // Reports to Finance Director
        isActive: true,
        employmentType: "full-time",
        status: "active",
        workLocation: "office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Marketing Manager
      {
        id: "550e8400-e29b-41d4-a716-446655440210",
        employeeId: "EMP010",
        firstName: "هناء",
        lastName: "عمر",
        dateOfBirth: "1983-11-07",
        gender: "female",
        email: "haneen.omar@company.com",
        phoneNumber: "0598476537",
        address: JSON.stringify({
          street: "شارع التسويق 741",
          city: "سلفيت",
          state: "سلفيت",
          zipCode: "91900",
          country: "PS",
        }),
        emergencyContact: JSON.stringify({
          name: "محمد عمر",
          phoneNumber: "0598476538",
          relationship: "زوج",
          email: "mohammed.omar@email.com",
        }),
        hireDate: "2020-10-01",
        position: "مديرة التسويق",
        department: "Marketing",
        salary: 95000.0,
        managerId: "550e8400-e29b-41d4-a716-446655440201", // Reports to CEO
        isActive: true,
        employmentType: "full-time",
        status: "active",
        workLocation: "office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Sales Manager
      {
        id: "550e8400-e29b-41d4-a716-446655440211",
        employeeId: "EMP011",
        firstName: "باسم",
        lastName: "فارس",
        dateOfBirth: "1981-06-20",
        gender: "male",
        email: "bassem.fares@company.com",
        phoneNumber: "0598476539",
        address: JSON.stringify({
          street: "شارع المبيعات 852",
          city: "طوباس",
          state: "طوباس",
          zipCode: "92000",
          country: "PS",
        }),
        emergencyContact: JSON.stringify({
          name: "سلمى فارس",
          phoneNumber: "0598476540",
          relationship: "زوجة",
          email: "salma.fares@email.com",
        }),
        hireDate: "2020-11-15",
        position: "مدير المبيعات",
        department: "Sales",
        salary: 100000.0,
        managerId: "550e8400-e29b-41d4-a716-446655440201", // Reports to CEO
        isActive: true,
        employmentType: "full-time",
        status: "active",
        workLocation: "office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Customer Support Specialist
      {
        id: "550e8400-e29b-41d4-a716-446655440212",
        employeeId: "EMP012",
        firstName: "دينا",
        lastName: "زكريا",
        dateOfBirth: "1992-03-12",
        gender: "female",
        email: "dina.zakaria@company.com",
        phoneNumber: "0598476541",
        address: JSON.stringify({
          street: "شارع الدعم 963",
          city: "أريحا",
          state: "أريحا",
          zipCode: "92100",
          country: "PS",
        }),
        emergencyContact: JSON.stringify({
          name: "أحمد زكريا",
          phoneNumber: "0598476542",
          relationship: "زوج",
          email: "ahmed.zakaria@email.com",
        }),
        hireDate: "2021-02-01",
        position: "متخصصة دعم العملاء",
        department: "Customer Support",
        salary: 55000.0,
        managerId: "550e8400-e29b-41d4-a716-446655440201", // Reports to CEO
        isActive: true,
        employmentType: "full-time",
        status: "active",
        workLocation: "office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Inactive Employee (for testing)
      {
        id: "550e8400-e29b-41d4-a716-446655440213",
        employeeId: "EMP013",
        firstName: "خالد",
        lastName: "ناصر",
        dateOfBirth: "1989-09-05",
        gender: "male",
        email: "khalid.nasser@company.com",
        phoneNumber: "0598476543",
        address: JSON.stringify({
          street: "شارع الموظف السابق 147",
          city: "رام الله",
          state: "رام الله",
          zipCode: "92200",
          country: "PS",
        }),
        emergencyContact: JSON.stringify({
          name: "فاطمة ناصر",
          phoneNumber: "0598476544",
          relationship: "زوجة",
          email: "fatima.nasser@email.com",
        }),
        hireDate: "2021-03-15",
        position: "موظف سابق",
        department: "Operations",
        salary: 60000.0,
        managerId: "550e8400-e29b-41d4-a716-446655440201",
        isActive: false,
        employmentType: "full-time",
        status: "inactive",
        workLocation: "office",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("employees", employees, {});

    // Create user accounts for managers and key employees
    const users = [
      // CEO User
      {
        id: "550e8400-e29b-41d4-a716-446655440301",
        phoneNumber: "0598476520",
        email: "Islam.Tubasi@company.com",
        password: await bcrypt.hash("CEO@123", 12),
        employeeId: "550e8400-e29b-41d4-a716-446655440201",
        isActive: true,
        lastLoginAt: null,
        refreshToken: null,
        refreshTokenExpiresAt: null,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
        passwordChangedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // HR Director User
      {
        id: "550e8400-e29b-41d4-a716-446655440302",
        phoneNumber: "0598476521",
        email: "ahmed.mohammed@company.com",
        password: await bcrypt.hash("HR@123", 12),
        employeeId: "550e8400-e29b-41d4-a716-446655440202",
        isActive: true,
        lastLoginAt: null,
        refreshToken: null,
        refreshTokenExpiresAt: null,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
        passwordChangedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // IT Director User
      {
        id: "550e8400-e29b-41d4-a716-446655440303",
        phoneNumber: "0598476523",
        email: "ali.hassan@company.com",
        password: await bcrypt.hash("IT@123", 12),
        employeeId: "550e8400-e29b-41d4-a716-446655440203",
        isActive: true,
        lastLoginAt: null,
        refreshToken: null,
        refreshTokenExpiresAt: null,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
        passwordChangedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Finance Director User
      {
        id: "550e8400-e29b-41d4-a716-446655440304",
        phoneNumber: "0598476525",
        email: "sara.abdullah@company.com",
        password: await bcrypt.hash("Finance@123", 12),
        employeeId: "550e8400-e29b-41d4-a716-446655440204",
        isActive: true,
        lastLoginAt: null,
        refreshToken: null,
        refreshTokenExpiresAt: null,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
        passwordChangedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // HR Manager User
      {
        id: "550e8400-e29b-41d4-a716-446655440305",
        phoneNumber: "0598476527",
        email: "noor.ahmed@company.com",
        password: await bcrypt.hash("HRManager@123", 12),
        employeeId: "550e8400-e29b-41d4-a716-446655440205",
        isActive: true,
        lastLoginAt: null,
        refreshToken: null,
        refreshTokenExpiresAt: null,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
        passwordChangedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Senior Developer User
      {
        id: "550e8400-e29b-41d4-a716-446655440306",
        phoneNumber: "0598476529",
        email: "youssef.khalid@company.com",
        password: await bcrypt.hash("Dev@123", 12),
        employeeId: "550e8400-e29b-41d4-a716-446655440206",
        isActive: true,
        lastLoginAt: null,
        refreshToken: null,
        refreshTokenExpiresAt: null,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
        passwordChangedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Users", users, {});

    // Assign roles to users
    const userRoles = [
      // CEO - Admin role
      {
        id: "550e8400-e29b-41d4-a716-446655440401",
        userId: "550e8400-e29b-41d4-a716-446655440301",
        roleId: "550e8400-e29b-41d4-a716-446655440001", // admin role
        assignedBy: "550e8400-e29b-41d4-a716-446655440102", // admin user
        assignedAt: new Date(),
        expiresAt: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // HR Director - HR Manager role
      {
        id: "550e8400-e29b-41d4-a716-446655440402",
        userId: "550e8400-e29b-41d4-a716-446655440302",
        roleId: "550e8400-e29b-41d4-a716-446655440002", // hr_manager role
        assignedBy: "550e8400-e29b-41d4-a716-446655440102",
        assignedAt: new Date(),
        expiresAt: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // IT Director - IT Manager role
      {
        id: "550e8400-e29b-41d4-a716-446655440403",
        userId: "550e8400-e29b-41d4-a716-446655440303",
        roleId: "550e8400-e29b-41d4-a716-446655440003", // it_manager role
        assignedBy: "550e8400-e29b-41d4-a716-446655440102",
        assignedAt: new Date(),
        expiresAt: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Finance Director - Finance Manager role
      {
        id: "550e8400-e29b-41d4-a716-446655440404",
        userId: "550e8400-e29b-41d4-a716-446655440304",
        roleId: "550e8400-e29b-41d4-a716-446655440004", // finance_manager role
        assignedBy: "550e8400-e29b-41d4-a716-446655440102",
        assignedAt: new Date(),
        expiresAt: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // HR Manager - HR Specialist role
      {
        id: "550e8400-e29b-41d4-a716-446655440405",
        userId: "550e8400-e29b-41d4-a716-446655440305",
        roleId: "550e8400-e29b-41d4-a716-446655440005", // hr_specialist role
        assignedBy: "550e8400-e29b-41d4-a716-446655440102",
        assignedAt: new Date(),
        expiresAt: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Senior Developer - Developer role
      {
        id: "550e8400-e29b-41d4-a716-446655440406",
        userId: "550e8400-e29b-41d4-a716-446655440306",
        roleId: "550e8400-e29b-41d4-a716-446655440006", // developer role
        assignedBy: "550e8400-e29b-41d4-a716-446655440102",
        assignedAt: new Date(),
        expiresAt: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("UserRoles", userRoles, {});

    // Update branch managers
    await queryInterface.bulkUpdate(
      "branches",
      { managerId: "550e8400-e29b-41d4-a716-446655440201" }, // CEO manages HQ
      { id: "550e8400-e29b-41d4-a716-446655440001" }
    );

    await queryInterface.bulkUpdate(
      "branches",
      { managerId: "550e8400-e29b-41d4-a716-446655440203" }, // IT Director manages West Coast
      { id: "550e8400-e29b-41d4-a716-446655440002" }
    );

    await queryInterface.bulkUpdate(
      "branches",
      { managerId: "550e8400-e29b-41d4-a716-446655440204" }, // Finance Director manages European Office
      { id: "550e8400-e29b-41d4-a716-446655440003" }
    );

    await queryInterface.bulkUpdate(
      "branches",
      { managerId: "550e8400-e29b-41d4-a716-446655440210" }, // Marketing Manager manages Asia Pacific
      { id: "550e8400-e29b-41d4-a716-446655440004" }
    );

    // Update department heads
    await queryInterface.bulkUpdate(
      "departments",
      { headId: "550e8400-e29b-41d4-a716-446655440202" }, // HR Director heads HR
      { id: "550e8400-e29b-41d4-a716-446655440001" }
    );

    await queryInterface.bulkUpdate(
      "departments",
      { headId: "550e8400-e29b-41d4-a716-446655440203" }, // IT Director heads IT
      { id: "550e8400-e29b-41d4-a716-446655440002" }
    );

    await queryInterface.bulkUpdate(
      "departments",
      { headId: "550e8400-e29b-41d4-a716-446655440204" }, // Finance Director heads Finance
      { id: "550e8400-e29b-41d4-a716-446655440003" }
    );

    await queryInterface.bulkUpdate(
      "departments",
      { headId: "550e8400-e29b-41d4-a716-446655440210" }, // Marketing Manager heads Marketing
      { id: "550e8400-e29b-41d4-a716-446655440004" }
    );

    await queryInterface.bulkUpdate(
      "departments",
      { headId: "550e8400-e29b-41d4-a716-446655440211" }, // Sales Manager heads Sales
      { id: "550e8400-e29b-41d4-a716-446655440005" }
    );

    await queryInterface.bulkUpdate(
      "departments",
      { headId: "550e8400-e29b-41d4-a716-446655440201" }, // CEO heads Operations
      { id: "550e8400-e29b-41d4-a716-446655440006" }
    );

    await queryInterface.bulkUpdate(
      "departments",
      { headId: "550e8400-e29b-41d4-a716-446655440212" }, // Customer Support Specialist heads CS
      { id: "550e8400-e29b-41d4-a716-446655440007" }
    );

    await queryInterface.bulkUpdate(
      "departments",
      { headId: "550e8400-e29b-41d4-a716-446655440206" }, // Senior Developer heads R&D
      { id: "550e8400-e29b-41d4-a716-446655440008" }
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove user roles first
    await queryInterface.bulkDelete("UserRoles", {
      id: {
        [Sequelize.Op.in]: [
          "550e8400-e29b-41d4-a716-446655440401",
          "550e8400-e29b-41d4-a716-446655440402",
          "550e8400-e29b-41d4-a716-446655440403",
          "550e8400-e29b-41d4-a716-446655440404",
          "550e8400-e29b-41d4-a716-446655440405",
          "550e8400-e29b-41d4-a716-446655440406",
        ],
      },
    });

    // Remove users
    await queryInterface.bulkDelete("Users", {
      id: {
        [Sequelize.Op.in]: [
          "550e8400-e29b-41d4-a716-446655440301",
          "550e8400-e29b-41d4-a716-446655440302",
          "550e8400-e29b-41d4-a716-446655440303",
          "550e8400-e29b-41d4-a716-446655440304",
          "550e8400-e29b-41d4-a716-446655440305",
          "550e8400-e29b-41d4-a716-446655440306",
        ],
      },
    });

    // Remove employees
    await queryInterface.bulkDelete("employees", {
      id: {
        [Sequelize.Op.in]: [
          "550e8400-e29b-41d4-a716-446655440201",
          "550e8400-e29b-41d4-a716-446655440202",
          "550e8400-e29b-41d4-a716-446655440203",
          "550e8400-e29b-41d4-a716-446655440204",
          "550e8400-e29b-41d4-a716-446655440205",
          "550e8400-e29b-41d4-a716-446655440206",
          "550e8400-e29b-41d4-a716-446655440207",
          "550e8400-e29b-41d4-a716-446655440208",
          "550e8400-e29b-41d4-a716-446655440209",
          "550e8400-e29b-41d4-a716-446655440210",
          "550e8400-e29b-41d4-a716-446655440211",
          "550e8400-e29b-41d4-a716-446655440212",
          "550e8400-e29b-41d4-a716-446655440213",
        ],
      },
    });

    // Reset branch managers
    await queryInterface.bulkUpdate("branches", { managerId: null }, {});

    // Reset department heads
    await queryInterface.bulkUpdate("departments", { headId: null }, {});
  },
};
