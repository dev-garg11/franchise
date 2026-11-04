/**
 * Tier 4: Real-World Scenarios & Quantitative Performance Budgets
 * Tests full admin workflow, enforces <100ms latency budget per transition,
 * verifies zero auth-spinner flicker, URL synchronization, and backend immutability.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { BrowserEnvironment } from "./harness/dom-shim.mjs";
import { AdminDashboardModel, TAB_ROUTE_MAP } from "./harness/admin-controller.mjs";
import { PerfTimer } from "./harness/perf-timer.mjs";
import { checkBackendImmutability } from "./harness/immutability.mjs";

describe("Tier 4: Real-World Scenarios & Quantitative Verification", () => {
  test("4.1 Complete Admin Workflow with Latency < 100ms per Hop", async () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);
    const timer = new PerfTimer();

    const navigationSequence = [
      { from: "dashboard", to: "brands", expectedRoute: "/admin/brands" },
      { from: "brands", to: "investors", expectedRoute: "/admin/investors" },
      { from: "investors", to: "blogs", expectedRoute: "/admin/blogs" },
      { from: "blogs", to: "services", expectedRoute: "/admin/services" },
      { from: "services", to: "ads", expectedRoute: "/admin/ads" },
      { from: "ads", to: "logs", expectedRoute: "/admin/logs" },
      { from: "logs", to: "dashboard", expectedRoute: "/admin" }
    ];

    for (const step of navigationSequence) {
      const { entry } = await timer.measure(`${step.from} -> ${step.to}`, () => {
        dashboard.handleTabChange(step.to);
      });

      // Verify activeTab and URL synchronization
      assert.strictEqual(dashboard.activeTab, step.to, `Active tab must be ${step.to}`);
      assert.strictEqual(env.location.pathname, step.expectedRoute, `Route must be ${step.expectedRoute}`);

      // Quantitative latency budget enforcement (< 100ms)
      assert.ok(
        entry.durationMs < 100.0,
        `Tab transition '${step.from} -> ${step.to}' latency was ${entry.durationMs}ms (must be < 100ms)`
      );
    }

    const summary = timer.getSummary();
    assert.strictEqual(summary.violations, 0, "No tab transition may exceed 100ms");
    assert.ok(summary.mean < 25.0, `Mean transition latency should be < 25ms (was ${summary.mean}ms)`);

    dashboard.destroy();
  });

  test("4.2 Zero Auth-Spinner Flicker Across Entire Admin Session", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    // Initial state after login
    assert.strictEqual(env.spinnerMountCount, 0, "No initial spinner when adminLoggedIn is true");

    // Perform multiple tab navigations
    const tabs = ["brands", "investors", "blogs", "services", "ads", "logs", "dashboard"];
    for (const t of tabs) {
      dashboard.handleTabChange(t);
    }

    // Verify spinner mount count remains exactly 0
    assert.strictEqual(
      env.spinnerMountCount,
      0,
      `Auth spinner mounted ${env.spinnerMountCount} times during tab switches (must be strictly 0)`
    );

    dashboard.destroy();
  });

  test("4.3 Address Bar URL Synchronization on Every Step", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    const tabs = ["brands", "investors", "blogs", "services", "ads", "logs", "dashboard"];
    for (const t of tabs) {
      dashboard.handleTabChange(t);
      const expectedUrl = TAB_ROUTE_MAP[t];
      assert.strictEqual(
        env.location.pathname,
        expectedUrl,
        `Address bar pathname must match canonical route '${expectedUrl}' for tab '${t}'`
      );
    }

    dashboard.destroy();
  });

  test("4.4 Backend API & Database Schema Immutability Audit", () => {
    const audit = checkBackendImmutability();
    if (!audit.passed) {
      const details = audit.violations.map(v => `${v.type}: ${v.detail}`).join("; ");
      assert.fail(`Backend immutability violation detected: ${details}`);
    }
    assert.ok(audit.passed, "Backend API routes (/api/*) and models are strictly untouched");
  });
});
