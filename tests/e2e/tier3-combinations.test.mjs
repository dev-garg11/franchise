/**
 * Tier 3: Cross-Feature Combinations Test Suite
 * Tests interactions between tab navigation, filters, search, modal dialogs,
 * mobile drawer auto-closing, and state isolation.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { BrowserEnvironment } from "./harness/dom-shim.mjs";
import { AdminDashboardModel } from "./harness/admin-controller.mjs";

describe("Tier 3: Cross-Feature Combinations", () => {
  test("3.1 Search & Filter Cleansing on Tab Navigation", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    // Navigate to brands and set search term
    dashboard.handleTabChange("brands");
    dashboard.setSearch("Franchise Express");
    dashboard.setBrandStatusFilter("Pending");

    assert.strictEqual(dashboard.searchTerm, "Franchise Express");
    assert.strictEqual(dashboard.brandFilters.status, "Pending");

    // Navigate to blogs: search term must be reset cleanly per handleTabChange contract
    dashboard.handleTabChange("blogs");
    assert.strictEqual(dashboard.activeTab, "blogs");
    assert.strictEqual(dashboard.searchTerm, "", "Search term must reset on tab switch");
    assert.strictEqual(env.location.pathname, "/admin/blogs");
    assert.strictEqual(env.spinnerMountCount, 0);

    dashboard.destroy();
  });

  test("3.2 Mobile Drawer Auto-Close on Navigation", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    // Open mobile sidebar
    dashboard.mobileSidebarOpen = true;
    assert.strictEqual(dashboard.mobileSidebarOpen, true);

    // Click a navigation item
    dashboard.handleTabChange("investors");
    assert.strictEqual(dashboard.activeTab, "investors");
    assert.strictEqual(dashboard.mobileSidebarOpen, false, "Mobile sidebar must auto-close upon navigation");

    dashboard.destroy();
  });

  test("3.3 Tab Navigation After Modal Dialog Interactions", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    // Open Brand Details modal
    dashboard.openModal("brand_details", { id: "brand_123", name: "Chai Point" });
    assert.ok(dashboard.activeModal);
    assert.strictEqual(dashboard.activeModal.type, "brand_details");

    // Close modal
    dashboard.closeModal();
    assert.strictEqual(dashboard.activeModal, null, "Modal must be dismissed");

    // Navigate to Ads tab
    dashboard.handleTabChange("ads");
    assert.strictEqual(dashboard.activeTab, "ads");
    assert.strictEqual(env.location.pathname, "/admin/ads");
    assert.strictEqual(env.spinnerMountCount, 0);

    dashboard.destroy();
  });

  test("3.4 Multi-hop Tab Traversal with Interleaved Filter Changes", () => {
    const env = new BrowserEnvironment("http://localhost:3000/admin");
    const dashboard = new AdminDashboardModel(env);

    // Hop 1: Dashboard -> Brands
    dashboard.handleTabChange("brands");
    dashboard.setBrandStatusFilter("Approved");
    assert.strictEqual(dashboard.activeTab, "brands");

    // Hop 2: Brands -> Services
    dashboard.handleTabChange("services");
    assert.strictEqual(dashboard.activeTab, "services");

    // Hop 3: Services -> Logs
    dashboard.handleTabChange("logs");
    assert.strictEqual(dashboard.activeTab, "logs");

    // Hop 4: Logs -> Brands
    dashboard.handleTabChange("brands");
    assert.strictEqual(dashboard.activeTab, "brands");

    // Total spinner count must strictly be 0 throughout all hops
    assert.strictEqual(env.spinnerMountCount, 0, "Zero spinner flickers across all multi-hop navigations");

    dashboard.destroy();
  });

  test("3.5 AdminCache Interface Contract Verification", async () => {
    // Dynamic import to test src/lib/adminCache.js directly
    const cacheModule = await import("../../src/lib/adminCache.js");
    assert.ok(typeof cacheModule.getAdminCache === "function", "getAdminCache must be a function");
    assert.ok(typeof cacheModule.setAdminCache === "function", "setAdminCache must be a function");
    assert.ok(typeof cacheModule.invalidateAdminCache === "function", "invalidateAdminCache must be a function");

    // Test basic cache set and get
    cacheModule.setAdminCache("test_brands_key", [{ id: 1, name: "Test Brand" }]);
    const cached = cacheModule.getAdminCache("test_brands_key");
    assert.ok(Array.isArray(cached));
    assert.strictEqual(cached.length, 1);
    assert.strictEqual(cached[0].name, "Test Brand");

    // Test invalidation
    cacheModule.invalidateAdminCache("test_brands_key");
    assert.strictEqual(cacheModule.getAdminCache("test_brands_key"), null);
  });
});

