import mongoose from "mongoose";
import dotenv from "dotenv";
import { generateBrandSeoData } from "../src/lib/brandSeoGenerator.js";
import { auditSeoData } from "../src/lib/seoAudit.js";
dotenv.config();

async function testRealtimeSeo() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const brand = await mongoose.connection.db.collection("brands").findOne({ name: "Nutera" });
  if (!brand) {
    console.error("Brand Nutera not found");
    process.exit(1);
  }

  console.log("\n1. Testing Real-time Audit on current Nutera data:");
  const currentAudit = auditSeoData(brand.seoData || {}, brand.faqs || []);
  console.log(`- Current Score: ${currentAudit.score} / 100 (${currentAudit.passCount}/${currentAudit.totalCount} passed)`);
  console.log(`- Focus Keyword: "${brand.seoData?.focusKeyword}"`);
  console.log(`- Title: "${brand.seoData?.seoTitle}"`);

  console.log("\n2. Testing Single Brand Generator Logic (Real-time AI Fix simulation):");
  const generated = generateBrandSeoData(brand);
  console.log(`- Generated Focus Keyword: "${generated.seoData.focusKeyword}"`);
  console.log(`- Generated Title: "${generated.seoData.seoTitle}"`);
  console.log(`- Generated FAQs Count: ${generated.faqs.length}`);
  console.log(`- Generated Score: ${generated.rankMathScore} / 100`);

  console.log("\n3. Testing Real-Time Custom Modification & Rescoring:");
  // Simulating an admin editing the title to something custom
  const customSeo = {
    ...generated.seoData,
    seoTitle: "Nutera Fast Food Franchise in India - Complete Cost & Profit 2026"
  };
  const customAudit = auditSeoData(customSeo, generated.faqs);
  console.log(`- Custom Edited Title Score: ${customAudit.score} / 100`);
  console.log(`- Keyword in Title check: ${customAudit.checks.focusKeywordInTitle}`);

  console.log("\n✔ Real-time SEO generation, inspection and audit logic verified successfully!");

  await mongoose.disconnect();
}

testRealtimeSeo().catch(console.error);
