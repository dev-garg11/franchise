"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X, Sparkles, CheckCircle2, AlertCircle, Save, Copy, Check,
  Search, Globe, Bot, FileText, Code, Award, ExternalLink, Plus, Trash2
} from "lucide-react";
import { auditSeoData } from "@/lib/seoAudit";

export default function SeoEditModal({
  isOpen,
  onClose,
  brandId,
  onSave,
  onRegenerate,
  saving = false,
  regenerating = false
}) {
  const [activeTab, setActiveTab] = useState("traditional"); // traditional, geo, aeo, pillar, schema, scorecard
  const [loading, setLoading] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Form State
  const [brandInfo, setBrandInfo] = useState(null);
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [geoDescription, setGeoDescription] = useState("");
  const [aeoContent, setAeoContent] = useState("");
  const [pillarContent, setPillarContent] = useState("");
  const [toc, setToc] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [schemaData, setSchemaData] = useState({});
  const [seoStatus, setSeoStatus] = useState("Approved");
  const [scorecard, setScorecard] = useState(null);

  // Fetch Brand SEO details on open
  useEffect(() => {
    if (!isOpen || !brandId) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/admin/seo/${brandId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.data) {
          const { brand, seoData, faqs: bFaqs, schemaData: bSchema, rankMathScorecard } = data.data;
          setBrandInfo(brand);
          setSeoTitle(seoData.seoTitle || "");
          setMetaDescription(seoData.metaDescription || "");
          setFocusKeyword(seoData.focusKeyword || "");
          setSecondaryKeywords(seoData.secondaryKeywords || "");
          setCanonicalUrl(seoData.canonicalUrl || "");
          setGeoDescription(seoData.geoDescription || "");
          setAeoContent(seoData.aeoContent || "");
          setPillarContent(seoData.pillarContent || "");
          setToc(Array.isArray(seoData.toc) ? seoData.toc : []);
          setFaqs(Array.isArray(bFaqs) ? bFaqs : []);
          setSchemaData(bSchema || {});
          setSeoStatus(brand.seoStatus || "Approved");
          setScorecard(rankMathScorecard || null);
        }
      })
      .catch((err) => {
        console.error("Failed to load brand SEO:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, brandId]);

  // Real-time calculation uses the same deterministic audit as the server.
  const liveAudit = useMemo(() => {
    return auditSeoData({ seoTitle, metaDescription, focusKeyword, canonicalUrl, pillarContent, toc }, faqs);
  }, [seoTitle, metaDescription, focusKeyword, canonicalUrl, pillarContent, toc, faqs]);

  if (!isOpen) return null;

  // Handle Save
  const handleSave = () => {
    if (seoTitle && seoTitle.trim().length > 60) {
      alert(`SEO Title is ${seoTitle.trim().length} chars (Maximum allowed: 60 chars). Please shorten before saving.`);
      return;
    }
    if (metaDescription && metaDescription.trim().length > 160) {
      alert(`Meta Description is ${metaDescription.trim().length} chars (Maximum allowed: 160 chars). Please shorten before saving.`);
      return;
    }
    const updatedSeoData = {
      seoTitle,
      metaDescription,
      focusKeyword,
      secondaryKeywords,
      canonicalUrl,
      geoDescription,
      aeoContent,
      pillarContent,
      toc,
      keywords: secondaryKeywords
        ? [focusKeyword, ...secondaryKeywords.split(",").map((s) => s.trim()).filter(Boolean)]
        : [focusKeyword],
      rankMathScore: liveAudit.score,
      lastGeneratedAt: new Date()
    };

    onSave({
      brandId,
      seoData: updatedSeoData,
      faqs,
      schemaData,
      seoStatus
    });
  };

  // Handle AI Regenerate
  const handleRegenerate = async () => {
    if (onRegenerate) {
      const refreshed = await onRegenerate(brandId);
      if (refreshed && refreshed.data) {
        const { seoData, faqs: bFaqs, schemaData: bSchema, rankMathScorecard } = refreshed.data;
        if (seoData) {
          setSeoTitle(seoData.seoTitle || "");
          setMetaDescription(seoData.metaDescription || "");
          setFocusKeyword(seoData.focusKeyword || "");
          setSecondaryKeywords(seoData.secondaryKeywords || "");
          setCanonicalUrl(seoData.canonicalUrl || "");
          setGeoDescription(seoData.geoDescription || "");
          setAeoContent(seoData.aeoContent || "");
          setPillarContent(seoData.pillarContent || "");
          setToc(Array.isArray(seoData.toc) ? seoData.toc : []);
        }
        if (bFaqs) setFaqs(bFaqs);
        if (bSchema) setSchemaData(bSchema);
        if (rankMathScorecard) setScorecard(rankMathScorecard);
      }
    }
  };

  // FAQ handlers
  const handleFaqChange = (index, field, value) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleDeleteFaq = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  // Copy schema
  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(schemaData, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "1050px",
          height: "90vh",
          maxHeight: "900px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden"
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#f8fafc"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                  {brandInfo ? brandInfo.name : "Brand"} &bull; SEO, GEO & AEO Configuration
                </h2>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "800",
                    backgroundColor: liveAudit.score >= 80 ? "#dcfce7" : "#fef3c7",
                    color: liveAudit.score >= 80 ? "#15803d" : "#b45309"
                  }}
                >
                  Score: {liveAudit.score}/100
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Category: {brandInfo?.category || "General"} &bull; Min Investment: {brandInfo?.minInvestment || "₹0"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating || loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                color: "#ffffff",
                border: "none",
                fontWeight: "700",
                fontSize: "12px",
                cursor: regenerating || loading ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)"
              }}
            >
              <Sparkles size={13} className={regenerating ? "animate-spin" : ""} />
              {regenerating ? "Regenerating..." : "⚡ 1-Click AI Regenerate"}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#64748b",
                padding: "6px",
                cursor: "pointer",
                borderRadius: "8px"
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Tabs Bar */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            padding: "0 24px"
          }}
        >
          {[
            { id: "traditional", label: "Traditional SEO (Rank Math)", icon: Search },
            { id: "geo", label: "GEO (AI Search & Citations)", icon: Globe },
            { id: "aeo", label: `AEO FAQs (${faqs.length})`, icon: Bot },
            { id: "pillar", label: `Pillar Guide (${liveAudit.wordCount} words)`, icon: FileText },
            { id: "schema", label: "Schema.org JSON-LD", icon: Code },
            { id: "scorecard", label: `Rank Math Audit (${liveAudit.passCount}/${liveAudit.totalCount})`, icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 18px",
                  border: "none",
                  backgroundColor: "transparent",
                  borderBottom: isActive ? "3px solid #2563eb" : "3px solid transparent",
                  color: isActive ? "#2563eb" : "#64748b",
                  fontWeight: isActive ? "700" : "600",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            backgroundColor: "#f8fafc"
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
              <Sparkles size={32} className="animate-spin" style={{ margin: "0 auto 12px auto", color: "#2563eb" }} />
              <p style={{ fontWeight: "700", fontSize: "15px" }}>Loading brand SEO metadata...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: TRADITIONAL SEO */}
              {activeTab === "traditional" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Google SERP Preview */}
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "14px",
                      padding: "18px 20px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                      Google SERP Desktop & Mobile Preview
                    </span>
                    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "12px", color: "#202124" }}>
                        https://www.franchiseroots.com &rsaquo; brands &rsaquo; {brandInfo?.id || "franchise"}
                      </span>
                      <h3
                        style={{
                          margin: "2px 0 4px 0",
                          fontSize: "18px",
                          fontWeight: "500",
                          color: "#1a0dab",
                          cursor: "pointer",
                          lineHeight: "1.3"
                        }}
                      >
                        {seoTitle || "Brand Franchise Opportunity, Cost & Profit (2026)"}
                      </h3>
                      <p style={{ margin: 0, fontSize: "13px", color: "#4d5156", lineHeight: "1.4" }}>
                        {metaDescription || "Explore franchise opportunities with complete investment breakdown, profit ROI, and requirements."}
                      </p>
                    </div>
                  </div>

                  {/* Form Controls */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                        Focus Keyword (Rank Math Rule #1, #2, #3)
                      </label>
                      <input
                        type="text"
                        value={focusKeyword}
                        onChange={(e) => setFocusKeyword(e.target.value)}
                        placeholder="e.g. Chai Sutta Bar franchise"
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#0f172a"
                        }}
                      />
                      <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                        Must appear at start of SEO title, URL slug, and meta description.
                      </span>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                        Canonical URL
                      </label>
                      <input
                        type="text"
                        value={canonicalUrl}
                        onChange={(e) => setCanonicalUrl(e.target.value)}
                        placeholder="https://www.franchiseroots.com/brands/..."
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          color: "#0f172a"
                        }}
                      />
                    </div>
                  </div>

                  {/* SEO Title */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
                        SEO Meta Title (Title Formula: [Focus Keyword] + [Cost & ROI] + [Power Word] + [Year])
                      </label>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: seoTitle.length > 60 ? "#ef4444" : "#16a34a" }}>
                        {seoTitle.length} / 60 characters
                      </span>
                    </div>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#0f172a"
                      }}
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
                        Meta Description (Max 160 characters)
                      </label>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: metaDescription.length > 160 ? "#ef4444" : "#16a34a" }}>
                        {metaDescription.length} / 160 characters
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                        color: "#0f172a",
                        resize: "vertical"
                      }}
                    />
                  </div>

                  {/* Secondary Keywords */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      Secondary & LSI Keywords (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={secondaryKeywords}
                      onChange={(e) => setSecondaryKeywords(e.target.value)}
                      placeholder="e.g. brand franchise cost, brand franchise profit margin, brand outlet requirements"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                        color: "#0f172a"
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: GEO (GENERATIVE ENGINE OPTIMIZATION) */}
              {activeTab === "geo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div
                    style={{
                      backgroundColor: "#f0fdf4",
                      borderRadius: "14px",
                      padding: "18px 20px",
                      border: "1px solid #bbf7d0"
                    }}
                  >
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: "800", color: "#166534" }}>
                      What is GEO (Generative Engine Optimization)?
                    </h3>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#15803d", lineHeight: "1.5" }}>
                      GEO ensures AI search engines like <strong>Perplexity, ChatGPT Search, Claude, and Google Gemini</strong> extract direct, factual, citable statistics when investors prompt: <em>&ldquo;How much does a {brandInfo?.name} franchise cost in India and what is the ROI?&rdquo;</em>
                    </p>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      AI Citable Executive Summary Paragraph
                    </label>
                    <textarea
                      rows={6}
                      value={geoDescription}
                      onChange={(e) => setGeoDescription(e.target.value)}
                      placeholder="Citable executive summary with exact investment amount, square footage, royalty fee, and payback period..."
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                        lineHeight: "1.5",
                        color: "#0f172a"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      AI Knowledge Graph Direct Facts (AEO Snippet)
                    </label>
                    <textarea
                      rows={4}
                      value={aeoContent}
                      onChange={(e) => setAeoContent(e.target.value)}
                      placeholder="Bullet-point facts for AI indexing..."
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13px",
                        lineHeight: "1.5",
                        color: "#0f172a"
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: AEO (ANSWER ENGINE OPTIMIZATION FAQS) */}
              {activeTab === "aeo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
                        Featured Snippet & Voice Search FAQs ({faqs.length})
                      </h3>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                        Formatted to rank directly for Google &ldquo;People Also Ask&rdquo; and Schema.org FAQPage.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddFaq}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      <Plus size={14} /> Add Question
                    </button>
                  </div>

                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        padding: "16px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "800", color: "#2563eb" }}>
                          Q{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(idx)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            padding: "4px"
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={faq.question || ""}
                        onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                        placeholder="Enter the searcher's exact question..."
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#0f172a"
                        }}
                      />

                      <textarea
                        rows={2}
                        value={faq.answer || ""}
                        onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                        placeholder="Concise direct answer under 50 words for Google Featured Snippets..."
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "12.5px",
                          color: "#334155",
                          resize: "vertical"
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: PILLAR CONTENT & TOC */}
              {activeTab === "pillar" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      padding: "14px 18px",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Word Count</span>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: liveAudit.wordCount >= 600 ? "#16a34a" : "#dc2626" }}>
                          {liveAudit.wordCount} words (Target: 600-2500)
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Keyword Density</span>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: liveAudit.density >= 0.8 && liveAudit.density <= 2.5 ? "#16a34a" : "#d97706" }}>
                          {liveAudit.density}% ({liveAudit.kwMentions} mentions)
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>TOC Sections</span>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: "#7c3aed" }}>
                          {toc.length} Clickable Anchors
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TOC Editor/Viewer */}
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      padding: "14px 18px",
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
                      Table of Contents Anchors
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {toc.map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "6px",
                            backgroundColor: "#eff6ff",
                            color: "#1d4ed8",
                            fontSize: "12px",
                            fontWeight: "600",
                            border: "1px solid #bfdbfe"
                          }}
                        >
                          #{t.id}: {t.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pillar Guide HTML Editor */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                      850+ Word Comprehensive Business Guide HTML (Rank Math Pillar Content)
                    </label>
                    <textarea
                      rows={14}
                      value={pillarContent}
                      onChange={(e) => setPillarContent(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "12.5px",
                        fontFamily: "monospace",
                        color: "#0f172a",
                        lineHeight: "1.5"
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: SCHEMA.ORG JSON-LD */}
              {activeTab === "schema" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>
                        Schema.org JSON-LD Structured Data
                      </h3>
                      <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                        Includes LocalBusiness, FAQPage, and BreadcrumbList schemas.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopySchema}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        backgroundColor: copiedSchema ? "#16a34a" : "#f1f5f9",
                        color: copiedSchema ? "#ffffff" : "#334155",
                        border: "1px solid #cbd5e1",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      {copiedSchema ? <Check size={14} /> : <Copy size={14} />}
                      {copiedSchema ? "Copied!" : "Copy JSON-LD"}
                    </button>
                  </div>

                  <pre
                    style={{
                      backgroundColor: "#0f172a",
                      color: "#38bdf8",
                      padding: "18px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      overflowX: "auto",
                      maxHeight: "450px"
                    }}
                  >
                    {JSON.stringify(schemaData, null, 2)}
                  </pre>
                </div>
              )}

              {/* TAB 6: RANK MATH SCORECARD */}
              {activeTab === "scorecard" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "14px",
                      padding: "20px",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
                        Overall Score: {liveAudit.score} / 100
                      </h3>
                      <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                        Passing {liveAudit.passCount} of {liveAudit.totalCount} Rank Math criteria for &ldquo;{brandInfo?.name}&rdquo;
                      </p>
                    </div>

                    <div
                      style={{
                        padding: "10px 20px",
                        borderRadius: "24px",
                        backgroundColor: liveAudit.score >= 80 ? "#dcfce7" : "#fef3c7",
                        color: liveAudit.score >= 80 ? "#15803d" : "#b45309",
                        fontSize: "16px",
                        fontWeight: "900"
                      }}
                    >
                      {liveAudit.score >= 80 ? "100/100 Pillar Grade" : "Needs Polish"}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {/* Basic SEO */}
                    <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0" }}>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase" }}>
                        Basic SEO (6 Tests)
                      </h4>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[
                          { label: "Focus Keyword in the SEO title", pass: liveAudit.checks.focusKeywordInTitle },
                          { label: "Focus Keyword in SEO Meta Description", pass: liveAudit.checks.focusKeywordInDesc },
                          { label: "Focus Keyword in the URL", pass: liveAudit.checks.focusKeywordInUrl },
                          { label: "Focus Keyword at beginning of content", pass: liveAudit.checks.focusKeywordAtStartContent },
                          { label: "Focus Keyword inside content body", pass: liveAudit.checks.focusKeywordInContent },
                          { label: `Content length (${liveAudit.wordCount} words >= 600 words)`, pass: liveAudit.checks.contentLengthValid }
                        ].map((item, idx) => (
                          <li key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px" }}>
                            {item.pass ? (
                              <CheckCircle2 size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
                            ) : (
                              <AlertCircle size={16} style={{ color: "#dc2626", flexShrink: 0 }} />
                            )}
                            <span style={{ color: item.pass ? "#1e293b" : "#dc2626" }}>{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Additional SEO */}
                    <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0" }}>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase" }}>
                        Additional SEO (8 Tests)
                      </h4>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[
                          { label: "Focus Keyword in H2, H3 subheadings", pass: liveAudit.checks.focusKeywordInSubheadings },
                          { label: "Image alt text includes Focus Keyword", pass: liveAudit.checks.hasImageAltWithKeyword },
                          { label: `Keyword Density around ~1% (Currently ${liveAudit.density}%)`, pass: liveAudit.checks.keywordDensityValid },
                          { label: "Short, clean canonical URL", pass: liveAudit.checks.hasShortUrl },
                          { label: "Link out to external authority resources", pass: liveAudit.checks.hasExternalLinks },
                          { label: "Add internal links to other franchise pages", pass: liveAudit.checks.hasInternalLinks },
                          { label: "DoFollow link authority present", pass: liveAudit.checks.hasDoFollowLinks },
                          { label: "Focus Keyword explicitly set", pass: liveAudit.checks.hasSetFocusKeyword }
                        ].map((item, idx) => (
                          <li key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px" }}>
                            {item.pass ? (
                              <CheckCircle2 size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
                            ) : (
                              <AlertCircle size={16} style={{ color: "#dc2626", flexShrink: 0 }} />
                            )}
                            <span style={{ color: item.pass ? "#1e293b" : "#dc2626" }}>{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Title Readability */}
                    <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0" }}>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase" }}>
                        Title Readability (4 Tests)
                      </h4>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[
                          { label: "Focus Keyword near the start of SEO title", pass: liveAudit.checks.titleKwNearStart },
                          { label: "Title contains a sentiment word (Profit, Best)", pass: liveAudit.checks.titleHasSentiment },
                          { label: "Title contains a power word (Complete, ROI)", pass: liveAudit.checks.titleHasPowerWord },
                          { label: "Title contains a number (2026)", pass: liveAudit.checks.titleHasNumber }
                        ].map((item, idx) => (
                          <li key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px" }}>
                            {item.pass ? (
                              <CheckCircle2 size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
                            ) : (
                              <AlertCircle size={16} style={{ color: "#dc2626", flexShrink: 0 }} />
                            )}
                            <span style={{ color: item.pass ? "#1e293b" : "#dc2626" }}>{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Content Readability */}
                    <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0" }}>
                      <h4 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase" }}>
                        Content Readability (3 Tests)
                      </h4>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[
                          { label: "Table of Contents breaks down content", pass: liveAudit.checks.hasTableOfContents },
                          { label: "Short concise paragraphs (<700 chars)", pass: liveAudit.checks.hasShortParagraphs },
                          { label: "Images or diagrams embedded", pass: liveAudit.checks.hasImagesOrVisuals }
                        ].map((item, idx) => (
                          <li key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px" }}>
                            {item.pass ? (
                              <CheckCircle2 size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
                            ) : (
                              <AlertCircle size={16} style={{ color: "#dc2626", flexShrink: 0 }} />
                            )}
                            <span style={{ color: item.pass ? "#1e293b" : "#dc2626" }}>{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569" }}>
              SEO Status:
            </label>
            <select
              value={seoStatus}
              onChange={(e) => setSeoStatus(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "12px",
                fontWeight: "700",
                color: seoStatus === "Approved" ? "#166534" : "#c2410c",
                backgroundColor: seoStatus === "Approved" ? "#f0fdf4" : "#fff7ed"
              }}
            >
              <option value="Approved">Approved</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                backgroundColor: "#f1f5f9",
                color: "#475569",
                border: "1px solid #cbd5e1",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "10px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                fontWeight: "700",
                fontSize: "13px",
                cursor: saving || loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                opacity: saving ? 0.7 : 1
              }}
            >
              <Save size={16} />
              {saving ? "Saving Changes..." : "Save SEO Strategy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

