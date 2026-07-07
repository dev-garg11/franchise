"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Mail, MapPin, IndianRupee, Lock } from "lucide-react";

export default function InvestorRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    budgetMin: "",
    budgetMax: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError("Please fill in all mandatory fields including password.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        budgetMin: Number(formData.budgetMin) || 0,
        budgetMax: Number(formData.budgetMax) || 0,
      };

      const res = await fetch("/api/investors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit investor registration.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
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

          <form onSubmit={handleSubmit} className="form-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <h3 className="form-section-title">1. Personal & Contact Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Investor Full Name <span>*</span></label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Contact Number <span>*</span></label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="10-digit mobile"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
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
                />
              </div>

              <div className="form-group">
                <label>Login Password <span>*</span></label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Create password for dashboard"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <h3 className="form-section-title">2. Investment Capacity</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Minimum Budget (INR)</label>
                <input
                  type="number"
                  name="budgetMin"
                  placeholder="e.g. 200000"
                  value={formData.budgetMin}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Maximum Budget (INR)</label>
                <input
                  type="number"
                  name="budgetMax"
                  placeholder="e.g. 1000000"
                  value={formData.budgetMax}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Preferred Franchise Location <span>*</span></label>
                <select
                  name="preferredLocation"
                  value={formData.preferredLocation}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="New Delhi">New Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Kerala">Kerala</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </div>
            </div>

            <h3 className="form-section-title">3. Sector Preferences</h3>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label>Select sectors you are interested in:</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
                {[
                  "Food and Beverage",
                  "Retail",
                  "Education",
                  "Automobiles",
                  "Health and Wellness",
                  "Business Services",
                ].map((ind, i) => (
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
                  placeholder="e.g. 500 Sq. Ft."
                  value={formData.propertyArea}
                  onChange={handleChange}
                  className="form-input"
                  disabled={formData.propertyAvailable === "No"}
                />
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
                <input type="checkbox" required id="agree-investor" />
                <label htmlFor="agree-investor" style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  I consent to receive contact calls and emails from Franchise Apply verified brand representatives regarding franchise proposals.
                </label>
              </div>

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
