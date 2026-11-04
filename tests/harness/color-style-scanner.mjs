/**
 * Color and Style Scanner for Homepage Redesign
 * Opaque-box auditor verifying color token requirements and visual contracts.
 */

import fs from "node:fs";
import path from "node:path";

export const FORBIDDEN_COLORS = [
  { code: "#7cb02c", name: "Dull Pea / Olive Green (Old Secondary)" },
  { code: "#527c15", name: "Dark Olive Green" },
  { code: "#5c8b19", name: "Medium Olive Green" },
  { code: "#628c20", name: "Muted Olive Hover" },
  { code: "#0d9488", name: "Teal 600" },
  { code: "teal-", name: "Tailwind Teal Palette Class" }
];

export const VIBRANT_PALETTE = {
  indigo: ["#4338ca", "#6366f1"],
  violet: ["#7c3aed"],
  emerald: ["#10b981", "#059669"],
  amber: ["#f59e0b", "#d97706"],
  coral: ["#ff5722"]
};

export class ColorStyleScanner {
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
  }

  scanFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return { exists: false, violations: [], content: "" };
    }

    const content = fs.readFileSync(filePath, "utf8");
    const violations = [];

    for (const forbidden of FORBIDDEN_COLORS) {
      const lower = content.toLowerCase();
      const needle = forbidden.code.toLowerCase();
      let index = 0;
      while ((index = lower.indexOf(needle, index)) !== -1) {
        // Calculate line number
        const lineNumber = content.substring(0, index).split("\n").length;
        const lineContent = content.split("\n")[lineNumber - 1]?.trim() || "";
        violations.push({
          file: path.relative(this.rootDir, filePath),
          forbidden: forbidden.code,
          name: forbidden.name,
          line: lineNumber,
          snippet: lineContent
        });
        index += needle.length;
      }
    }

    return {
      exists: true,
      violations,
      content
    };
  }

  auditHomepageAbsenceOfTealAndOlive() {
    const filesToAudit = [
      path.join(this.rootDir, "src", "app", "globals.css"),
      path.join(this.rootDir, "src", "app", "page.js"),
      path.join(this.rootDir, "src", "components", "GeminiAssistantWidget.js"),
      path.join(this.rootDir, "src", "components", "TopFranchiseOpportunities.js"),
      path.join(this.rootDir, "src", "components", "TopBusinessOpportunities.js")
    ];

    const results = [];
    let totalViolations = 0;

    for (const f of filesToAudit) {
      if (fs.existsSync(f)) {
        const res = this.scanFile(f);
        results.push({ file: path.relative(this.rootDir, f), ...res });
        totalViolations += res.violations.length;
      }
    }

    return {
      passed: totalViolations === 0,
      totalViolations,
      results
    };
  }

  auditVibrantTokens() {
    const globalsPath = path.join(this.rootDir, "src", "app", "globals.css");
    if (!fs.existsSync(globalsPath)) {
      return { passed: false, error: "src/app/globals.css does not exist" };
    }

    const content = fs.readFileSync(globalsPath, "utf8").toLowerCase();
    const matches = {
      indigo: VIBRANT_PALETTE.indigo.some(c => content.includes(c.toLowerCase())),
      violet: VIBRANT_PALETTE.violet.some(c => content.includes(c.toLowerCase())),
      emerald: VIBRANT_PALETTE.emerald.some(c => content.includes(c.toLowerCase())),
      amber: VIBRANT_PALETTE.amber.some(c => content.includes(c.toLowerCase())),
      coral: VIBRANT_PALETTE.coral.some(c => content.includes(c.toLowerCase()))
    };

    const hasVibrantPrimary = matches.indigo || matches.violet;
    const hasVibrantAccent = matches.amber || matches.coral;
    const hasVibrantSuccess = matches.emerald;

    const passed = hasVibrantPrimary && hasVibrantAccent && hasVibrantSuccess;

    return {
      passed,
      matches,
      details: {
        vibrantPrimary: hasVibrantPrimary,
        vibrantAccent: hasVibrantAccent,
        vibrantSuccess: hasVibrantSuccess
      }
    };
  }

  auditSmoothScrollAndTransitions() {
    const globalsPath = path.join(this.rootDir, "src", "app", "globals.css");
    const pagePath = path.join(this.rootDir, "src", "app", "page.js");

    const globalsContent = fs.existsSync(globalsPath) ? fs.readFileSync(globalsPath, "utf8") : "";
    const pageContent = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, "utf8") : "";

    const hasSmoothScrollCss = globalsContent.includes("scroll-behavior: smooth") || globalsContent.includes("scroll-smooth");
    const hasHardwareTransitions = globalsContent.includes("transform") || globalsContent.includes("transition");
    const hasScrollRevealClasses = globalsContent.includes("reveal-on-scroll") || globalsContent.includes("is-visible") || pageContent.includes("reveal-on-scroll") || pageContent.includes("IntersectionObserver");

    return {
      passed: hasSmoothScrollCss && hasHardwareTransitions,
      hasSmoothScrollCss,
      hasHardwareTransitions,
      hasScrollRevealClasses
    };
  }
}
