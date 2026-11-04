/**
 * Tier 2: Boundary & Corner Cases Test Suite
 * Tests high-frequency clicks, browser history (popstate), direct deep links,
 * empty datasets, and invalid input fallbacks.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { BrowserEnvironment } from "./harness/dom-shim.mjs";
import { AdminDashboardModel, TAB_ROUTE_MAP } from "./harness/admin-controller.mjs";

describe("Tier 2: Boundary & Corner Cases", () => {
  test("2.1 Rapid Tab Clicking Burst Stress (20 clicks within 50ms)", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    const tabsSequence = [
      "brands", "investors", "blogs", "services", "ads", "logs", "dashboard",
      "brands", "blogs", "ads", "investors", "services", "logs", "dashboard",
      "brands", "services", "investors", "blogs", "ads", "logs"
    ];

    const startTime = performance.now();
    for (const tab of tabsSequence) {
      dashboard.handleTabChange(tab);
    }
    const elapsed = performance.now() - startTime;

    assert.strictEqual(dashboard.activeTab, "logs", "Final tab must match the last clicked tab");
    assert.strictEqual(env.location.pathname, "/admin/logs");
    assert.strictEqual(env.spinnerMountCount, 0, "Rapid clicks must not trigger auth spinner");
    assert.ok(elapsed < 50.0, `20 rapid tab switches took ${elapsed.toFixed(2)}ms (must be < 50ms)`);
  });

  test("2.2 Browser History Back & Forward (Popstate Navigation)", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    // Navigate sequentially: dashboard -> brands -> investors -> blogs
    dashboard.handleTabChange("brands");
    dashboard.handleTabChange("investors");
    dashboard.handleTabChange("blogs");

    assert.strictEqual(dashboard.activeTab, "blogs");
    assert.strictEqual(env.location.pathname, "/admin/blogs");

    // Popstate 1 step back -> investors
    env.history.back();
    assert.strictEqual(env.location.pathname, "/admin/investors");
    assert.strictEqual(dashboard.activeTab, "investors", "Popstate back must sync activeTab to investors");

    // Popstate another step back -> brands
    env.history.back();
    assert.strictEqual(env.location.pathname, "/admin/brands");
    assert.strictEqual(dashboard.activeTab, "brands", "Popstate back must sync activeTab to brands");

    // Popstate forward -> investors
    env.history.forward();
    assert.strictEqual(env.location.pathname, "/admin/investors");
    assert.strictEqual(dashboard.activeTab, "investors", "Popstate forward must sync activeTab to investors");

    dashboard.destroy();
  });

  test("2.3 Direct Deep-Link Loads Across Subroutes", () => {
    const deepLinks = [
      { url: "http://localhost:3000/admin/brands", expectedTab: "brands" },
      { url: "http://localhost:3000/admin/investors", expectedTab: "investors" },
      { url: "http://localhost:3000/admin/blogs", expectedTab: "blogs" },
      { url: "http://localhost:3000/admin/services", expectedTab: "services" },
      { url: "http://localhost:3000/admin/ads", expectedTab: "ads" },
      { url: "http://localhost:3000/admin/logs", expectedTab: "logs" }
    ];

    for (const dl of deepLinks) {
      const env = new BrowserEnvironment(dl.url);
      const dashboard = new AdminDashboardModel(env, { initialTab: dl.expectedTab });

      assert.strictEqual(
        dashboard.activeTab,
        dl.expectedTab,
        `Direct load at ${dl.url} must set activeTab to '${dl.expectedTab}'`
      );
      assert.strictEqual(env.location.pathname, TAB_ROUTE_MAP[dl.expectedTab]);
      assert.strictEqual(dashboard.authorized, true);
      dashboard.destroy();
    }
  });

  test("2.4 Empty Dataset Handling & Graceful Degradation", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env, {
      totalBrands: 0,
      pendingBrandsCount: 0,
      totalInvestors: 0,
      totalBlogs: 0,
      totalServices: 0,
      totalAds: 0
    });

    assert.strictEqual(dashboard.counts.totalBrands, 0);
    assert.strictEqual(dashboard.counts.pendingBrandsCount, 0);

    // Verify navigating between empty tabs executes without exceptions
    assert.doesNotThrow(() => {
      dashboard.handleTabChange("brands");
      dashboard.handleTabChange("investors");
      dashboard.handleTabChange("blogs");
      dashboard.handleTabChange("services");
      dashboard.handleTabChange("ads");
      dashboard.handleTabChange("logs");
    });
    dashboard.destroy();
  });

  test("2.5 Unauthenticated Direct Access Redirects to /login with Auth Spinner", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    // Remove auth flag
    env.localStorage.removeItem("adminLoggedIn");

    const dashboard = new AdminDashboardModel(env);

    assert.strictEqual(dashboard.authorized, false);
    assert.strictEqual(env.location.pathname, "/login");
    assert.strictEqual(env.spinnerMountCount, 1, "Unauthenticated access should mount auth verification spinner");
    dashboard.destroy();
  });

  test("2.6 Invalid Tab Fallback Resilience", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    // Attempt invalid tab ID
    dashboard.handleTabChange("non_existent_tab_id");

    // Must retain previous activeTab ("dashboard") and previous URL
    assert.strictEqual(dashboard.activeTab, "dashboard");
    assert.strictEqual(env.location.pathname, "/admin");
    dashboard.destroy();
  });
});
