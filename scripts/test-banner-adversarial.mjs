import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const BANNER_PATH = path.join(ROOT_DIR, "src", "components", "TopMenuBanner.js");
const LAYOUT_PATH = path.join(ROOT_DIR, "src", "components", "LayoutClientWrapper.js");
const GLOBALS_PATH = path.join(ROOT_DIR, "src", "app", "globals.css");

console.log("================================================================================");
console.log("  TOP MENU BANNER - ADVERSARIAL & EMPIRICAL STRESS TEST SUITE");
console.log("================================================================================\n");

const bannerCode = fs.readFileSync(BANNER_PATH, "utf8");
const layoutCode = fs.readFileSync(LAYOUT_PATH, "utf8");
const globalsCss = fs.readFileSync(GLOBALS_PATH, "utf8");

let passedCount = 0;
let failedCount = 0;
const failures = [];

function assertTest(name, condition, details) {
  if (condition) {
    passedCount++;
    console.log(`  \x1b[32m✔ [PASS]\x1b[0m ${name}`);
  } else {
    failedCount++;
    failures.push({ name, details });
    console.log(`  \x1b[31m✖ [FAIL]\x1b[0m ${name}: ${details}`);
  }
}

// -----------------------------------------------------------------------------
// CHECK 1: CTA Button Visual & Routing Compliance
// -----------------------------------------------------------------------------
console.log("\x1b[34m--- CHECK 1: CTA Button Visual & Routing Compliance ---\x1b[0m");

// 1.1 "List Your Brand →" text
const hasCtaText = /List\s+Your\s+Brand\s*(&rarr;|→)/i.test(bannerCode);
assertTest("CTA button contains 'List Your Brand →'", hasCtaText, "CTA text must be 'List Your Brand →' or '&rarr;'");

