import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function runPhase0Inspection() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI missing");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB successfully.");

  const db = mongoose.connection.db;
  const brandsCollection = db.collection("brands");

  const totalBrands = await brandsCollection.countDocuments({});
  console.log(`\n========================================`);
  console.log(`PHASE 0 INSPECTION: TOTAL BRANDS = ${totalBrands}`);
  console.log(`========================================\n`);

  const allBrands = await brandsCollection.find({}).toArray();

  let invalidAreaCount = 0;
  let invalidArea80MCount = 0;
  let emptyAreaCount = 0;
  let validAreaCount = 0;
  const sampleInvalidAreas = [];

  let base64LogoCount = 0;
  let base64ImageCount = 0;
  let base64PillarCount = 0;
  let base64AnywhereCount = 0;

  let testNameCount = 0;
  const testBrandNames = [];

  let missingCategoryCount = 0;
  let missingHqCount = 0;
  let missingInvestmentRangeCount = 0;
  let missingMinInvestmentCount = 0;
  let missingRoyaltyCount = 0;
  let missingOutletsCount = 0;
  let missingLogoCount = 0;
  let missingDescriptionCount = 0;

  const statusCounts = {};
  const seoStatusCounts = {};
  const canonicalUrlPatterns = {};

  for (const b of allBrands) {
    const name = b.name || b.brandName || "";
    // Test-like name check
    if (/test|demo|dummy|ajay/i.test(name)) {
      testNameCount++;
      testBrandNames.push({ id: b.id || b._id.toString(), name, status: b.status, seoStatus: b.seoStatus });
    }

    // Status counts
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    seoStatusCounts[b.seoStatus] = (seoStatusCounts[b.seoStatus] || 0) + 1;

    // Area check (valid: 50 to 50000 sq ft)
    const rawArea = b.areaRequired;
    if (!rawArea || String(rawArea).trim() === "") {
      emptyAreaCount++;
    } else {
      const areaStr = String(rawArea).trim();
      const numMatch = areaStr.match(/\d+/g);
      const numVal = numMatch ? parseInt(numMatch.join(""), 10) : NaN;
      if (areaStr.includes("80000000")) {
        invalidArea80MCount++;
        invalidAreaCount++;
        if (sampleInvalidAreas.length < 5) sampleInvalidAreas.push({ name, areaRequired: rawArea });
      } else if (isNaN(numVal) || numVal < 50 || numVal > 50000) {
        invalidAreaCount++;
        if (sampleInvalidAreas.length < 5) sampleInvalidAreas.push({ name, areaRequired: rawArea });
      } else {
        validAreaCount++;
      }
    }

    // Base64 checks
    let hasBase64 = false;
    const isBase64 = (s) => typeof s === "string" && s.startsWith("data:image");

    if (isBase64(b.logo)) { base64LogoCount++; hasBase64 = true; }
    if (isBase64(b.image)) { base64ImageCount++; hasBase64 = true; }
    if (b.seoData?.pillarContent && b.seoData.pillarContent.includes("data:image")) {
      base64PillarCount++;
      hasBase64 = true;
    }
    if (hasBase64) base64AnywhereCount++;

    // Missing fields
    if (!b.category || String(b.category).trim() === "") missingCategoryCount++;
    if (!b.hq && !b.location) missingHqCount++;
    if (!b.investment_range && !b.investmentRange) missingInvestmentRangeCount++;
    if (!b.minInvestment || b.minInvestment <= 0) missingMinInvestmentCount++;
    if (!b.royaltyFee && !b.royalty) missingRoyaltyCount++;
    if (b.outlets === undefined && b.totalOutlets === undefined && b.numberOfOutlets === undefined) missingOutletsCount++;
    if (!b.image && !b.logo) missingLogoCount++;
    if (!b.description || String(b.description).trim() === "") missingDescriptionCount++;

    // Canonical patterns
    const canonical = b.seoData?.canonicalUrl || "none";
    if (canonical.includes("-franchise") && canonical.includes("brand-")) {
      canonicalUrlPatterns["brand-timestamp-slug"] = (canonicalUrlPatterns["brand-timestamp-slug"] || 0) + 1;
    } else if (canonical.includes("-franchise") && /[0-9a-f]{24}/.test(canonical)) {
      canonicalUrlPatterns["mongoId-slug"] = (canonicalUrlPatterns["mongoId-slug"] || 0) + 1;
    } else if (canonical === "none") {
      canonicalUrlPatterns["none"] = (canonicalUrlPatterns["none"] || 0) + 1;
    } else {
      canonicalUrlPatterns["other"] = (canonicalUrlPatterns["other"] || 0) + 1;
    }
  }

  console.log("--- 1. AREA REQUIRED AUDIT ---");
  console.log(`Valid Area (50 - 50,000 sq ft) : ${validAreaCount}`);
  console.log(`Empty / Missing Area           : ${emptyAreaCount}`);
  console.log(`Invalid Area (<50 or >50,000)  : ${invalidAreaCount}`);
  console.log(`  └ Specific '80000000' bug    : ${invalidArea80MCount}`);
  console.log(`Sample Invalid Areas           :`, JSON.stringify(sampleInvalidAreas, null, 2));

  console.log("\n--- 2. BASE64 IMAGES AUDIT ---");
  console.log(`Brands with base64 in logo          : ${base64LogoCount}`);
  console.log(`Brands with base64 in image         : ${base64ImageCount}`);
  console.log(`Brands with base64 in pillarContent : ${base64PillarCount}`);
  console.log(`Total Brands with ANY base64 image  : ${base64AnywhereCount}`);

  console.log("\n--- 3. TEST / DUMMY BRANDS AUDIT ---");
  console.log(`Test-like brands matched (/test|demo|dummy|ajay/i) : ${testNameCount}`);
  console.log(`Sample test brands:`, JSON.stringify(testBrandNames.slice(0, 10), null, 2));

  console.log("\n--- 4. MISSING FIELDS AUDIT ---");
  console.log(`Missing Category                : ${missingCategoryCount}`);
  console.log(`Missing HQ / Location           : ${missingHqCount}`);
  console.log(`Missing Investment Range Text   : ${missingInvestmentRangeCount}`);
  console.log(`Missing Min Investment Number   : ${missingMinInvestmentCount}`);
  console.log(`Missing Royalty Fee             : ${missingRoyaltyCount}`);
  console.log(`Missing Outlets Field           : ${missingOutletsCount}`);
  console.log(`Missing Logo / Image            : ${missingLogoCount}`);
  console.log(`Missing Description             : ${missingDescriptionCount}`);

  console.log("\n--- 5. STATUS & SEO STATUS BREAKDOWN ---");
  console.log(`Listing Statuses:`, statusCounts);
  console.log(`SEO Statuses:`, seoStatusCounts);

  console.log("\n--- 6. CANONICAL URL FORMAT BREAKDOWN ---");
  console.log(`Canonical URL patterns in seoData:`, canonicalUrlPatterns);

  // Inspect 1 actual brand document to see all raw keys
  const sampleBrand = allBrands[0];
  console.log("\n--- 7. ALL KEYS PRESENT IN A REAL BRAND DOC ---");
  console.log(Object.keys(sampleBrand));

  await mongoose.disconnect();
  console.log("\nDisconnected from MongoDB.");
}

runPhase0Inspection().catch(err => {
  console.error("Phase 0 inspection failed:", err);
  process.exit(1);
});
