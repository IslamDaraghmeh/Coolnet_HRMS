const { execSync } = require("child_process");
const path = require("path");

console.log("🌱 Running employee seed migration...");

try {
  // Run the seed migration
  execSync("npx sequelize-cli db:seed --seed 007_employees.js", {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
  });

  console.log("✅ Employee seed migration completed successfully!");
  console.log("\n📊 Test Data Summary:");
  console.log("========================");
  console.log("👥 Employees Created: 13");
  console.log("   • CEO (John Smith) - Top Level");
  console.log("   • HR Director (Emily Johnson)");
  console.log("   • IT Director (David Chen)");
  console.log("   • Finance Director (Maria Garcia)");
  console.log("   • HR Manager (Sarah Williams)");
  console.log("   • Senior Software Engineer (Alex Thompson)");
  console.log("   • Junior Software Engineer (Michael Brown)");
  console.log("   • HR Specialist (Jessica Davis)");
  console.log("   • Financial Analyst (Daniel Wilson)");
  console.log("   • Marketing Manager (Lisa Anderson)");
  console.log("   • Sales Manager (Robert Taylor)");
  console.log("   • Customer Support Specialist (Amanda Martinez)");
  console.log("   • Inactive Employee (Kevin Lee) - For testing");

  console.log("\n🔐 User Accounts Created: 6");
  console.log("   • CEO: john.smith@company.com / CEO@123");
  console.log("   • HR Director: emily.johnson@company.com / HR@123");
  console.log("   • IT Director: david.chen@company.com / IT@123");
  console.log("   • Finance Director: maria.garcia@company.com / Finance@123");
  console.log("   • HR Manager: sarah.williams@company.com / HRManager@123");
  console.log("   • Senior Developer: alex.thompson@company.com / Dev@123");

  console.log("\n🏢 Management Hierarchy:");
  console.log("   • CEO → All Directors");
  console.log("   • HR Director → HR Manager → HR Specialist");
  console.log("   • IT Director → Senior Developer → Junior Developer");
  console.log("   • Finance Director → Financial Analyst");

  console.log("\n🏢 Branch Managers:");
  console.log("   • Headquarters → CEO");
  console.log("   • West Coast Office → IT Director");
  console.log("   • European Office → Finance Director");
  console.log("   • Asia Pacific Office → Marketing Manager");

  console.log("\n📋 Department Heads:");
  console.log("   • HR → HR Director");
  console.log("   • IT → IT Director");
  console.log("   • Finance → Finance Director");
  console.log("   • Marketing → Marketing Manager");
  console.log("   • Sales → Sales Manager");
  console.log("   • Operations → CEO");
  console.log("   • Customer Support → Customer Support Specialist");
  console.log("   • R&D → Senior Developer");

  console.log("\n🧪 Test Scenarios Available:");
  console.log("   • Employee CRUD operations");
  console.log("   • Manager-subordinate relationships");
  console.log("   • Department assignments");
  console.log("   • Branch management");
  console.log("   • User authentication with different roles");
  console.log("   • Active/inactive employee filtering");
  console.log("   • Salary and position management");

  console.log("\n🚀 Ready to test the HR system!");
} catch (error) {
  console.error("❌ Error running employee seed migration:", error.message);
  process.exit(1);
}
