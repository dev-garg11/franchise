             import dotenv from "dotenv";
dotenv.config();

async function testBrandSubmit() {
  const payload = {
    name: "Burger Singh Test Franchise",
    company: "Burger Singh Pvt Ltd",
    category: "Food and Beverage",
    sector: "Fast Food / QSR",
    hq: "Delhi",
    location: "Delhi",
    pincode: "110001",
    investment_range: "Rs. 10 Lakh - 20 Lakh",
    max_investment_limit: "Rs. 20 Lakh - 30 Lakh",
    franchiseFee: 200000,
    royaltyFee: "8%",
    areaRequired: "500 - 1000 sq ft",
    trainingSupport: "Yes",
    agreement: "Yes",
    description: "Burger Singh is India's largest made-in-India burger chain with delicious Indian flavored burgers.",
    email: `burgertest_${Date.now()}@yopmail.com`,
    password: "Password123#",
    phone: "9876543210",
    website: "https://burgersingh.com",
    status: "Pending"
  };

  try {
    const { saveBrand } = await import("../src/lib/db.js");
    const result = await saveBrand(payload);
    console.log("✔ saveBrand succeeded! Created brand id:", result.id || result._id);
  } catch (err) {
    console.error("✖ saveBrand failed:", err);
  }
  process.exit(0);
}

testBrandSubmit();
