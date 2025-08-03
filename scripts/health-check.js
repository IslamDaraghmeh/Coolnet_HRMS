#!/usr/bin/env node

/**
 * Health Check Script
 * Used by Docker to check if the application is healthy
 */

const http = require("http");
const url = require("url");

const options = {
  hostname: process.env.HOST || "localhost",
  port: process.env.PORT || 3000,
  path: "/health",
  method: "GET",
  timeout: 5000,
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log("Health check passed");
    process.exit(0);
  } else {
    console.log(`Health check failed with status code: ${res.statusCode}`);
    process.exit(1);
  }
});

request.on("error", (err) => {
  console.error("Health check error:", err.message);
  process.exit(1);
});

request.on("timeout", () => {
  console.error("Health check timeout");
  request.destroy();
  process.exit(1);
});

request.end();
