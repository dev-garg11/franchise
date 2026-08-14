"use client";

import { useState, useEffect } from "react";
import { Briefcase, Zap, ShieldCheck, ArrowRight, MessageCircle, Percent, DollarSign, ChevronRight, X, CheckCircle, Award, RefreshCw } from "lucide-react";
import { ProductSkeletonGrid } from "@/components/SkeletonLoader";
import { getApprovedBrands } from "@/lib/brandsCache";

export default function TopBusinessOpportunities({ brands = [], loading = false, onAskExperts }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [dbBrands, setDbBrands] = useState(brands);
  const [fetchingLoading, setFetchingLoading] = useState(false);
  const isSkeletonLoading = loading || fetchingLoading;

  // Fetch approved brands if not passed via props
  useEffect(() => {
    if (brands && brands.length > 0) {
      setDbBrands(brands);
    } else {
      fetchApprovedBrands();
    }
  }, [brands]);

  const fetchApprovedBrands = async () => {
    try {
      setFetchingLoading(true);
      const data = await getApprovedBrands();
      if (Array.isArray(data) && data.length > 0) {
        setDbBrands(data);
      }
    } catch (err) {
      console.error("Error fetching dynamic business opportunities from DB:", err);
    } finally {
      setFetchingLoading(false);
    }
  };

  const filters = ["All", "Low Investment (< ₹5L)", "Distributorship", "High Margin", "Master Franchise"];

  // Helper format currency
  const formatLakhs = (val) => {
    if (!val) return "N/A";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakhs`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  // Helper to strip any raw HTML tags and entities from text content
  const stripHtmlTags = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/<[^>]*>?/gm, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .trim();
  };


  // Fallback static business opportunities
  const fallbackOpportunities = [
    {
      id: "biz-1",
      title: "EV Charging Station Dealership",
      type: "Distributorship",
      category: "Automobiles",
      investment: "₹3 Lakhs - ₹8 Lakhs",
      margin: "Up to 35%",
      payback: "8 - 12 Months",
      tags: ["Low Capital", "Govt Subsidized", "High Margin"],
      badge: "HOT DEALERSHIP",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=600",
      description: "Setup fast EV charging points at high-traffic commercial spaces with 24x7 hardware and app management.",
      highlights: [
        "Government subsidies & green energy tax benefits available",
        "24/7 automated remote monitoring and digital payments",
        "Complete installation support & site location approval",
        "High repeat customer traffic from EV drivers"
      ]
    },
    {
      id: "biz-2",
      title: "Solar Rooftop Systems Agency",
      type: "Distributorship",
      category: "Clean Energy",
      investment: "₹2 Lakhs - ₹5 Lakhs",
      margin: "Up to 25%",
      payback: "6 - 10 Months",
      tags: ["Low Capital", "High Growth"],
      badge: "TOP SELLER",
      image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=600",
      description: "Distribute modular rooftop solar power kits and net-metering solutions for residential & industrial clients.",
      highlights: [
        "High demand driven by rising electricity tariffs",
        "Zero warehousing requirement - direct factory delivery",
        "Full technical training provided for local installations",
        "Recurring maintenance revenue streams"
      ]
    },
    {
      id: "biz-3",
      title: "FMCG Organic Food Distribution",
      type: "Distributorship",
      category: "Retail",
      investment: "₹4 Lakhs - ₹10 Lakhs",
      margin: "Up to 30%",
      payback: "9 - 14 Months",
      tags: ["High Margin", "Fast Rotation"],
      badge: "HIGH MARGIN",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
      description: "Exclusive district-level distribution rights for premium organic grocery, cold-pressed oils & superfoods.",
      highlights: [
        "Exclusive territory rights for your target district",
        "High inventory turnover with 30%+ net margins",
        "Strong marketing collateral & supermarket tie-ups",
        "100% certified organic product range"
      ]
    },
    {
      id: "biz-4",
      title: "Fintech & ATM Franchise Agency",
      type: "Low Investment (< ₹5L)",
      category: "Business Services",
      investment: "₹1.5 Lakhs - ₹3 Lakhs",
      margin: "₹12 - ₹18 per Transaction",
      payback: "5 - 8 Months",
      tags: ["Low Capital", "Passive Income"],
      badge: "PASSIVE INCOME",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600",
      description: "Install white-label ATMs & digital banking kiosks in tier-2/3 towns with lifetime residual commissions.",
      highlights: [
        "Earn daily transaction commissions without inventory",
        "Complete machine security & insurance coverage",
        "Fast setup within 15 days of site approval",
        "Low space requirement: 50-100 Sq.Ft"
      ]
    },
    {
      id: "biz-5",
      title: "Master Franchise - EdTech Coding",
      type: "Master Franchise",
      category: "Education",
      investment: "₹12 Lakhs - ₹25 Lakhs",
      margin: "Up to 45%",
      payback: "12 - 16 Months",
      tags: ["Master Territory", "High Margin"],
      badge: "EXCLUSIVE TERRITORY",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600",
      description: "State-level master franchise rights to sub-franchise and distribute AI coding curriculum.",
      highlights: [
        "Sub-franchise licensing rights with revenue sharing",
        "Turnkey LMS software and teacher training module",
        "Corporate branding & national advertising support",
        "Guaranteed institutional school tie-ups"
      ]
    },
    {
      id: "biz-6",
      title: "Smart Home Automation Dealership",
      type: "Distributorship",
      category: "Retail",
      investment: "₹3.5 Lakhs - ₹7 Lakhs",
      margin: "Up to 40%",
      payback: "8 - 12 Months",
      tags: ["High Margin", "Tech Driven"],
      badge: "TRENDING TECH",
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=600",
      description: "IoT smart switches, biometric security doors, and wireless home automation distributorship.",
      highlights: [
        "Compatible with Alexa, Google Home & mobile apps",
        "High profit margin on luxury builder projects",
        "Experience center demo kit provided by franchisor",
        "Dedicated technical support engineer"
      ]
    }
  ];

  // Dynamically map MongoDB brands to opportunity cards
  const dynamicOpportunities = (dbBrands || []).map((brand, idx) => {
    const minInv = brand.minInvestment || 0;
    const maxInv = brand.maxInvestment || 0;
    const invStr = brand.investment_range || (minInv ? `${formatLakhs(minInv)} - ${formatLakhs(maxInv)}` : "₹2L - ₹5 Lakhs");
    
    let type = "Distributorship";
    if (minInv && minInv <= 500000) {
      type = "Low Investment (< ₹5L)";
    } else if (minInv && minInv >= 1500000) {
      type = "Master Franchise";
    } else if (idx % 2 === 0) {
      type = "High Margin";
    }

    const cleanTitle = stripHtmlTags(brand.name || "");
    const cleanCategory = stripHtmlTags(brand.category || "Business Services");
    const rawDescription = brand.description || `${cleanTitle} provides high-growth dealership, distributorship, and business expansion rights.`;

    return {
      id: brand.id || brand._id || `db-${idx}`,
      title: cleanTitle,
      type: type,
      category: cleanCategory,
      investment: stripHtmlTags(invStr),
      margin: stripHtmlTags(brand.royaltyFee ? `Royalty: ${brand.royaltyFee}` : "Up to 30%"),
      payback: "10 - 15 Months",
      tags: [
        minInv <= 500000 ? "Low Capital" : "High Growth",
        brand.hq ? `HQ: ${stripHtmlTags(brand.hq)}` : "Verified Brand",
        "Audited Concept"
      ],
      badge: brand.featured ? "FEATURED DEAL" : idx === 0 ? "HOT DEALERSHIP" : idx === 1 ? "TOP SELLER" : "VERIFIED CONCEPT",
      image: brand.image || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600",
      description: rawDescription,
      highlights: [
        `Verified Listing: ${stripHtmlTags(brand.company || cleanTitle)}`,
        `Headquarters: ${stripHtmlTags(brand.hq || 'India')}`,
        `Space Required: ${stripHtmlTags(brand.areaRequired || '200 - 500 Sq.Ft')}`,
        `Royalty Fee: ${stripHtmlTags(brand.royaltyFee || '0%')}`
      ]
    };
  });


  // Combine database opportunities with fallback items if DB has few items
  const allOpportunities = dynamicOpportunities.length >= 3
    ? dynamicOpportunities
    : [...dynamicOpportunities, ...fallbackOpportunities.slice(dynamicOpportunities.length)];

  const filteredOpportunities = allOpportunities.filter(item => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Low Investment (< ₹5L)") return item.type === "Low Investment (< ₹5L)" || (item.investment && (item.investment.includes("2L") || item.investment.includes("3L") || item.investment.includes("4L") || item.investment.includes("5L")));
    return item.type === activeFilter || item.tags.some(t => t.toLowerCase().includes(activeFilter.toLowerCase()));
  }).slice(0, 12);


  const handleWhatsAppEnquiry = (biz) => {
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919876543210";
    const cleanPhone = adminPhone.replace(/[^0-9]/g, "");
    const msg = `Hello Admin, I want details regarding Top Business Opportunity: *${biz.title}* (${biz.category} - ${biz.investment}). Please connect me with the team.`;
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <section className="top-business-section" style={{ padding: "70px 0", background: "#ffffff" }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <span className="hero-tag" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#16a34a" }}>
            <Zap size={14} style={{ marginRight: "4px" }} /> Dynamic Database Verification
          </span>
          <h2 style={{ fontSize: "34px", fontWeight: "800", color: "#0f172a", marginTop: "12px", marginBottom: "10px" }}>
            Top Business Opportunities
          </h2>
          <p style={{ color: "#64748b", fontSize: "16px", maxWidth: "680px", margin: "0 auto" }}>
            Discover lucrative dealerships, distribution networks, master franchise rights, and low-capital business models from verified partner databases.
          </p>

          {/* Filter Pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginTop: "24px" }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "700",
                  border: activeFilter === f ? "none" : "1px solid #e2e8f0",
                  background: activeFilter === f ? "#25D366" : "#f8fafc",
                  color: activeFilter === f ? "#ffffff" : "#475569",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Opportunities List Grid */}
        {isSkeletonLoading ? (
          <ProductSkeletonGrid count={6} minWidth="350px" />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
            {filteredOpportunities.map((biz) => (
              <div
                key={biz.id}
                style={{
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative"
                }}
              >
                {/* Image Banner */}
                <div style={{ position: "relative", height: "160px" }}>
                  <img
                    src={biz.image}
                    alt={biz.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)" }}></div>

                  <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(15, 23, 42, 0.8)", color: "#38bdf8", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                    {biz.badge}
                  </div>

                  <div style={{ position: "absolute", bottom: "12px", left: "16px", right: "16px" }}>
                    <span style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: "600", textTransform: "uppercase" }}>{biz.category}</span>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#ffffff", margin: "2px 0 0 0" }}>{biz.title}</h3>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <p
                    style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0", height: "38px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                    dangerouslySetInnerHTML={{ __html: biz.description || "" }}
                  />

                  {/* Metrics */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "12px", background: "#f8fafc", borderRadius: "10px", marginBottom: "16px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", display: "block" }}>INVESTMENT</span>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>{biz.investment}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", display: "block" }}>MARGIN / ROYALTY</span>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "#16a34a" }}>{biz.margin}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "18px" }}>
                    {biz.tags.map((t, idx) => (
                      <span key={idx} style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: "600", padding: "3px 9px", borderRadius: "12px" }}>
                        ✓ {t}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons Grid */}
                  <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <button
                      onClick={() => setSelectedOpportunity(biz)}
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
                      onClick={() => handleWhatsAppEnquiry(biz)}
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
        )}
      </div>

      {/* Opportunity Details Popup Modal */}
      {selectedOpportunity && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedOpportunity(null); }}
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
            style={{
              maxWidth: "600px",
              width: "100%",
              borderRadius: "20px",
              overflow: "hidden",
              backgroundColor: "#ffffff",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              position: "relative"
            }}
          >
            {/* Header Image */}
            <div style={{ position: "relative", height: "180px" }}>
              <img
                src={selectedOpportunity.image}
                alt={selectedOpportunity.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 60%)" }}></div>

              <button
                onClick={() => setSelectedOpportunity(null)}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "16px",
                  background: "rgba(0,0,0,0.4)",
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

              <div style={{ position: "absolute", bottom: "16px", left: "20px", right: "20px" }}>
                <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "700", textTransform: "uppercase", background: "rgba(15, 23, 42, 0.8)", padding: "3px 10px", borderRadius: "12px", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                  {selectedOpportunity.badge}
                </span>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", margin: "6px 0 0 0" }}>
                  {selectedOpportunity.title}
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: "24px", overflowY: "auto" }}>
              <div
                style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, marginBottom: "20px" }}
                dangerouslySetInnerHTML={{ __html: selectedOpportunity.description || "" }}
              />


              {/* Business Metrics Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", padding: "14px", background: "#f8fafc", borderRadius: "12px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", display: "block" }}>INVESTMENT</span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>{selectedOpportunity.investment}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", display: "block" }}>MARGIN / ROYALTY</span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#16a34a" }}>{selectedOpportunity.margin}</span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", display: "block" }}>PAYBACK</span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#2563eb" }}>{selectedOpportunity.payback}</span>
                </div>
              </div>

              {/* Highlights */}
              {selectedOpportunity.highlights && (
                <div style={{ marginBottom: "24px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", marginBottom: "10px" }}>
                    Key Opportunity Highlights
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {selectedOpportunity.highlights.map((h, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "#334155" }}>
                        <CheckCircle size={16} style={{ color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <button
                  onClick={() => {
                    setSelectedOpportunity(null);
                    if (onAskExperts) onAskExperts("buy");
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#0f172a",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  Ask Expert Advice
                </button>

                <button
                  onClick={() => {
                    handleWhatsAppEnquiry(selectedOpportunity);
                    setSelectedOpportunity(null);
                  }}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#25D366",
                    color: "#ffffff",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <MessageCircle size={18} /> WhatsApp Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
