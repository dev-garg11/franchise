import fs from "fs";
import path from "path";

const regPath = path.join(process.cwd(), "src", "app", "brand-registration", "page.js");
let content = fs.readFileSync(regPath, "utf8");

// 1. Email input style & error
const oldEmailInput = `<input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. brand_1234@yopmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />`;

const newEmailInput = `<input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. brand_1234@yopmail.com"
                  value={formData.email}
                  onChange={(e) => {
                    if (errorField === "email") setErrorField("");
                    handleChange(e);
                  }}
                  className="form-input"
                  style={errorField === "email" ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)" } : undefined}
                />
                {errorField === "email" && (
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginTop: "4px", display: "block" }}>
                    ⚠ Please enter a valid Official Brand Email address.
                  </span>
                )}`;

if (content.includes(oldEmailInput)) {
  content = content.replace(oldEmailInput, newEmailInput);
} else {
  const oldEmailCRLF = oldEmailInput.replace(/\n/g, "\r\n");
  const newEmailCRLF = newEmailInput.replace(/\n/g, "\r\n");
  if (content.includes(oldEmailCRLF)) {
    content = content.replace(oldEmailCRLF, newEmailCRLF);
  }
}

// 2. Phone input style & error
const oldPhoneInput = `<input
                  type="tel"
                  name="phone"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  placeholder="10 digit mobile"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />`;

const newPhoneInput = `<input
                  type="tel"
                  name="phone"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  placeholder="10 digit mobile number"
                  value={formData.phone}
                  onChange={(e) => {
                    if (errorField === "phone") setErrorField("");
                    handleChange(e);
                  }}
                  className="form-input"
                  style={errorField === "phone" ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)" } : undefined}
                />
                {errorField === "phone" && (
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginTop: "4px", display: "block" }}>
                    ⚠ Please enter a valid 10-digit Mobile Number.
                  </span>
                )}`;

if (content.includes(oldPhoneInput)) {
  content = content.replace(oldPhoneInput, newPhoneInput);
} else {
  const oldPhoneCRLF = oldPhoneInput.replace(/\n/g, "\r\n");
  const newPhoneCRLF = newPhoneInput.replace(/\n/g, "\r\n");
  if (content.includes(oldPhoneCRLF)) {
    content = content.replace(oldPhoneCRLF, newPhoneCRLF);
  }
}

// 3. Agree checkbox style & inline error
const oldAgreeInput = `<div className="form-checkbox" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary)", cursor: "pointer" }}
                />
                <label htmlFor="agree" style={{ fontSize: "13px", color: "var(--text-muted)", cursor: "pointer", margin: 0 }}>
                  I agree to the <Link href="/terms" style={{ color: "var(--primary)", textDecoration: "underline" }}>terms and conditions</Link> of Franchise Apply.
                </label>
              </div>`;

const newAgreeInput = `<div className="form-checkbox" style={{
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                padding: errorField === "agree" ? "10px 14px" : "0",
                background: errorField === "agree" ? "#fef2f2" : "transparent",
                borderRadius: "8px",
                border: errorField === "agree" ? "1px solid #f87171" : "none"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agreed}
                    onChange={(e) => {
                      if (errorField === "agree") setErrorField("");
                      setAgreed(e.target.checked);
                    }}
                    style={{ width: "18px", height: "18px", accentColor: "var(--primary)", cursor: "pointer" }}
                  />
                  <label htmlFor="agree" style={{ fontSize: "13.5px", fontWeight: "600", color: errorField === "agree" ? "#991b1b" : "var(--text-muted)", cursor: "pointer", margin: 0 }}>
                    I agree to the <Link href="/terms" style={{ color: "var(--primary)", textDecoration: "underline" }}>terms and conditions</Link> of Franchise Apply. <span>*</span>
                  </label>
                </div>
                {errorField === "agree" && (
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginLeft: "28px" }}>
                    ⚠ Please check the box to agree to the terms and conditions.
                  </span>
                )}
              </div>`;

if (content.includes(oldAgreeInput)) {
  content = content.replace(oldAgreeInput, newAgreeInput);
} else {
  const oldAgreeCRLF = oldAgreeInput.replace(/\n/g, "\r\n");
  const newAgreeCRLF = newAgreeInput.replace(/\n/g, "\r\n");
  if (content.includes(oldAgreeCRLF)) {
    content = content.replace(oldAgreeCRLF, newAgreeCRLF);
  }
}

fs.writeFileSync(regPath, content, "utf8");
console.log("✔ Successfully polished field-level validation and error indicators in brand registration!");
