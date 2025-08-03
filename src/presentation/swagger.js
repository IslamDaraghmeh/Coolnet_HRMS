const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const config = require("../config");

/**
 * Swagger Configuration
 */
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HR Backend API",
      version: "1.0.0",
      description: "Complete HR Management System API with Clean Architecture",
      contact: {
        name: "HR API Support",
        email: "support@hrsystem.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}/api/${config.server.apiVersion}`,
        description: "Development server",
      },
      {
        url: "https://api.hrsystem.com/api/v1",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme",
        },
      },
      schemas: {
        // Employee schemas
        Employee: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            employeeId: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            phoneNumber: { type: "string" },
            dateOfBirth: { type: "string", format: "date" },
            gender: { type: "string", enum: ["male", "female", "other"] },
            address: { type: "string" },
            position: { type: "string" },
            department: { type: "string" },
            employmentType: {
              type: "string",
              enum: ["full-time", "part-time", "contract", "intern"],
            },
            salary: { type: "number" },
            hourlyRate: { type: "number" },
            hireDate: { type: "string", format: "date" },
            status: {
              type: "string",
              enum: ["active", "inactive", "terminated", "on-leave"],
            },
            managerId: { type: "string", format: "uuid" },
            emergencyContact: {
              type: "object",
              properties: {
                name: { type: "string" },
                relationship: { type: "string" },
                phone: { type: "string" },
              },
            },
            bankDetails: {
              type: "object",
              properties: {
                accountNumber: { type: "string" },
                bankName: { type: "string" },
                routingNumber: { type: "string" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // User schemas
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            employeeId: { type: "string", format: "uuid" },
            phoneNumber: { type: "string" },
            email: { type: "string", format: "email" },
            isActive: { type: "boolean" },
            lastLoginAt: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Authentication schemas
        LoginRequest: {
          type: "object",
          required: ["phoneNumber", "password"],
          properties: {
            phoneNumber: { type: "string" },
            password: { type: "string" },
          },
        },

        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                tokens: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                    refreshToken: { type: "string" },
                    expiresIn: { type: "string" },
                  },
                },
              },
            },
          },
        },

        // Leave schemas
        Leave: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            employeeId: { type: "string", format: "uuid" },
            leaveType: {
              type: "string",
              enum: [
                "annual",
                "sick",
                "personal",
                "maternity",
                "paternity",
                "bereavement",
                "unpaid",
              ],
            },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            totalDays: { type: "number" },
            reason: { type: "string" },
            status: {
              type: "string",
              enum: ["pending", "approved", "rejected", "cancelled"],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Shift schemas
        Shift: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            startTime: { type: "string", format: "time" },
            endTime: { type: "string", format: "time" },
            breakDuration: { type: "integer" },
            color: { type: "string" },
            isActive: { type: "boolean" },
            department: { type: "string" },
            maxEmployees: { type: "integer" },
            overtimeAllowed: { type: "boolean" },
            overtimeRate: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Attendance schemas
        Attendance: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            employeeId: { type: "string", format: "uuid" },
            date: { type: "string", format: "date" },
            checkInTime: { type: "string", format: "date-time" },
            checkOutTime: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: [
                "present",
                "absent",
                "late",
                "half-day",
                "leave",
                "holiday",
              ],
            },
            workHours: { type: "number" },
            overtimeHours: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Loan schemas
        Loan: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            employeeId: { type: "string", format: "uuid" },
            loanType: {
              type: "string",
              enum: [
                "personal",
                "emergency",
                "education",
                "housing",
                "vehicle",
              ],
            },
            amount: { type: "number" },
            interestRate: { type: "number" },
            totalAmount: { type: "number" },
            monthlyPayment: { type: "number" },
            termMonths: { type: "integer" },
            status: {
              type: "string",
              enum: [
                "pending",
                "approved",
                "rejected",
                "active",
                "completed",
                "defaulted",
              ],
            },
            remainingBalance: { type: "number" },
            paidAmount: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Payroll schemas
        Payroll: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            employeeId: { type: "string", format: "uuid" },
            payPeriod: {
              type: "object",
              properties: {
                startDate: { type: "string", format: "date" },
                endDate: { type: "string", format: "date" },
              },
            },
            payDate: { type: "string", format: "date" },
            status: {
              type: "string",
              enum: ["draft", "calculated", "approved", "paid", "cancelled"],
            },
            basicSalary: { type: "number" },
            grossPay: { type: "number" },
            totalDeductions: { type: "number" },
            netPay: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Error schemas
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            error: {
              type: "object",
              properties: {
                message: { type: "string" },
                status: { type: "string" },
                statusCode: { type: "integer" },
                errors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: { type: "string" },
                      message: { type: "string" },
                      value: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },

        // Pagination schemas
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/presentation/routes/*.js",
    "./src/presentation/controllers/*.js",
  ],
};

/**
 * Setup Swagger documentation
 * @param {Express} app - Express application
 */
function setupSwagger(app) {
  const specs = swaggerJsdoc(swaggerOptions);

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "HR Backend API Documentation",
      customfavIcon: "/favicon.ico",
      swaggerOptions: {
        docExpansion: "list",
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
      },
    })
  );

  // Serve swagger.json
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });

  console.log("📚 Swagger documentation available at /api-docs");
}

module.exports = setupSwagger;
