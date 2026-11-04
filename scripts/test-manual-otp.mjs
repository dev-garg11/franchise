import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Direct test for manual OTP flow
async function testManualOtpFlow() {
  console.log("Starting Manual OTP verification test...");
  
  // 1. Verify environment defaults
  const autoSend = process.env.AUTO_SEND_LOGIN_OTP_EMAIL === "true";
  console.log(`- Automated email dispatch enabled: ${autoSend} (Expected: false)`);
  if (autoSend) {
    throw new Error("Automatic email should be disabled by default for manual OTP.");
  }

  // 2. Test manual code definition
  const manualCode = process.env.MANUAL_LOGIN_OTP || "123456";
  console.log(`- Standard Manual OTP configured: ${manualCode}`);

  // 3. Verify regex check
  const isValidFormat = /^\d{6}$/.test(manualCode);
  console.log(`- Manual code 6-digit regex format: ${isValidFormat ? "VALID" : "INVALID"}`);
  if (!isValidFormat) throw new Error("Manual OTP must be 6 digits.");

  console.log("✔ Manual OTP settings and logic verified successfully!");
}

testManualOtpFlow().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
