/**
 * scripts/verify-franchise-fee-bounds.mjs
 * Automated Boundary Test Suite for Franchise Fee Validation (R3 & R4)
 */

import { register } from "node:module";

// Register custom loader to resolve Next.js "@/..." alias in standalone Node
try {
  register(new URL("./alias-loader.mjs", import.meta.url).href, import.meta.url);
} catch (e) {
  // Fallback if already registered
}

const { validateFranchiseFee } = await import("../src/lib/seo/validate.js");
const { mapRangeToNumeric, getMaxInvestmentLimitValue } = await import("../src/lib/investmentData.js");
const { formatLakhs } = await import("../src/lib/brandFormatters.js");

console.log("=== Running Franchise Fee Bounds Verification Suite ===\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// 1. Boundary: Equal Condition (franchiseFee === maxInvestment)
{
  const maxLimit = 1000000; // 10 Lakhs
  const fee = 1000000;
  const result = validateFranchiseFee(fee, maxLimit);
  assert(
    result.isValid === true && result.reason === null,
    `Equal condition (fee: ${fee}, max: ${maxLimit}) must be valid`
  );
}

// 2. Boundary: Less Than Condition (franchiseFee < maxInvestment)
{
  const maxLimit = 1000000; // 10 Lakhs
  const fee = 999999;
  const result = validateFranchiseFee(fee, maxLimit);
  assert(
    result.isValid === true && result.reason === null,
    `Less than boundary (fee: ${fee}, max: ${maxLimit}) must be valid`
  );
}

{
  const maxLimit = 5000000; // 50 Lakhs
  const fee = 250000; // 2.5 Lakhs
  const result = validateFranchiseFee(fee, maxLimit);
  assert(
    result.isValid === true && result.reason === null,
    `Well below limit (fee: ${fee}, max: ${maxLimit}) must be valid`
  );
}

// 3. Boundary: Greater Than Condition (franchiseFee > maxInvestment)
{
  const maxLimit = 1000000; // 10 Lakhs
  const fee = 1000001; // Just 1 rupee over
  const result = validateFranchiseFee(fee, maxLimit);
  assert(
    result.isValid === false &&
    typeof result.reason === "string" &&
    result.reason.includes("One-Time Franchise Fee cannot exceed the Max Investment Limit"),
    `Greater than boundary (fee: ${fee}, max: ${maxLimit}) must be rejected with proper warning`
  );
}

{
  const maxLimit = 1000000; // 10 Lakhs
  const fee = 2500000; // 25 Lakhs
  const result = validateFranchiseFee(fee, maxLimit);
  assert(
    result.isValid === false &&
    result.reason.includes("One-Time Franchise Fee cannot exceed the Max Investment Limit"),
    `Well above limit (fee: ${fee}, max: ${maxLimit}) must be rejected`
  );
}

// 4. String format handling (user input values from HTML inputs)
{
  const maxLimit = 2000000; // 20 Lakhs
  const feeStr = "1500000";
  const result = validateFranchiseFee(feeStr, maxLimit);
  assert(
    result.isValid === true && result.value === 1500000,
    `String numeric fee ("${feeStr}" <= ${maxLimit}) must parse and pass`
  );
}

{
  const maxLimit = 2000000; // 20 Lakhs
  const feeStr = "2500000";
  const result = validateFranchiseFee(feeStr, maxLimit);
  assert(
    result.isValid === false && result.value === 2500000,
    `String numeric fee exceeding limit ("${feeStr}" > ${maxLimit}) must parse and reject`
  );
}

// 5. Empty / Zero / Optional fee edge cases
{
  assert(validateFranchiseFee("", 1000000).isValid === true, "Empty string fee should not trigger error");
  assert(validateFranchiseFee(null, 1000000).isValid === true, "Null fee should not trigger error");
  assert(validateFranchiseFee(undefined, 1000000).isValid === true, "Undefined fee should not trigger error");
  assert(validateFranchiseFee(0, 1000000).isValid === true, "Zero fee should not trigger error");
}

// 6. Investment tier mapping & helper tests
{
  const mappedMin = mapRangeToNumeric("Rs. 2 Lakh - 5 Lakh", false);
  const mappedMax = mapRangeToNumeric("Rs. 2 Lakh - 5 Lakh", true);
  assert(mappedMin === 200000 && mappedMax === 500000, "mapRangeToNumeric maps 'Rs. 2 Lakh - 5 Lakh' to 2L and 5L");

  const above5Cr = mapRangeToNumeric("Above Rs. 5 Crore", true);
  assert(above5Cr === 999999999, "mapRangeToNumeric maps 'Above Rs. 5 Crore' to 999,999,999");
}

// 7. getMaxInvestmentLimitValue resolution priority
{
  assert(getMaxInvestmentLimitValue("Rs. 5 Lakh - 10 Lakh", "Rs. 2 Lakh - 5 Lakh", 3000000) === 3000000, "Direct numericMax takes top priority");
  assert(getMaxInvestmentLimitValue("Rs. 5 Lakh - 10 Lakh", "Rs. 2 Lakh - 5 Lakh", 0) === 1000000, "maxLimitStr resolves to 1,000,000");
  assert(getMaxInvestmentLimitValue("", "Rs. 2 Lakh - 5 Lakh", 0) === 500000, "rangeStr resolves to 500,000 when maxLimitStr is empty");
  assert(getMaxInvestmentLimitValue("", "", 0) === 0, "Empty inputs resolve to 0");
}

// 8. Error message format validation
{
  const maxLimit = 10000000; // 1 Crore
  const result = validateFranchiseFee(20000000, maxLimit);
  const expectedPrefix = "One-Time Franchise Fee cannot exceed the Max Investment Limit (";
  assert(
    result.reason.startsWith(expectedPrefix) && result.reason.endsWith(")"),
    `Error reason format matches required template: "${result.reason}"`
  );
}

console.log(`\n=== Suite Completed: ${passed} passed, ${failed} failed ===`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
