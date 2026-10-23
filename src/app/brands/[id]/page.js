"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  MessageCircle,
  ArrowLeft,
  MapPin,
  Building,
  Building2,
  Store,
  Users,
  IndianRupee,
  PieChart,
  Navigation,
  Mail,
  Flag,
  FileText,
  ChevronRight,
  Share2,
  Heart,
  Play,
  DollarSign,
  Award,
  ShieldCheck,
  Globe,
  Clock,
  Sparkles,
  PhoneCall,
  TrendingUp,
  Briefcase
} from "lucide-react";
import SEOGeoTags from "@/components/SEOGeoTags";
import CommercialSpecsBreakdown from "@/components/CommercialSpecsBreakdown";
import { decodeHtmlEntities, sanitizeBrandHtml, formatLakhs } from "@/lib/brandFormatters";

export default function BrandDetailPage({ params }) {
  const resolvedParams = use(params);
  const brandId = resolvedParams?.id;
  const router = useRouter();

  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedBrands, setRelatedBrands] = useState([]);

  // Enquiry form state
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    budget: "",
    message: ""
  });
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!brandId) return;

    setLoading(true);
    setError(null);

    // Fetch Brand Details
    fetch(`/api/brands/${brandId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Brand not found");
        return res.json();
      })
      .then((data) => {
        if (data.brand) {
          setBrand(data.brand);
          // Set default budget in form
          setEnquiryForm((prev) => ({
            ...prev,
            budget: data.brand.minInvestment ? `${formatLakhs(data.brand.minInvestment)} - ${formatLakhs(data.brand.maxInvestment)}` : ""
          }));
        } else {
          throw new Error("Brand data not available");
        }
      })
      .catch((err) => {
        console.error("Error fetching brand detail:", err);
        setError("Brand details could not be found or loaded.");
      })
      .finally(() => setLoading(false));

    // Fetch all brands for related list
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const filtered = data.filter((b) => (b.id || b._id?.toString()) !== brandId).slice(0, 3);
          setRelatedBrands(filtered);
        }
      })
      .catch(() => { });
  }, [brandId]);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!brand) return;

    setSubmittingEnquiry(true);
    try {
      const budgetFormatted = enquiryForm.budget || `${formatLakhs(brand.minInvestment)} - ${formatLakhs(brand.maxInvestment)}`;
      const res = await fetch("/api/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enquiryForm.name,
          fullName: enquiryForm.name,
          email: enquiryForm.email,
          phone: enquiryForm.phone,
          city: enquiryForm.city || "Not specified",
          preferredLocation: enquiryForm.city || "Not specified",
          investment_range: budgetFormatted,
          investmentCapacity: budgetFormatted,
          category: brand.category || "General",
          interestedCategory: brand.category || "General",
          comments: `Enquiry submitted for Brand: ${brand.name}. Message: ${enquiryForm.message || "None"}`,
          notes: `Enquiry submitted for Brand: ${brand.name}. Message: ${enquiryForm.message || "None"}`,
          status: "Pending",
          brandName: brand.name,
          targetBrand: brand.name,
          brandId: brand.id || brand._id,
          targetBrandId: brand.id || brand._id
        })
      });

      if (res.ok) {
        setEnquirySubmitted(true);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Failed to submit enquiry. Please try again or WhatsApp directly.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting enquiry.");
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!brand) return;
    const phone = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919876543210").replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hello Admin, I am interested in opening a franchise for *${brand.name}* (Category: ${brand.category || "General"}). Please share detailed catalog, location requirements & investment structure.`
    );
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${text}`, "_blank");
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* Main Container */}
      <main style={{ maxWidth: "1240px", margin: "0 auto", padding: "24px 16px 60px 16px" }}>
        {/* Breadcrumbs & Back Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#64748b" }}>
            <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
            <ChevronRight size={14} />
            <Link href="/brands" style={{ color: "#64748b", textDecoration: "none" }}>Brands</Link>
            <ChevronRight size={14} />
            <span style={{ color: "#0f172a", fontWeight: "600" }}>{decodeHtmlEntities(brand?.name || "Brand Details")}</span>
          </div>

          <button
            onClick={() => router.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              padding: "8px 16px",
              borderRadius: "10px",
              color: "#334155",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease"
            }}
          >
            <ArrowLeft size={16} /> Back to Brands
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "100px 20px", background: "#ffffff", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 16px auto", animation: "spin 1s infinite linear" }}></div>
            <p style={{ color: "#64748b", fontWeight: "600", fontSize: "16px" }}>Loading Brand Details...</p>
          </div>
        ) : error || !brand ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#ffffff", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>Brand Not Found</h2>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>{error || "The requested brand details could not be found."}</p>
            <Link
              href="/brands"
              style={{
                display: "inline-block",
                background: "#2563eb",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: "700",
                textDecoration: "none"
              }}
            >
              Browse All Brands
            </Link>
          </div>
        ) : (
          <div>
            {/* HERO BRAND COVER HEADER */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.08)",
                border: "1px solid #e2e8f0",
                marginBottom: "28px"
              }}
            >
              {/* Cover Banner Image */}
              <div style={{ position: "relative", height: "260px", width: "100%", overflow: "hidden", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                  src={brand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200"}
                  alt={decodeHtmlEntities(brand.name)}
                  style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.4) 60%, transparent 100%)" }}></div>

                {/* Banner Overlay Info */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "24px",
                    left: "28px",
                    right: "28px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                    gap: "16px"
                  }}
                >
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <img
                      src={brand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=300"}
                      alt={decodeHtmlEntities(brand.name)}
                      style={{
                        width: "90px",
                        height: "90px",
                        borderRadius: "20px",
                        objectFit: "contain",
                        objectPosition: "center",
                        border: "3px solid #ffffff",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                        backgroundColor: "#ffffff"
                      }}
                    />
                    <div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", background: "#16a34a", color: "#ffffff", padding: "4px 12px", borderRadius: "20px", letterSpacing: "0.5px" }}>
                          ✓ Verified Concept
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(6px)", color: "#ffffff", padding: "4px 12px", borderRadius: "20px" }}>
                          {decodeHtmlEntities(brand.category || "General")}
                        </span>
                      </div>
                      <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#ffffff", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                        {decodeHtmlEntities(brand.name)}
                      </h1>
                      <p style={{ color: "#cbd5e1", fontSize: "14px", margin: "4px 0 0 0", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Building size={15} /> {decodeHtmlEntities(brand.company || brand.name)} • HQ: <strong style={{ color: "#ffffff" }}>{decodeHtmlEntities(brand.hq || "India")}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Header Action Buttons */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={handleWhatsAppClick}
                      style={{
                        background: "#25D366",
                        color: "#ffffff",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: "12px",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 14px rgba(37, 211, 102, 0.3)"
                      }}
                    >
                      <MessageCircle size={18} /> WhatsApp Admin
                    </button>
                  </div>
                </div>
              </div>

              {/* QUICK HIGHLIGHT BAR */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1px",
                  background: "#e2e8f0"
                }}
              >
                <div style={{ background: "#ffffff", padding: "16px 24px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#64748b", display: "block", marginBottom: "2px" }}>MIN INVESTMENT</span>
                  <span style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>{formatLakhs(brand.minInvestment)}</span>
                </div>
                <div style={{ background: "#ffffff", padding: "16px 24px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#64748b", display: "block", marginBottom: "2px" }}>MAX INVESTMENT</span>
                  <span style={{ fontSize: "18px", fontWeight: "900", color: "#2563eb" }}>{formatLakhs(brand.maxInvestment)}</span>
                </div>
                <div style={{ background: "#ffffff", padding: "16px 24px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#64748b", display: "block", marginBottom: "2px" }}>ROYALTY FEE</span>
                  <span style={{ fontSize: "18px", fontWeight: "900", color: "#16a34a" }}>{brand.royaltyFee || "0% (Zero)"}</span>
                </div>
                <div style={{ background: "#ffffff", padding: "16px 24px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#64748b", display: "block", marginBottom: "2px" }}>SPACE REQUIRED</span>
                  <span style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>{brand.areaRequired || "200 - 500 Sq.Ft"}</span>
                </div>
              </div>
            </div>

            {/* MAIN TWO-COLUMN CONTENT & ENQUIRY FORM */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "28px" }} className="brand-detail-grid">
              {/* LEFT COLUMN: BRAND DETAILS */}
              <div>
                {/* Navigation Tabs */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "24px",
                    borderBottom: "2px solid #e2e8f0",
                    paddingBottom: "8px"
                  }}
                >
                  <button
                    onClick={() => setActiveTab("overview")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "8px 16px",
                      fontSize: "15px",
                      fontWeight: "700",
                      color: activeTab === "overview" ? "#2563eb" : "#64748b",
                      borderBottom: activeTab === "overview" ? "3px solid #2563eb" : "3px solid transparent",
                      cursor: "pointer",
                      marginBottom: "-10px"
                    }}
                  >
                    Business Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("financials")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "8px 16px",
                      fontSize: "15px",
                      fontWeight: "700",
                      color: activeTab === "financials" ? "#2563eb" : "#64748b",
                      borderBottom: activeTab === "financials" ? "3px solid #2563eb" : "3px solid transparent",
                      cursor: "pointer",
                      marginBottom: "-10px"
                    }}
                  >
                    Investment & Returns
                  </button>
                  <button
                    onClick={() => setActiveTab("support")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "8px 16px",
                      fontSize: "15px",
                      fontWeight: "700",
                      color: activeTab === "support" ? "#2563eb" : "#64748b",
                      borderBottom: activeTab === "support" ? "3px solid #2563eb" : "3px solid transparent",
                      cursor: "pointer",
                      marginBottom: "-10px"
                    }}
                  >
                    Training & Support
                  </button>
                </div>

                {/* OVERVIEW CONTENT */}
                {activeTab === "overview" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div style={{ background: "#ffffff", padding: "28px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                      <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "14px" }}>
                        About {decodeHtmlEntities(brand.name)}
                      </h3>
                      <div
                        className="brand-rich-description fck-content-wrapper"
                        style={{ fontSize: "15px", color: "#334155", lineHeight: 1.7 }}
                        dangerouslySetInnerHTML={{
                          __html: sanitizeBrandHtml(
                            (brand.description || "")
                              .replace(/<section[^>]*class=["'][^"']*commercial-specs[^"']*["'][\s\S]*?<\/section>/gi, ""),
                            brand
                          )
                        }}
                      />
                    </div>

                    {/* REDESIGNED COMMERCIAL SPECIFICATIONS & INVESTMENT BREAKDOWN */}
                    <CommercialSpecsBreakdown
                      brand={brand}
                      onEnquireClick={() => {
                        const box = document.getElementById("brand-enquiry-box");
                        box?.scrollIntoView({ behavior: "smooth" });
                      }}
                    />

                    {/* Key Highlights Grid */}
                    <div style={{ background: "#ffffff", padding: "28px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                      <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "18px" }}>
                        Key Opportunity Highlights
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px", background: "#f8fafc", borderRadius: "14px" }}>
                          <ShieldCheck size={24} style={{ color: "#16a34a", flexShrink: 0 }} />
                          <div>
                            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Proven Business Model</h4>
                            <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>Established operations with high brand recall</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px", background: "#f8fafc", borderRadius: "14px" }}>
                          <TrendingUp size={24} style={{ color: "#2563eb", flexShrink: 0 }} />
                          <div>
                            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>High Profit Margin</h4>
                            <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>Optimized supply chain & operational efficiency</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px", background: "#f8fafc", borderRadius: "14px" }}>
                          <Users size={24} style={{ color: "#9333ea", flexShrink: 0 }} />
                          <div>
                            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Complete Training</h4>
                            <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>Comprehensive staff training and store setup guide</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px", background: "#f8fafc", borderRadius: "14px" }}>
                          <Globe size={24} style={{ color: "#0891b2", flexShrink: 0 }} />
                          <div>
                            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>PAN India Expansion</h4>
                            <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>Prime location availability across Tier 1, 2 & 3 cities</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FINANCIALS CONTENT */}
                {activeTab === "financials" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <CommercialSpecsBreakdown
                      brand={brand}
                      onEnquireClick={() => {
                        const box = document.getElementById("brand-enquiry-box");
                        box?.scrollIntoView({ behavior: "smooth" });
                      }}
                    />

                    <div style={{ background: "#ffffff", padding: "28px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                      <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "18px" }}>
                        Financial & Agreement Parameters
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 18px", background: "#f8fafc", borderRadius: "12px" }}>
                          <span style={{ fontWeight: "600", color: "#64748b" }}>Investment Range</span>
                          <strong style={{ color: "#0f172a" }}>{formatLakhs(brand.minInvestment)} - {formatLakhs(brand.maxInvestment)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 18px", background: "#f8fafc", borderRadius: "12px" }}>
                          <span style={{ fontWeight: "600", color: "#64748b" }}>Royalty / Commission</span>
                          <strong style={{ color: "#16a34a" }}>{brand.royaltyFee || "0% (Zero Royalty)"}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 18px", background: "#f8fafc", borderRadius: "12px" }}>
                          <span style={{ fontWeight: "600", color: "#64748b" }}>Franchise Agreement Tenure</span>
                          <strong style={{ color: "#0f172a" }}>{brand.tenure || "3 to 5 Years (Renewable)"}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 18px", background: "#f8fafc", borderRadius: "12px" }}>
                          <span style={{ fontWeight: "600", color: "#64748b" }}>Expected Payback Period</span>
                          <strong style={{ color: "#2563eb" }}>{brand.paybackPeriod || "12 - 18 Months"}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUPPORT CONTENT */}
                {activeTab === "support" && (
                  <div style={{ background: "#ffffff", padding: "28px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "18px" }}>
                      Corporate Support & Assistance
                    </h3>
                    <ul style={{ paddingLeft: "20px", color: "#334155", lineHeight: 1.8, fontSize: "15px" }}>
                      <li>Site selection assistance and location audit by brand experts</li>
                      <li>Store interior layout designing and 3D architectural blueprint</li>
                      <li>Complete equipment, inventory, and point-of-sale software setup</li>
                      <li>Staff hiring assistance and intensive operational training</li>
                      <li>Local marketing campaigns, grand opening assistance & social media kits</li>
                      <li>Ongoing operational guidance and quality assurance audits</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: STICKY ENQUIRY FORM */}
              <div>
                <div
                  id="brand-enquiry-box"
                  style={{
                    background: "#ffffff",
                    borderRadius: "24px",
                    padding: "28px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.08)",
                    position: "sticky",
                    top: "90px"
                  }}
                >
                  <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                    Apply For Franchise
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
                    Send direct enquiry to request official catalog & connect with brand manager.
                  </p>

                  {enquirySubmitted ? (
                    <div
                      style={{
                        background: "rgba(22, 163, 74, 0.08)",
                        border: "1px solid rgba(22, 163, 74, 0.2)",
                        borderRadius: "16px",
                        padding: "24px 16px",
                        textAlign: "center"
                      }}
                    >
                      <CheckCircle size={40} style={{ color: "#16a34a", margin: "0 auto 12px auto" }} />
                      <h4 style={{ color: "#16a34a", margin: 0, fontWeight: "800", fontSize: "18px" }}>Enquiry Submitted!</h4>
                      <p style={{ fontSize: "13px", color: "#475569", marginTop: "6px", lineHeight: 1.5 }}>
                        Thank you for your interest in <strong>{brand.name}</strong>. Our franchise expert will reach out to you within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleEnquirySubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={enquiryForm.name}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>Phone Number *</label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          pattern="[0-9]{10}"
                          required
                          placeholder="10-digit mobile number"
                          value={enquiryForm.phone}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="email@example.com"
                          value={enquiryForm.email}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>Preferred City / State</label>
                        <input
                          type="text"
                          placeholder="e.g. Mumbai, Delhi, Bangalore"
                          value={enquiryForm.city}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, city: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>Message / Note (Optional)</label>
                        <textarea
                          rows="2"
                          placeholder="Share your experience or location availability..."
                          value={enquiryForm.message}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingEnquiry}
                        style={{
                          background: "#2563eb",
                          color: "#ffffff",
                          border: "none",
                          padding: "14px",
                          borderRadius: "12px",
                          fontWeight: "800",
                          fontSize: "15px",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {submittingEnquiry ? "Submitting..." : `Submit Free Enquiry`}
                      </button>

                      <div style={{ textAlign: "center", marginTop: "4px" }}>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>100% Free & Confidential Direct Brand Connection</span>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* DYNAMIC FAQ SECTION WITH ACCORDION */}
            <div style={{ marginTop: "60px" }}>
              <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "20px" }}>
                Frequently Asked Questions about {brand.name}
              </h3>
              <div className="faq-accordion-container" style={{ display: "flex", flexDirection: "column" }}>
                <details className="faq-details">
                  <summary className="faq-summary">
                    <span>What is the minimum investment required for a {brand.name} franchise?</span>
                    <span className="faq-icon">+</span>
                  </summary>
                  <div className="faq-content">
                    <p>The minimum investment required is {formatLakhs(brand.minInvestment)}.</p>
                  </div>
                </details>
                <details className="faq-details">
                  <summary className="faq-summary">
                    <span>What is the area required to open a {brand.name} outlet?</span>
                    <span className="faq-icon">+</span>
                  </summary>
                  <div className="faq-content">
                    <p>To successfully open this franchise, an area of approximately {brand.areaRequired || "200 - 500 Sq.Ft"} is required.</p>
                  </div>
                </details>
                <details className="faq-details">
                  <summary className="faq-summary">
                    <span>What is the royalty fee structure?</span>
                    <span className="faq-icon">+</span>
                  </summary>
                  <div className="faq-content">
                    <p>The current royalty fee for {brand.name} is set at {brand.royaltyFee || "0%"}.</p>
                  </div>
                </details>
                <details className="faq-details">
                  <summary className="faq-summary">
                    <span>Does {brand.name} provide training and support?</span>
                    <span className="faq-icon">+</span>
                  </summary>
                  <div className="faq-content">
                    <p>{brand.trainingSupport === 'Yes' ? `Yes, ${brand.name} provides complete training and operational support for franchisees.` : `Detailed training programs and support levels vary. Please contact us for exact specifics regarding ${brand.name}.`}</p>
                  </div>
                </details>
                <details className="faq-details">
                  <summary className="faq-summary">
                    <span>Are master franchise options available for {brand.name}?</span>
                    <span className="faq-icon">+</span>
                  </summary>
                  <div className="faq-content">
                    <p>{brand.masterFranchiseAvailable ? `Yes, master franchise options are available. The master investment range is ${brand.masterInvestmentRange || 'available upon contact'}.` : `Currently, ${brand.name} is focusing on standard franchise units. Connect with us to discuss special territorial rights.`}</p>
                  </div>
                </details>
              </div>
            </div>

            {/* JSON-LD FOR SEO, GEO, AND AEO */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@graph": [
                    {
                      "@type": "LocalBusiness",
                      "name": brand.name,
                      "image": brand.image,
                      "address": {
                        "@type": "PostalAddress",
                        "addressLocality": brand.hq || "India",
                        "addressCountry": "IN"
                      },
                      "priceRange": `${brand.minInvestment} - ${brand.maxInvestment}`
                    },
                    {
                      "@type": "FAQPage",
                      "mainEntity": [
                        {
                          "@type": "Question",
                          "name": `What is the minimum investment required for a ${brand.name} franchise?`,
                          "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `The minimum investment required is ${formatLakhs(brand.minInvestment)}.`
                          }
                        },
                        {
                          "@type": "Question",
                          "name": `What is the area required to open a ${brand.name} outlet?`,
                          "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `To successfully open this franchise, an area of approximately ${brand.areaRequired || '200 - 500 Sq.Ft'} is required.`
                          }
                        },
                        {
                          "@type": "Question",
                          "name": `What is the royalty fee structure?`,
                          "acceptedAnswer": {
                            "@type": "Answer",
                            "text": `The current royalty fee for ${brand.name} is set at ${brand.royaltyFee || '0%'}.`
                          }
                        },
                        {
                          "@type": "Question",
                          "name": `Does ${brand.name} provide training and support?`,
                          "acceptedAnswer": {
                            "@type": "Answer",
                            "text": brand.trainingSupport === 'Yes' ? `Yes, ${brand.name} provides complete training and operational support for franchisees.` : `Detailed training programs and support levels vary. Please contact us for exact specifics regarding ${brand.name}.`
                          }
                        },
                        {
                          "@type": "Question",
                          "name": `Are master franchise options available for ${brand.name}?`,
                          "acceptedAnswer": {
                            "@type": "Answer",
                            "text": brand.masterFranchiseAvailable ? `Yes, master franchise options are available. The master investment range is ${brand.masterInvestmentRange || 'available upon contact'}.` : `Currently, ${brand.name} is focusing on standard franchise units. Connect with us to discuss special territorial rights.`
                          }
                        }
                      ]
                    },
                    {
                      "@type": "BreadcrumbList",
                      "itemListElement": [
                        {
                          "@type": "ListItem",
                          "position": 1,
                          "name": "Home",
                          "item": "https://www.franchiseroots.com"
                        },
                        {
                          "@type": "ListItem",
                          "position": 2,
                          "name": "Brands",
                          "item": "https://www.franchiseroots.com/brands"
                        },
                        {
                          "@type": "ListItem",
                          "position": 3,
                          "name": brand.category || "Franchise",
                          "item": `https://www.franchiseroots.com/brands?category=${encodeURIComponent(brand.category || "Business")}`
                        },
                        {
                          "@type": "ListItem",
                          "position": 4,
                          "name": brand.name,
                          "item": `https://www.franchiseroots.com/brands/${brand._id || brand.id}`
                        }
                      ]
                    }
                  ]
                })
              }}
            />

            {/* RELATED BRANDS RECOMMENDATIONS */}
            {relatedBrands.length > 0 && (
              <div style={{ marginTop: "60px" }}>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "20px" }}>
                  Similar Franchise Opportunities
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                  {relatedBrands.map((rel) => (
                    <div
                      key={rel.id || rel._id}
                      style={{
                        background: "#ffffff",
                        borderRadius: "20px",
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                        display: "flex",
                        flexDirection: "column"
                      }}
                    >
                      <div style={{ height: "160px", position: "relative", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img
                          src={rel.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600"}
                          alt={decodeHtmlEntities(rel.name)}
                          style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }}
                        />
                        <span style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(15,23,42,0.8)", color: "#fff", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                          {decodeHtmlEntities(rel.category || "General")}
                        </span>
                      </div>
                      <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                        <h4 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>{decodeHtmlEntities(rel.name)}</h4>
                        <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#64748b" }}>Min Inv: <strong style={{ color: "#0f172a" }}>{formatLakhs(rel.minInvestment)}</strong></p>
                        <Link
                          href={`/brands/${rel.id || rel._id}`}
                          style={{
                            marginTop: "auto",
                            display: "block",
                            textAlign: "center",
                            background: "#f1f5f9",
                            color: "#0f172a",
                            padding: "10px",
                            borderRadius: "10px",
                            fontWeight: "700",
                            fontSize: "13px",
                            textDecoration: "none"
                          }}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DYNAMIC SEO + GEO TAGS */}
            {brand && <SEOGeoTags categoryName={brand.category || "Franchise"} basePath="/brands" />}

          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 991px) {
          .brand-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .faq-accordion-container {
          gap: 12px;
        }
        .faq-details {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .faq-details[open] {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .faq-summary {
          list-style: none;
          padding: 18px 20px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          font-size: 15.5px;
          color: #0f172a;
          outline: none;
        }
        .faq-summary::-webkit-details-marker {
          display: none;
        }
        .faq-icon {
          font-size: 20px;
          font-weight: 400;
          color: var(--primary);
          transition: transform 0.3s ease;
        }
        .faq-details[open] .faq-icon {
          transform: rotate(45deg);
        }
        .faq-content {
          padding: 0 20px 20px 20px;
          color: #475569;
          font-size: 14.5px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
