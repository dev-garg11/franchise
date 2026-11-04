import mongoose from "mongoose";
import dotenv from "dotenv";
import { auditSeoData } from "../src/lib/seoAudit.js";
dotenv.config();

async function inspectScores() {
  await mongoose.connect(process.env.MONGODB_URI);
  const brands = await mongoose.connection.db.collection("brands").find({}).limit(10).toArray();

  console.log("Analyzing real-time SEO audit scores for first 5 brands:\n");
  for (const b of brands.slice(0, 5)) {
    const seo = b.seoData || {};
    const faqs = b.faqs || [];
    const audit = auditSeoData(seo, faqs);
    console.log(`Brand: ${b.name} (id: ${b.id || b._id})`);
    console.log(`  Focus Keyword : "${seo.focusKeyword}"`);
    console.log(`  SEO Title     : "${seo.seoTitle}" (length: ${seo.seoTitle?.length || 0})`);
    console.log(`  Meta Desc     : "${seo.metaDescription?.slice(0, 60)}..." (length: ${seo.metaDescription?.length || 0})`);
    console.log(`  Real Score    : ${audit.score} / 100 (Pass: ${audit.passCount} / ${audit.totalCount})`);
    const failing = Object.entries(audit.checks).filter(([k, v]) => !v).map(([k]) => k);
    console.log(`  Failing Checks: ${failing.length > 0 ? failing.join(", ") : "NONE (All 22 passed)"}`);
    console.log("----------------------------------------------------------------");
  }

  await mongoose.disconnect();
}

inspectScores().catch(console.error);