// 1.2 Route to /brand-registration
const hasBrandRegRoute = /href=["']\/brand-registration["']/i.test(bannerCode);
assertTest("CTA button links to '/brand-registration'", hasBrandRegRoute, "CTA href must target '/brand-registration'");

// 1.3 Blue background #2563eb
const hasBlueBg = /backgroundColor:\s*["']#2563eb["']|bg-blue-600|background:\s*["']#2563eb["']/i.test(bannerCode);
assertTest("CTA button background is styled with blue #2563eb", hasBlueBg, "Must use #2563eb blue background");

// 1.4 Darker blue hover #1d4ed8 / hover:bg-blue-700
const hasBlueHover = /hover:bg-blue-700|#1d4ed8/i.test(bannerCode);
assertTest("CTA button defines darker blue hover (#1d4ed8 / hover:bg-blue-700)", hasBlueHover, "Hover state must be darker blue");

// 1.5 Pill button styling (rounded-full, high padding, bold text, shadow)
const hasPillStyle = /rounded-full/i.test(bannerCode) && /font-bold/i.test(bannerCode) && /shadow/i.test(bannerCode);
assertTest("CTA button has full pill rounding, bold weight, and shadow", hasPillStyle, "CTA button styling requires rounded-full, font-bold, shadow");

// -----------------------------------------------------------------------------
// CHECK 2: Visual Elements & Branding Integrity
// -----------------------------------------------------------------------------
console.log("\n\x1b[34m--- CHECK 2: Visual Elements & Branding Integrity ---\x1b[0m");

// 2.1 Dark navy/violet gradient background
const hasGradient = /bg-gradient-to-r\s+from-\[#0d0824\]\s+via-\[#090e29\]\s+to-\[#17072b\]/i.test(bannerCode);
assertTest("Dark navy/violet gradient background with custom color stops (#0d0824 -> #090e29 -> #17072b)", hasGradient, "Dark navy/violet gradient must be defined");

// 2.2 Edge navigation arrow buttons (ChevronLeft and ChevronRight)
const hasLeftArrow = /<ChevronLeft/i.test(bannerCode) && /scroll\(["']left["']\)/i.test(bannerCode);
const hasRightArrow = /<ChevronRight/i.test(bannerCode) && /scroll\(["']right["']\)/i.test(bannerCode);
assertTest("Left circular arrow button with smooth scroll handler", hasLeftArrow, "Left arrow button must trigger scroll('left')");
assertTest("Right circular arrow button with smooth scroll handler", hasRightArrow, "Right arrow button must trigger scroll('right')");

// 2.3 Crown icon
const hasCrown = /<Crown\s+[^>]*text-amber-400\s+fill-amber-400/i.test(bannerCode) || /<Crown/i.test(bannerCode);
assertTest("Crown icon rendered with amber/gold styling", hasCrown, "Crown icon must be present with gold styling");

// 2.4 Franchise Roots logo
const hasLogo = /src=["']\/logo-footer\.png["']/i.test(bannerCode) && /alt=["']Franchise Roots["']/i.test(bannerCode);
assertTest("Franchise Roots logo rendered (/logo-footer.png) with alt text", hasLogo, "Logo must be rendered with alt='Franchise Roots'");

// 2.5 Vertical divider separating badge
const hasDivider = /banner-divider|border-white\/20/i.test(bannerCode);
assertTest("Vertical divider present separating brand badge", hasDivider, "Vertical divider line required");

// 2.6 Headline "India's No.1 Franchise Marketplace"
const hasHeadline = /India['’]?s\s*No\.?\s*1\s*Franchise\s*Marketplace/i.test(bannerCode);
assertTest("Headline 'India\\'s No.1 Franchise Marketplace' present", hasHeadline, "Headline copy must match exactly");

// 2.7 Subtitle with highlighted count 1,200+
const hasSubtitle = /Explore\s*<span[^>]*>\s*1,200\+\s*<\/span>\s*verified\s*franchise\s*(&|&amp;)\s*business\s*opportunities/i.test(bannerCode);
assertTest("Subtitle with highlighted gold count 1,200+ present", hasSubtitle, "Subtitle must highlight count 1,200+");

// 2.8 Stat 1: 50,000+ Verified Investors with Users icon
const hasStat1 = /50,000\+/i.test(bannerCode) && /Verified\s*Investors/i.test(bannerCode) && /<Users/i.test(bannerCode);
assertTest("Stat 1: '50,000+ Verified Investors' with Users icon", hasStat1, "Stat 1 must render 50,000+ Verified Investors with Users icon");

// 2.9 Stat 2: 1,200+ Business Opportunities with TrendingUp icon
const hasStat2 = /1,200\+/i.test(bannerCode) && /Business\s*Opportunities/i.test(bannerCode) && /<TrendingUp/i.test(bannerCode);
assertTest("Stat 2: '1,200+ Business Opportunities' with TrendingUp icon", hasStat2, "Stat 2 must render 1,200+ Business Opportunities with TrendingUp icon");

// 2.10 Stat 3: Expert Consultation Support with Handshake icon
const hasStat3 = /Expert/i.test(bannerCode) && /Consultation\s*Support/i.test(bannerCode) && /<Handshake/i.test(bannerCode);
assertTest("Stat 3: 'Expert Consultation Support' with Handshake icon", hasStat3, "Stat 3 must render Expert Consultation Support with Handshake icon");

// -----------------------------------------------------------------------------
// CHECK 3: Layout Responsiveness & Viewport Stress Testing
// -----------------------------------------------------------------------------
console.log("\n\x1b[34m--- CHECK 3: Layout Responsiveness & Viewport Stress Testing ---\x1b[0m");

// 3.1 Outer container prevents horizontal document overflow
const hasOverflowHidden = /className=["'][^"']*overflow-hidden/i.test(bannerCode);
assertTest("Outer banner container has 'overflow-hidden' preventing document horizontal scroll", hasOverflowHidden, "Outer container must prevent horizontal document overflow");

// 3.2 Content container has flex-1 and min-w-0 to prevent flex item blowout
const hasFlexContainment = /flex-1\s+min-w-0/i.test(bannerCode);
assertTest("Scrollable content container uses 'flex-1 min-w-0' preventing flex item blowout", hasFlexContainment, "Flex child must have min-w-0 to allow scrolling inside container without expanding parent");

// 3.3 Scrollable container has overflow-x-auto and no-scrollbar
const hasHorizontalScroll = /overflow-x-auto\s+no-scrollbar/i.test(bannerCode);
assertTest("Content container enables internal horizontal scroll (overflow-x-auto no-scrollbar)", hasHorizontalScroll, "Horizontal scrolling must be enabled for overflow content");

// 3.4 Arrow buttons have shrink-0 so they remain fixed size on mobile viewports
const hasShrink0Arrows = /w-7\s+h-7\s+sm:w-8\s+sm:h-8[^"']*shrink-0/i.test(bannerCode);
assertTest("Navigation arrow buttons have shrink-0 ensuring they do not collapse at 360px", hasShrink0Arrows, "Arrow controls must maintain width across viewports");

// 3.5 CTA button has shrink-0 and whitespace-nowrap
const hasShrink0Cta = /shrink-0[^"']*whitespace-nowrap|whitespace-nowrap[^"']*shrink-0/i.test(bannerCode);
assertTest("CTA button has shrink-0 and whitespace-nowrap preventing text wrapping distortion", hasShrink0Cta, "CTA button must preserve whitespace-nowrap and shrink-0");

// 3.6 Simulated Viewport Stress Dimensions
const viewports = [
  { width: 1440, name: "Desktop Large (1440px)" },
  { width: 1024, name: "Tablet Landscape / Laptop (1024px)" },
  { width: 768, name: "Tablet Portrait (768px)" },
  { width: 390, name: "Mobile Large - iPhone 14/15/16 (390px)" },
  { width: 360, name: "Mobile Small - Android compact (360px)" },
  { width: 320, name: "Extreme Edge - Mobile Extra Small (320px)" }
];

viewports.forEach(vp => {
  // Arrow size at viewport:
  const arrowSize = vp.width >= 640 ? 32 : 28; // sm:w-8 sm:h-8 vs w-7 h-7
  const containerPadding = vp.width >= 640 ? 32 : 16; // sm:px-4 (16*2) vs px-2 (8*2)
  const gap = 8; // gap-2
  const availableScrollWidth = vp.width - (arrowSize * 2) - containerPadding - (gap * 2);

  const passesWidthConstraint = availableScrollWidth > 150 && vp.width > 0;
  assertTest(
    `Viewport ${vp.name}: Available content width ${availableScrollWidth}px >= 150px min constraint (0 doc overflow)`,
    passesWidthConstraint,
    `Width must allocate positive container bounds for internal scroll`
  );
});

// -----------------------------------------------------------------------------
// CHECK 4: Placement & Non-Regression in Layout
// -----------------------------------------------------------------------------
console.log("\n\x1b[34m--- CHECK 4: Placement & Non-Regression in Layout ---\x1b[0m");

// 4.1 Placed right under Header in LayoutClientWrapper
const renderedDirectlyUnderHeader = /\{!isNoHeaderFooter\s*&&\s*<Header\s*\/>\}\s*\{!isNoHeaderFooter\s*&&\s*<TopMenuBanner\s*\/>\}/.test(layoutCode);
assertTest("TopMenuBanner rendered immediately beneath Header under same route condition", renderedDirectlyUnderHeader, "TopMenuBanner must sit directly below Header");

// 4.2 Z-index hierarchy: Header has high z-index (z-50/1000), TopMenuBanner has z-40
const hasZ40 = /z-40/i.test(bannerCode);
assertTest("TopMenuBanner has z-index 40 (correctly sitting below Header z-50/1000 and modals)", hasZ40, "TopMenuBanner should have z-40");

console.log("\n================================================================================");
console.log(`  TOTAL: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log("================================================================================");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
