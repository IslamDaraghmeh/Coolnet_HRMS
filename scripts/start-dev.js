#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

/**
 * Development Startup Script
 * Sets up the environment and starts the development server
 */

console.log("🚀 Starting HR Backend Development Server...\n");

// Check if .env file exists, if not copy from env.development
const envPath = path.join(__dirname, "..", ".env");
const envDevPath = path.join(__dirname, "..", "env.development");

if (!fs.existsSync(envPath) && fs.existsSync(envDevPath)) {
  console.log("📝 Creating .env file from development template...");
  fs.copyFileSync(envDevPath, envPath);
  console.log("✅ .env file created successfully\n");
}

// Create necessary directories
const dirs = [
  path.join(__dirname, "..", "logs"),
  path.join(__dirname, "..", "uploads"),
  path.join(__dirname, "..", "temp"),
];

dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Check if PostgreSQL is running
async function checkDatabase() {
  return new Promise((resolve) => {
    const checkDb = spawn("pg_isready", ["-h", "localhost", "-p", "5432"]);

    checkDb.on("close", (code) => {
      if (code === 0) {
        console.log("✅ PostgreSQL is running");
        resolve(true);
      } else {
        console.log("❌ PostgreSQL is not running");
        console.log(
          "Please start PostgreSQL before running the development server"
        );
        resolve(false);
      }
    });
  });
}

// Run database migrations
async function runMigrations() {
  return new Promise((resolve) => {
    console.log("🔄 Running database migrations...");

    const migrate = spawn("npx", ["sequelize-cli", "db:migrate"], {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
    });

    migrate.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Database migrations completed");
        resolve(true);
      } else {
        console.log("❌ Database migrations failed");
        resolve(false);
      }
    });
  });
}

// Run database seeds
async function runSeeds() {
  return new Promise((resolve) => {
    console.log("🌱 Running database seeds...");

    const seed = spawn("npx", ["sequelize-cli", "db:seed:all"], {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
    });

    seed.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Database seeds completed");
        resolve(true);
      } else {
        console.log("❌ Database seeds failed");
        resolve(false);
      }
    });
  });
}

// Start the development server
async function startServer() {
  console.log("🚀 Starting development server...\n");

  const server = spawn("npm", ["run", "dev"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "development",
    },
  });

  server.on("close", (code) => {
    console.log(`\n🛑 Server stopped with code ${code}`);
    process.exit(code);
  });

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down development server...");
    server.kill("SIGINT");
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Shutting down development server...");
    server.kill("SIGTERM");
  });
}

// Main execution
async function main() {
  try {
    // Check database
    const dbRunning = await checkDatabase();
    if (!dbRunning) {
      process.exit(1);
    }

    // Run migrations
    const migrationsSuccess = await runMigrations();
    if (!migrationsSuccess) {
      console.log("⚠️  Continuing without migrations...");
    }

    // Run seeds
    const seedsSuccess = await runSeeds();
    if (!seedsSuccess) {
      console.log("⚠️  Continuing without seeds...");
    }

    // Start server
    await startServer();
  } catch (error) {
    console.error("❌ Error starting development server:", error);
    process.exit(1);
  }
}

// Run the main function
main();
