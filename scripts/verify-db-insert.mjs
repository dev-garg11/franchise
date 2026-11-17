import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

async function verifyBrandCreation() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const brandsColl = db.collection("brands");
  const usersColl = db.collection("users");

  const testEmail = `verify_reg_${Date.now()}@yopmail.com`;
  console.log("Testing user & brand creation for:", testEmail);

  // 1. Create User
  const hashedPassword = await bcrypt.hash("Password123#", 10);
  const userRes = await usersColl.insertOne({
    email: testEmail,
    password: hashedPassword,
    role: "brand",
    name: "Verification Brand",
    phone: "9876543210",
    createdAt: new Date()
  });
  console.log("✔ User created with ID:", userRes.insertedId);

  // 2. Create Brand
  const brandDoc = {
    id: `brand-${Date.now()}`,
    name: "Verification Brand",
    company: "Verification Brand Pvt Ltd",
    category: "Food and Beverage",
    sector: "QSR",
    hq: "Delhi",
    location: "Delhi",
    pincode: "110001",
    investment_range: "Rs. 5 Lakh - 10 Lakh",
    max_investment_limit: "Rs. 20 Lakh - 30 Lakh",
    minInvestment: 500000,
    maxInvestment: 2000000,
    franchiseFee: 50000,
    royaltyFee: "5%",
    areaRequired: "300 - 500 sq ft",
    trainingSupport: "Yes",
    agreement: "Yes",
    description: "Verification brand model description.",
    email: testEmail,
    phone: "9876543210",
    user: userRes.insertedId,
    status: "Pending",
    seoStatus: "needs_fix",
    featured: false,
    createdAt: new Date()
  };

  const brandRes = await brandsColl.insertOne(brandDoc);
  console.log("✔ Brand inserted with ID:", brandRes.insertedId);

  // Clean up verification test documents
  await brandsColl.deleteOne({ _id: brandRes.insertedId });
  await usersColl.deleteOne({ _id: userRes.insertedId });
  console.log("✔ Cleanup complete! MongoDB Atlas accepts brand insertion cleanly.");

  await mongoose.disconnect();
}

verifyBrandCreation().catch(console.error);
