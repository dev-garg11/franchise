/**
 * Backend Immutability Auditor
 * Verifies that src/app/api/* and src/models/* have not been modified, added, or deleted.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export function checkBackendImmutability(rootDir = process.cwd()) {
  const violations = [];

  try {
    // 1. Check git status for any unstaged or staged changes in backend routes and models
    const gitStatus = execSync("git status --porcelain -- src/app/api src/models", {
      cwd: rootDir,
      encoding: "utf8"
    }).trim();

    if (gitStatus.length > 0) {
      const lines = gitStatus.split("\n").filter(Boolean);
      for (const line of lines) {
        violations.push({
          type: "GIT_STATUS_DIRTY",
          detail: line
        });
      }
    }

    // 2. Check git diff against HEAD for src/app/api and src/models
    const gitDiff = execSync("git diff HEAD -- src/app/api src/models", {
      cwd: rootDir,
      encoding: "utf8"
    }).trim();

    if (gitDiff.length > 0) {
      violations.push({
        type: "GIT_DIFF_DETECTED",
        detail: `Found modifications in backend routes or models (${gitDiff.length} diff characters)`
      });
    }

    // 3. Confirm expected backend route directories still exist and are accessible
    const apiDir = path.join(rootDir, "src", "app", "api");
    const requiredEndpoints = [
      "brands",
      "investors",
      "blogs",
      "services",
      "advertisements",
      "logs"
    ];

    for (const ep of requiredEndpoints) {
      const epPath = path.join(apiDir, ep);
      if (!fs.existsSync(epPath)) {
        violations.push({
          type: "API_ENDPOINT_MISSING",
          detail: `Expected API route folder missing: ${epPath}`
        });
      }
    }
  } catch (err) {
    violations.push({
      type: "AUDIT_EXEC_ERROR",
      detail: err.message
    });
  }

  return {
    passed: violations.length === 0,
    violations
  };
}
