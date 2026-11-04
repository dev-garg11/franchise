import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import {
  validateArea,
  validateInvestment,
  validateImageUrl,
  validateBrandName,
  validateTitle,
  validateDescription,
  validateBrandSeo
} from "../src/lib/seo/validate.js";

dotenv.config();

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✔ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✖ FAIL: ${message}`);
  }
}

async function runPhase1Test() {
  console.log("================================================================================");
  console.log("  PHASE 1 VERIFICATION & COMPLIANCE TEST SUITE");
  console.log("================================================================================\n");

  // 1. Area Validation Tests
  console.log("[SUITE 1] Area Required Validation (50 to 50,000 sq ft)");
  assert(!validateArea("80000000").isValid, "80000000 is rejected");
  assert(!validateArea("80000000 sq ft").isValid, "80000000 sq ft is rejected");
  assert(!validateArea("10 sq ft").isValid, "10 sq ft (< 50) is rejected");
  assert(!validateArea("60000 sq ft").isValid, "60,000 sq ft (> 50,000) is rejected");
  assert(validateArea("1,500 sq ft").isValid, "1,500 sq ft (with comma) is valid");
  assert(validateArea("200 - 500").isValid, "200 - 500 is valid and formatted");
  assert(validateArea("500").value === "500 sq ft", "500 appends 'sq ft' unit");
  assert(validateArea("").value === null, "Empty area treated as null/missing");
  assert(validateArea(null).value === null, "Null area treated as null/missing");

  // 2. Investment Validation Tests
  console.log("\n[SUITE 2] Investment Validation (Required)");
  assert(validateInvestment({ investment_range: "Rs. 5 Lakh - 10 Lakh" }).isValid, "Valid investment range accepted");
  assert(validateInvestment({ minInvestment: 500000 }).isValid, "Valid minInvestment numeric accepted");
  assert(!validateInvestment({}).isValid, "Missing investment rejected");
  assert(!validateInvestment({ investment_range: "", minInvestment: 0 }).isValid, "Zero investment rejected");

  // 3. Logo / Image Validation Tests
  console.log("\n[SUITE 3] Image / Logo URL Validation (Reject Base64)");
  assert(!validateImageUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA").isValid, "Base64 data URI rejected");
  assert(validateImageUrl("https://example.com/logo.png").isValid, "HTTPS image URL accepted");
  assert(validateImageUrl("/uploads/brands/sample-brand.jpg").isValid, "Internal /uploads/ image URL accepted");
  assert(!validateImageUrl("").isValid, "Empty image URL rejected");

  // 4. Brand Name Validation Tests
  console.log("\n[SUITE 4] Brand Name Validation (Reject Test / Dummy Names)");
  assert(!validateBrandName("testing").isValid, "'testing' rejected as test brand");
  assert(!validateBrandName("Test").isValid, "'Test' rejected as test brand");
  assert(!validateBrandName("dummy brand").isValid, "'dummy brand' rejected as test brand");
  assert(!validateBrandName("ajay").isValid, "'ajay' rejected as test brand");
  assert(validateBrandName("Starbucks India").isValid, "'Starbucks India' accepted as valid brand");

  // 5. Title & Description Length Tests
  console.log("\n[SUITE 5] SEO Title & Description Lengths");
  assert(validateTitle("Haldiram Franchise Cost & ROI (2026) | Franchise Roots").isValid, "Valid 55-char title accepted");
  assert(!validateTitle("Haldiram Franchise Cost, Profit Margin, Investment Details, Requirements & ROI (2026) | Franchise Roots").isValid, "78-char title (> 60) rejected");
  assert(validateDescription("Explore Haldiram franchise cost, profit margins, setup investment, and dealership criteria in India.").isValid, "103-char description accepted");
  assert(!validateDescription("Explore Haldiram franchise cost, profit margins, setup investment, requirements, documents, operational support, centralized supply chain, royalty structure, and dealership criteria in India for 2026.").isValid, "198-char description (> 160) rejected");

  // 6. Live Database State Verification
  console.log("\n[SUITE 6] Live Database State Verification");
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const brands = await db.collection("brands").find({}).toArray();

  assert(brands.length >= 150, `Found ${brands.length} brands in MongoDB`);

  const base64Brands = brands.filter(b => b.image && b.image.startsWith("data:image"));
  assert(base64Brands.length === 0, `0 brands have base64 in 'image' field (Actual: ${base64Brands.length})`);

  const impossibleAreaBrands = brands.filter(b => b.areaRequired && b.areaRequired.includes("80000000"));
  assert(impossibleAreaBrands.length === 0, `0 brands have 80000000 area (Actual: ${impossibleAreaBrands.length})`);

  const testBrands = brands.filter(b => /^(test|demo|dummy|testing|sample|ajay)$/i.test(b.name));
  const quarantinedTestBrands = testBrands.filter(b => b.status === "Pending" && b.seoStatus === "needs_fix");
  assert(quarantinedTestBrands.length === testBrands.length, `All ${testBrands.length} test brands are quarantined as Pending / needs_fix (Actual: ${quarantinedTestBrands.length})`);

  // 7. Backup & Public Uploads Directory Verification
  console.log("\n[SUITE 7] Backup & Upload Directory Verification");
  const backupFiles = fs.readdirSync(path.join(process.cwd(), "backups"));
  assert(backupFiles.length > 0, `Backup files exist in /backups (${backupFiles.length} found)`);

  const uploadFiles = fs.readdirSync(path.join(process.cwd(), "public", "uploads", "brands"));
  assert(uploadFiles.length >= 70, `Physical images decoded in /public/uploads/brands (${uploadFiles.length} found)`);

  await mongoose.disconnect();

  console.log("\n================================================================================");
  console.log(`  PHASE 1 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) process.exit(1);
}

runPhase1Test().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
