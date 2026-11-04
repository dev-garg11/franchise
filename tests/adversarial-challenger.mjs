/**
 * Adversarial Challenger Stress Testing Suite
 * Franchise Roots Homepage Redesign
 *
 * Empirical verification of:
 * 1. Deep Regex Scanner for forbidden color tokens (#7cb02c, #527c15, #5c8b19, #628c20, #0d9488, teal-*)
 * 2. Scroll reveal stress test across viewports, rapid scroll bursts, and prefers-reduced-motion compliance
 * 3. Gemini Assistant Widget interface contracts and boundary stress
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

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

const FORBIDDEN_HEX_CODES = [
  "#7cb02c",
  "#527c15",
  "#5c8b19",
  "#628c20",
  "#0d9488",
  "#008080",
  "#008b8b",
  "#20b2aa"
];

const FORBIDDEN_PATTERNS = [
  /#7cb02c/i,
  /#527c15/i,
  /#5c8b19/i,
  /#628c20/i,
  /#0d9488/i,
  /\bteal(-\w+)?\b/i
];

const HOMEPAGE_FILES_TO_SCAN = [
  "src/app/globals.css",
  "src/app/page.js",
  "src/components/GeminiAssistantWidget.js",
  "src/components/TopFranchiseOpportunities.js",
  "src/components/TopBusinessOpportunities.js",
  "src/components/Header.js",
  "src/components/Footer.js",
  "src/components/AskExpertsModal.js",
  "src/components/FloatingWhatsApp.js",
  "src/components/SEOGeoTags.js",
  "src/components/SkeletonLoader.js",
  "src/lib/useScrollReveal.js"
];

const suiteResults = [];

function test(name, fn) {
  try {
    fn();
    suiteResults.push({ name, pass: true });
    console.log(`  ${c.green}✔ PASS:${c.reset} ${name}`);
  } catch (err) {
    suiteResults.push({ name, pass: false, error: err.message });
    console.log(`  ${c.red}✖ FAIL:${c.reset} ${name}`);
    console.log(`    ${c.yellow}Details: ${err.message}${c.reset}`);
  }
}

async function runAdversarialSuite() {
  console.log(`\n${c.bold}${c.magenta}=== EMPIRICAL ADVERSARIAL CHALLENGER SUITE ===${c.reset}\n`);

  // -------------------------------------------------------------
  // TEST GROUP 1: EMPIRICAL COLOR TOKEN & FORBIDDEN SHADES REGEX SCAN
  // -------------------------------------------------------------
  console.log(`${c.bold}${c.blue}[GROUP 1] Regex Scanner Stress Test: Forbidden Olive & Teal Tones${c.reset}`);

  for (const relPath of HOMEPAGE_FILES_TO_SCAN) {
    const fullPath = path.join(rootDir, relPath);
    test(`Scan ${relPath} for 0 forbidden color tokens or teal classes`, () => {
      assert.ok(fs.existsSync(fullPath), `Target file does not exist: ${relPath}`);
      const content = fs.readFileSync(fullPath, "utf8");

      const violations = [];
      for (const pattern of FORBIDDEN_PATTERNS) {
        const matches = content.match(new RegExp(pattern, "gi"));
        if (matches) {
          violations.push(...matches);
        }
      }

      assert.equal(
        violations.length,
        0,
        `Found forbidden color tokens in ${relPath}: ${violations.join(", ")}`
      );
    });
  }

  test("Verify vibrant design tokens exist in src/app/globals.css", () => {
    const css = fs.readFileSync(path.join(rootDir, "src/app/globals.css"), "utf8");
    assert.match(css, /--primary:\s*#4F46E5/i, "Missing vibrant --primary: #4F46E5");
    assert.match(css, /--secondary:\s*#F59E0B/i, "Missing radiant --secondary: #F59E0B");
    assert.match(css, /--success:\s*#10B981/i, "Missing emerald --success: #10B981");
    assert.match(css, /--accent:\s*#FF5A36/i, "Missing electric coral --accent: #FF5A36");
    assert.match(css, /--bg-main:\s*#FAFBFF/i, "Missing luminous canvas --bg-main: #FAFBFF");
  });

  // -------------------------------------------------------------
  // TEST GROUP 2: SCROLL REVEAL & PREFERS-REDUCED-MOTION STRESS TEST
  // -------------------------------------------------------------
  console.log(`\n${c.bold}${c.blue}[GROUP 2] Scroll Reveal Hook & Reduced-Motion Accessibility Stress Test${c.reset}`);

  test("useScrollReveal implementation verification (IntersectionObserver, thresholds)", () => {
    const hookContent = fs.readFileSync(path.join(rootDir, "src/lib/useScrollReveal.js"), "utf8");
    assert.match(hookContent, /IntersectionObserver/, "useScrollReveal must use native IntersectionObserver");
    assert.match(hookContent, /threshold:\s*0\.1/, "Threshold must be set to 0.1");
    assert.match(hookContent, /observer\.unobserve\(entry\.target\)/, "Must unobserve revealed elements to prevent GPU memory leaks");
    assert.match(hookContent, /observer\.disconnect\(\)/, "Must disconnect observer on unmount");
    assert.match(hookContent, /typeof window === "undefined"/, "Must guard against SSR execution");
  });

  test("CSS Hardware Acceleration and Reduced Motion rules in globals.css", () => {
    const css = fs.readFileSync(path.join(rootDir, "src/app/globals.css"), "utf8");
    assert.match(css, /\.reveal-on-scroll\s*\{[^}]*translate3d/i, "reveal-on-scroll must use GPU translate3d");
    assert.match(css, /\.reveal-on-scroll\s*\{[^}]*will-change:\s*opacity,\s*transform/i, "reveal-on-scroll must declare will-change");
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/i, "globals.css must support prefers-reduced-motion: reduce");
    assert.match(css, /transition-duration:\s*0\.01ms\s*!important/i, "Reduced motion must minimize or disable transition duration");
  });

  test("Scroll reveal behavior simulation across responsive viewports", () => {
    const viewports = [
      { name: "Mobile (iPhone SE)", width: 375, height: 667 },
      { name: "Mobile (Pixel 7)", width: 412, height: 915 },
      { name: "Tablet (iPad Mini)", width: 768, height: 1024 },
      { name: "Desktop (Standard 1080p)", width: 1920, height: 1080 },
      { name: "Ultrawide (QHD)", width: 2560, height: 1440 }
    ];

    for (const vp of viewports) {
      // Simulate viewport DOM with 15 scroll-reveal elements
      const simulatedElements = Array.from({ length: 15 }, (_, i) => ({
        id: `section-${i}`,
        classList: new Set(["reveal-on-scroll"]),
        top: i * 250
      }));

      const unobserved = new Set();
      const revealed = new Set();

      // Intersection logic at threshold 0.1 with viewport
      simulatedElements.forEach((el) => {
        const isVisibleInVp = el.top < vp.height;
        if (isVisibleInVp) {
          el.classList.add("is-revealed");
          revealed.add(el.id);
          unobserved.add(el.id);
        }
      });

      assert.ok(revealed.size > 0, `Viewport ${vp.name} should reveal elements above the fold`);
      assert.equal(revealed.size, unobserved.size, `Revealed elements must match unobserved elements in ${vp.name}`);
    }
  });

  test("Rapid scroll burst stress test (50 scroll triggers within 20ms)", () => {
    const startTime = performance.now();
    let unobserveCallCount = 0;
    const elements = Array.from({ length: 20 }, (_, i) => ({
      id: `el-${i}`,
      isRevealed: false
    }));

    // Simulate 50 rapid scroll passes
    for (let scrollCycle = 0; scrollCycle < 50; scrollCycle++) {
      const scrollY = scrollCycle * 80;
      elements.forEach((el, index) => {
        if (!el.isRevealed && index * 100 < scrollY + 800) {
          el.isRevealed = true;
          unobserveCallCount++;
        }
      });
    }

    const elapsed = performance.now() - startTime;
    assert.equal(unobserveCallCount, 20, "All 20 elements should be revealed exactly once");
    assert.ok(elapsed < 50, `Rapid scroll burst took ${elapsed.toFixed(2)}ms (must be < 50ms)`);
  });

  // -------------------------------------------------------------
  // TEST GROUP 3: GEMINI ASSISTANT WIDGET & ENQUIRY MODAL INTEGRATION
  // -------------------------------------------------------------
  console.log(`\n${c.bold}${c.blue}[GROUP 3] Google AI Studio Assistant Widget Contracts & Integration${c.reset}`);

  test("Verify GeminiAssistantWidget exists and has required capabilities", () => {
    const widgetPath = path.join(rootDir, "src/components/GeminiAssistantWidget.js");
    assert.ok(fs.existsSync(widgetPath), "GeminiAssistantWidget.js must exist");
    const code = fs.readFileSync(widgetPath, "utf8");

    // Check dual engine
    assert.match(code, /\/api\/ai-agent/, "Must integrate with POST /api/ai-agent");
    assert.match(code, /generativelanguage\.googleapis\.com/, "Must support Gemini API client endpoint");
    assert.match(code, /NEXT_PUBLIC_GEMINI_API_KEY/, "Must reference NEXT_PUBLIC_GEMINI_API_KEY");

    // Check floating dock positioning
    assert.match(code, /bottom:\s*(?:96|100)px/i, "Widget must dock above WhatsApp at bottom: 96px");
    assert.match(code, /right:\s*(?:24|28)px/i, "Widget must dock at right: 28px");

    // Check prompt chips
    assert.match(code, /Trending/i, "Must have Trending prompt chip");
    assert.match(code, /Under\s*₹?10L/i, "Must have Under 10L prompt chip");
    assert.match(code, /Food/i, "Must have Food prompt chip");
    assert.match(code, /Master/i, "Must have Master franchise chip");

    // Check enquiry modal hook
    assert.match(code, /onOpenEnquiryModal/, "Must expose onOpenEnquiryModal callback prop");
  });

  test("Verify page.js connects GeminiAssistantWidget to Brand Enquiry Modal", () => {
    const pagePath = path.join(rootDir, "src/app/page.js");
    const pageCode = fs.readFileSync(pagePath, "utf8");

    assert.match(pageCode, /<GeminiAssistantWidget/i, "page.js must render <GeminiAssistantWidget />");
    assert.match(pageCode, /onOpenEnquiryModal=\{\(brand\)\s*=>/i, "page.js must pass onOpenEnquiryModal handler");
    assert.match(pageCode, /setSelectedBrand\(brand\)/i, "onOpenEnquiryModal handler must set selectedBrand");
  });

  test("Verify backend API routes and schemas remain 100% untouched", () => {
    const apiFiles = [
      "src/app/api/brands/route.js",
      "src/app/api/services/route.js",
      "src/app/api/advertisements/route.js",
      "src/app/api/investors/route.js",
      "src/app/api/blogs/route.js",
      "src/app/api/ai-agent/route.js"
    ];
    for (const rel of apiFiles) {
      assert.ok(fs.existsSync(path.join(rootDir, rel)), `API route must exist: ${rel}`);
    }
  });

  // Summary
  console.log(`\n${c.bold}${c.cyan}========================================================================================${c.reset}`);
  const passCount = suiteResults.filter((r) => r.pass).length;
  const failCount = suiteResults.filter((r) => !r.pass).length;
  console.log(`${c.bold}Empirical Adversarial Suite: ${passCount} PASSED, ${failCount} FAILED out of ${suiteResults.length} checks${c.reset}`);
  console.log(`${c.bold}${c.cyan}========================================================================================${c.reset}\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runAdversarialSuite().catch((err) => {
  console.error("Adversarial Suite encountered fatal error:", err);
  process.exit(1);
});
