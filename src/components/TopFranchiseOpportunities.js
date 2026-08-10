"use client";

import { useState } from "react";
import { Star, Award, Building, ArrowRight, MessageCircle, CheckCircle2, TrendingUp } from "lucide-react";

export default function TopFranchiseOpportunities({ brands = [], onSelectBrand, onAskExperts }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Food and Beverage", "Retail", "Education", "Health and Wellness", "Automobiles"];

  // Filter brands based on category or fall back to high-quality fallback data if DB brands are few
  const filteredBrands = brands.filter(b => activeCategory === "All" || b.category === activeCategory);

  const fallbackTopFranchises = [
    {
      id: "top-1",
      name: "Jaipur Chai Premium",
      category: "Food and Beverage",
      minInvestment: 500000,
      maxInvestment: 1200000,
      areaRequired: "150 - 300 Sq.Ft",
      hq: "Jaipur, RJ",
      royaltyFee: "5%",
      badge: "#1 Top Pick",
      roi: "12-18 Months",
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=600",
      description: "Authentic kulhad tea, traditional snacks & cozy café franchise with proven high daily ticket count."
    },
    {
      id: "top-2",
      name: "Doctor Garage EV Hub",
      category: "Automobiles",
      minInvestment: 1000000,
      maxInvestment: 2500000,
      areaRequired: "800 - 1500 Sq.Ft",
      hq: "Ahmedabad, GJ",
      royaltyFee: "0%",
      badge: "High Growth",
      roi: "15-20 Months",
      image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=600",
      description: "India's fastest growing multi-brand 2-wheeler automobile and EV service station chain."
    },
    {
      id: "top-3",
      name: "EduQuantum STEM Labs",
      category: "Education",
      minInvestment: 800000,
      maxInvestment: 1500000,
      areaRequired: "1000 - 2000 Sq.Ft",
      hq: "Bengaluru, KA",
      royaltyFee: "10%",
      badge: "Hot Opportunity",
      roi: "10-14 Months",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600",
      description: "Robotics, Coding & AI learning academy for K-12 students with guaranteed student enrolment support."
    },
    {
      id: "top-4",
      name: "Bombay Kulfi & Desserts",
      category: "Food and Beverage",
      minInvestment: 600000,
      maxInvestment: 1200000,
      areaRequired: "200 - 400 Sq.Ft",
      hq: "Mumbai, MH",
      royaltyFee: "0%",
      badge: "Trending",
      roi: "10-15 Months",
      image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=600",
      description: "100% natural gourmet kulfi & artisanal dessert parlor with zero cooking overheads."
    },
    {
      id: "top-5",
      name: "Jaaz Luxury Bathware",
      category: "Retail",
      minInvestment: 1500000,
      maxInvestment: 3500000,
      areaRequired: "1200 - 2500 Sq.Ft",
      hq: "New Delhi, DL",
      royaltyFee: "0%",
      badge: "Premium Concept",
      roi: "18-24 Months",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
      description: "Exclusive sanitaryware, designer faucets & smart bathroom solution franchise."
    },
    {
      id: "top-6",
      name: "NutriFit Wellness Lounge",
      category: "Health and Wellness",
      minInvestment: 1200000,
      maxInvestment: 2800000,
      areaRequired: "1500 - 3000 Sq.Ft",
      hq: "Pune, MH",
      royaltyFee: "8%",
      badge: "High ROI",
      roi: "14-18 Months",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600",
      description: "Premium fitness center & holistic wellness lounge equipped with automated equipment."
    }
  ];

  const displayBrands = filteredBrands.length >= 3 
    ? filteredBrands.slice(0, 6).map((b, idx) => ({
        ...b,
        badge: idx === 0 ? "#1 Top Pick" : idx === 1 ? "Hot Opportunity" : idx === 2 ? "High Growth" : "Featured",
        roi: "12-18 Months",
        royaltyFee: b.royaltyFee || "0%"
      }))
    : fallbackTopFranchises.filter(b => activeCategory === "All" || b.category === activeCategory);

  const formatCurrency = (val) => {
    if (!val) return "N/A";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakhs`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const handleWhatsAppEnquiry = (brand) => {
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919876543210";
    const cleanPhone = adminPhone.replace(/[^0-9]/g, "");
    const msg = `Hi Admin, I am interested in Top Franchise Opportunity: *${brand.name}* (${brand.category}). Please share catalog & ROI details.`;
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <section className="top-franchise-section" style={{ padding: "70px 0", background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="hero-tag" style={{ background: "rgba(14, 165, 233, 0.1)", color: "#0284c7" }}>
            <Award size={14} style={{ marginRight: "4px" }} /> Certified Top Picks
          </span>
          <h2 style={{ fontSize: "34px", fontWeight: "800", color: "#0f172a", marginTop: "12px", marginBottom: "10px" }}>
            Top Franchise Opportunities in India
          </h2>
          <p style={{ color: "#64748b", fontSize: "16px", maxWidth: "680px", margin: "0 auto" }}>
            Handpicked premium brands with verified ROI, high market demand, and robust corporate franchisor support.
          </p>

          {/* Category Tabs */}
          <div className="opportunity-tabs" style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginTop: "28px" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "30px",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: activeCategory === cat ? "none" : "1px solid #cbd5e1",
                  background: activeCategory === cat ? "#0f172a" : "#ffffff",
                  color: activeCategory === cat ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: activeCategory === cat ? "0 4px 12px rgba(15, 23, 42, 0.25)" : "none"
                }}
              >
                {cat === "All" ? "🔥 All Top Brands" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
          {displayBrands.map((brand) => (
            <div
              key={brand.id || brand._id}
              className="top-opportunity-card"
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.25s ease, box-shadow 0.25s ease"
              }}
            >
              {/* Image & Badge Header */}
              <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                <img
                  src={brand.image || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600"}
                  alt={brand.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 60%)" }}></div>
                
                {/* Badge */}
                <div style={{ position: "absolute", top: "14px", left: "14px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "#ffffff", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {brand.badge}
                </div>

                <div style={{ position: "absolute", bottom: "12px", left: "16px", right: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", color: "#ffffff" }}>
                  <div>
                    <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>
                      {brand.category}
                    </span>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "4px 0 0 0", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                      {brand.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Content Details */}
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <p
                  style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0", height: "38px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                  dangerouslySetInnerHTML={{ __html: brand.description || "" }}
                />


                {/* Key Metrics Table */}
                <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px", border: "1px solid #f1f5f9" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", fontWeight: "600" }}>MIN INVESTMENT</span>
                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#2563eb" }}>
                      {formatCurrency(brand.minInvestment)}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", fontWeight: "600" }}>SPACE NEEDED</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>
                      {brand.areaRequired || "200-500 Sq.Ft"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", fontWeight: "600" }}>EST. PAYBACK (ROI)</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a" }}>
                      {brand.roi || "12-18 Months"}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", fontWeight: "600" }}>ROYALTY FEE</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569" }}>
                      {brand.royaltyFee || "0%"}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    onClick={() => onSelectBrand && onSelectBrand(brand)}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#0f172a",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleWhatsAppEnquiry(brand)}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#25D366",
                      color: "#ffffff",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <button
            onClick={() => onAskExperts && onAskExperts("buy")}
            style={{
              padding: "14px 28px",
              borderRadius: "30px",
              background: "#0f172a",
              color: "#ffffff",
              border: "none",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 10px 20px -5px rgba(15,23,42,0.3)"
            }}
          >
            Need Help Choosing The Best Franchise? Talk to Experts <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
