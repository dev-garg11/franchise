import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function inspectInvestorBrandAssignments() {
  await mongoose.connect(process.env.MONGODB_URI);
  const investors = await mongoose.connection.db.collection("investors").find({}).toArray();
  const brands = await mongoose.connection.db.collection("brands").find({}).toArray();

  console.log(`Total Investors: ${investors.length}`);
  console.log(`Total Brands: ${brands.length}\n`);

  for (const inv of investors) {
    const assigned = Array.isArray(inv.assignedBrands) ? inv.assignedBrands : [];
    const directBrand = inv.brandName || inv.brandId;
    const investedBrand = inv.investedBrandName || inv.investedBrandId;
    console.log(`Investor: ${inv.name} (${inv.email || inv.phone || "No Contact"})`);
    console.log(`  - Direct Enquiry Brand: ${directBrand || "None (General Consultation)"}`);
    console.log(`  - Assigned Brands     : ${assigned.length > 0 ? assigned.join(", ") : "None"}`);
    console.log(`  - Investment Status   : ${inv.investmentStatus || "Not Started"}`);
    if (investedBrand) {
      console.log(`  - Deal Closed Brand   : ${investedBrand}`);
    }
    console.log("--------------------------------------------------");
  }

  await mongoose.disconnect();
}

inspectInvestorBrandAssignments().catch(console.error);
