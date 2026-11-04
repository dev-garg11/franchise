import fs from "fs";

// 1. Patch src/lib/email.js
let emailCode = fs.readFileSync("src/lib/email.js", "utf8");

const oldEmailTransporter = /const SMTP_USER = process\.env\.SMTP_USER;[\s\S]*?auth: \{[\s\S]*?user: SMTP_USER,[\s\S]*?pass: SMTP_PASS,[\s\S]*?\},[\s\S]*?\}\)[\s\S]*?: null;/;

const newEmailTransporter = `const SMTP_USER = (process.env.SMTP_USER || "").trim();
const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\\s+/g, "").trim();
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const isConfigured = Boolean(SMTP_USER && SMTP_PASS);

const logoPath = path.join(process.cwd(), "public", "logo-footer.png");

const transporter = isConfigured
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;`;

if (oldEmailTransporter.test(emailCode)) {
  emailCode = emailCode.replace(oldEmailTransporter, newEmailTransporter);
  fs.writeFileSync("src/lib/email.js", emailCode, "utf8");
  console.log("✔ Successfully patched src/lib/email.js");
} else {
  console.log("ℹ email.js transporter already updated or pattern did not match directly.");
}

// 2. Patch src/lib/db.js
let dbCode = fs.readFileSync("src/lib/db.js", "utf8");

// Replace requestLoginOtp
const oldRequestOtpRegex = /export async function requestLoginOtp\(identifier\) \{[\s\S]*?return \{[\s\S]*?success: true,[\s\S]*?manualCode:[\s\S]*?\};[\s\S]*?\}/;

const newRequestOtpCode = `export async function requestLoginOtp(identifier) {
  await connectForAuth();
  const user = await findLoginUserWithRetry(identifier);
  if (!user) return { success: false, message: "No account found for this email or mobile number." };

  // Generate real secure 6-digit random OTP
  const code = String(crypto.randomInt(100000, 1000000));
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  await LoginOtp.deleteMany({ user: user._id });
  await LoginOtp.create({
    user: user._id,
    codeHash,
    destination: user.email,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });

  // Dispatch OTP strictly to user's registered Gmail
  try {
    const { sendLoginOtpEmail } = await import("./email");
    await sendLoginOtpEmail({ email: user.email, code });
  } catch (mailError) {
    console.error("Failed to deliver Gmail OTP:", mailError);
    return {
      success: false,
      message: "Failed to send OTP to Gmail. Please check email service configuration or try again."
    };
  }

  const maskedEmail = user.email.replace(/^(.{2}).*(@.*)$/, "$1***$2");
  return {
    success: true,
    destination: maskedEmail,
    message: \`OTP sent successfully to your Gmail (\${maskedEmail}). Please check your inbox.\`
  };
}`;

if (oldRequestOtpRegex.test(dbCode)) {
  dbCode = dbCode.replace(oldRequestOtpRegex, newRequestOtpCode);
} else {
  console.log("Warning: oldRequestOtpRegex did not match in db.js");
}

// Replace verifyLoginOtp
const oldVerifyOtpRegex = /export async function verifyLoginOtp\(identifier, code\) \{[\s\S]*?const manualCode = process\.env\.MANUAL_LOGIN_OTP[\s\S]*?if \(!isManualMatch\) \{[\s\S]*?\}\s*else\s*\{[\s\S]*?\}\s*const profileId = user\._id\.toString\(\);/;

const newVerifyOtpCode = `export async function verifyLoginOtp(identifier, code) {
  await connectForAuth();
  const user = await findLoginUserWithRetry(identifier);
  const cleanCode = String(code || "").trim();
  if (!user || !/^\\d{6}$/.test(cleanCode)) {
    return { success: false, message: "Please enter a valid 6-digit OTP." };
  }

  const otp = await LoginOtp.findOne({ user: user._id }).sort({ createdAt: -1 });
  if (!otp || otp.expiresAt.getTime() <= Date.now() || otp.attempts >= 5) {
    return { success: false, message: "OTP has expired or exceeded maximum attempts. Please request a new OTP." };
  }

  const codeHash = crypto.createHash("sha256").update(cleanCode).digest("hex");
  if (codeHash !== otp.codeHash) {
    await LoginOtp.updateOne({ _id: otp._id }, { $inc: { attempts: 1 } });
    return { success: false, message: "Invalid OTP. Please check your Gmail and try again." };
  }

  // OTP verified successfully - clear pending OTPs
  await LoginOtp.deleteMany({ user: user._id }).catch(() => {});

  const profileId = user._id.toString();`;

if (oldVerifyOtpRegex.test(dbCode)) {
  dbCode = dbCode.replace(oldVerifyOtpRegex, newVerifyOtpCode);
  fs.writeFileSync("src/lib/db.js", dbCode, "utf8");
  console.log("✔ Successfully patched src/lib/db.js with secure Gmail OTP logic");
} else {
  console.log("Warning: oldVerifyOtpRegex did not match in db.js");
}

// 3. Patch src/components/AuthModal.js
let authCode = fs.readFileSync("src/components/AuthModal.js", "utf8");

// Replace handleRequestOtp success message
authCode = authCode.replace(
  /const manualOtp = data\.manualCode[\s\S]*?setSuccess\(`Manual OTP: \${manualOtp}[\s\S]*?`\);/,
  'setSuccess(`OTP sent to ${data.destination || "your Gmail"}. Please check your inbox and enter the 6-digit code.`);'
);

// Replace the manual OTP helper text below input
authCode = authCode.replace(
  /Manual verification OTP:[\s\S]*?\(Enter manually to verify without checking email\)\./,
  'Check your Gmail inbox or spam folder for your 6-digit verification code.'
);

fs.writeFileSync("src/components/AuthModal.js", authCode, "utf8");
console.log("✔ Successfully patched src/components/AuthModal.js");
