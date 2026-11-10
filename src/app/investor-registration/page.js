"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Mail, MapPin, IndianRupee, Lock, Phone } from "lucide-react";
import { REGISTRATION_INVESTMENT_OPTIONS, getFilteredMaxLimits } from "@/lib/investmentData";
import { BRAND_CATEGORIES, ALL_INDIAN_STATES } from "@/lib/brandConstants";
import { validateArea } from "@/lib/seo/validate";
import { toast, Swal } from "@/lib/swal";

const INVESTMENT_OPTIONS = [
  "Rs. 10,000 - 50,000",
  "Rs. 50,000 - 2 Lakh",
  "Rs. 2 Lakh - 5 Lakh",
  "Rs. 5 Lakh - 10 Lakh",
  "Rs. 10 Lakh - 20 Lakh",
  "Rs. 20 Lakh - 30 Lakh",
  "Rs. 30 Lakh - 50 Lakh",
  "Rs. 50 Lakh - 1 Crore",
  "Rs. 1 Crore - 2 Crore",
  "Rs. 2 Crore - 5 Crore",
  "Above Rs. 5 Crore"
];

const mapRangeToNumeric = (rangeStr, isMax = false) => {
  if (!rangeStr) return 0;
  if (rangeStr === "Rs. 10,000 - 50,000") return isMax ? 50000 : 10000;
  if (rangeStr === "Rs. 50,000 - 2 Lakh") return isMax ? 200000 : 50000;
  if (rangeStr === "Rs. 2 Lakh - 5 Lakh") return isMax ? 500000 : 200000;
  if (rangeStr === "Rs. 5 Lakh - 10 Lakh") return isMax ? 1000000 : 500000;
  if (rangeStr === "Rs. 10 Lakh - 20 Lakh") return isMax ? 2000000 : 1000000;
  if (rangeStr === "Rs. 20 Lakh - 30 Lakh") return isMax ? 3000000 : 2000000;
  if (rangeStr === "Rs. 30 Lakh - 50 Lakh") return isMax ? 5000000 : 3000000;
  if (rangeStr === "Rs. 50 Lakh - 1 Crore") return isMax ? 10000000 : 5000000;
  if (rangeStr === "Rs. 1 Crore - 2 Crore") return isMax ? 20000000 : 10000000;
  if (rangeStr === "Rs. 2 Crore - 5 Crore") return isMax ? 50000000 : 20000000;
  if (rangeStr === "Above Rs. 5 Crore") return isMax ? 999999999 : 50000000;
  return 0;
};

