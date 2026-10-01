"use client";

import { useState, useEffect, useRef } from "react";
import { X, MessageCircle, CheckCircle, User, Phone, Mail, MapPin, Building, Briefcase, Store, TrendingUp } from "lucide-react";

export default function AskExpertsModal({ isOpen, onClose, initialMode = "buy" }) {
  const modalRef = useRef(null);
  const [activeMode, setActiveMode] = useState(initialMode === "expand" ? "expand" : "buy"); // "buy" | "expand"

  // Buy a Franchise state
  const [buyData, setBuyData] = useState({
    name: "",
    phone: "",
    email: "",
    category: "Food and Beverage",
    budget: "₹5L - ₹10 Lakhs",
    location: "",
    message: ""
  });

  // Expand My Brand state
  const [expandData, setExpandData] = useState({
    name: "",
    brandName: "",
    phone: "",
    email: "",
    category: "Food and Beverage",
    existingOutlets: "1 - 5 Outlets",
    targetCities: "",
    message: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setActiveMode(initialMode === "expand" ? "expand" : "buy");
      setSubmitted(false);
    }
  }, [isOpen, initialMode]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBuyChange = (e) => {
    let val = e.target.value;
    if (e.target.name === "phone") {
      val = val.replace(/\D/g, '').slice(0, 10);
    }
    setBuyData({ ...buyData, [e.target.name]: val });
  };

  const handleExpandChange = (e) => {
    let val = e.target.value;
    if (e.target.name === "phone") {
      val = val.replace(/\D/g, '').slice(0, 10);
    }
    setExpandData({ ...expandData, [e.target.name]: val });
  };

  const generateWhatsAppLink = () => {
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919876543210";
    const cleanPhone = adminPhone.replace(/[^0-9]/g, "");

    let text = "";
    if (activeMode === "expand") {
      text = `*New Expert Inquiry - EXPAND MY BRAND*\n\n` +
        `👤 *Contact Person:* ${expandData.name}\n` +
        `🏢 *Brand Name:* ${expandData.brandName}\n` +
        `📱 *WhatsApp:* ${expandData.phone}\n` +
        `✉️ *Email:* ${expandData.email || 'N/A'}\n` +
        `🏬 *Current Outlets:* ${expandData.existingOutlets}\n` +
        `📂 *Category:* ${expandData.category}\n` +
        `📍 *Target Cities:* ${expandData.targetCities || 'N/A'}\n` +
        `📝 *Requirement:* ${expandData.message || 'I want expert guidance on expanding my brand into a franchise network.'}`;
    } else {
      text = `*New Expert Inquiry - BUY A FRANCHISE*\n\n` +
        `👤 *Name:* ${buyData.name}\n` +
        `📱 *WhatsApp:* ${buyData.phone}\n` +
        `✉️ *Email:* ${buyData.email || 'N/A'}\n` +
        `🏢 *Category Interest:* ${buyData.category}\n` +
        `💰 *Budget Range:* ${buyData.budget}\n` +
        `📍 *Preferred Location:* ${buyData.location || 'N/A'}\n` +
        `📝 *Query:* ${buyData.message || 'I want expert consultation on buying a franchise.'}`;
    }

    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentData = activeMode === "expand" ? expandData : buyData;
    if (!currentData.name || !currentData.phone) return;
    if (activeMode === "expand" && !expandData.brandName) return;

    setSubmitting(true);
    const waUrl = generateWhatsAppLink();
    setWhatsappUrl(waUrl);

    try {
      if (activeMode === "expand") {
        // Save Brand Lead
        await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: expandData.brandName,
            company: expandData.brandName,
            category: expandData.category,
            phone: expandData.phone,
            email: expandData.email || `${expandData.phone.replace(/[^0-9]/g, '')}@brand.com`,
            pincode: "000000",
            investment_range: "Expand Brand Advisory",
            max_investment_limit: "N/A",
            hq: expandData.targetCities || "N/A",
            description: `[ASK OUR EXPERTS - EXPAND MY BRAND]: Contact: ${expandData.name}. Current Outlets: ${expandData.existingOutlets}. Message: ${expandData.message || 'N/A'}`,
            status: "Pending"
          })
        });
      } else {
        // Save Investor Lead
        await fetch("/api/investors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: buyData.name,
            email: buyData.email || `${buyData.phone.replace(/[^0-9]/g, '')}@investor.com`,
            phone: buyData.phone,
            investment_range: buyData.budget,
            industries: [buyData.category],
            preferredLocation: buyData.location,
            comments: `[ASK OUR EXPERTS - BUY A FRANCHISE]: ${buyData.message || 'General Expert Consultation Inquiry'}`,
            status: "Pending"
          })
        });
      }
    } catch (err) {
      console.error("Error logging expert inquiry:", err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      window.open(waUrl, "_blank");
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setActiveMode("buy");
    setBuyData({
      name: "",
      phone: "",
      email: "",
      category: "Food and Beverage",
      budget: "₹5L - ₹10 Lakhs",
      location: "",
      message: ""
    });
    setExpandData({
      name: "",
      brandName: "",
      phone: "",
      email: "",
      category: "Food and Beverage",
      existingOutlets: "1 - 5 Outlets",
      targetCities: "",
      message: ""
    });
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleReset();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        padding: "20px",
        zIndex: 999999,
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div
        ref={modalRef}
        className="modal-card experts-modal"
        style={{
          maxWidth: "620px",
          width: "100%",
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#fff", padding: "24px 28px", position: "relative" }}>
          <button
            onClick={handleReset}
            style={{
              position: "absolute",
              right: "20px",
              top: "20px",
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(34, 197, 94, 0.2)", color: "#4ade80", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", marginBottom: "12px" }}>
            <MessageCircle size={14} /> Direct Admin WhatsApp Advisory
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 6px 0", color: "#ffffff" }}>
            Ask Our Franchise Experts
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Connect directly with senior franchise advisors to expand your brand or invest in a top franchise.
          </p>

          {/* Mode Switcher Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "18px", background: "rgba(255,255,255,0.08)", padding: "4px", borderRadius: "12px" }}>
            <button
              type="button"
              onClick={() => { setActiveMode("buy"); setSubmitted(false); }}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: activeMode === "buy" ? "#ffffff" : "transparent",
                color: activeMode === "buy" ? "#0f172a" : "#cbd5e1",
                boxShadow: activeMode === "buy" ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              <Store size={16} style={{ color: activeMode === "buy" ? "#25D366" : "inherit" }} /> Buy a Franchise
            </button>

            <button
              type="button"
              onClick={() => { setActiveMode("expand"); setSubmitted(false); }}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: activeMode === "expand" ? "#ffffff" : "transparent",
                color: activeMode === "expand" ? "#0f172a" : "#cbd5e1",
                boxShadow: activeMode === "expand" ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              <TrendingUp size={16} style={{ color: activeMode === "expand" ? "#38bdf8" : "inherit" }} /> Expand My Brand
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px", backgroundColor: "#ffffff", overflowY: "auto" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "20px 10px" }}>
              <div style={{ width: "64px", height: "64px", background: "#dcfce7", color: "#16a34a", borderRadius: "50%", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={36} />
              </div>
              <h4 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                Inquiry Sent to WhatsApp!
              </h4>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px", lineHeight: "1.5" }}>
                Your {activeMode === "expand" ? "brand expansion" : "franchise inquiry"} request has been logged. Click below to chat with Admin directly.
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex-center"
                style={{ background: "#25D366", borderColor: "#25D366", color: "#ffffff", width: "100%", padding: "14px", borderRadius: "12px", fontWeight: "700", fontSize: "15px", gap: "8px", textDecoration: "none" }}
              >
                <MessageCircle size={20} /> Open Admin WhatsApp Chat
              </a>

              <button
                onClick={handleReset}
                style={{ marginTop: "14px", background: "transparent", border: "none", color: "#64748b", fontSize: "13px", cursor: "pointer", textDecoration: "underline" }}
              >
                Close Window
              </button>
            </div>
          ) : activeMode === "expand" ? (
            /* Expand My Brand Form */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Your Name *
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={expandData.name}
                      onChange={handleExpandChange}
                      style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Brand / Business Name *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Building size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      name="brandName"
                      required
                      placeholder="e.g. Chai Express Café"
                      value={expandData.brandName}
                      onChange={handleExpandChange}
                      style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    WhatsApp Mobile No. *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      name="phone"
                      required
                      placeholder="e.g. 9876543210"
                      value={expandData.phone}
                      onChange={handleExpandChange}
                      style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. contact@brand.com"
                      value={expandData.email}
                      onChange={handleExpandChange}
                      style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Business Category
                  </label>
                  <select
                    name="category"
                    value={expandData.category}
                    onChange={handleExpandChange}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", background: "#fff", color: "#0f172a", outline: "none" }}
                  >
                    <option value="Food and Beverage">Food & Beverage</option>
                    <option value="Retail">Retail & Fashion</option>
                    <option value="Education">Education & Training</option>
                    <option value="Automobiles">Automotive & EV</option>
                    <option value="Health and Wellness">Health & Wellness</option>
                    <option value="Business Services">Business Services & IT</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Existing Outlets / Units
                  </label>
                  <select
                    name="existingOutlets"
                    value={expandData.existingOutlets}
                    onChange={handleExpandChange}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", background: "#fff", color: "#0f172a", outline: "none" }}
                  >
                    <option value="1 - 5 Outlets">1 - 5 Outlets</option>
                    <option value="5 - 20 Outlets">5 - 20 Outlets</option>
                    <option value="20 - 50 Outlets">20 - 50 Outlets</option>
                    <option value="50+ Outlets">50+ Outlets</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Target Expansion Cities / States
                </label>
                <div style={{ position: "relative" }}>
                  <MapPin size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    name="targetCities"
                    placeholder="e.g. Delhi NCR, Mumbai, Bengaluru"
                    value={expandData.targetCities}
                    onChange={handleExpandChange}
                    style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Expansion Details / Requirements
                </label>
                <textarea
                  name="message"
                  rows={2}
                  placeholder="Describe your expansion goals, required franchisee profile, or FOCO/FOFO preferences..."
                  value={expandData.message}
                  onChange={handleExpandChange}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", resize: "vertical", color: "#0f172a", backgroundColor: "#fff" }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn flex-center"
                style={{
                  background: "#25D366",
                  color: "#ffffff",
                  border: "none",
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: "pointer",
                  gap: "8px",
                  marginTop: "8px",
                  boxShadow: "0 4px 14px rgba(37, 211, 102, 0.35)"
                }}
              >
                {submitting ? "Connecting..." : <> <MessageCircle size={20} /> Submit & Connect to Admin WhatsApp </>}
              </button>
            </form>
          ) : (
            /* Buy a Franchise Form */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Full Name *
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={buyData.name}
                      onChange={handleBuyChange}
                      style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    WhatsApp Mobile No. *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      name="phone"
                      required
                      placeholder="e.g. 9876543210"
                      value={buyData.phone}
                      onChange={handleBuyChange}
                      style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. rajesh@gmail.com"
                      value={buyData.email}
                      onChange={handleBuyChange}
                      style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Preferred Location / District
                  </label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g. Mumbai, Maharashtra"
                      value={buyData.location}
                      onChange={handleBuyChange}
                      style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Industry Interest
                  </label>
                  <select
                    name="category"
                    value={buyData.category}
                    onChange={handleBuyChange}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", background: "#fff", color: "#0f172a", outline: "none" }}
                  >
                    <option value="Food and Beverage">Food & Beverage</option>
                    <option value="Retail">Retail & Fashion</option>
                    <option value="Education">Education & Training</option>
                    <option value="Automobiles">Automotive & EV</option>
                    <option value="Health and Wellness">Health & Wellness</option>
                    <option value="Business Services">Business Services & IT</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                    Investment Budget
                  </label>
                  <select
                    name="budget"
                    value={buyData.budget}
                    onChange={handleBuyChange}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", background: "#fff", color: "#0f172a", outline: "none" }}
                  >
                    <option value="Under ₹2 Lakhs">Under ₹2 Lakhs</option>
                    <option value="₹2L - ₹5 Lakhs">₹2L - ₹5 Lakhs</option>
                    <option value="₹5L - ₹10 Lakhs">₹5L - ₹10 Lakhs</option>
                    <option value="₹10L - ₹20 Lakhs">₹10L - ₹20 Lakhs</option>
                    <option value="₹20L - ₹50 Lakhs">₹20L - ₹50 Lakhs</option>
                    <option value="Above ₹50 Lakhs">Above ₹50 Lakhs</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Specific Requirements or Questions
                </label>
                <textarea
                  name="message"
                  rows={2}
                  placeholder="Tell us what type of business or brand you are interested in starting..."
                  value={buyData.message}
                  onChange={handleBuyChange}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", resize: "vertical", color: "#0f172a", backgroundColor: "#fff" }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn flex-center"
                style={{
                  background: "#25D366",
                  color: "#ffffff",
                  border: "none",
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: "pointer",
                  gap: "8px",
                  marginTop: "8px",
                  boxShadow: "0 4px 14px rgba(37, 211, 102, 0.35)"
                }}
              >
                {submitting ? "Connecting..." : <> <MessageCircle size={20} /> Send Inquiry to Admin WhatsApp </>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
