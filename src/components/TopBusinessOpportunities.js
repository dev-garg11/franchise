"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  const fallbackOpportunities = [];

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

  const allOpportunities = dynamicOpportunities;

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
                  fontWeight: "600",
                  border: activeFilter === f ? "none" : "1px solid #cbd5e1",
                  background: activeFilter === f ? "#16a34a" : "#ffffff",
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
        ) : filteredOpportunities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px", background: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>No Business Opportunities Currently Listed</h3>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Dealership and distributorship opportunities registered on Franchise Roots will appear here once approved.</p>
          </div>
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
                    <Link
                      href={`/brands/${biz.id || biz._id}`}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#0f172a",
                        fontWeight: "700",
                        fontSize: "13px",
                        textDecoration: "none",
                        textAlign: "center"
                      }}
                    >
                      View Details
                    </Link>

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


    </section>
  );
}
