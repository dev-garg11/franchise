/**
 * Tier 1: Feature Coverage Test Suite
 * Tests all 7 admin sections, routing mappings, sidebar components, and presentation views.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { BrowserEnvironment } from "./harness/dom-shim.mjs";
import { AdminDashboardModel, TAB_ROUTE_MAP, ROUTE_TAB_MAP } from "./harness/admin-controller.mjs";

describe("Tier 1: Feature Coverage (All 7 Admin Sections)", () => {
  const rootDir = process.cwd();

  test("1.1 Subroute Pages Existence & InitialTab Bindings", () => {
    const subroutes = [
      { dir: "brands", expectedTab: "brands" },
      { dir: "investors", expectedTab: "investors" },
      { dir: "blogs", expectedTab: "blogs" },
      { dir: "services", expectedTab: "services" },
      { dir: "ads", expectedTab: "ads" },
      { dir: "logs", expectedTab: "logs" }
    ];

    for (const sub of subroutes) {
      const pagePath = path.join(rootDir, "src", "app", "admin", sub.dir, "page.js");
      assert.ok(fs.existsSync(pagePath), `Subroute file missing: ${pagePath}`);
      const content = fs.readFileSync(pagePath, "utf8");
      assert.ok(
        content.includes(`initialTab="${sub.expectedTab}"`),
        `Subroute ${sub.dir}/page.js must pass initialTab="${sub.expectedTab}"`
      );
    }
  });

  test("1.2 Presentation Tab Components Integrity", () => {
    const tabComponents = [
      "DashboardTab.js",
      "BrandsTab.js",
      "InvestorsTab.js",
      "BlogsTab.js",
      "ServicesTab.js",
      "AdsTab.js",
      "LogsTab.js",
      "AdminSidebar.js",
      "SkeletonLoader.js"
    ];

    const adminCompDir = path.join(rootDir, "src", "components", "admin");
    for (const comp of tabComponents) {
      const compPath = path.join(adminCompDir, comp);
      assert.ok(fs.existsSync(compPath), `Required admin component missing: ${compPath}`);
      const stats = fs.statSync(compPath);
      assert.ok(stats.size > 200, `Component ${comp} file size is suspiciously small (${stats.size} bytes)`);
    }
  });

  test("1.3 Canonical Route & Tab Mapping Integrity", () => {
    const expectedTabs = ["dashboard", "brands", "investors", "blogs", "services", "ads", "logs"];

    for (const tab of expectedTabs) {
      const route = TAB_ROUTE_MAP[tab];
      assert.ok(route, `Tab '${tab}' must have an assigned canonical route`);
      assert.strictEqual(ROUTE_TAB_MAP[route], tab, `Route '${route}' must reverse-map to '${tab}'`);
    }
  });

  test("1.4 Tab 1: Dashboard Overview Mount & Default State", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env, { initialTab: "dashboard" });

    assert.strictEqual(dashboard.activeTab, "dashboard");
    assert.strictEqual(dashboard.authorized, true);
    assert.strictEqual(env.location.pathname, "/admin");
    assert.strictEqual(env.spinnerMountCount, 0, "No auth spinner should mount when logged in");
  });

  test("1.5 Tab 2: Manage Franchise Brands Navigation", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    dashboard.handleTabChange("brands");
    assert.strictEqual(dashboard.activeTab, "brands");
    assert.strictEqual(env.location.pathname, "/admin/brands");
    assert.strictEqual(env.spinnerMountCount, 0);
  });

  test("1.6 Tab 3: Investor Profiles & Leads Navigation", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    dashboard.handleTabChange("investors");
    assert.strictEqual(dashboard.activeTab, "investors");
    assert.strictEqual(env.location.pathname, "/admin/investors");
    assert.strictEqual(env.spinnerMountCount, 0);
  });

  test("1.7 Tab 4: Manage Blog Articles Navigation", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    dashboard.handleTabChange("blogs");
    assert.strictEqual(dashboard.activeTab, "blogs");
    assert.strictEqual(env.location.pathname, "/admin/blogs");
    assert.strictEqual(env.spinnerMountCount, 0);
  });

  test("1.8 Tab 5: Manage Company Services Navigation", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    dashboard.handleTabChange("services");
    assert.strictEqual(dashboard.activeTab, "services");
    assert.strictEqual(env.location.pathname, "/admin/services");
    assert.strictEqual(env.spinnerMountCount, 0);
  });

  test("1.9 Tab 6: Manage Advertising Space Navigation", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    dashboard.handleTabChange("ads");
    assert.strictEqual(dashboard.activeTab, "ads");
    assert.strictEqual(env.location.pathname, "/admin/ads");
    assert.strictEqual(env.spinnerMountCount, 0);
  });

  test("1.10 Tab 7: Activity & Audit Logs Navigation", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    dashboard.handleTabChange("logs");
    assert.strictEqual(dashboard.activeTab, "logs");
    assert.strictEqual(env.location.pathname, "/admin/logs");
    assert.strictEqual(env.spinnerMountCount, 0);
  });

  test("1.11 Live Badge Counter Contract", () => {
    const env = new BrowserEnvironment();
    const dashboard = new AdminDashboardModel(env, {
      totalBrands: 42,
      pendingBrandsCount: 5,
      totalInvestors: 100
    });

    assert.strictEqual(dashboard.counts.totalBrands, 42);
    assert.strictEqual(dashboard.counts.pendingBrandsCount, 5);
    assert.strictEqual(dashboard.counts.totalInvestors, 100);
  });
});
