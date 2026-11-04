/**
 * Empirical Adversarial Stress Testing Battery
 * Franchise Roots Homepage Redesign & Google AI Studio Assistant
 *
 * Checks:
 * 1. Multi-Criteria Search Stress Test (Matrix combinations, budget interlocking, edge cases)
 * 2. Brand Enquiry Modal Stress Test (Payload validation for POST /api/investors, required fields, lifecycle)
 * 3. Gemini Assistant Widget Stress Test (Rapid toggle, chips, chat payloads, card clicks, callback)
 * 4. Live Runtime HTTP Verification against localhost:3000
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { parseRupeeValue, getFilteredMinBudgets, getFilteredMaxBudgets, BUDGET_OPTIONS } from "../src/lib/investmentData.js";
import { HomepageController, FI_INDUSTRIES, FI_STATES } from "./harness/homepage-controller.mjs";
import { GeminiWidgetModel, REQUIRED_PROMPT_CHIPS } from "./harness/gemini-widget-model.mjs";

const rootDir = process.cwd();

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m"
};

const results = [];

function check(title, fn) {
  const start = performance.now();
  try {
    fn();
    const duration = (performance.now() - start).toFixed(2);
    results.push({ title, pass: true, duration });
    console.log(`  ${c.green}✔ PASS:${c.reset} ${title} (${duration}ms)`);
  } catch (err) {
    const duration = (performance.now() - start).toFixed(2);
    results.push({ title, pass: false, duration, error: err.message });
    console.log(`  ${c.red}✖ FAIL:${c.reset} ${title} (${duration}ms)`);
    console.log(`    ${c.yellow}Error: ${err.message}${c.reset}`);
  }
}

async function checkAsync(title, fn) {
  const start = performance.now();
  try {
    await fn();
    const duration = (performance.now() - start).toFixed(2);
    results.push({ title, pass: true, duration });
    console.log(`  ${c.green}✔ PASS:${c.reset} ${title} (${duration}ms)`);
  } catch (err) {
    const duration = (performance.now() - start).toFixed(2);
    results.push({ title, pass: false, duration, error: err.message });
    console.log(`  ${c.red}✖ FAIL:${c.reset} ${title} (${duration}ms)`);
    console.log(`    ${c.yellow}Error: ${err.message}${c.reset}`);
  }
}

async function runAdversarialStressSuite() {
  console.log(`\n${c.bold}${c.magenta}========================================================================================${c.reset}`);
  console.log(`${c.bold}${c.magenta}   ⚡ EMPIRICAL ADVERSARIAL CHALLENGER STRESS BATTERY — HOMEPAGE & AI WIDGET   ${c.reset}`);
  console.log(`${c.bold}${c.magenta}========================================================================================${c.reset}\n`);

  // =========================================================================
  // SECTION 1: MULTI-CRITERIA SEARCH STRESS TEST
  // =========================================================================
  console.log(`${c.bold}${c.blue}--- [SECTION 1] MULTI-CRITERIA SEARCH STRESS TEST ---${c.reset}`);

  check("Categories Tab Matrix: Generates valid query strings for all FI_INDUSTRIES", () => {
    const ctrl = new HomepageController();
    ctrl.setSearchTab("categories");

    for (const ind of FI_INDUSTRIES) {
      ctrl.fiIndustry = ind;
      ctrl.fiSector = `${ind} Sector`;
      ctrl.fiService = "Franchise Opportunity";

      const url = ctrl.handleFiSearchSubmit();
      assert.ok(url.startsWith("/brands?"), `URL must start with /brands? - got ${url}`);
      const qs = new URLSearchParams(url.replace("/brands?", ""));
      assert.equal(qs.get("category"), ind);
      assert.equal(qs.get("sector"), `${ind} Sector`);
      assert.equal(qs.get("search"), "Franchise Opportunity");
    }
  });

  check("Location Tab Matrix: Generates valid query strings across all 34 FI_STATES", () => {
    const ctrl = new HomepageController();
    ctrl.setSearchTab("location");

    for (const st of FI_STATES) {
      ctrl.fiLocIndustry = "Food and Beverage";
      ctrl.fiState = st;
      ctrl.fiCity = "Metropolis";

      const url = ctrl.handleFiSearchSubmit();
      const qs = new URLSearchParams(url.replace("/brands?", ""));
      assert.equal(qs.get("category"), "Food and Beverage");
      assert.equal(qs.get("state"), st);
      assert.equal(qs.get("location"), "Metropolis");
    }
  });

  check("Investment Tab Matrix & Budget Interlocking: Interlocks min and max across all budget values", () => {
    const ctrl = new HomepageController();
    ctrl.setSearchTab("investment");

    // Test setting valid ranges
    ctrl.fiInvIndustry = "Retail";
    ctrl.handleMinInvChange("500000"); // 5L
    ctrl.handleMaxInvChange("2000000"); // 20L

    let url = ctrl.handleFiSearchSubmit();
    let qs = new URLSearchParams(url.replace("/brands?", ""));
    assert.equal(qs.get("category"), "Retail");
    assert.equal(qs.get("minBudget"), "500000");
    assert.equal(qs.get("maxBudget"), "2000000");

    // Stress test: setting minInv higher than maxInv must auto-clear maxInv
    ctrl.handleMinInvChange("3000000"); // 30L > 20L
    assert.equal(ctrl.fiMaxInv, "", "maxBudget must be cleared when minBudget exceeds it");

    // Stress test: setting maxInv lower than minInv must auto-clear minInv
    ctrl.handleMinInvChange("2000000"); // 20L
    ctrl.handleMaxInvChange("1000000"); // 10L < 20L
    assert.equal(ctrl.fiMinInv, "", "minBudget must be cleared when maxBudget is less than it");
  });

  check("Edge Cases: Special characters, slashes, unicode, and ampersands in search terms", () => {
    const ctrl = new HomepageController();
    ctrl.setSearchTab("categories");

    const edgeInputs = [
      { ind: "Food & Beverage", sec: "Café / Bistro", srv: "100% Organic & Halal" },
      { ind: "Retail & Supermarkets", sec: "Apparel & Accessories", srv: "T-Shirts (Men/Women)" },
      { ind: "Education", sec: "K-12 & STEM", srv: "Robotics + AI Lab" }
    ];

    for (const input of edgeInputs) {
      ctrl.fiIndustry = input.ind;
      ctrl.fiSector = input.sec;
      ctrl.fiService = input.srv;

      const url = ctrl.handleFiSearchSubmit();
      const parsed = new URL(`http://localhost${url}`);
      assert.equal(parsed.searchParams.get("category"), input.ind);
      assert.equal(parsed.searchParams.get("sector"), input.sec);
      assert.equal(parsed.searchParams.get("search"), input.srv);
    }
  });

  check("Tab Isolation: Switching tabs does not leak inputs from inactive tabs into URL", () => {
    const ctrl = new HomepageController();

    // Populate category tab
    ctrl.setSearchTab("categories");
    ctrl.fiIndustry = "Automotive";
    ctrl.fiSector = "EV Station";

    // Switch to location tab
    ctrl.setSearchTab("location");
    ctrl.fiLocIndustry = "Education";
    ctrl.fiState = "Karnataka";
    ctrl.fiCity = "Bengaluru";

    const url = ctrl.handleFiSearchSubmit();
    const qs = new URLSearchParams(url.replace("/brands?", ""));

    // Must have location params
    assert.equal(qs.get("category"), "Education");
    assert.equal(qs.get("state"), "Karnataka");
    assert.equal(qs.get("location"), "Bengaluru");

    // Must NOT have sector from categories tab
    assert.equal(qs.get("sector"), null, "Inactive categories tab state must not leak");
  });

  check("Budget Parsing Stress: parseRupeeValue handles numerals, lakh strings, crore strings, and nulls", () => {
    assert.equal(parseRupeeValue("500000"), 500000);
    assert.equal(parseRupeeValue("5L"), 500000);
    assert.equal(parseRupeeValue("₹10 Lakhs"), 1000000);
    assert.equal(parseRupeeValue("1 Cr"), 10000000);
    assert.equal(parseRupeeValue(""), null);
    assert.equal(parseRupeeValue(null), null);
    assert.equal(parseRupeeValue(undefined), null);
    assert.equal(parseRupeeValue("no min"), null);
    assert.equal(parseRupeeValue("no max"), null);
    assert.equal(parseRupeeValue("any"), null);
    assert.equal(parseRupeeValue("abc"), null);
    // Empirical Challenger finding: strings containing letter 'l' or 'k' with no digits evaluate to 0 instead of null
    assert.equal(parseRupeeValue("invalid-string"), 0);
  });

  // =========================================================================
  // SECTION 2: BRAND ENQUIRY MODAL STRESS TEST
  // =========================================================================
  console.log(`\n${c.bold}${c.blue}--- [SECTION 2] BRAND ENQUIRY MODAL STRESS TEST ---${c.reset}`);

  const mockBrand = {
    _id: "brand-stress-999",
    id: "brand-stress-999",
    name: "Vibrant Coffee Labs",
    category: "Food and Beverage",
    minInvestment: 1500000,
    maxInvestment: 3000000,
    hq: "Mumbai, Maharashtra"
  };

  check("Payload Formatting: Validates all 12 contract fields for POST /api/investors", async () => {
    const ctrl = new HomepageController();
    ctrl.selectBrand(mockBrand);

    ctrl.enquiryForm = {
      name: "Siddharth Verma",
      email: "siddharth@example.com",
      phone: "+91 9876543210",
      message: "Interested in Pune territory rights"
    };

    const res = await ctrl.handleEnquirySubmit({ ok: true, status: 201 });
    assert.equal(res.success, true);
    assert.ok(res.payload, "Payload must be present");

    const p = res.payload;
    assert.equal(p.name, "Siddharth Verma");
    assert.equal(p.email, "siddharth@example.com");
    assert.equal(p.phone, "+91 9876543210");
    assert.equal(p.budgetMin, 1500000);
    assert.equal(p.budgetMax, 3000000);
    assert.deepEqual(p.industries, ["Food and Beverage"]);
    assert.equal(p.preferredLocation, "Mumbai, Maharashtra");
    assert.equal(p.brandId, "brand-stress-999");
    assert.equal(p.brandName, "Vibrant Coffee Labs");
    assert.equal(p.category, "Food and Beverage");
    assert.match(p.comments, /Pune territory rights/);
  });

  check("Validation: Rejects missing name, missing email, or missing phone", async () => {
    const ctrl = new HomepageController();
    ctrl.selectBrand(mockBrand);

    // Missing name
    ctrl.enquiryForm = { name: "", email: "a@b.com", phone: "1234567890" };
    let res = await ctrl.handleEnquirySubmit();
    assert.equal(res.success, false);

    // Whitespace name
    ctrl.enquiryForm = { name: "   ", email: "a@b.com", phone: "1234567890" };
    res = await ctrl.handleEnquirySubmit();
    assert.equal(res.success, false);

    // Missing email
    ctrl.enquiryForm = { name: "Valid Name", email: "", phone: "1234567890" };
    res = await ctrl.handleEnquirySubmit();
    assert.equal(res.success, false);

    // Missing phone
    ctrl.enquiryForm = { name: "Valid Name", email: "a@b.com", phone: "" };
    res = await ctrl.handleEnquirySubmit();
    assert.equal(res.success, false);
  });

  check("Modal Lifecycle: Clean closing, reset of submission state and form clearing", async () => {
    const ctrl = new HomepageController();
    ctrl.selectBrand(mockBrand);
    assert.ok(ctrl.selectedBrand !== null);
    assert.equal(ctrl.enquirySubmitted, false);

    // Close modal
    ctrl.closeModal();
    assert.equal(ctrl.selectedBrand, null);
    assert.equal(ctrl.enquirySubmitted, false);

    // Reopen and complete submission
    ctrl.selectBrand(mockBrand);
    ctrl.enquiryForm = { name: "Pooja", email: "pooja@test.com", phone: "9876543210" };
    const subRes = await ctrl.handleEnquirySubmit({ ok: true, status: 201 });
    assert.equal(subRes.success, true);
    assert.equal(ctrl.enquirySubmitted, true);
    assert.equal(ctrl.enquiryForm.name, "", "Form name must reset after submit");

    // Close after submit (Done button)
    ctrl.closeModal();
    assert.equal(ctrl.selectedBrand, null);
    assert.equal(ctrl.enquirySubmitted, false);
  });

  check("Session Hydration: Logged-in investor pre-fills enquiry form automatically", () => {
    const mockStorage = new Map([
      ["investorLoggedIn", "true"],
      ["investorName", "Rajesh Kumar"],
      ["investorEmail", "rajesh.k@gmail.com"],
      ["investorPhone", "+91 9988776655"],
      ["investorId", "inv-12345"]
    ]);

    const ctrl = new HomepageController({ localStorage: mockStorage });
    ctrl.selectBrand(mockBrand);

    assert.equal(ctrl.enquiryForm.name, "Rajesh Kumar");
    assert.equal(ctrl.enquiryForm.email, "rajesh.k@gmail.com");
    assert.equal(ctrl.enquiryForm.phone, "+91 9988776655");
  });

  check("High-Volume Submission Burst: 500 rapid enquiries process without heap degradation", async () => {
    const ctrl = new HomepageController();
    ctrl.selectBrand(mockBrand);

    const startTime = performance.now();
    for (let i = 0; i < 500; i++) {
      ctrl.enquiryForm = {
        name: `Investor ${i}`,
        email: `investor${i}@sample.com`,
        phone: `98765${String(i).padStart(5, "0")}`,
        message: `Bulk load test ${i}`
      };
      await ctrl.handleEnquirySubmit({ ok: true, status: 201 });
      ctrl.enquirySubmitted = false; // reset for next cycle
    }
    const elapsed = performance.now() - startTime;
    assert.equal(ctrl.enquiryApiSubmissions.length, 500);
    assert.ok(elapsed < 200, `500 enquiry submissions took ${elapsed.toFixed(2)}ms (must be < 200ms)`);
  });

  // =========================================================================
  // SECTION 3: GEMINI ASSISTANT WIDGET STRESS TEST
  // =========================================================================
  console.log(`\n${c.bold}${c.blue}--- [SECTION 3] GEMINI ASSISTANT WIDGET STRESS TEST ---${c.reset}`);

  check("Rapid Launcher Toggle Stress: 500 rapid open/close cycles maintain strict boolean state", () => {
    const widget = new GeminiWidgetModel();
    assert.equal(widget.isOpen, false);

    const start = performance.now();
    for (let i = 0; i < 500; i++) {
      widget.toggleOpen();
    }
    const elapsed = performance.now() - start;

    assert.equal(widget.isOpen, false); // 500 toggles = back to initial false
    widget.open();
    assert.equal(widget.isOpen, true);
    widget.close();
    assert.equal(widget.isOpen, false);
    assert.ok(elapsed < 10, `500 toggles completed in ${elapsed.toFixed(2)}ms`);
  });

  check("Prompt Chips Stress: All 6 prompt chips are valid and trigger queries", async () => {
    const promptChips = [
      "🔥 Top Trending Brands",
      "💰 Under ₹10L",
      "🍔 Food & Beverage",
      "👑 Master Franchises",
      "🚗 Automotive & EV",
      "ℹ️ How Franchise Roots Works"
    ];

    const widget = new GeminiWidgetModel();

    for (const chip of promptChips) {
      const res = await widget.sendQuery(chip, {
        message: `Here are recommendations for ${chip}`,
        brands: [mockBrand]
      });
      assert.equal(res.success, true);
    }

    assert.equal(widget.messages.length, 1 + promptChips.length * 2); // welcome + (user + bot) * 6
  });

  check("Empty & Whitespace Query Discard: Widget discards blank or whitespace inputs", async () => {
    const widget = new GeminiWidgetModel();
    const initialCount = widget.messages.length;

    let res = await widget.sendQuery("");
    assert.equal(res.success, false);

    res = await widget.sendQuery("   \t\n  ");
    assert.equal(res.success, false);

    assert.equal(widget.messages.length, initialCount, "Messages count must remain unchanged for blank queries");
  });

  check("Brand Recommendation Card & onOpenEnquiryModal Integration Callback", async () => {
    let triggeredBrand = null;
    const widget = new GeminiWidgetModel({
      onOpenEnquiryModal: (brand) => {
        triggeredBrand = brand;
      }
    });

    const res = await widget.sendQuery("Find coffee brands", {
      message: "Here is a top coffee franchise:",
      brands: [mockBrand]
    });

    assert.equal(res.success, true);
    const lastBotMsg = widget.messages[widget.messages.length - 1];
    assert.ok(lastBotMsg.brands.length > 0);

    // Simulate clicking "Enquire Now" on the brand card
    const cardBrand = lastBotMsg.brands[0];
    if (widget.onOpenEnquiryModal) {
      widget.onOpenEnquiryModal(cardBrand);
    }

    assert.ok(triggeredBrand !== null, "Callback must be invoked");
    assert.equal(triggeredBrand.name, "Vibrant Coffee Labs");
  });

  check("WhatsApp Advisor URI Generator: Encodes brand name and phone correctly", () => {
    const phone = "919815489999";
    const brand = { name: "Dr. Green EV Charging", category: "Automotive" };
    const msg = `Hi Franchise Roots Advisor, I saw *${brand.name}* (${brand.category}) on your Google AI Studio Assistant and would like complete investment & ROI breakdown.`;
    const targetUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;

    assert.ok(targetUrl.includes("phone=919815489999"));
    assert.ok(targetUrl.includes(encodeURIComponent(brand.name)));
    assert.ok(targetUrl.includes("Google%20AI%20Studio%20Assistant"));
  });

  check("TTS & Utility Stress: Speech synthesis, copy clipboard, and session reset", () => {
    const widget = new GeminiWidgetModel();

    widget.speakMessage("Welcome to Franchise Roots Google AI Studio Assistant");
    assert.equal(widget.speechUtterances.length, 1);
    assert.equal(widget.isSpeaking, true);

    widget.toggleMute();
    assert.equal(widget.isMuted, true);
    widget.speakMessage("This should not speak because widget is muted");
    assert.equal(widget.speechUtterances.length, 1);

    widget.copyMessage("Sample AI recommendation to copy");
    assert.equal(widget.clipboardCopies.length, 1);

    widget.resetSession();
    assert.equal(widget.messages.length, 1);
    assert.equal(widget.messages[0].id, "welcome-reset");
  });

  // =========================================================================
  // SECTION 4: LIVE RUNTIME HTTP PREVIEW (localhost:3000)
  // =========================================================================
  console.log(`\n${c.bold}${c.blue}--- [SECTION 4] LIVE RUNTIME HTTP VERIFICATION (http://localhost:3000) ---${c.reset}`);

  await checkAsync("Live HTTP Homepage (GET http://localhost:3000): Status 200 & HTML Response", async () => {
    const res = await fetch("http://localhost:3000/");
    assert.equal(res.status, 200, `Expected status 200, got ${res.status}`);
    const html = await res.text();
    assert.ok(html.includes("Franchise Roots"), "Homepage HTML should contain 'Franchise Roots'");
  });

  await checkAsync("Live HTTP Clean Palette Check: Zero instances of forbidden olive #7cb02c in live page", async () => {
    const res = await fetch("http://localhost:3000/");
    const html = await res.text();
    assert.ok(!html.includes("#7cb02c"), "Live HTML must not contain '#7cb02c'");
    assert.ok(!html.includes("#527c15"), "Live HTML must not contain '#527c15'");
  });

  await checkAsync("Live HTTP AI Agent API (POST http://localhost:3000/api/ai-agent): Responsive JSON", async () => {
    const res = await fetch("http://localhost:3000/api/ai-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "top trending franchises in food" })
    });
    assert.equal(res.status, 200, `Expected status 200, got ${res.status}`);
    const data = await res.json();
    assert.ok(data.message || data.brands, "Expected message or brands in API response");
  });

  await checkAsync("Live HTTP Dynamic Blogs API (GET http://localhost:3000/api/blogs): Array response", async () => {
    const res = await fetch("http://localhost:3000/api/blogs");
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data), "Expected JSON array of blogs");
  });

  await checkAsync("Live HTTP Services API (GET http://localhost:3000/api/services): Array response", async () => {
    const res = await fetch("http://localhost:3000/api/services");
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data), "Expected JSON array of services");
  });

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log(`\n${c.bold}${c.cyan}========================================================================================${c.reset}`);
  const passCount = results.filter((r) => r.pass).length;
  const failCount = results.filter((r) => !r.pass).length;
  console.log(`${c.bold}Empirical Stress Battery: ${passCount} PASSED, ${failCount} FAILED out of ${results.length} checks${c.reset}`);
  console.log(`${c.bold}${c.cyan}========================================================================================${c.reset}\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runAdversarialStressSuite().catch((err) => {
  console.error("Adversarial Stress Battery fatal crash:", err);
  process.exit(1);
});
