const fs = require("fs");
const crypto = require("crypto");

console.log("🔧 Setting up environment variables...\n");

// Read the example file
const envExample = fs.readFileSync("env.example", "utf8");

// Generate secure secrets
const jwtSecret = crypto.randomBytes(32).toString("hex");
const jwtRefreshSecret = crypto.randomBytes(32).toString("hex");
const sessionSecret = crypto.randomBytes(32).toString("hex");

// Replace placeholder values with secure ones
let envContent = envExample
  .replace("your_jwt_secret_key_here", jwtSecret)
  .replace("your_refresh_secret_key_here", jwtRefreshSecret)
  .replace("your_session_secret", sessionSecret)
  .replace("your_password", "postgres"); // Default database password

// Write the .env file
fs.writeFileSync(".env", envContent);

console.log("✅ Environment file created successfully!");
console.log("📝 Generated secure secrets:");
console.log(`   JWT_SECRET: ${jwtSecret.substring(0, 20)}...`);
console.log(`   JWT_REFRESH_SECRET: ${jwtRefreshSecret.substring(0, 20)}...`);
console.log(`   SESSION_SECRET: ${sessionSecret.substring(0, 20)}...`);
console.log("\n🔧 Next steps:");
console.log("1. Update DB_PASSWORD if needed");
console.log("2. Run: npm run migrate");
console.log("3. Run: npm run seed");
console.log("4. Run: npm run dev");
console.log("\n🚀 Your HR Backend API is ready to use!");
