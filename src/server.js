require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const path = require("path");

const config = require("./config");
const { testConnection } = require("./infrastructure/db/connection");
const defineAssociations = require("./infrastructure/db/associations");
const errorHandler = require("./presentation/middlewares/errorHandler");
const notFoundHandler = require("./presentation/middlewares/notFoundHandler");

// Import routes
const authRoutes = require("./presentation/routes/auth");
const employeeRoutes = require("./presentation/routes/employees");
const branchRoutes = require("./presentation/routes/branches");
const shiftRoutes = require("./presentation/routes/shifts");
const leaveRoutes = require("./presentation/routes/leaves");
const attendanceRoutes = require("./presentation/routes/attendance");
const loanRoutes = require("./presentation/routes/loans");
const payrollRoutes = require("./presentation/routes/payroll");
const performanceRoutes = require("./presentation/routes/performance");
const notificationRoutes = require("./presentation/routes/notifications");
const healthRoutes = require("./presentation/routes/health");
const sessionRoutes = require("./presentation/routes/sessions");
const activityRoutes = require("./presentation/routes/activities");
const auditRoutes = require("./presentation/routes/audit");
const identityRoutes = require("./presentation/routes/identities");
const departmentRoutes = require("./modules/departments/presentation/routes/departments");

// Import Swagger setup
const setupSwagger = require("./presentation/swagger");

class Server {
  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.nodeEnv = config.server.nodeEnv;
  }

  /**
   * Initialize the server
   */
  async init() {
    try {
      // Test database connection
      await testConnection();
      console.log("✅ Database connection established");

      // Define model associations
      defineAssociations();
      console.log("✅ Model associations defined");

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup Swagger documentation
      setupSwagger(this.app);

      // Setup error handling
      this.setupErrorHandling();

      console.log("✅ Server initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize server:", error);
      process.exit(1);
    }
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
      })
    );

    // CORS configuration
    this.app.use(
      cors({
        origin:
          this.nodeEnv === "production"
            ? process.env.ALLOWED_ORIGINS?.split(",") || [
                "http://localhost:3000",
              ]
            : true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        error: "Too many requests from this IP, please try again later.",
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use("/api/", limiter);

    // Compression
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Logging middleware
    if (this.nodeEnv === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(morgan("combined"));
    }

    // Static files
    this.app.use(
      "/uploads",
      express.static(path.join(__dirname, "../uploads"))
    );

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: this.nodeEnv,
        version: process.env.npm_package_version || "1.0.0",
      });
    });

    // API versioning
    this.app.use(`/api/${config.server.apiVersion}`, (req, res, next) => {
      req.apiVersion = config.server.apiVersion;
      next();
    });
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    const apiPrefix = `/api/${config.server.apiVersion}`;

    // API routes
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/employees`, employeeRoutes);
    this.app.use(`${apiPrefix}/branches`, branchRoutes);
    this.app.use(`${apiPrefix}/shifts`, shiftRoutes);
    this.app.use(`${apiPrefix}/leaves`, leaveRoutes);
    this.app.use(`${apiPrefix}/attendance`, attendanceRoutes);
    this.app.use(`${apiPrefix}/loans`, loanRoutes);
    this.app.use(`${apiPrefix}/payroll`, payrollRoutes);
    this.app.use(`${apiPrefix}/performance`, performanceRoutes);
    this.app.use(`${apiPrefix}/notifications`, notificationRoutes);
    this.app.use(`${apiPrefix}/health`, healthRoutes);
    this.app.use(`${apiPrefix}/sessions`, sessionRoutes);
    this.app.use(`${apiPrefix}/activities`, activityRoutes);
    this.app.use(`${apiPrefix}/audit`, auditRoutes);
    this.app.use(`${apiPrefix}/identities`, identityRoutes);
    this.app.use(`${apiPrefix}/departments`, departmentRoutes);

    // API documentation route
    this.app.get(`${apiPrefix}/docs`, (req, res) => {
      res.redirect("/api-docs");
    });

    // API info endpoint
    this.app.get(`${apiPrefix}`, (req, res) => {
      res.json({
        message: "HR Backend API",
        version: config.server.apiVersion,
        environment: this.nodeEnv,
        documentation: `${req.protocol}://${req.get("host")}/api-docs`,
        endpoints: {
          auth: `${apiPrefix}/auth`,
          employees: `${apiPrefix}/employees`,
          branches: `${apiPrefix}/branches`,
          shifts: `${apiPrefix}/shifts`,
          leaves: `${apiPrefix}/leaves`,
          attendance: `${apiPrefix}/attendance`,
          loans: `${apiPrefix}/loans`,
          payroll: `${apiPrefix}/payroll`,
          performance: `${apiPrefix}/performance`,
          notifications: `${apiPrefix}/notifications`,
          sessions: `${apiPrefix}/sessions`,
          activities: `${apiPrefix}/activities`,
          audit: `${apiPrefix}/audit`,
          identities: `${apiPrefix}/identities`,
          departments: `${apiPrefix}/departments`,
        },
      });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server running on port ${this.port}`);
      console.log(`📊 Environment: ${this.nodeEnv}`);
      console.log(
        `📚 API Documentation: http://localhost:${this.port}/api-docs`
      );
      console.log(
        `🔗 API Base URL: http://localhost:${this.port}/api/${config.server.apiVersion}`
      );
    });
  }

  /**
   * Graceful shutdown
   */
  gracefulShutdown() {
    console.log("\n🛑 Received shutdown signal");

    process.exit(0);
  }
}

// Create and start server
const server = new Server();

// Handle graceful shutdown
process.on("SIGTERM", () => server.gracefulShutdown());
process.on("SIGINT", () => server.gracefulShutdown());

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Initialize and start server
server
  .init()
  .then(() => {
    server.start();
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  });

module.exports = server;
