"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles, Search, Filter, RefreshCw, ExternalLink,
  Edit3, CheckCircle2, AlertCircle, FileText, Globe, Bot,
  Award, ShieldCheck, ChevronRight
} from "lucide-react";

export default function SeoTab({
  brands = [],
  loading = false,
  onRefresh,
  onOpenEditModal,
  onRegenerateSeo,
  onBatchGenerate,
  regeneratingId = null,
  batchProcessing = false
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Derive unique categories from brands
  const categories = useMemo(() => {
    const set = new Set();
    brands.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set).sort();
  }, [brands]);

  // Filter and sort brands
  const filteredBrands = useMemo(() => {
    return brands
      .filter((b) => {
        const matchesSearch =
          !searchTerm ||
          (b.name && b.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (b.category && b.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (b.seoData?.focusKeyword && b.seoData.focusKeyword.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory =
          categoryFilter === "all" || b.category?.toLowerCase() === categoryFilter.toLowerCase();

        const score = b.seoData?.rankMathScore || 0;
        let matchesStatus = true;
        if (statusFilter === "optimized") {
          matchesStatus = score >= 80;
        } else if (statusFilter === "needs_work") {
          matchesStatus = score < 80;
        } else if (statusFilter === "pending") {
          matchesStatus = b.seoStatus === "Pending Review";
        } else if (statusFilter === "approved") {
          matchesStatus = b.seoStatus === "Approved";
        }

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "score_desc") {
          return (b.seoData?.rankMathScore || 0) - (a.seoData?.rankMathScore || 0);
        }
        if (sortBy === "score_asc") {
          return (a.seoData?.rankMathScore || 0) - (b.seoData?.rankMathScore || 0);
        }
        if (sortBy === "name_asc") {
          return (a.name || "").localeCompare(b.name || "");
        }
        return 0;
      });
  }, [brands, searchTerm, categoryFilter, statusFilter, sortBy]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = brands.length;
    const fullyOptimized = brands.filter((b) => (b.seoData?.rankMathScore || 0) >= 80).length;
    const withPillar = brands.filter((b) => b.hasPillarContent || (b.seoData?.pillarContent && b.seoData.pillarContent.length > 200)).length;
    const withFaqs = brands.filter((b) => (b.faqsCount || 0) >= 3 || (b.faqs && b.faqs.length >= 3)).length;
    const avgScore = total > 0 ? Math.round(brands.reduce((acc, b) => acc + (b.seoData?.rankMathScore || 0), 0) / total) : 0;

    return { total, fullyOptimized, withPillar, withFaqs, avgScore };
  }, [brands]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Header Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "18px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 6px 16px rgba(37, 99, 235, 0.3)"
            }}
          >
            <Sparkles size={24} />
          </div>
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "800",
                color: "#0f172a",
                margin: "0 0 4px 0",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              SEO, GEO & AEO AI Optimization Engine
            </h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
              Rank Math 100/100, Generative AI Search (ChatGPT, Claude, Perplexity), and Google Answer Engine Optimization.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "10px",
              backgroundColor: "#f1f5f9",
              color: "#334155",
              border: "1px solid #cbd5e1",
              fontWeight: "600",
              fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={onBatchGenerate}
            disabled={batchProcessing || loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              color: "#ffffff",
              border: "none",
              fontWeight: "700",
              fontSize: "13px",
              cursor: batchProcessing || loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
              opacity: batchProcessing ? 0.7 : 1
            }}
          >
            <Sparkles size={16} />
            {batchProcessing ? "Optimizing All Brands..." : "⚡ 1-Click Optimize All Brands"}
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px"
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "18px 20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Globe size={22} />
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>
              Total Brands
            </span>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>
              {stats.total}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "18px 20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#ecfdf5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Award size={22} />
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>
              100/100 Score Brands
            </span>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#059669" }}>
              {stats.fullyOptimized} / {stats.total}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "18px 20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#f5f3ff",
              color: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <FileText size={22} />
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>
              Pillar Guides Active
            </span>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#7c3aed" }}>
              {stats.withPillar}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "18px 20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#fffbeb",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Bot size={22} />
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>
              Average Rank Math
            </span>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#d97706" }}>
              {stats.avgScore} / 100
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          padding: "16px 20px",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 300px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8"
              }}
            />
            <input
              type="text"
              placeholder="Search by Brand Name, Focus Keyword, Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
                color: "#0f172a"
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: "9px 12px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              color: "#334155",
              backgroundColor: "#ffffff",
              cursor: "pointer"
            }}
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "9px 12px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              color: "#334155",
              backgroundColor: "#ffffff",
              cursor: "pointer"
            }}
          >
            <option value="all">All Statuses</option>
            <option value="optimized">100/100 Optimized (80+)</option>
            <option value="needs_work">Needs Optimization (&lt;80)</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "9px 12px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              color: "#334155",
              backgroundColor: "#ffffff",
              cursor: "pointer"
            }}
          >
            <option value="default">Sort: Default</option>
            <option value="score_desc">Rank Math: High to Low</option>
            <option value="score_asc">Rank Math: Low to High</option>
            <option value="name_asc">Brand Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Brands SEO Table */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          overflow: "hidden"
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Brand Details
                </th>
                <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Focus Keyword
                </th>
                <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Rank Math Score
                </th>
                <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  AI & Search Readiness
                </th>
                <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                  Status
                </th>
                <th style={{ padding: "14px 18px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", textAlign: "right" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && brands.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px auto", color: "#2563eb" }} />
                    <p style={{ margin: 0, fontWeight: "600" }}>Loading brand SEO strategies...</p>
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#64748b" }}>
                    <AlertCircle size={32} style={{ margin: "0 auto 12px auto", color: "#94a3b8" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px 0" }}>
                      No brands match your filter
                    </h3>
                    <p style={{ margin: 0, fontSize: "13px" }}>Try adjusting your search keyword or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => {
                  const score = brand.seoData?.rankMathScore || 0;
                  const isOptimized = score >= 80;
                  const hasPillar = brand.hasPillarContent || (brand.seoData?.pillarContent && brand.seoData.pillarContent.length > 200);
                  const isRegenerating = regeneratingId === brand.id;

                  return (
                    <tr
                      key={brand.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* Brand identity */}
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {brand.image ? (
                            <img
                              src={brand.image}
                              alt={brand.name}
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "10px",
                                objectFit: "cover",
                                border: "1px solid #e2e8f0"
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "10px",
                                backgroundColor: "#eff6ff",
                                color: "#2563eb",
                                fontWeight: "800",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px"
                              }}
                            >
                              {brand.name ? brand.name.substring(0, 2).toUpperCase() : "FR"}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>
                              {brand.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                              {brand.category} &bull; {brand.investmentRange}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Focus Keyword */}
                      <td style={{ padding: "16px 18px" }}>
                        {brand.seoData?.focusKeyword ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                backgroundColor: "#eff6ff",
                                color: "#1d4ed8",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: "700",
                                border: "1px solid #bfdbfe",
                                maxWidth: "220px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {brand.seoData.focusKeyword}
                            </span>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>
                              {brand.seoData?.secondaryKeywords
                                ? `${brand.seoData.secondaryKeywords.split(",").length} LSI variants`
                                : "No secondary keywords"}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
                            Not set
                          </span>
                        )}
                      </td>

                      {/* Rank Math Score */}
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              padding: "6px 12px",
                              borderRadius: "20px",
                              fontSize: "12.5px",
                              fontWeight: "800",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              backgroundColor: isOptimized ? "#dcfce7" : score >= 50 ? "#fef3c7" : "#fee2e2",
                              color: isOptimized ? "#15803d" : score >= 50 ? "#b45309" : "#b91c1c"
                            }}
                          >
                            <span
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: isOptimized ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626"
                              }}
                            />
                            {score} / 100
                          </div>
                        </div>
                      </td>

                      {/* AI & Search Readiness Badges */}
                      <td style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {/* Pillar Content Badge */}
                          <span
                            title={hasPillar ? "850+ Word Pillar Guide Active" : "No Pillar Content"}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "700",
                              backgroundColor: hasPillar ? "#ede9fe" : "#f1f5f9",
                              color: hasPillar ? "#6d28d9" : "#94a3b8",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <FileText size={11} /> Pillar
                          </span>

                          {/* AEO FAQ Badge */}
                          <span
                            title={`${brand.faqsCount || 0} AEO Featured Snippet FAQs`}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "700",
                              backgroundColor: (brand.faqsCount || 0) >= 3 ? "#dbeafe" : "#f1f5f9",
                              color: (brand.faqsCount || 0) >= 3 ? "#1e40af" : "#94a3b8",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Bot size={11} /> {brand.faqsCount || 0} FAQs
                          </span>

                          {/* GEO Snippet Badge */}
                          <span
                            title={brand.seoData?.geoDescription ? "GEO AI Search snippet ready" : "No GEO Snippet"}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "700",
                              backgroundColor: brand.seoData?.geoDescription ? "#ccfbf1" : "#f1f5f9",
                              color: brand.seoData?.geoDescription ? "#0f766e" : "#94a3b8",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Globe size={11} /> GEO
                          </span>

                          {/* Schema Badge */}
                          <span
                            title={brand.hasSchema ? "Schema.org JSON-LD graph present" : "No Schema"}
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "700",
                              backgroundColor: brand.hasSchema ? "#fef3c7" : "#f1f5f9",
                              color: brand.hasSchema ? "#92400e" : "#94a3b8",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <ShieldCheck size={11} /> Schema
                          </span>
                        </div>
                      </td>

                      {/* Approval Status */}
                      <td style={{ padding: "16px 18px" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            backgroundColor: brand.seoStatus === "Approved" ? "#f0fdf4" : "#fff7ed",
                            color: brand.seoStatus === "Approved" ? "#166534" : "#c2410c",
                            border: `1px solid ${brand.seoStatus === "Approved" ? "#bbf7d0" : "#ffedd5"}`
                          }}
                        >
                          {brand.seoStatus || "Pending Review"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px 18px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          {/* Live preview */}
                          <Link
                            href={`/brands/${brand.id}`}
                            target="_blank"
                            title="View Public Brand Page"
                            style={{
                              padding: "7px",
                              borderRadius: "8px",
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textDecoration: "none",
                              transition: "background-color 0.15s ease"
                            }}
                          >
                            <ExternalLink size={14} />
                          </Link>

                          {/* 1-Click AI Regenerate Button */}
                          <button
                            type="button"
                            onClick={() => onRegenerateSeo(brand.id)}
                            disabled={isRegenerating}
                            title="Regenerate 100/100 Rank Math, GEO, AEO, Pillar Guide with AI"
                            style={{
                              padding: "7px 12px",
                              borderRadius: "8px",
                              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                              color: "#ffffff",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: isRegenerating ? "not-allowed" : "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)",
                              opacity: isRegenerating ? 0.6 : 1
                            }}
                          >
                            <Sparkles size={13} className={isRegenerating ? "animate-spin" : ""} />
                            {isRegenerating ? "Generating..." : "⚡ AI Fix"}
                          </button>

                          {/* Inspect & Edit Button */}
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(brand.id)}
                            style={{
                              padding: "7px 14px",
                              borderRadius: "8px",
                              backgroundColor: "#2563eb",
                              color: "#ffffff",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)"
                            }}
                          >
                            <Edit3 size={13} />
                            Inspect & Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

