"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award, Shield, MapPin, Sparkles, Building2, CheckCircle2, ChevronRight,
  Send, HelpCircle, Check, Search, Filter, RotateCcw, Building, Users, Star,
  IndianRupee, Lock, Crown, Layers, ArrowUpRight, MessageCircle, X
} from "lucide-react";
import { useApprovedBrands } from "@/lib/brandsCache";
import { BRAND_CATEGORIES, ALL_INDIAN_STATES } from "@/lib/brandConstants";
import { ProductSkeletonGrid } from "@/components/SkeletonLoader";
import SEOGeoTags from "@/components/SEOGeoTags";
import { decodeHtmlEntities, cleanBrandPlainText } from "@/lib/brandFormatters";

const MASTER_BENEFITS = [
  {
    icon: Crown,
    title: "Territorial Exclusivity",
    description: "Secure exclusive 100% Master Franchise rights for an entire state, region, or multi-district territory with zero competing brand units."
  },
  {
    icon: IndianRupee,
    title: "Sub-Franchise Royalty Share",
    description: "Earn significant upfront franchisee sign-up fees and recurring monthly royalty shares from every unit opened within your territory."
  },
  {
    icon: Layers,
    title: "High Equity Appreciation",
    description: "Build an expansive regional business empire with high capital appreciation and multi-unit enterprise value."
  },
  {
    icon: Shield,
    title: "Turnkey Brand Support",
    description: "Receive full operational SOPs, supply chain backing, staff training, national marketing, and brand owner escalation support."
  }
];

const TERRITORY_TYPES = [
  "All Territory Types",
  "State Level Exclusivity",
  "Multi-District Zone",
  "Metropolitan Area",
  "Pan India Rights"
];

