"use client";

import React, { useState } from "react";
import {
  IndianRupee,
  Building2,
  Store,
  Percent,
  Clock,
  ShieldCheck,
  TrendingUp,
  Award,
  Crown,
  FileCheck,
  Users,
  CheckCircle,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { extractCommercialSpecs, formatLakhs } from "@/lib/brandFormatters";

export default function CommercialSpecsBreakdown({ brand, onEnquireClick }) {
  const specs = extractCommercialSpecs(brand || {});
  const [activeSegment, setActiveSegment] = useState(null);
  const [showFullNotes, setShowFullNotes] = useState(false);

  return (
    <div
      className="commercial-specs-root"
      style={{
        background: "#ffffff",
        borderRadius: "24px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
        marginBottom: "28px"
      }}
    >
      {/* SECTION HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "26px 28px",
          color: "#ffffff",
          position: "relative"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span
                style={{
                  background: "rgba(37, 99, 235, 0.3)",
                  border: "1px solid rgba(96, 165, 250, 0.4)",
                  color: "#93c5fd",
                  fontSize: "11px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  letterSpacing: "0.5px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px"
                }}
              >
                <Sparkles size={13} /> Official Financial Model
              </span>
              <span
                style={{
                  background: "rgba(22, 163, 74, 0.25)",
                  color: "#86efac",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <ShieldCheck size={13} /> {specs.capitalTier}
              </span>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "900",
                letterSpacing: "-0.5px",
                color: "#ffffff"
              }}
            >
              Commercial Specifications & Investment Breakdown
            </h2>
            <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "14px", maxWidth: "680px", lineHeight: "1.5" }}>
              Audited franchise unit economics, capital requirements, recurring fee schedules, and expansion parameters for {specs.brandName}.
            </p>
          </div>

          {onEnquireClick && (
            <button
              onClick={onEnquireClick}
              style={{
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                transition: "all 0.2s ease"
              }}
            >
              Get Full P&L Sheet <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "28px" }}>
        {/* CORE COMMERCIAL METRICS GRID (4 PRIMARY TILES) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "16px",
            marginBottom: "28px"
          }}
        >
          {/* Card 1: Investment Range */}
          <div
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
              position: "relative",
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.5px" }}>
                Total Setup Investment
              </span>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IndianRupee size={18} />
              </div>
            </div>
            <div style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", marginBottom: "4px" }}>
              {specs.invRangeFormatted}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Turnkey Capex + Initial Fitout
            </div>
          </div>

          {/* Card 2: Franchise Fee */}
          <div
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
              position: "relative",
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.5px" }}>
                One-Time Brand Fee
              </span>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Award size={18} />
              </div>
            </div>
            <div style={{ fontSize: "22px", fontWeight: "900", color: "#16a34a", marginBottom: "4px" }}>
              {specs.franchiseFee}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              License & Trademark Onboarding
            </div>
          </div>

          {/* Card 3: Royalty / Commission */}
          <div
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
              position: "relative",
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.5px" }}>
                Royalty / Sharing
              </span>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#faf5ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Percent size={18} />
              </div>
            </div>
            <div style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", marginBottom: "4px" }}>
              {specs.royaltyFee}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              {specs.royaltyFee.includes("0%") ? "Zero Ongoing Royalties" : "Ongoing Operational Royalty"}
            </div>
          </div>

          {/* Card 4: Space Required */}
          <div
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
              position: "relative",
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.5px" }}>
                Commercial Space
              </span>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#ecfeff", color: "#0891b2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Store size={18} />
              </div>
            </div>
            <div style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", marginBottom: "4px" }}>
              {specs.areaRequired}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Prime High-Street / Mall / Kiosk
            </div>
          </div>
        </div>

        {/* SECONDARY COMMERCIAL PARAMETERS TABLE */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "18px",
            border: "1px solid #e2e8f0",
            padding: "20px 24px",
            marginBottom: "28px"
          }}
        >
          <h4 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Operational & Commercial Specifications
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <Clock size={20} style={{ color: "#2563eb", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block" }}>Agreement Tenure</span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{specs.tenure}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <TrendingUp size={20} style={{ color: "#16a34a", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block" }}>Payback Period (ROI)</span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#16a34a" }}>{specs.paybackPeriod}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <Building2 size={20} style={{ color: "#7c3aed", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block" }}>Territory Rights</span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{specs.territory}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <Users size={20} style={{ color: "#0891b2", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block" }}>Training & Setup</span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{specs.trainingSupport}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ESTIMATED CAPITAL ALLOCATION VISUALIZER */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                Estimated Capital Allocation Breakdown
              </h4>
              <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                Indicative budget deployment based on median setup expenditure ({formatLakhs(specs.medianInvestment)})
              </p>
            </div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", background: "#eff6ff", padding: "4px 10px", borderRadius: "10px" }}>
              100% Turnkey Model
            </span>
          </div>

          {/* Allocation Progress Bar */}
          <div
            style={{
              height: "16px",
              width: "100%",
              borderRadius: "10px",
              overflow: "hidden",
              display: "flex",
              marginBottom: "16px",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              background: "#e2e8f0"
            }}
          >
            {specs.breakdown.map((item, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveSegment(idx)}
                onMouseLeave={() => setActiveSegment(null)}
                style={{
                  width: `${item.pct}%`,
                  height: "100%",
                  backgroundColor: item.color,
                  cursor: "pointer",
                  transition: "opacity 0.2s ease",
                  opacity: activeSegment === null || activeSegment === idx ? 1 : 0.4
                }}
                title={`${item.label}: ${item.pct}% (~${formatLakhs(item.amount)})`}
              />
            ))}
          </div>

          {/* Allocation Breakdown Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "12px"
            }}
          >
            {specs.breakdown.map((item, idx) => {
              const isSelected = activeSegment === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveSegment(idx)}
                  onMouseLeave={() => setActiveSegment(null)}
                  style={{
                    background: isSelected ? item.bgColor : "#ffffff",
                    border: `1px solid ${isSelected ? item.color : "#e2e8f0"}`,
                    borderRadius: "14px",
                    padding: "14px",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.06)" : "none"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: item.color,
                          display: "inline-block"
                        }}
                      />
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>
                        {item.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "800",
                        color: item.color,
                        background: item.bgColor,
                        padding: "2px 6px",
                        borderRadius: "6px"
                      }}
                    >
                      {item.pct}%
                    </span>
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                    ~{formatLakhs(item.amount)}
                  </div>
                  <p style={{ margin: 0, fontSize: "11px", color: "#64748b", lineHeight: "1.4" }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* MASTER FRANCHISE / EXCLUSIVITY BANNER (IF AVAILABLE) */}
        {specs.masterAvailable && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "16px",
              padding: "18px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
              marginBottom: "24px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#fef3c7",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Crown size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#92400e" }}>
                  👑 Master Franchise & Regional Exclusivity Available
                </h4>
                <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#b45309" }}>
                  Exclusive territory rights: <strong>{specs.territory}</strong> • Master Investment Tier: <strong>{specs.masterRange}</strong>
                </p>
              </div>
            </div>

            {onEnquireClick && (
              <button
                onClick={onEnquireClick}
                style={{
                  background: "#d97706",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Request Master Terms
              </button>
            )}
          </div>
        )}

        {/* FRANCHISEROOTS COMMERCIAL ASSURANCE BADGES */}
        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            paddingTop: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle size={18} style={{ color: "#16a34a", flexShrink: 0 }} />
            <span style={{ fontSize: "12.5px", color: "#475569", fontWeight: "600" }}>
              Direct Franchisor Match (Zero Commission to Us)
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle size={18} style={{ color: "#16a34a", flexShrink: 0 }} />
            <span style={{ fontSize: "12.5px", color: "#475569", fontWeight: "600" }}>
              Site Selection Audit & Layout Blueprint Support
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle size={18} style={{ color: "#16a34a", flexShrink: 0 }} />
            <span style={{ fontSize: "12.5px", color: "#475569", fontWeight: "600" }}>
              Standardized Corporate Training & SOP Manuals
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
