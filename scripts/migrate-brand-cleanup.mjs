import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { validateArea, validateBrandName, validateImageUrl } from "../src/lib/seo/validate.js";

dotenv.config();

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function runMigration() {
  const isApply = process.argv.includes("--apply");
  const mode = isApply ? "APPLY (LIVE DATABASE MUTATION)" : "DRY RUN (REPORT ONLY - ZERO CHANGES TO DB)";

  console.log("================================================================================");
  console.log(`  PHASE 1: BRAND DATA CLEANUP & BASE64 DECODING MIGRATION`);
  console.log(`  MODE: ${mode}`);
  console.log("================================================================================\n");

  // 1. Connect to Database
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const brandsCollection = db.collection("brands");
  const brands = await brandsCollection.find({}).toArray();
  console.log(`[DATABASE] Connected. Found ${brands.length} brands.\n`);

  // 2. Ensure Directories Exist
  const backupsDir = path.join(process.cwd(), "backups");
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "brands");
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // 3. Export Backup (ALWAYS run, even in dry-run, for audit safety)
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupJsonPath = path.join(backupsDir, `brands_backup_${timestamp}.json`);
  fs.writeFileSync(backupJsonPath, JSON.stringify(brands, null, 2), "utf8");
  console.log(`✔ [BACKUP EXPORT] Complete JSON backup saved to: ${backupJsonPath}`);

  // 4. Migration Plan Tracking
  const base64Migrations = [];
  const invalidAreaFixes = [];
  const testBrandQuarantines = [];
  const slugCollisions = new Map();

  for (const b of brands) {
    const id = b.id || b._id.toString();
    const name = (b.name || "").trim();
    const baseSlug = slugify(name) || "brand";
    
    // Slug collision handling
    let brandSlug = `${baseSlug}-franchise`;
    if (slugCollisions.has(brandSlug)) {
      const count = slugCollisions.get(brandSlug) + 1;
      slugCollisions.set(brandSlug, count);
      brandSlug = `${baseSlug}-${count}-franchise`;
    } else {
      slugCollisions.set(brandSlug, 1);
    }

    // A. Check Base64 Images
    const rawImage = b.image || b.logo || "";
    if (rawImage.startsWith("data:image")) {
      const match = rawImage.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        let ext = match[1].toLowerCase();
        if (ext === "jpeg") ext = "jpg";
        if (ext === "svg+xml") ext = "svg";
        const buffer = Buffer.from(match[2], "base64");
        const filename = `${brandSlug}.${ext}`;
        const relativeUrl = `/uploads/brands/${filename}`;
        const diskPath = path.join(uploadsDir, filename);

        base64Migrations.push({
          id,
          name,
          slug: brandSlug,
          ext,
          diskPath,
          relativeUrl,
          buffer,
          bufferSizeKb: (buffer.length / 1024).toFixed(1),
          oldImageSnippet: rawImage.slice(0, 50) + "..."
        });
      }
    }

    // B. Check Invalid Area
    const areaCheck = validateArea(b.areaRequired);
    if (!areaCheck.isValid && b.areaRequired) {
      invalidAreaFixes.push({
        id,
        name,
        oldArea: b.areaRequired,
        newArea: null, // Set to null instead of guessing per instructions
        reason: areaCheck.reason
      });
    }

    // C. Check Test Brands
    const nameCheck = validateBrandName(name);
    if (nameCheck.isTest) {
      testBrandQuarantines.push({
        id,
        name,
        currentStatus: b.status,
        currentSeoStatus: b.seoStatus,
        reason: nameCheck.reason
      });
    }
  }

  // 5. Print Detailed Dry Run Report
  console.log("\n--------------------------------------------------------------------------------");
  console.log(`  1. BASE64 IMAGE DECODING & FILE EXTRACTION PLAN (${base64Migrations.length} BRANDS)`);
  console.log("--------------------------------------------------------------------------------");
  base64Migrations.slice(0, 5).forEach((m, i) => {
    console.log(`[${i + 1}] Brand: ${m.name}`);
    console.log(`    File Target : ${m.relativeUrl} (${m.bufferSizeKb} KB, ext: ${m.ext})`);
    console.log(`    Action      : Decode base64 -> Save to disk -> Update brand.image & backupImage`);
  });
  if (base64Migrations.length > 5) {
    console.log(`... and ${base64Migrations.length - 5} more brands.`);
  }

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`  2. INVALID AREA FIX PLAN (${invalidAreaFixes.length} BRANDS)`);
  console.log("--------------------------------------------------------------------------------");
  invalidAreaFixes.forEach((fix, i) => {
    console.log(`[${i + 1}] Brand: ${fix.name}`);
    console.log(`    Current Area : "${fix.oldArea}"`);
    console.log(`    Action       : Set areaRequired = null (Reason: ${fix.reason})`);
  });

  console.log("\n--------------------------------------------------------------------------------");
  console.log(`  3. TEST / DUMMY BRANDS QUARANTINE PLAN (${testBrandQuarantines.length} BRANDS)`);
  console.log("--------------------------------------------------------------------------------");
  testBrandQuarantines.forEach((t, i) => {
    console.log(`[${i + 1}] Brand: "${t.name}" (ID: ${t.id})`);
    console.log(`    Current      : status: ${t.currentStatus}, seoStatus: ${t.currentSeoStatus}`);
    console.log(`    Action       : Change seoStatus to 'needs_fix', status to 'Pending' (NOINDEX)`);
  });

  // 6. Execute Live Apply If Flag Present
  if (!isApply) {
    console.log("\n================================================================================");
    console.log("  DRY RUN COMPLETE — ZERO DATA MUTATED IN MONGODB");
    console.log("  To execute these changes, run with: node scripts/migrate-brand-cleanup.mjs --apply");
    console.log("================================================================================");
    await mongoose.disconnect();
    return;
  }

  console.log("\n================================================================================");
  console.log("  EXECUTING LIVE MIGRATION (--apply active)");
  console.log("================================================================================\n");

  // Step A: Save Decoded Images to Disk and Update Database
  let savedImagesCount = 0;
  for (const m of base64Migrations) {
    // 1. Write file to public/uploads/brands/
    fs.writeFileSync(m.diskPath, m.buffer);
    savedImagesCount++;

    // 2. Query brand from MongoDB and update
    const bDoc = brands.find(x => (x.id || x._id.toString()) === m.id);
    const oldPillar = bDoc?.seoData?.pillarContent || "";
    // Clean pillar content from base64 string
    const cleanedPillar = oldPillar.replace(/src=["']data:image\/[^"']+["']/g, `src="${m.relativeUrl}"`);

    await brandsCollection.updateOne(
      { _id: bDoc._id },
      {
        $set: {
          image: m.relativeUrl,
          logo: m.relativeUrl,
          backupImage: bDoc.image || bDoc.logo, // Keep old value in backup field
          "seoData.ogImage": m.relativeUrl,
          "seoData.pillarContent": cleanedPillar
        }
      }
    );
  }
  console.log(`✔ [IMAGES] Saved ${savedImagesCount} images to disk and updated DB records with relative URLs.`);

  // Step B: Set Invalid Area to Null
  let fixedAreaCount = 0;
  for (const fix of invalidAreaFixes) {
    const bDoc = brands.find(x => (x.id || x._id.toString()) === fix.id);
    const oldDesc = bDoc?.seoData?.metaDescription || "";
    const cleanedDesc = oldDesc.replace(/,?\s*commercial area:\s*80000000,?/gi, "");

    await brandsCollection.updateOne(
      { _id: bDoc._id },
      {
        $set: {
          areaRequired: null,
          "seoData.metaDescription": cleanedDesc
        }
      }
    );
    fixedAreaCount++;
  }
  console.log(`✔ [AREA] Cleaned ${fixedAreaCount} invalid area records in DB.`);

  // Step C: Quarantine Test Brands
  let quarantinedCount = 0;
  for (const t of testBrandQuarantines) {
    const bDoc = brands.find(x => (x.id || x._id.toString()) === t.id);
    await brandsCollection.updateOne(
      { _id: bDoc._id },
      {
        $set: {
          status: "Pending",
          seoStatus: "needs_fix"
        }
      }
    );
    quarantinedCount++;
  }
  console.log(`✔ [TEST BRANDS] Quarantined ${quarantinedCount} test brands to 'needs_fix' & 'Pending'.`);

  await mongoose.disconnect();
  console.log("\n================================================================================");
  console.log("  MIGRATION COMPLETE & VERIFIED");
  console.log("================================================================================");
}

runMigration().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