export default function InvestorRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    pincode: "",
    investment_range: "",
    max_investment_limit: "",
    preferredLocation: "New Delhi",
    industries: [],
    propertyAvailable: "No",
    propertyArea: "",
    experience: "No",
    comments: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState("");
  const [areaError, setAreaError] = useState("");
  const [agreed, setAgreed] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errorField === name) setErrorField("");

    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        name: value.slice(0, 30),
      }));
    } else if (name === "investment_range") {
      const validMaxOptions = getFilteredMaxLimits(value);
      setFormData((prev) => {
        let maxVal = prev.max_investment_limit;
        if (maxVal && !validMaxOptions.includes(maxVal)) {
          maxVal = value;
        }
        return {
          ...prev,
          investment_range: value,
          max_investment_limit: maxVal,
        };
      });
    } else if (name === "phone") {
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        phone: sanitized,
      }));
    } else if (name === "propertyArea") {
      const numMatch = value.replace(/,/g, "").match(/\d+/g);
      if (numMatch) {
        const maxVal = Math.max(...numMatch.map(Number));
        if (maxVal > 5000) {
          setAreaError("⚠ Available property area cannot exceed 5,000 Sq. Ft.");
        } else {
          setAreaError("");
        }
      } else {
        setAreaError("");
      }
      setFormData((prev) => ({
        ...prev,
        propertyArea: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleIndustryChange = (industry) => {
    setFormData((prev) => {
      const list = [...prev.industries];
      if (list.includes(industry)) {
        return { ...prev, industries: list.filter((i) => i !== industry) };
      } else {
        return { ...prev, industries: [...list, industry] };
      }
    });
  };

  const scrollAndWarn = (name, msg) => {
    setError(msg);
    setErrorField(name);
    toast.error(msg);
    setLoading(false);
    const el = name === "agree" ? document.getElementById("agree-investor") : document.getElementsByName(name)[0];
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setErrorField("");

    if (!formData.name?.trim()) {
      return scrollAndWarn("name", "Please enter Investor Full Name.");
    }
    if (formData.name.trim().length > 30) {
      return scrollAndWarn("name", "Investor Name cannot exceed 30 characters.");
    }

    const cleanPhone = String(formData.phone || "").replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return scrollAndWarn("phone", "Please enter a valid 10-digit Indian Mobile Number starting with 6, 7, 8, or 9.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim() || !emailRegex.test(formData.email.trim())) {
      return scrollAndWarn("email", "Please enter a valid Email Address.");
    }

    if (!formData.password || formData.password.length < 6) {
      return scrollAndWarn("password", "Password must be at least 6 characters.");
    }
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      return scrollAndWarn("confirmPassword", "Passwords do not match. Please verify both password fields.");
    }

    if (!formData.pincode?.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      return scrollAndWarn("pincode", "Please enter a valid 6-digit Pincode.");
    }

    if (!formData.investment_range) {
      return scrollAndWarn("investment_range", "Please select an Investment Range.");
    }
    if (!formData.max_investment_limit) {
      return scrollAndWarn("max_investment_limit", "Please select a Maximum Investment Limit.");
    }

    const rangeIndex = INVESTMENT_OPTIONS.indexOf(formData.investment_range);
    const maxIndex = INVESTMENT_OPTIONS.indexOf(formData.max_investment_limit);
    if (maxIndex < rangeIndex) {
      return scrollAndWarn("max_investment_limit", "Maximum investment limit cannot be lower than the starting investment range.");
    }

    let sanitizedArea = formData.propertyArea ? formData.propertyArea.trim() : "";
    if (formData.propertyAvailable === "Yes" && sanitizedArea) {
      const numMatch = sanitizedArea.replace(/,/g, "").match(/\d+/g);
      if (numMatch) {
        const maxVal = Math.max(...numMatch.map(Number));
        if (maxVal > 5000) {
          return scrollAndWarn("propertyArea", "Property Area cannot exceed 5,000 Sq. Ft.");
        }
      }
      const areaVal = validateArea(sanitizedArea);
      if (!areaVal.isValid) {
        return scrollAndWarn("propertyArea", `Invalid Area: ${areaVal.reason}. Available area must be between 50 and 5,000 sq ft.`);
      }
      sanitizedArea = areaVal.value;
    }

    if (!agreed) {
      return scrollAndWarn("agree", "Please check the box to agree to the terms.");
    }

    try {
      const rangeMinVal = mapRangeToNumeric(formData.investment_range, false);
      const rangeMaxVal = mapRangeToNumeric(formData.max_investment_limit, true);

      const payload = {
        ...formData,
        phone: cleanPhone,
        propertyArea: sanitizedArea,
        budgetMin: rangeMinVal,
        budgetMax: rangeMaxVal,
      };
      delete payload.confirmPassword;

      const res = await fetch("/api/investors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("Investor registration submitted successfully!");
      } else {
        const data = await res.json();
        const errorMsg = data.error || "Failed to submit investor registration.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      toast.error("Network error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="form-page flex-center" style={{ minHeight: "calc(100vh - 80px)" }}>
        <div className="container" style={{ maxWidth: "600px" }}>
          <div className="form-wrapper success-card">
            <div className="success-icon flex-center">
              <CheckCircle2 size={40} />
            </div>
            <h2>Registration Successful!</h2>
            <p>
              Thank you, <strong>{formData.name}</strong>. Your investor profile has been registered successfully.
            </p>
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "30px", fontSize: "14px", color: "var(--text-muted)", textAlign: "left" }}>
              <p style={{ fontWeight: "600", color: "var(--text-dark)", marginBottom: "4px" }}>What's Next?</p>
              <ul style={{ paddingLeft: "20px" }}>
                <li>You can now log in to your custom <strong>Investor Panel</strong> using your email and password.</li>
                <li>Search through franchise recommendations matching your budget limit and interests.</li>
              </ul>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link href="/login" className="btn btn-primary">
                Proceed to Login
              </Link>
              <Link href="/" className="btn btn-outline">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="container">
        <div className="form-wrapper">
          <div className="form-header">
            <h2>Start Your New Business Journey</h2>
            <p>Register as a certified investor. Gain exclusive access to franchise catalogs, investment breakdowns, and direct support from brand managers.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="form-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <h3 className="form-section-title">1. Personal & Contact Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Investor Full Name <span>*</span></label>
                <input
                  type="text"
                  name="name"
                  required
                  maxLength={30}
                  placeholder="Full Name (Max 30 chars)"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  style={errorField === "name" ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)" } : undefined}
                />
                {errorField === "name" && (
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginTop: "4px", display: "block" }}>
                    ⚠ Please enter Investor Full Name (Max 30 characters).
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Contact Number <span>*</span></label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{
                    padding: "10px 14px",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRight: "none",
                    borderRadius: "6px 0 0 6px",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#334155"
                  }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    style={{
                      borderRadius: "0 6px 6px 0",
                      ...(errorField === "phone" ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)" } : {})
                    }}
                  />
                </div>
                {errorField === "phone" && (
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginTop: "4px", display: "block" }}>
                    ⚠ Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Email Address <span>*</span></label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  style={errorField === "email" ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)" } : undefined}
                />
                {errorField === "email" && (
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginTop: "4px", display: "block" }}>
                    ⚠ Please enter a valid email address.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Login Password <span>*</span></label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Create password for dashboard (min 6 chars)"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  style={errorField === "password" ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)" } : undefined}
                />
                {errorField === "password" && (
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginTop: "4px", display: "block" }}>
                    ⚠ Password must be at least 6 characters.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  style={errorField === "confirmPassword" ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)" } : undefined}
                />
                {errorField === "confirmPassword" && (
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginTop: "4px", display: "block" }}>
                    ⚠ Passwords do not match.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Pincode <span>*</span></label>
                <input
                  type="text"
                  name="pincode"
                  required
                  placeholder="Enter 6-digit Pincode"
                  value={formData.pincode}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || (/^\d+$/.test(val) && val.length <= 6)) {
                      handleChange(e);
                    }
                  }}
                  className="form-input"
                  style={errorField === "pincode" ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)" } : undefined}
                />
                {errorField === "pincode" && (
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginTop: "4px", display: "block" }}>
                    ⚠ Pincode must be exactly 6 digits.
                  </span>
                )}
              </div>
            </div>

            <h3 className="form-section-title">2. Investment Capacity</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Investment Range <span>*</span></label>
                <select
                  name="investment_range"
                  required
                  value={formData.investment_range}
                  onChange={handleChange}
                  className="form-input"
                  style={errorField === "investment_range" ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)" } : undefined}
                >
                  <option value="" disabled>Select Investment Range</option>
                  {INVESTMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errorField === "investment_range" && (
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginTop: "4px", display: "block" }}>
                    ⚠ Please select an investment range.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Max Investment Limit <span>*</span>
                  {formData.investment_range && (
                    <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: "700", marginLeft: "6px" }}>
                      (≥ {formData.investment_range})
                    </span>
                  )}
                </label>
                <select
                  name="max_investment_limit"
                  required
                  value={formData.max_investment_limit}
                  onChange={handleChange}
                  className="form-input"
                  style={errorField === "max_investment_limit" ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)" } : undefined}
                >
                  <option value="" disabled>Select Max Investment Limit</option>
                  {getFilteredMaxLimits(formData.investment_range).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errorField === "max_investment_limit" && (
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginTop: "4px", display: "block" }}>
                    ⚠ Please select maximum investment limit.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Preferred Franchise Location <span>*</span></label>
                <select
                  name="preferredLocation"
                  value={formData.preferredLocation}
                  onChange={handleChange}
                  className="form-input"
                >
                  {ALL_INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <h3 className="form-section-title">3. Sector Preferences</h3>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label>Select sectors you are interested in:</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px", marginTop: "8px" }}>
                {BRAND_CATEGORIES.map((ind, i) => (
                  <div key={i} className="form-checkbox">
                    <input
                      type="checkbox"
                      id={`ind-${i}`}
                      checked={formData.industries.includes(ind)}
                      onChange={() => handleIndustryChange(ind)}
                    />
                    <label htmlFor={`ind-${i}`}>{ind}</label>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="form-section-title">4. Space & Experience</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Do you have a commercial property available?</label>
                <select
                  name="propertyAvailable"
                  value={formData.propertyAvailable}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="Yes">Yes, I own/lease a shop</option>
                  <option value="No">No property yet</option>
                  <option value="Renting">Planning to rent soon</option>
                </select>
              </div>

              <div className="form-group">
                <label>If Yes, available area (Sq. Ft.)</label>
                <input
                  type="text"
                  name="propertyArea"
                  placeholder="e.g. 500 Sq. Ft. (50 to 5,000)"
                  value={formData.propertyArea}
                  onChange={handleChange}
                  className="form-input"
                  disabled={formData.propertyAvailable === "No"}
                  style={areaError || errorField === "propertyArea" ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2)" } : undefined}
                />
                {areaError ? (
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginTop: "4px", display: "block" }}>
                    {areaError}
                  </span>
                ) : (
                  <small style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    Allowed range: 50 to 5,000 sq ft. Leave blank if not applicable.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Do you have prior retail/business experience?</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="Yes">Yes, active business owner</option>
                  <option value="No">No, I am a first-time franchisee</option>
                  <option value="Corporate">Corporate background / salaried</option>
                </select>
              </div>

              <div className="form-group form-grid-full">
                <label>Additional Notes / Requirements</label>
                <textarea
                  name="comments"
                  rows="3"
                  placeholder="Describe your location characteristics, time-to-start, or key priorities."
                  value={formData.comments}
                  onChange={handleChange}
                  className="form-input"
                ></textarea>
              </div>
            </div>

            <div style={{ marginTop: "32px" }}>
              <div className="form-checkbox" style={{ marginBottom: "20px" }}>
                <input
                  type="checkbox"
                  id="agree-investor"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary)", cursor: "pointer" }}
                />
                <label htmlFor="agree-investor" style={{ fontSize: "13px", color: errorField === "agree" ? "#991b1b" : "var(--text-muted)", cursor: "pointer" }}>
                  I consent to receive contact calls and emails from Franchise Roots verified brand representatives regarding franchise proposals. <span>*</span>
                </label>
              </div>
              {errorField === "agree" && (
                <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", marginTop: "-12px", marginBottom: "16px", display: "block" }}>
                  ⚠ Please check the box to agree before submitting.
                </span>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", padding: "14px 28px", fontSize: "16px" }}
              >
                {loading ? "Registering Profile..." : "Submit Investor Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
