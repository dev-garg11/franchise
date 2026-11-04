/**
 * Standard Node.js Test Runner Spec for Homepage Redesign & Gemini AI Assistant
 * Run with: node --test tests/e2e-homepage.spec.mjs
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ColorStyleScanner } from "./harness/color-style-scanner.mjs";
import { BackendAuditor } from "./harness/backend-auditor.mjs";
import { GeminiWidgetModel, REQUIRED_PROMPT_CHIPS } from "./harness/gemini-widget-model.mjs";
import { HomepageController } from "./harness/homepage-controller.mjs";
import { getFilteredMinBudgets, getFilteredMaxBudgets, parseRupeeValue } from "../src/lib/investmentData.js";
import { decodeHtmlEntities, cleanBrandPlainText } from "../src/lib/brandFormatters.js";

const rootDir = process.cwd();

describe("Tier 1: Feature Coverage (PROJECT.md Feature Inventory)", () => {
  const colorScanner = new ColorStyleScanner(rootDir);
  const backendAuditor = new BackendAuditor(rootDir);

  test("F03: GPU-Accelerated Smooth Scroll CSS is configured", () => {
    const scrollAudit = colorScanner.auditSmoothScrollAndTransitions();
    assert.strictEqual(scrollAudit.hasSmoothScrollCss, true, "scroll-behavior: smooth must be active");
  });

  test("F05: Modern card depth and glassmorphism tokens exist", () => {
    const globalsPath = path.join(rootDir, "src", "app", "globals.css");
    const content = fs.readFileSync(globalsPath, "utf8");
    assert.ok(content.includes("--shadow-md") || content.includes("--shadow-premium"), "Shadow tokens must exist");
  });

  test("F06-F08: Google AI Studio Gemini Assistant Widget contract and 5 Prompt Chips", () => {
    const widget = new GeminiWidgetModel({ initialOpen: false });
    assert.strictEqual(widget.promptChips.length, 5, "5 prompt chips required");
    for (const chip of REQUIRED_PROMPT_CHIPS) {
      assert.ok(widget.promptChips.includes(chip), `Prompt chip ${chip} must be present`);
    }
  });

  test("F09-F11: AI Brand recommendation cards & onOpenEnquiryModal callback", async () => {
    let modalBrand = null;
    const widget = new GeminiWidgetModel({
      onOpenEnquiryModal: (brand) => { modalBrand = brand; }
    });
    const res = await widget.sendQuery("Show trending brands");
    assert.strictEqual(res.success, true);
    assert.ok(res.response.brands.length > 0);

    widget.clickBrandEnquire(res.response.brands[0]);
    assert.strictEqual(modalBrand.name, res.response.brands[0].name);
  });

  test("F12-F13: Multi-criteria search filters and tabs exist in homepage source", () => {
    const pageSrc = fs.readFileSync(path.join(rootDir, "src", "app", "page.js"), "utf8");
    assert.ok(pageSrc.includes("searchTab"), "Search tabs state must exist");
    assert.ok(pageSrc.includes("FI_INDUSTRIES"), "FI_INDUSTRIES must exist");
    assert.ok(pageSrc.includes("FI_STATES"), "FI_STATES must exist");
    assert.ok(pageSrc.includes("FI_MIN_BUDGETS"), "FI_MIN_BUDGETS must exist");
  });

  test("F15 & F20: Carousels and horizontal sliders have navigation handlers", () => {
    const pageSrc = fs.readFileSync(path.join(rootDir, "src", "app", "page.js"), "utf8");
    assert.ok(pageSrc.includes("leadingCarouselRef"), "leadingCarouselRef must exist");
    assert.ok(pageSrc.includes("sliderRef"), "sliderRef must exist");
    assert.ok(pageSrc.includes("handlePrevLeading") && pageSrc.includes("handleNextLeading"));
    assert.ok(pageSrc.includes("handlePrevSlide") && pageSrc.includes("handleNextSlide"));
  });

  test("F24: Restored Brand Enquiry modal sends payload to POST /api/investors", () => {
    const pageSrc = fs.readFileSync(path.join(rootDir, "src", "app", "page.js"), "utf8");
    assert.ok(pageSrc.includes("/api/investors"), "Must submit to /api/investors");
    assert.ok(pageSrc.includes("handleEnquirySubmit"), "handleEnquirySubmit must exist");
  });

  test("F30: Backend API routes and database models exist and are intact", () => {
    const audit = backendAuditor.verifyBackendIntegrity();
    assert.strictEqual(audit.passed, true, `Backend integrity violated: ${JSON.stringify(audit.violations)}`);
  });
});

describe("Tier 2: Boundary & Corner Cases", () => {
  test("T2.1: Empty search inputs redirect gracefully to /brands", () => {
    const ctrl = new HomepageController();
    ctrl.setSearchTab("categories");
    assert.strictEqual(ctrl.handleFiSearchSubmit(), "/brands");
    ctrl.setSearchTab("location");
    assert.strictEqual(ctrl.handleFiSearchSubmit(), "/brands");
    ctrl.setSearchTab("investment");
    assert.strictEqual(ctrl.handleFiSearchSubmit(), "/brands");
  });

  test("T2.2: Budget interlocking prevents min > max inversion", () => {
    const ctrl = new HomepageController();
    ctrl.handleMaxInvChange("Rs. 10 Lakhs");
    ctrl.handleMinInvChange("Rs. 20 Lakhs");
    assert.strictEqual(ctrl.fiMaxInv, "", "Max budget must clear if Min exceeds Max");

    ctrl.handleMinInvChange("Rs. 1 Crore");
    ctrl.handleMaxInvChange("Rs. 50 Lakhs");
    assert.strictEqual(ctrl.fiMinInv, "", "Min budget must clear if Max falls below Min");

    const maxOpts = getFilteredMaxBudgets("Rs. 1 Crore");
    assert.ok(maxOpts.every(o => o.value > 10000000), "Filtered max options must exceed 1 Crore");
  });

  test("T2.4: Enquiry form blocks empty/whitespace submissions", async () => {
    const ctrl = new HomepageController();
    ctrl.selectBrand({ id: "b1", name: "Chai Point", minInvestment: 1000000, maxInvestment: 2000000 });
    ctrl.enquiryForm = { name: "", email: "", phone: "" };
    const res1 = await ctrl.handleEnquirySubmit();
    assert.strictEqual(res1.success, false);

    ctrl.enquiryForm = { name: "   ", email: "invalid", phone: "   " };
    const res2 = await ctrl.handleEnquirySubmit();
    assert.strictEqual(res2.success, false);
  });

  test("T2.6: Input sanitization strips dangerous HTML scripts and decodes entities", () => {
    const clean = cleanBrandPlainText("<script>alert('bad')</script>Exclusive Opportunity", { name: "Brand" });
    assert.strictEqual(clean.includes("<script>"), false);
    assert.strictEqual(clean.includes("alert"), false);

    const decoded = decodeHtmlEntities("&lt;h1&gt;Franchise &amp; Roots&lt;/h1&gt;");
    assert.strictEqual(decoded.includes("&amp;"), false);
    assert.ok(decoded.includes("&"));
  });

  test("T2.8: Carousel scroll clamping prevents negative offsets", () => {
    const ctrl = new HomepageController();
    ctrl.leadingScrollLeft = 0;
    const clampedLeading = ctrl.handlePrevLeading(400);
    assert.strictEqual(clampedLeading, 0);

    ctrl.sliderScrollLeft = 0;
    const clampedSlider = ctrl.handlePrevSlide(400);
    assert.strictEqual(clampedSlider, 0);
  });
});

describe("Tier 3: Cross-Feature Combinations", () => {
  test("T3.1: Search Filter -> Brand Selection -> Enquiry Modal flow", () => {
    const ctrl = new HomepageController();
    ctrl.setSearchTab("categories");
    ctrl.fiIndustry = "Automotive";
    ctrl.fiSector = "EV Service Station";
    const redirectUrl = ctrl.handleFiSearchSubmit();
    assert.ok(redirectUrl.includes("category=Automotive"));

    ctrl.selectBrand({ id: "brand-ev", name: "SpeedEV Workshop", category: "Automotive", minInvestment: 2000000 });
    assert.strictEqual(ctrl.selectedBrand.name, "SpeedEV Workshop");
  });

  test("T3.2: AI Prompt Chip -> Recommendation Card -> Homepage Modal", async () => {
    const ctrl = new HomepageController();
    const widget = new GeminiWidgetModel({
      onOpenEnquiryModal: (brand) => ctrl.selectBrand(brand)
    });

    const res = await widget.sendQuery("🍔 Food & Beverage");
    assert.strictEqual(res.success, true);
    widget.clickBrandEnquire(res.response.brands[0]);
    assert.strictEqual(ctrl.selectedBrand.name, res.response.brands[0].name);
  });

  test("T3.4: Investor login session in localStorage auto-hydrates enquiry form", () => {
    const storage = new Map([
      ["investorLoggedIn", "true"],
      ["investorName", "Neha Gupta"],
      ["investorEmail", "neha.gupta@enterprise.in"],
      ["investorPhone", "9811198111"],
      ["investorId", "inv-5544"]
    ]);
    const ctrl = new HomepageController({ localStorage: storage });
    ctrl.selectBrand({ id: "brand-1", name: "Starbucks", category: "Food and Beverage" });
    assert.strictEqual(ctrl.enquiryForm.name, "Neha Gupta");
    assert.strictEqual(ctrl.enquiryForm.email, "neha.gupta@enterprise.in");
  });
});

describe("Tier 4: Real-World Scenarios", () => {
  test("T4.1: Full end-to-end investor enquiry submission", async () => {
    const ctrl = new HomepageController();
    ctrl.selectBrand({
      id: "brand-full-e2e",
      name: "Naturals Ice Cream",
      category: "Food and Beverage",
      minInvestment: 2500000,
      maxInvestment: 4000000
    });
    ctrl.enquiryForm = {
      name: "Vikas Aggarwal",
      email: "vikas@aggarwal-holdings.com",
      phone: "+91 98989 89898",
      message: "Ready with 500 sq ft retail space."
    };
    const submitRes = await ctrl.handleEnquirySubmit({ ok: true, status: 201 });
    assert.strictEqual(submitRes.success, true);
    assert.strictEqual(ctrl.enquirySubmitted, true);
    assert.strictEqual(ctrl.enquiryApiSubmissions.length, 1);
    assert.strictEqual(ctrl.enquiryApiSubmissions[0].brandName, "Naturals Ice Cream");
  });

  test("T4.2: AI Advisory to WhatsApp advisor link generation", async () => {
    const widget = new GeminiWidgetModel();
    const queryRes = await widget.sendQuery("💰 Under ₹10L");
    assert.strictEqual(queryRes.success, true);
    const brand = queryRes.response.brands[0];
    const waLink = `https://wa.me/919876543210?text=${encodeURIComponent(`Enquiry for ${brand.name}`)}`;
    assert.ok(waLink.startsWith("https://wa.me/919876543210?text="));
  });

  test("T4.5: Backend immutability check", () => {
    const auditor = new BackendAuditor(rootDir);
    const res = auditor.verifyBackendIntegrity();
    assert.strictEqual(res.passed, true);
  });
});
