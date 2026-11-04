import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function inspectAreaValues() {
  await mongoose.connect(process.env.MONGODB_URI);
  const brands = await mongoose.connection.db.collection("brands").find({}).toArray();
  const areaValues = {};
  for (const b of brands) {
    const val = b.areaRequired || "EMPTY/NULL";
    areaValues[val] = (areaValues[val] || 0) + 1;
  }
  console.log("Distinct areaRequired values and counts:");
  console.log(JSON.stringify(areaValues, null, 2));

  // Let's also check the brand with 80000000
  const bugBrand = brands.find(b => JSON.stringify(b).includes("80000000"));
  if (bugBrand) {
    console.log("Brand with 80000000 bug:", {
      name: bugBrand.name,
      areaRequired: bugBrand.areaRequired,
      minInvestment: bugBrand.minInvestment,
      maxInvestment: bugBrand.maxInvestment,
      seoDataMetaDescription: bugBrand.seoData?.metaDescription
    });
  }

  await mongoose.disconnect();
}

inspectAreaValues().catch(console.error);
