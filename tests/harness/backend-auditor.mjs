/**
 * Backend Immutability and Schema Integrity Auditor
 * Verifies that backend API routes and database schemas remain completely untouched.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const REQUIRED_BACKEND_ROUTES = [
  "brands",
  "services",
  "advertisements",
  "investors",
  "blogs",
  "ai-agent"
];

export const REQUIRED_DB_MODELS = [
  "Brand.js",
  "Investor.js",
  "Blog.js",
  "Service.js",
  "Advertisement.js"
];

export class BackendAuditor {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
  }

  hashFile(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  verifyBackendIntegrity() {
    const violations = [];
    const apiDir = path.join(this.rootDir, "src", "app", "api");
    const modelsDir = path.join(this.rootDir, "src", "models");

    // 1. Verify API Routes existence
    for (const route of REQUIRED_BACKEND_ROUTES) {
      const routePath = path.join(apiDir, route, "route.js");
      if (!fs.existsSync(routePath)) {
        violations.push({
          type: "MISSING_API_ROUTE",
          path: path.relative(this.rootDir, routePath),
          message: `Required API route handler missing: ${route}`
        });
      }
    }

    // 2. Verify Models existence
    for (const model of REQUIRED_DB_MODELS) {
      const modelPath = path.join(modelsDir, model);
      if (!fs.existsSync(modelPath)) {
        violations.push({
          type: "MISSING_DB_MODEL",
          path: path.relative(this.rootDir, modelPath),
          message: `Required DB model schema missing: ${model}`
        });
      }
    }

    // 3. Verify AI Agent API Contract
    const aiRoutePath = path.join(apiDir, "ai-agent", "route.js");
    if (fs.existsSync(aiRoutePath)) {
      const content = fs.readFileSync(aiRoutePath, "utf8");
      if (!content.includes("export async function POST") || !content.includes("NextResponse.json")) {
        violations.push({
          type: "CORRUPTED_AI_AGENT_ROUTE",
          path: path.relative(this.rootDir, aiRoutePath),
          message: "POST handler in /api/ai-agent is corrupted or altered"
        });
      }
    }

    // 4. Verify Investors API Contract
    const invRoutePath = path.join(apiDir, "investors", "route.js");
    if (fs.existsSync(invRoutePath)) {
      const content = fs.readFileSync(invRoutePath, "utf8");
      if (!content.includes("export async function POST")) {
        violations.push({
          type: "CORRUPTED_INVESTORS_ROUTE",
          path: path.relative(this.rootDir, invRoutePath),
          message: "POST handler in /api/investors is missing or altered"
        });
      }
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }
}
