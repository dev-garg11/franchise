import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.TEST_BASE_URL || "https://franchise-git-franchiseai-sparo5.vercel.app";

let passed = 0;
let failed = 0;
const timings = {};

function assert(condition, testName, details = "") {
  if (condition) {
    passed++;
    console.log(`  ✔ [PASS] ${testName} ${details ? `(${details})` : ""}`);
  } else {
    failed++;
    console.error(`  ✖ [FAIL] ${testName} ${details ? `(${details})` : ""}`);
  }
}

async function measureRequest(name, url, options = {}) {
  const start = performance.now();
  const res = await fetch(url, options);
  const duration = Math.round(performance.now() - start);
  timings[name] = duration;
  return { res, duration };
}

async function runSeniorTestSuite() {
  console.log("================================================================================");
  console.log("  FRANCHISE ROOTS — SENIOR QA AUDIT & PERFORMANCE BATTERY (19-YR STANDARD)");
  console.log(`  Target Environment: ${BASE_URL}`);
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // SUITE 1: Page Load Performance & HTML Component Rendering
  // ---------------------------------------------------------------------------
  console.log("[SUITE 1] Page Load Performance & Form Element Inspection");
  const pageUrl = `${BASE_URL}/brand-registration`;
  const { res: pageRes, duration: pageDuration } = await measureRequest("PageLoad", pageUrl);
  
  assert(pageRes.status === 200, "Brand Registration Page HTTP 200 OK", `Status: ${pageRes.status}`);
  assert(pageDuration < 3000, "Page Load Time under 3 seconds", `${pageDuration}ms`);

  const pageHtml = await pageRes.text();
  assert(pageHtml.includes("Expand Your Brand Network") || pageHtml.includes("brand-registration"), "Page Title & Heading rendered");
  assert(pageHtml.includes('name="name"') || pageHtml.includes("Brand Name"), "Brand Name input rendered");
  assert(pageHtml.includes('name="company"') || pageHtml.includes("Parent Company"), "Company Name input rendered");
  assert(pageHtml.includes('name="pincode"') || pageHtml.includes("Pincode"), "Pincode input rendered");
  assert(pageHtml.includes('name="investment_range"') || pageHtml.includes("Investment Range"), "Investment Range select rendered");
  assert(pageHtml.includes('name="phone"') || pageHtml.includes("Mobile Number"), "Mobile Number input rendered");
  assert(pageHtml.includes('name="password"') || pageHtml.includes("Password"), "Account Password input rendered");
  assert(pageHtml.includes("Submit Brand for Review"), "Submit Button rendered");

  // ---------------------------------------------------------------------------
  // SUITE 2: Negative Validation & Security Guard Tests
  // ---------------------------------------------------------------------------
  console.log("\n[SUITE 2] Negative Validation & Error Trapping Battery");
  const apiUrl = `${BASE_URL}/api/brands`;

  // Test 2.1: Missing Name
  const { res: resMissingName } = await measureRequest("MissingName", apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", phone: "9876543210" })
  });
  const dataMissingName = await resMissingName.json().catch(() => ({}));
  assert(resMissingName.status === 400 && !dataMissingName.success, "Missing Brand Name returns 400 Bad Request", dataMissingName.error);

  // Test 2.2: Invalid Email
  const { res: resBadEmail } = await measureRequest("BadEmail", apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Valid Brand", email: "invalid-email-address", phone: "9876543210" })
  });
  const dataBadEmail = await resBadEmail.json().catch(() => ({}));
  assert(resBadEmail.status === 400 && !dataBadEmail.success, "Invalid Email format returns 400 Bad Request", dataBadEmail.error);

  // Test 2.3: Invalid Phone (9 digits)
  const { res: resBadPhone } = await measureRequest("BadPhone", apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Valid Brand", email: "valid@example.com", phone: "987654321" })
  });
  const dataBadPhone = await resBadPhone.json().catch(() => ({}));
  assert(resBadPhone.status === 400 && !dataBadPhone.success, "Invalid Phone (< 10 digits) returns 400 Bad Request", dataBadPhone.error);

  // Test 2.4: Impossible Area (80000000)
  const { res: resBadArea } = await measureRequest("BadArea", apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Valid Brand",
      email: "valid@example.com",
      phone: "9876543210",
      pincode: "110001",
      areaRequired: "80000000 sq ft"
    })
  });
  const dataBadArea = await resBadArea.json().catch(() => ({}));
  assert(resBadArea.status === 400 && !dataBadArea.success, "Impossible Area (80,000,000 sq ft) returns 400 Bad Request", dataBadArea.error);

  // ---------------------------------------------------------------------------
  // SUITE 3: Full End-to-End Brand Submission (Happy Path)
  // ---------------------------------------------------------------------------
  console.log("\n[SUITE 3] End-to-End Brand Registration Submission (Live API)");
  const testBrandSlug = `qabrand_${Date.now()}`;
  const testBrandEmail = `${testBrandSlug}@yopmail.com`;
  const happyPayload = {
    name: `Senior QA Brand ${Date.now().toString().slice(-4)}`,
    company: "Senior QA Enterprises Pvt Ltd",
    category: "Food and Beverage",
    sector: "Quick Service Restaurant (QSR)",
    hq: "Delhi",
    location: "New Delhi",
    pincode: "110001",
    investment_range: "Rs. 10 Lakh - 20 Lakh",
    max_investment_limit: "Rs. 20 Lakh - 30 Lakh",
    franchiseFee: 200000,
    royaltyFee: "6%",
    areaRequired: "400 - 800 sq ft",
    trainingSupport: "Yes",
    agreement: "Yes",
    masterFranchiseAvailable: true,
    masterInvestmentRange: "Rs. 25 Lakhs - 50 Lakhs",
    territoryOffered: "State Level Exclusivity",
    description: "Certified premium quick service restaurant franchise model with high operational profitability.",
    email: testBrandEmail,
    password: "Franchise@123#",
    phone: "9876543210",
    website: "https://seniorqa-brand.com",
    status: "Pending"
  };

  const { res: resHappy, duration: happyDuration } = await measureRequest("HappySubmit", apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(happyPayload)
  });

  const happyData = await resHappy.json().catch(() => ({}));
  assert(resHappy.status === 201 || resHappy.status === 200, "Form Submit returns HTTP 201 Created", `Status: ${resHappy.status}`);
  assert(happyData.success === true, "Form Submit response returns { success: true }");
  assert(happyDuration < 2500, `Submission completed in under 2.5 seconds (Actual: ${happyDuration}ms)`);
  assert(happyData.brand && (happyData.brand.id || happyData.brand._id), "Brand object returned with unique ID", happyData.brand?.id || happyData.brand?._id);
  assert(happyData.brand?.status === "Pending", "Brand initialized in 'Pending' review status");

  const createdBrandId = happyData.brand?._id || happyData.brand?.id;

  // ---------------------------------------------------------------------------
  // SUITE 4: Test Brand Auto-Quarantine (Non-Blocking Registration)
  // ---------------------------------------------------------------------------
  console.log("\n[SUITE 4] Test Brand Registration & SEO Quarantine Verification");
  const testBrandNamePayload = {
    name: "Testing Sample Franchise",
    company: "Testing Sample Pvt Ltd",
    category: "Retail",
    hq: "Maharashtra",
    location: "Mumbai",
    pincode: "400001",
    investment_range: "Rs. 5 Lakh - 10 Lakh",
    max_investment_limit: "Rs. 10 Lakh - 20 Lakh",
    description: "Test brand registration to verify that test names do not block submission.",
    email: `testing_${Date.now()}@yopmail.com`,
    password: "Franchise@123#",
    phone: "9123456780",
    status: "Pending"
  };

  const { res: resTestBrand, duration: testBrandDuration } = await measureRequest("TestBrandSubmit", apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testBrandNamePayload)
  });

  const testBrandData = await resTestBrand.json().catch(() => ({}));
  assert(resTestBrand.status === 201 || resTestBrand.status === 200, "Test Brand Name does NOT get blocked (Smooth Submission)", `Status: ${resTestBrand.status}`);
  assert(testBrandData.success === true, "Test Brand returns success: true");
  assert(testBrandData.brand?.seoStatus === "needs_fix", "Test Brand automatically quarantined as 'needs_fix' for SEO", `seoStatus: ${testBrandData.brand?.seoStatus}`);

  const createdTestBrandId = testBrandData.brand?._id || testBrandData.brand?.id;

  // ---------------------------------------------------------------------------
  // SUITE 5: MongoDB Atlas Direct Database Integrity Audit
  // ---------------------------------------------------------------------------
  console.log("\n[SUITE 5] MongoDB Atlas Live Database Consistency Audit");
  const dbStart = performance.now();
  await mongoose.connect(process.env.MONGODB_URI);
  const dbConnectDuration = Math.round(performance.now() - dbStart);
  timings["DBConnect"] = dbConnectDuration;
  assert(true, "MongoDB Atlas Connected", `${dbConnectDuration}ms`);

  const db = mongoose.connection.db;
  const brandsColl = db.collection("brands");
  const usersColl = db.collection("users");

  // Verify happy brand in DB
  if (createdBrandId) {
    const dbBrand = await brandsColl.findOne({
      $or: [
        { id: createdBrandId },
        ...(mongoose.Types.ObjectId.isValid(createdBrandId) ? [{ _id: new mongoose.Types.ObjectId(createdBrandId) }] : [])
      ]
    });
    assert(!!dbBrand, "Brand saved permanently in MongoDB 'brands' collection");
    assert(dbBrand?.email === testBrandEmail, "Brand email matches payload exactly", dbBrand?.email);
    assert(dbBrand?.phone === "9876543210", "Brand phone saved as clean 10-digit format", dbBrand?.phone);
    assert(dbBrand?.areaRequired === "400 - 800 sq ft", "Area required formatted with unit 'sq ft'", dbBrand?.areaRequired);
    assert(dbBrand?.user, "Brand linked to User Account in MongoDB", String(dbBrand?.user));

    // Verify linked user account
    const dbUser = await usersColl.findOne({ _id: dbBrand?.user });
    assert(!!dbUser, "User Account created in MongoDB 'users' collection");
    assert(dbUser?.role === "brand", "User role set to 'brand'");
    assert(dbUser?.password && dbUser?.password.startsWith("$2"), "Password stored as secure bcrypt hash (never plain text)");

    // Cleanup happy brand test record
    await brandsColl.deleteOne({ _id: dbBrand._id });
    if (dbUser) await usersColl.deleteOne({ _id: dbUser._id });
    console.log("  ✔ Cleaned up happy path test record from MongoDB Atlas");
  }

  // Cleanup test brand record
  if (createdTestBrandId) {
    const dbTestBrand = await brandsColl.findOne({
      $or: [
        { id: createdTestBrandId },
        ...(mongoose.Types.ObjectId.isValid(createdTestBrandId) ? [{ _id: new mongoose.Types.ObjectId(createdTestBrandId) }] : [])
      ]
    });
    if (dbTestBrand) {
      await brandsColl.deleteOne({ _id: dbTestBrand._id });
      if (dbTestBrand.user) await usersColl.deleteOne({ _id: dbTestBrand.user });
      console.log("  ✔ Cleaned up test brand record from MongoDB Atlas");
    }
  }

  await mongoose.disconnect();

  // ---------------------------------------------------------------------------
  // PERFORMANCE & SUMMARY REPORT
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("  PERFORMANCE LATENCY BENCHMARKS (MILLISECONDS)");
  console.log("================================================================================");
  for (const [metric, ms] of Object.entries(timings)) {
    const status = ms < 1500 ? "⚡ FAST" : (ms < 3000 ? "✔ ACCEPTABLE" : "⚠ SLOW");
    console.log(`  ${metric.padEnd(20)} : ${String(ms).padStart(6)} ms   [${status}]`);
  }

  console.log("\n================================================================================");
  console.log(`  AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED (Pass Rate: ${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log("================================================================================");

  if (failed > 0) process.exit(1);
}

runSeniorTestSuite().catch((err) => {
  console.error("Test execution threw error:", err);
  process.exit(1);
});
