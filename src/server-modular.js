require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Import shared utilities and configuration
const {
  config,
  dbConnection,
  errorHandler,
  notFoundHandler,
  logInfo,
  logError,
} = require("./shared");

// Import all modules
const {
  auth,
  branches,
  employees,
  attendance,
  leaves,
  payroll,
  performance,
  notifications,
  audit,
  shifts,
  loans,
  identities,
  activities,
  sessions,
  health,
} = require("./modules");

class ModularServer {
  constructor() {
    this.app = express();
    this.nodeEnv = process.env.NODE_ENV || "development";
    this.port = config.server.port;
  }

  /**
   * Initialize the server
   */
  async init() {
    try {
      // Initialize database connection
      await dbConnection.authenticate();
      logInfo("Database connection established successfully");

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup Swagger documentation
      this.setupSwagger();

      // Setup error handling
      this.setupErrorHandling();

      logInfo("Modular server initialized successfully");
    } catch (error) {
      logError("Failed to initialize modular server", error);
      throw error;
    }
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors(config.cors));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later.",
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Static files
    this.app.use("/public", express.static(path.join(__dirname, "../public")));

    // Logging middleware
    if (this.nodeEnv === "development") {
      this.app.use(morgan("dev"));
    }

    // Request logging
    this.app.use((req, res, next) => {
      logInfo(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        timestamp: new Date().toISOString(),
      });
      next();
    });

    logInfo("Middleware setup completed");
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    const apiPrefix = `/api/${config.server.apiVersion}`;

    // Use modular routes
    this.app.use(`${apiPrefix}/auth`, auth.authRoutes);
    this.app.use(`${apiPrefix}/branches`, branches.branchRoutes);
    this.app.use(`${apiPrefix}/employees`, employees.employeeRoutes);
    this.app.use(`${apiPrefix}/attendance`, attendance.attendanceRoutes);
    this.app.use(`${apiPrefix}/leaves`, leaves.leaveRoutes);
    this.app.use(`${apiPrefix}/payroll`, payroll.payrollRoutes);
    this.app.use(`${apiPrefix}/performance`, performance.performanceRoutes);
    this.app.use(
      `${apiPrefix}/notifications`,
      notifications.notificationRoutes
    );
    this.app.use(`${apiPrefix}/audit`, audit.auditRoutes);
    this.app.use(`${apiPrefix}/shifts`, shifts.shiftRoutes);
    this.app.use(`${apiPrefix}/loans`, loans.loanRoutes);
    this.app.use(`${apiPrefix}/identities`, identities.identityRoutes);
    this.app.use(`${apiPrefix}/activities`, activities.activityRoutes);
    this.app.use(`${apiPrefix}/sessions`, sessions.sessionRoutes);
    this.app.use(`${apiPrefix}/health`, health.healthRoutes);

    // API documentation route
    this.app.get(`${apiPrefix}`, (req, res) => {
      res.json({
        message: "HR Backend API (Modular Architecture)",
        version: config.server.apiVersion,
        environment: this.nodeEnv,
        architecture: "modular",
        documentation: `${req.protocol}://${req.get("host")}${apiPrefix}/docs`,
        endpoints: {
          auth: `${apiPrefix}/auth`,
          branches: `${apiPrefix}/branches`,
          employees: `${apiPrefix}/employees`,
          attendance: `${apiPrefix}/attendance`,
          leaves: `${apiPrefix}/leaves`,
          payroll: `${apiPrefix}/payroll`,
          performance: `${apiPrefix}/performance`,
          notifications: `${apiPrefix}/notifications`,
          audit: `${apiPrefix}/audit`,
          shifts: `${apiPrefix}/shifts`,
          loans: `${apiPrefix}/loans`,
          identities: `${apiPrefix}/identities`,
          activities: `${apiPrefix}/activities`,
          sessions: `${apiPrefix}/sessions`,
          health: `${apiPrefix}/health`,
        },
        modules: {
          auth: "migrated",
          branches: "migrated",
          employees: "migrated",
          attendance: "migrated",
          leaves: "migrated",
          payroll: "migrated",
          performance: "migrated",
          notifications: "migrated",
          audit: "migrated",
          shifts: "migrated",
          loans: "migrated",
          identities: "migrated",
          activities: "migrated",
          sessions: "migrated",
          health: "migrated",
        },
      });
    });

    logInfo("Routes setup completed");
  }

  setupSwagger() {
    const options = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "HR Backend API (Modular)",
          version: config.server.apiVersion,
          description: "HR Management System API with Modular Architecture",
        },
        servers: [
          {
            url: `http://localhost:${config.server.port}/api/${config.server.apiVersion}`,
            description: "Development server",
          },
        ],
      },
      apis: [
        "./src/modules/*/presentation/routes/*.js",
        "./src/modules/*/presentation/validators/*.js",
      ],
    };

    const specs = swaggerJsdoc(options);
    this.app.use(
      `/api/${config.server.apiVersion}/docs`,
      swaggerUi.serve,
      swaggerUi.setup(specs)
    );

    logInfo("Swagger documentation setup completed");
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);

    logInfo("Error handling setup completed");
  }

  /**
   * Start the server
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        const server = this.app.listen(this.port, () => {
          logInfo(
            `Modular server running on port ${this.port} in ${this.nodeEnv} mode`
          );
          resolve(server);
        });

        server.on("error", (error) => {
          logError("Server error", error);
          reject(error);
        });
      } catch (error) {
        logError("Failed to start server", error);
        reject(error);
      }
    });
  }

  /**
   * Graceful shutdown
   */
  async gracefulShutdown(server) {
    return new Promise((resolve) => {
      logInfo("Received shutdown signal, closing server...");
      server.close(() => {
        logInfo("Server closed");
        resolve();
      });
    });
  }
}

// Create and start server
const server = new ModularServer();

// Handle graceful shutdown
process.on("SIGTERM", () => server.gracefulShutdown(server.app));
process.on("SIGINT", () => server.gracefulShutdown(server.app));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logError("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logError("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
server.init().then(() => {
  server.start().then((httpServer) => {
    // Graceful shutdown handling
    const shutdown = async (signal) => {
      logInfo(`Received ${signal}, shutting down gracefully...`);
      await server.gracefulShutdown(httpServer);
      process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  });
});
