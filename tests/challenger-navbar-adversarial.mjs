/**
 * =============================================================================
 * EMPIRICAL ADVERSARIAL CHALLENGER TEST SUITE
 * Redesigned Header/Navbar (src/components/Header.js) & TopMenuBanner.js
 * =============================================================================
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const HEADER_PATH = path.join(ROOT_DIR, "src", "components", "Header.js");
const BANNER_PATH = path.join(ROOT_DIR, "src", "components", "TopMenuBanner.js");
const GLOBALS_CSS_PATH = path.join(ROOT_DIR, "src", "app", "globals.css");
const LAYOUT_PATH = path.join(ROOT_DIR, "src", "components", "LayoutClientWrapper.js");

const headerCode = fs.readFileSync(HEADER_PATH, "utf8");
const bannerCode = fs.readFileSync(BANNER_PATH, "utf8");
const globalsCss = fs.readFileSync(GLOBALS_CSS_PATH, "utf8");
const layoutCode = fs.readFileSync(LAYOUT_PATH, "utf8");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function assertTest(id, category, description, condition, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ [PASS]\x1b[0m [${id}] ${category} - ${description}`);
  } else {
    failedTests++;
    failureDetails.push({ id, category, description, details });
    console.log(`  \x1b[31m✖ [FAIL]\x1b[0m [${id}] ${category} - ${description}`);
    console.log(`         \x1b[90m↳ Issue: ${details}\x1b[0m`);
  }
}

console.log("\n================================================================================");
console.log("  EMPIRICAL ADVERSARIAL STRESS TEST SUITE: HEADER & NAVBAR REDESIGN");
console.log("================================================================================\n");

// =============================================================================
// MANDATE AREA 1: Search Modal Opening Contracts & Triggers
// =============================================================================
console.log("\x1b[1m\x1b[34m=== MANDATE AREA 1: Search Modal Opening Contracts & Triggers ===\x1b[0m");

{
  // 1.1 Check if a circular search button exists in the desktop header nav-actions
  // Extract nav-actions block
  const navActionsMatch = headerCode.match(/<div\s+className=["']nav-actions["']>([\s\S]*?)<\/nav>/i);
  const navActionsHtml = navActionsMatch ? navActionsMatch[1] : "";
  
  const hasDesktopSearchButton = /<button[^>]*search-circle-btn[^>]*>/i.test(navActionsHtml) ||
    (/<button[^>]*onClick=\{[^}]*setSearchModalOpen\s*\(\s*(?:true|prev\s*=>\s*!prev)\s*\)[^}]*\}[^>]*>[\s\S]*?<Search/i.test(navActionsHtml));

  assertTest(
    "ADV-1.1",
    "Search Modal Triggers",
    "Circular Search Button exists inside desktop nav-actions",
    hasDesktopSearchButton,
    "CRITICAL DEFECT: No circular Search trigger button exists in <div className='nav-actions'> in Header.js. Desktop users cannot click to search!"
  );

  // 1.2 Check if .search-circle-btn CSS class is attached in Header.js
  const usesSearchCircleClass = headerCode.includes("search-circle-btn");
  assertTest(
    "ADV-1.2",
    "Search Modal Triggers",
    "Header.js references the .search-circle-btn class defined in globals.css",
    usesSearchCircleClass,
    "globals.css defines .search-circle-btn specifically for header actions, but Header.js never uses this class."
  );

  // 1.3 Check if search trigger exists in mobile bottom nav
  const hasMobileBottomSearch = /mobile-bottom-nav-item[\s\S]*?onClick=\{[^}]*setSearchModalOpen\(true\)[^}]*\}[\s\S]*?<Search/i.test(headerCode);
  assertTest(
    "ADV-1.3",
    "Search Modal Triggers",
    "Mobile bottom nav contains a Search trigger button with onClick setSearchModalOpen(true)",
    hasMobileBottomSearch,
    "Mobile bottom nav must provide search modal trigger"
  );

  // 1.4 Test Keyboard Shortcut: Ctrl+K / Meta+K
  const hasCtrlK = /\(e\.ctrlKey\s*\|\|\s*e\.metaKey\)\s*&&\s*e\.key\s*===\s*["']k["']/i.test(headerCode);
  assertTest(
    "ADV-1.4",
    "Search Modal Triggers",
    "Header attaches keydown listener for (Ctrl|Meta) + 'k' shortcut",
    hasCtrlK,
    "Keyboard shortcut Ctrl+K / Meta+K must toggle search modal"
  );

  // 1.5 Adversarial Test: Case-sensitivity on Ctrl+K (Caps Lock / Shift+K)
  const handlesCapsOrShiftK = /e\.key(?:\.toLowerCase\(\))?\s*===\s*["']k["']/i.test(headerCode) && headerCode.includes("toLowerCase");
  assertTest(
    "ADV-1.5",
    "Search Modal Triggers",
    "Keyboard shortcut handles Shift+K or CapsLock gracefully (e.key.toLowerCase() === 'k')",
    handlesCapsOrShiftK,
    "e.key strictly checks === 'k', ignoring 'K' when CapsLock is on or Shift is pressed"
  );

  // 1.6 Keyboard shortcut calls e.preventDefault()
  const hasPreventDefault = /e\.key\s*===\s*["']k["'][\s\S]*?e\.preventDefault\(\)/i.test(headerCode);
  assertTest(
    "ADV-1.6",
    "Search Modal Triggers",
    "Ctrl+K handler calls e.preventDefault() to avoid browser search default",
    hasPreventDefault,
    "Must prevent default browser Ctrl+K action"
  );
}

// =============================================================================
// MANDATE AREA 2: Escape Key Handling & Backdrop Dismissal
// =============================================================================
console.log("\n\x1b[1m\x1b[34m=== MANDATE AREA 2: Escape Key Handling & Backdrop Dismissal ===\x1b[0m");

{
  // 2.1 Escape key handler in keydown listener
  const hasEscapeHandler = /e\.key\s*===\s*["']Escape["'][\s\S]*?setSearchModalOpen\(false\)/i.test(headerCode);
  assertTest(
    "ADV-2.1",
    "Search Modal Dismissal",
    "Keydown listener dismisses search modal on Escape key press",
    hasEscapeHandler,
    "Escape key must set searchModalOpen to false"
  );

  // 2.2 Search modal overlay click dismisses modal
  const hasBackdropDismiss = /className=["']search-modal-overlay["'][^>]*onClick=\{[^}]*setSearchModalOpen\(false\)[^}]*\}/i.test(headerCode);
  assertTest(
    "ADV-2.2",
    "Search Modal Dismissal",
    "search-modal-overlay click triggers setSearchModalOpen(false)",
    hasBackdropDismiss,
    "Overlay backdrop must close modal on click"
  );

  // 2.3 Modal content stops click propagation
  const contentStopsPropagation = /className=["']search-modal-content["'][^>]*onClick=\{[^}]*e\.stopPropagation\(\)[^}]*\}/i.test(headerCode);
  assertTest(
    "ADV-2.3",
    "Search Modal Dismissal",
    "search-modal-content stops click propagation to prevent premature dismissal",
    contentStopsPropagation,
    "Clicking inside search dialog must not trigger overlay backdrop close"
  );

  // 2.4 Dedicated close button exists and functions
  const hasDedicatedCloseBtn = /className=["']search-modal-close-btn["'][^>]*onClick=\{[^}]*setSearchModalOpen\(false\)[^}]*\}[\s\S]*?<X/i.test(headerCode);
  assertTest(
    "ADV-2.4",
    "Search Modal Dismissal",
    "Dedicated search-modal-close-btn renders X icon and sets searchModalOpen(false)",
    hasDedicatedCloseBtn,
    "Search modal requires explicit close button"
  );

  // 2.5 Query submission dismisses modal before navigation
  const submitDismissesModal = /handleSearchSubmit[\s\S]*?setSearchModalOpen\(false\)[\s\S]*?router\.push/i.test(headerCode);
  assertTest(
    "ADV-2.5",
    "Search Modal Dismissal",
    "Search submission dismisses modal prior to navigating to /brands",
    submitDismissesModal,
    "Submitting search must close modal before redirect"
  );
}

// =============================================================================
// MANDATE AREA 3: Auth Modal Event Dispatching ('open-auth-modal')
// =============================================================================
console.log("\n\x1b[1m\x1b[34m=== MANDATE AREA 3: Auth Modal Event Dispatching ('open-auth-modal') ===\x1b[0m");

{
  // 3.1 Login button dispatches open-auth-modal with tab: "login"
  const loginDispatchesAuth = /open-auth-modal[\s\S]*?tab:\s*["']login["']/i.test(headerCode);
  assertTest(
    "ADV-3.1",
    "Auth Modal Dispatching",
    "Login button dispatches 'open-auth-modal' CustomEvent with { tab: 'login' }",
    loginDispatchesAuth,
    "Login trigger must dispatch open-auth-modal with login tab"
  );

  // 3.2 Register button dispatches open-auth-modal with tab: "register"
  const registerDispatchesAuth = /open-auth-modal[\s\S]*?tab:\s*["']register["']/i.test(headerCode);
  assertTest(
    "ADV-3.2",
    "Auth Modal Dispatching",
    "Register button dispatches 'open-auth-modal' CustomEvent with { tab: 'register' }",
    registerDispatchesAuth,
    "Register trigger must dispatch open-auth-modal with register tab"
  );

  // 3.3 LayoutClientWrapper listens to 'open-auth-modal' and updates modal state
  const layoutListensAuth = /window\.addEventListener\(["']open-auth-modal["'],\s*handleOpenAuth\)/i.test(layoutCode) &&
    /setIsAuthModalOpen\(true\)/i.test(layoutCode) &&
    /setAuthModalTab\(e\.detail\?\.tab\s*\|\|\s*["']login["']\)/i.test(layoutCode);
  assertTest(
    "ADV-3.3",
    "Auth Modal Dispatching",
    "LayoutClientWrapper listens to 'open-auth-modal' and sets isOpen + tab correctly",
    layoutListensAuth,
    "LayoutClientWrapper must handle open-auth-modal event"
  );

  // 3.4 Adversarial Test: Mobile Drawer Auth Button Visibility
  // In Header.js line 482: {!isAdmin && !isInvestor && !isBrand && null}
  // And .desktop-only-auth has display: none !important in mobile media query.
  // Check if unauthenticated mobile users have a Login/Register button in the mobile drawer (nav-container)
  const hasMobileDrawerAuth = /nav-links[\s\S]*?!isAdmin[\s\S]*?mobile-auth-item/i.test(headerCode);
  assertTest(
    "ADV-3.4",
    "Auth Modal Dispatching",
    "Mobile hamburger drawer exposes Login/Register actions for unauthenticated visitors",
    hasMobileDrawerAuth,
    "DEFECT: In Header.js line 482, mobile auth links are set to 'null' and action buttons use .desktop-only-auth (hidden on mobile). Mobile users opening hamburger drawer see zero auth buttons!"
  );

  // 3.5 Unauthenticated Profile button on mobile bottom nav dispatches login modal
  const mobileProfileTriggersLogin = /mobile-bottom-nav-item[\s\S]*?isAdmin\s*\|\|\s*isInvestor\s*\|\|\s*isBrand[\s\S]*?open-auth-modal[\s\S]*?tab:\s*["']login["']/i.test(headerCode);
  assertTest(
    "ADV-3.5",
    "Auth Modal Dispatching",
    "Mobile bottom nav unauthenticated profile click dispatches login modal",
    mobileProfileTriggersLogin,
    "Clicking Profile in bottom nav when unauthenticated must open login modal"
  );
}

// =============================================================================
// MANDATE AREA 4: Authenticated Session Simulation & User Avatar/Dropdown/Logout
// =============================================================================
console.log("\n\x1b[1m\x1b[34m=== MANDATE AREA 4: Authenticated Session Simulation ===\x1b[0m");

{
  // Simulated avatar & greeting generator function mirroring Header.js
  function simulateUserSession(auth) {
    const isAdmin = auth.adminLoggedIn === "true";
    const isInvestor = auth.investorLoggedIn === "true";
    const isBrand = auth.brandLoggedIn === "true";
    const investorName = auth.investorName || "Investor";
    const brandName = auth.brandName || "Brand Owner";

    const avatar = isAdmin ? "AD" : isInvestor ? investorName.substring(0, 2).toUpperCase() : brandName.substring(0, 2).toUpperCase();
    const greeting = `Hi, ${isAdmin ? "Admin" : isInvestor ? investorName.split(" ")[0] : brandName.split(" ")[0]}`;
    const signedInAs = isAdmin ? "System Administrator" : isInvestor ? investorName : brandName;
    const dashboardRoute = isAdmin ? "/admin" : isInvestor ? "/investor-panel" : "/brand-panel";

    return { avatar, greeting, signedInAs, dashboardRoute };
  }

  // 4.1 Admin Session
  const adminRes = simulateUserSession({ adminLoggedIn: "true" });
  assertTest(
    "ADV-4.1",
    "Authenticated Session",
    "Admin session computes avatar 'AD' and 'Hi, Admin'",
    adminRes.avatar === "AD" && adminRes.greeting === "Hi, Admin" && adminRes.dashboardRoute === "/admin",
    "Admin state calculation failed"
  );

  // 4.2 Investor Session
  const invRes = simulateUserSession({ investorLoggedIn: "true", investorName: "Vikram Malhotra" });
  assertTest(
    "ADV-4.2",
    "Authenticated Session",
    "Investor 'Vikram Malhotra' computes avatar 'VI' and 'Hi, Vikram'",
    invRes.avatar === "VI" && invRes.greeting === "Hi, Vikram" && invRes.dashboardRoute === "/investor-panel",
    "Investor state calculation failed"
  );

  // 4.3 Brand Owner Session
  const brandRes = simulateUserSession({ brandLoggedIn: "true", brandName: "Puma India" });
  assertTest(
    "ADV-4.3",
    "Authenticated Session",
    "Brand 'Puma India' computes avatar 'PU' and 'Hi, Puma'",
    brandRes.avatar === "PU" && brandRes.greeting === "Hi, Puma" && brandRes.dashboardRoute === "/brand-panel",
    "Brand state calculation failed"
  );

  // 4.4 Boundary name tests (single letter, missing name, special chars)
  const edgeRes1 = simulateUserSession({ investorLoggedIn: "true", investorName: "K" });
  const edgeRes2 = simulateUserSession({ brandLoggedIn: "true", brandName: "" });
  const edgeRes3 = simulateUserSession({ investorLoggedIn: "true", investorName: "Dr. A. P. J. Kalam" });
  
  const edgeCasesPassed = 
    edgeRes1.avatar === "K" && edgeRes1.greeting === "Hi, K" &&
    edgeRes2.avatar === "BR" && edgeRes2.greeting === "Hi, Brand" &&
    edgeRes3.avatar === "DR" && edgeRes3.greeting === "Hi, Dr.";

  assertTest(
    "ADV-4.4",
    "Authenticated Session",
    "User avatar & greeting handle edge names (single letter, empty fallback, prefixes)",
    edgeCasesPassed,
    "Boundary names failed avatar substring or greeting split"
  );

  // 4.5 Logout Handler verification
  const logoutRemovesAllKeys = [
    "adminLoggedIn", "investorLoggedIn", "brandLoggedIn",
    "investorEmail", "investorName", "brandEmail", "brandId", "brandName"
  ].every(key => headerCode.includes(`localStorage.removeItem("${key}")`));

  assertTest(
    "ADV-4.5",
    "Authenticated Session",
    "handleLogout removes all 8 authentication & user profile keys from localStorage",
    logoutRemovesAllKeys,
    "handleLogout must clear all localStorage auth items"
  );

  // 4.6 Outside Click listener handles user dropdown
  const handlesUserDropdownClickOutside = /userDropdownRef\.current[\s\S]*?!userDropdownRef\.current\.contains\(event\.target\)[\s\S]*?setUserDropdownOpen\(false\)/i.test(headerCode);
  assertTest(
    "ADV-4.6",
    "Authenticated Session",
    "userDropdownRef outside click listener automatically dismisses user dropdown panel",
    handlesUserDropdownClickOutside,
    "Must dismiss user profile dropdown when clicking outside"
  );
}

// =============================================================================
// MANDATE AREA 5: Mobile Drawer Toggle & Small Screen Simulation
// =============================================================================
console.log("\n\x1b[1m\x1b[34m=== MANDATE AREA 5: Mobile Drawer Toggle & Small Screen Simulation ===\x1b[0m");

{
  // 5.1 Mobile menu hamburger button toggles mobileMenuOpen
  const hasHamburgerToggle = /mobile-menu-toggle[\s\S]*?onClick=\{[^}]*setMobileMenuOpen\(!mobileMenuOpen\)[^}]*\}/i.test(headerCode);
  assertTest(
    "ADV-5.1",
    "Mobile Drawer",
    "Hamburger toggle button toggles mobileMenuOpen state on click",
    hasHamburgerToggle,
    "Mobile menu toggle must toggle mobileMenuOpen"
  );

  // 5.2 Hamburger button switches icon between Menu and X
  const hasToggleIcons = /mobile-menu-toggle[\s\S]*?mobileMenuOpen\s*\?\s*<X\s+size=\{22\}\s*\/>\s*:\s*<Menu\s+size=\{22\}\s*\/>/i.test(headerCode);
  assertTest(
    "ADV-5.2",
    "Mobile Drawer",
    "Hamburger toggle displays Menu icon when closed, X icon when open",
    hasToggleIcons,
    "Hamburger icon must toggle between Menu and X"
  );

  // 5.3 Nav container toggles .open class based on mobileMenuOpen
  const navContainerTogglesOpen = /className=\{`nav-container\s+\$\{mobileMenuOpen\s*\?\s*["']open["']\s*:\s*["']["']\}`\}/i.test(headerCode);
  assertTest(
    "ADV-5.3",
    "Mobile Drawer",
    "nav-container applies '.open' CSS class when mobileMenuOpen is true",
    navContainerTogglesOpen,
    "nav-container must dynamically apply .open class"
  );

  // 5.4 Primary nav links auto-close mobile drawer on click
  const primaryLinksCloseDrawer = [
    /Home[\s\S]*?onClick=\{[^}]*setMobileMenuOpen\(false\)[^}]*\}/i,
    /Brands[\s\S]*?onClick=\{[^}]*setMobileMenuOpen\(false\)[^}]*\}/i,
    /Master Franchise[\s\S]*?onClick=\{[^}]*setMobileMenuOpen\(false\)[^}]*\}/i,
    /Services[\s\S]*?onClick=\{[^}]*setMobileMenuOpen\(false\)[^}]*\}/i,
    /About Us[\s\S]*?onClick=\{[^}]*setMobileMenuOpen\(false\)[^}]*\}/i,
    /Blogs[\s\S]*?onClick=\{[^}]*setMobileMenuOpen\(false\)[^}]*\}/i,
    /Contact[\s\S]*?onClick=\{[^}]*setMobileMenuOpen\(false\)[^}]*\}/i
  ].every(regex => regex.test(headerCode));

  assertTest(
    "ADV-5.4",
    "Mobile Drawer",
    "All primary navigation links invoke setMobileMenuOpen(false) to auto-close drawer",
    primaryLinksCloseDrawer,
    "All navigation links in mobile drawer must close the drawer on click"
  );

  // 5.5 Adversarial Test: Solutions mega dropdown on touch devices
  // Look at lines 378-384: onMouseEnter and onMouseLeave, NO onClick on button
  const solutionsHasTouchClick = /Solutions[\s\S]*?onClick=\{[^}]*setActiveDropdown/i.test(headerCode) ||
    /button[^>]*onClick=\{[^}]*setActiveDropdown[^}]*\}[^>]*>[\s\S]*?Solutions/i.test(headerCode);
  assertTest(
    "ADV-5.5",
    "Mobile Drawer",
    "Solutions dropdown provides touch-friendly click/tap handler for mobile users",
    solutionsHasTouchClick,
    "DEFECT: Solutions dropdown relies strictly on onMouseEnter/onMouseLeave hover events. Touch mobile devices cannot hover, making Solutions sub-items inaccessible in mobile drawer!"
  );
}

// =============================================================================
// MANDATE AREA 6: Routing Link Destinations
// =============================================================================
console.log("\n\x1b[1m\x1b[34m=== MANDATE AREA 6: Routing Link Destinations ===\x1b[0m");

{
  const expectedRoutes = [
    { name: "Home", href: "/", regex: /<Link[^>]*href=["']\/["'][^>]*>[\s\S]*?Home[\s\S]*?<\/Link>/i },
    { name: "Brands", href: "/brands", regex: /<Link[^>]*href=["']\/brands["'][^>]*>[\s\S]*?Brands[\s\S]*?<\/Link>/i },
    { name: "Master Franchise", href: "/master-franchising", regex: /<Link[^>]*href=["']\/master-franchising["'][^>]*>[\s\S]*?Master Franchise[\s\S]*?<\/Link>/i },
    { name: "Services", href: "/services", regex: /<Link[^>]*href=["']\/services["'][^>]*>[\s\S]*?Services[\s\S]*?<\/Link>/i },
    { name: "About Us", href: "/about-us", regex: /<Link[^>]*href=["']\/about-us["'][^>]*>[\s\S]*?About Us[\s\S]*?<\/Link>/i },
    { name: "Blogs", href: "/blogs", regex: /<Link[^>]*href=["']\/blogs["'][^>]*>[\s\S]*?Blogs[\s\S]*?<\/Link>/i },
    { name: "Contact", href: "/contact", regex: /<Link[^>]*href=["']\/contact["'][^>]*>[\s\S]*?Contact[\s\S]*?<\/Link>/i },
    { name: "Brand Registration", href: "/brand-registration", regex: /brand-registration/i }
  ];

  expectedRoutes.forEach((route, idx) => {
    const passed = route.regex.test(headerCode);
    assertTest(
      `ADV-6.${idx + 1}`,
      "Routing Links",
      `Route '${route.name}' targets '${route.href}' correctly`,
      passed,
      `Route destination mismatch for ${route.name}`
    );
  });

  // 6.9 Active Indicator Logic Coverage
  const activeClassLogic = [
    { path: "/", check: 'pathname === "/"' },
    { path: "/brands", check: 'pathname === "/brands" || pathname.startsWith("/brands/")' },
    { path: "/master-franchising", check: 'pathname === "/master-franchising"' },
    { path: "/services", check: 'pathname === "/services"' },
    { path: "/about-us", check: 'pathname === "/about-us"' },
    { path: "/blogs", check: 'pathname === "/blogs"' },
    { path: "/contact", check: 'pathname === "/contact"' }
  ].every(item => headerCode.includes(item.check));

  assertTest(
    "ADV-6.9",
    "Routing Links",
    "Primary nav links have explicit active state highlight conditions for corresponding pathnames",
    activeClassLogic,
    "Active class pathname condition missing for one or more routes"
  );
}

// =============================================================================
// SUMMARY & REPORT
// =============================================================================
console.log("\n================================================================================");
console.log("  EMPIRICAL ADVERSARIAL CHALLENGER TEST RESULTS SUMMARY");
console.log("================================================================================");
console.log(`  Total Inquiries & Assertions: ${totalTests}`);
console.log(`  Passed Inquiries:             \x1b[32m${passedTests}\x1b[0m`);
console.log(`  Failed / Defect Inquiries:    \x1b[31m${failedTests}\x1b[0m`);
console.log(`  Empirical Pass Rate:          ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log("================================================================================\n");

if (failedTests > 0) {
  console.log("\x1b[1m\x1b[31mCRITICAL DEFECTS & FAILURE DETAILS IDENTIFIED:\x1b[0m");
  failureDetails.forEach((fail, i) => {
    console.log(`\n  ${i + 1}. [${fail.id}] ${fail.category} - ${fail.description}`);
    console.log(`     \x1b[90m${fail.details}\x1b[0m`);
  });
  console.log("\n");
}