export default function MasterFranchisingPage() {
  const { brands, loading } = useApprovedBrands();
  const [masterBrands, setMasterBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedTerritory, setSelectedTerritory] = useState("All Territory Types");

  // Application Modal State
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    targetState: "Delhi NCR",
    budget: "Rs. 25 Lakhs - 50 Lakhs",
    experience: "5+ Years Business Management",
    message: ""
  });

  // Filter approved brands for Master Franchise opportunities
  useEffect(() => {
    if (brands.length > 0) {
      // If brands explicitly have masterFranchiseAvailable or we mark high-value investment brands as master eligible
      const filtered = brands.filter(b => b.masterFranchiseAvailable || b.minInvestment >= 1000000 || b.maxInvestment >= 2500000);
      setMasterBrands(filtered);
      setFilteredBrands(filtered);
    }
  }, [brands]);

  // Apply multi-criteria filters
  useEffect(() => {
    let result = [...masterBrands];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(b =>
        b.name.toLowerCase().includes(q) ||
        (b.company && b.company.toLowerCase().includes(q)) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q))
      );
    }

    if (selectedCategory && selectedCategory !== "All Industries") {
      result = result.filter(b => b.category && b.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    }

    if (selectedState && selectedState !== "All States") {
      result = result.filter(b => b.hq && b.hq.toLowerCase().includes(selectedState.toLowerCase()));
    }

    if (selectedTerritory && selectedTerritory !== "All Territory Types") {
      result = result.filter(b => b.territoryOffered ? b.territoryOffered === selectedTerritory : true);
    }

    setFilteredBrands(result);
  }, [searchTerm, selectedCategory, selectedState, selectedTerritory, masterBrands]);

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedState("");
    setSelectedTerritory("All Territory Types");
  };

  const handleApplyClick = (brand) => {
    setSelectedBrand(brand);
    setEnquirySubmitted(false);

    // Auto-fill investor details if logged in
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("investorLoggedIn") === "true";
      if (isLoggedIn) {
        setEnquiryForm(prev => ({
          ...prev,
          name: localStorage.getItem("investorName") || prev.name,
          email: localStorage.getItem("investorEmail") || prev.email,
          phone: localStorage.getItem("investorPhone") || prev.phone,
        }));
      }
    }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!enquiryForm.name || !enquiryForm.email || !enquiryForm.phone) return;

    setSubmitting(true);
    try {
      const brandName = selectedBrand ? selectedBrand.name : "General Master Franchise Inquiry";
      const res = await fetch("/api/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enquiryForm.name,
          email: enquiryForm.email,
          phone: enquiryForm.phone,
          preferredLocation: enquiryForm.targetState,
          industries: selectedBrand ? [selectedBrand.category] : ["Master Franchise"],
          budgetMin: selectedBrand ? selectedBrand.minInvestment * 1.5 : 2500000,
          budgetMax: selectedBrand ? selectedBrand.maxInvestment * 2 : 10000000,
          brandId: selectedBrand ? (selectedBrand.id || selectedBrand._id) : null,
          brandName: brandName,
          category: selectedBrand ? selectedBrand.category : "Master Franchise",
          comments: `[MASTER FRANCHISE APPLICATION] Target State: ${enquiryForm.targetState}. Capital Budget: ${enquiryForm.budget}. Experience: ${enquiryForm.experience}. Note: ${enquiryForm.message || "Requesting Master Franchise Rights Package"}`
        })
      });

      if (res.ok) {
        setEnquirySubmitted(true);
      }
    } catch (err) {
      console.error("Master Franchise Application Failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatLakhs = (val) => {
    if (!val) return "N/A";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakhs`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: "60px" }}>

      {/* Hero Header Section */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
        color: "white",
        padding: "70px 0 90px 0",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.25), transparent 70%)",
          filter: "blur(50px)"
        }}></div>

        <div className="container" style={{ maxWidth: "1280px", position: "relative", zIndex: 2 }}>
          <div style={{ maxWidth: "800px" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "50px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#c7d2fe",
              fontSize: "13px",
              fontWeight: "700",
              marginBottom: "16px"
            }}>
              <Crown size={14} style={{ color: "#fbbf24" }} /> Exclusive Master Franchise Portal
            </span>
            <h1 style={{ fontSize: "42px", fontWeight: "800", color: "white", lineHeight: "1.2", marginBottom: "16px" }}>
              Acquire State & Regional Master Franchise Rights in India
            </h1>
            <p style={{ color: "#c7d2fe", fontSize: "17px", lineHeight: "1.6", marginBottom: "28px" }}>
              Own complete territorial exclusivity for leading brand networks. Collect upfront franchisee sign-up fees and recurring monthly royalty shares across your entire designated state or region.
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <button
                onClick={() => handleApplyClick(null)}
                className="btn btn-primary"
                style={{ padding: "14px 28px", fontSize: "15px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <Crown size={18} /> Apply for Master Rights
              </button>
              <a
                href="#master-listings"
                className="btn btn-outline"
                style={{ padding: "14px 28px", fontSize: "15px", color: "white", borderColor: "rgba(255, 255, 255, 0.3)" }}
              >
                Explore Master Brands
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: "1280px", marginTop: "-40px", position: "relative", zIndex: 10 }}>

        {/* Value Proposition Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
          marginBottom: "48px"
        }}>
          {MASTER_BENEFITS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))",
                  color: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px"
                }}>
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "13.5px", color: "#64748b", lineHeight: "1.5", margin: 0 }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Master Franchise Listings Section */}
        <div id="master-listings" style={{ marginBottom: "30px" }}>

          {/* Header & Filter Toolbar */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "var(--shadow-sm)",
            border: "1px solid #e2e8f0",
            marginBottom: "30px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                  Verified Master Franchise Opportunities ({filteredBrands.length})
                </h2>
                <p style={{ fontSize: "13.5px", color: "#64748b", margin: "4px 0 0 0" }}>
                  Select a brand to request exclusive state-level master rights and royalty structures.
                </p>
              </div>

              <button
                onClick={handleReset}
                className="btn btn-outline"
                style={{ fontSize: "13px", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <RotateCcw size={14} /> Reset Filters
              </button>
            </div>

            {/* Filter Inputs Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>

              {/* Keyword Search */}
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search Master Brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: "36px", background: "#f8fafc" }}
                />
              </div>

              {/* Industry Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-input"
                  style={{ background: "#f8fafc" }}
                >
                  <option value="">All Industries</option>
                  {BRAND_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="form-input"
                  style={{ background: "#f8fafc" }}
                >
                  <option value="">All HQ States</option>
                  {ALL_INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Territory Exclusivity Type */}
              <div>
                <select
                  value={selectedTerritory}
                  onChange={(e) => setSelectedTerritory(e.target.value)}
                  className="form-input"
                  style={{ background: "#f8fafc" }}
                >
                  {TERRITORY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Master Brands Grid */}
          {loading ? (
            <ProductSkeletonGrid count={6} />
          ) : filteredBrands.length === 0 ? (
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "50px 20px",
              textAlign: "center",
              border: "1px solid #e2e8f0"
            }}>
              <Building size={48} style={{ color: "#94a3b8", marginBottom: "16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>No Master Franchise Listings Found</h3>
              <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "450px", margin: "8px auto 20px" }}>
                We couldn't find any Master Franchise opportunities matching your search filters. Try clearing your filters or submit a general application.
              </p>
              <button onClick={handleReset} className="btn btn-primary" style={{ padding: "10px 20px" }}>
                Clear Search Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "24px"
            }}>
              {filteredBrands.map((brand) => (
                <div key={brand._id || brand.id} style={{
                  background: "white",
                  borderRadius: "18px",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }} className="master-card-hover">

                  {/* Card Header Image */}
                  <div style={{ position: "relative", height: "180px", background: "#0f172a" }}>
                    <img
                      src={brand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600"}
                      alt={brand.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff", opacity: 0.85 }}
                    />

                    <div style={{
                      position: "absolute",
                      top: "14px",
                      left: "14px",
                      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: "800",
                      padding: "4px 10px",
                      borderRadius: "50px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                    }}>
                      <Crown size={12} style={{ color: "#fbbf24" }} /> MASTER FRANCHISE
                    </div>

                    <div style={{
                      position: "absolute",
                      bottom: "14px",
                      left: "14px",
                      background: "rgba(15, 23, 42, 0.85)",
                      backdropFilter: "blur(8px)",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <MapPin size={12} /> {brand.territoryOffered || "State Level Exclusivity"}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <h3 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                          {decodeHtmlEntities(brand.name)}
                        </h3>
                        <span style={{ fontSize: "12px", color: "#4f46e5", fontWeight: "700" }}>
                          {decodeHtmlEntities(brand.category)} {brand.sector && `• ${decodeHtmlEntities(brand.sector)}`}
                        </span>
                      </div>
                    </div>

                    <p style={{
                      fontSize: "13px",
                      color: "#64748b",
                      lineHeight: "1.5",
                      marginBottom: "18px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {cleanBrandPlainText(brand.description, brand, 130)}
                    </p>

                    {/* Metrics Grid */}
                    <div style={{
                      background: "#f8fafc",
                      borderRadius: "12px",
                      padding: "14px",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginBottom: "20px",
                      fontSize: "12px",
                      border: "1px solid #f1f5f9"
                    }}>
                      <div>
                        <span style={{ color: "#94a3b8", display: "block", fontSize: "11px", fontWeight: "600" }}>Est. Master Investment</span>
                        <strong style={{ color: "#0f172a", fontSize: "13px" }}>
                          {brand.masterInvestmentRange || `${formatLakhs(brand.minInvestment * 1.5)} - ${formatLakhs(brand.maxInvestment * 2)}`}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: "#94a3b8", display: "block", fontSize: "11px", fontWeight: "600" }}>Royalty Share</span>
                        <strong style={{ color: "#10b981", fontSize: "13px" }}>Up to 50% Share</strong>
                      </div>
                      <div>
                        <span style={{ color: "#94a3b8", display: "block", fontSize: "11px", fontWeight: "600" }}>HQ Location</span>
                        <strong style={{ color: "#0f172a" }}>{brand.hq || "Delhi NCR"}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#94a3b8", display: "block", fontSize: "11px", fontWeight: "600" }}>Agreement Term</span>
                        <strong style={{ color: "#0f172a" }}>5 - 10 Years</strong>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div style={{ marginTop: "auto" }}>
                      <Link
                        href={`/brands/${brand.id || brand._id}`}
                        className="btn btn-primary"
                        style={{
                          width: "100%",
                          padding: "12px",
                          fontSize: "14px",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          textDecoration: "none"
                        }}
                      >
                        Apply for Master Rights <ChevronRight size={16} />
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* DYNAMIC SEO + GEO TAGS */}
      <div className="container" style={{ maxWidth: "1280px", marginTop: "40px" }}>
        <SEOGeoTags categoryName="Master Brand" basePath="/master-franchising" />
      </div>

    </div>
  );
}
