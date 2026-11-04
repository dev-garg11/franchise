"use client";

import { useState, useMemo } from "react";
import {
  Building,
  Clock,
  Users,
  FileText,
  Wrench,
  Megaphone,
  ArrowRight,
  PlusCircle,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ExternalLink
} from "lucide-react";
import StatCard from "./StatCard";
import Button from "./Button";
import StatusChip from "./StatusChip";

// Format investment display cleanly once
function formatInvestmentRange(rangeStr, maxStr) {
  if (!rangeStr && !maxStr) return "Not specified";
  if (rangeStr && maxStr && rangeStr !== maxStr) {
    return `${rangeStr} - ${maxStr}`;
  }
  return rangeStr || maxStr || "Not specified";
}

// Helper to extract numeric amount from investor budget range
function extractBudgetAmount(inv) {
  const numericMinimum = [inv?.budgetMin, inv?.minInvestment, inv?.investmentMin, inv?.minimumInvestment]
    .find((value) => typeof value === "number" && value > 0);
  if (numericMinimum) return numericMinimum;

  const raw = `${inv?.investment_range || ""} ${inv?.max_investment_limit || ""} ${inv?.investmentCapacity || ""} ${inv?.budget || ""}`.toLowerCase();
  if (!raw.trim()) return 0;

  const match = raw.match(/([\d.]+)\s*(crore|cr|lakh|lac|lakhs|thousand|k)\b/i);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    if (!Number.isNaN(value)) {
      if (unit === "crore" || unit === "cr") return value * 10000000;
      if (["lakh", "lakhs", "lac"].includes(unit)) return value * 100000;
      return value * 1000;
    }
  }

  return 0;
}

const formatCompactAmount = (amount) => {
  if (!amount) return "Amount not specified";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakh`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
};

const getInvestorDate = (investor) => {
  const value = investor?.createdAt || investor?.appliedAt || investor?.submittedAt || investor?.date;
  if (value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  const idStr = String(investor?._id || investor?.id || "");
  if (/^[0-9a-fA-F]{24}$/.test(idStr)) {
    const timestamp = parseInt(idStr.substring(0, 8), 16) * 1000;
    const date = new Date(timestamp);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
};

export default function DashboardTab({
  brands = [],
  investors = [],
  allInvestors = [],
  blogs = [],
  services = [],
  ads = [],
  logs = [],
  loading = false,
  onTabChange,
  onApproveBrand,
  onDeclineBrand,
  onOpenBlogModal,
  onOpenServiceModal,
  onOpenAdModal
}) {
  const leadList = (allInvestors && allInvestors.length > 0) ? allInvestors : investors;
  const [leadTimeframe, setLeadTimeframe] = useState("weekly");
  const [activeTooltip, setActiveTooltip] = useState(null);

  // 1. Core Summary Metrics
  const totalBrands = brands.length;
  const pendingBrands = useMemo(() => brands.filter(b => b.status === "Pending"), [brands]);
  const approvedBrands = useMemo(() => brands.filter(b => b.status === "Approved"), [brands]);
  const declinedBrands = useMemo(() => brands.filter(b => b.status === "Declined" || b.status === "Rejected"), [brands]);

  const totalInvestors = leadList.length;
  const totalBlogs = blogs.length;
  const totalServices = services.length;
  const activeAds = useMemo(() => (
    ads
      .filter((ad) => ad.isActive !== false)
      .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
  ), [ads]);
  const totalAds = activeAds.length;

  // 2. Derive Recent Enquiries (Latest 5)
  const recentInvestors = useMemo(() => {
    return [...leadList]
      .sort((a, b) => new Date(b.createdAt || b.appliedAt || 0) - new Date(a.createdAt || a.appliedAt || 0))
      .slice(0, 5);
  }, [leadList]);

  // 3. Derive Brand Categories for Progress Bars
  const categoryStats = useMemo(() => {
    const counts = {};
    brands.forEach(b => {
      const rawCategory = String(b.category || "Others").trim();
      const cat = /top\s+featured/i.test(rawCategory) ? "Featured Brands" : rawCategory;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 4);
    if (top.length === 0) {
      return [
        { name: "Food and Beverage", count: 0, pct: 0, color: "#2563eb" },
        { name: "Education", count: 0, pct: 0, color: "#7c3aed" },
        { name: "Sports & Fitness", count: 0, pct: 0, color: "#ea580c" },
        { name: "Others", count: 0, pct: 0, color: "#15803d" }
      ];
    }
    const maxVal = top[0]?.[1] || 1;
    const colors = ["#2563eb", "#7c3aed", "#ea580c", "#15803d"];
    return top.map(([name, count], i) => ({
      name,
      count,
      pct: Math.round((count / maxVal) * 100),
      color: colors[i % colors.length]
    }));
  }, [brands]);

  // 4. Derive Lead Cities for Progress Bars
  const cityStats = useMemo(() => {
    const counts = {};
    leadList.forEach(inv => {
      const city = inv.preferredLocation || inv.city || "Others";
      const clean = city.split(",")[0].trim() || "Others";
      counts[clean] = (counts[clean] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 4);
    if (top.length === 0) {
      return [
        { name: "New Delhi", count: 0, pct: 0, color: "#2563eb" },
        { name: "Mumbai", count: 0, pct: 0, color: "#7c3aed" },
        { name: "Bengaluru", count: 0, pct: 0, color: "#ea580c" },
        { name: "Others", count: 0, pct: 0, color: "#15803d" }
      ];
    }
    const maxVal = top[0]?.[1] || 1;
    const colors = ["#2563eb", "#7c3aed", "#ea580c", "#15803d"];
    return top.map(([name, count], i) => ({
      name,
      count,
      pct: Math.round((count / maxVal) * 100),
      color: colors[i % colors.length]
    }));
  }, [leadList]);

  // 5. Derive Budget Ranges for Column Chart
  const budgetStats = useMemo(() => {
    const legacyRanges = [
      { label: "Under ₹1 Cr", count: 0 },
      { label: "₹1-10 Cr", count: 0 },
      { label: "₹10-50 Cr", count: 0 },
      { label: "₹50 Cr+", count: 0 }
    ];
    void legacyRanges;

    const ranges = [
      { label: "Under 5 Lakh", count: 0, amountTotal: 0 },
      { label: "5–20 Lakh", count: 0 },
      { label: "20–50 Lakh", count: 0 },
      { label: "50 Lakh+", count: 0, amountTotal: 0 },
      { label: "Amount not specified", count: 0, amountTotal: 0 }
    ];
    ranges.forEach(range => { range.amountTotal = range.amountTotal || 0; });

    leadList.forEach(inv => {
      const amount = extractBudgetAmount(inv);
      if (!amount) {
        ranges[4].count++;
      } else if (amount >= 5000000) {
        // >= ₹50 Cr
        ranges[3].count++;
        ranges[3].amountTotal += amount;
      } else if (amount >= 2000000) {
        // ₹10-50 Cr
        ranges[2].count++;
        ranges[2].amountTotal += amount;
      } else if (amount >= 500000) {
        // ₹1-10 Cr
        ranges[1].count++;
        ranges[1].amountTotal += amount;
      } else {
        // < ₹1 Cr (Lakhs, Thousands, or default)
        ranges[0].count++;
        ranges[0].amountTotal += amount;
      }
    });

    const maxCount = Math.max(...ranges.map(r => r.count), 1);
    return ranges.map(r => ({
      ...r,
      heightPct: r.count > 0 ? Math.max(16, Math.round((r.count / maxCount) * 100)) : 8
    }));
  }, [leadList]);

  // 6. Area Chart Points for Investor Leads Over Time
  const areaChartData = useMemo(() => {
    const datedLeads = leadList
      .map((investor) => ({ investor, date: getInvestorDate(investor) }))
      .filter((item) => item.date)
      .sort((a, b) => a.date - b.date);
    const now = new Date();
    const anchor = (datedLeads.length > 0 && datedLeads[datedLeads.length - 1].date > now)
      ? datedLeads[datedLeads.length - 1].date
      : now;
    const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" });
    const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" });

    if (leadTimeframe === "daily") {
      return Array.from({ length: 7 }, (_, index) => {
        const dayOffset = 6 - index;
        const targetDate = new Date(anchor);
        targetDate.setDate(anchor.getDate() - dayOffset);

        const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
        const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

        const leads = datedLeads.filter(({ date }) => date >= start && date <= end);
        const latest = leads[leads.length - 1]?.date;
        const isToday = start.toDateString() === now.toDateString();

        return {
          label: isToday ? `Today (${dateFormatter.format(start)})` : dateFormatter.format(start),
          shortLabel: isToday ? "Today" : dateFormatter.format(start),
          value: leads.length,
          leads: leads.length,
          detail: latest
            ? `${leads.length} lead${leads.length > 1 ? "s" : ""} (Latest: ${latest.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })})`
            : "No leads recorded"
        };
      });
    }

    if (leadTimeframe === "monthly") {
      return Array.from({ length: 6 }, (_, index) => {
        const monthOffset = 5 - index;
        const end = new Date(anchor.getFullYear(), anchor.getMonth() - monthOffset + 1, 0, 23, 59, 59);
        const start = new Date(anchor.getFullYear(), anchor.getMonth() - monthOffset, 1);
        const leads = datedLeads.filter(({ date }) => date >= start && date <= end);
        const latest = leads[leads.length - 1]?.date;
        return {
          label: monthFormatter.format(start),
          shortLabel: monthFormatter.format(start),
          value: leads.length,
          leads: leads.length,
          detail: latest ? `Latest: ${latest.toLocaleString("en-IN")}` : "No leads recorded"
        };
      });
    }

    return Array.from({ length: 6 }, (_, index) => {
      const weekOffset = 5 - index;
      const end = new Date(anchor);
      end.setDate(anchor.getDate() - weekOffset * 7);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      const leads = datedLeads.filter(({ date }) => date >= start && date <= end);
      const latest = leads[leads.length - 1]?.date;
      return {
        label: `${dateFormatter.format(start)}–${dateFormatter.format(end)}`,
        shortLabel: `${dateFormatter.format(start)}–${dateFormatter.format(end)}`,
        value: leads.length,
        leads: leads.length,
        detail: latest ? `Latest: ${latest.toLocaleString("en-IN")}` : "No leads recorded"
      };
    });
  }, [leadList, leadTimeframe]);

  // Calculate SVG curve path for Area Chart
  const svgWidth = 480;
  const svgHeight = 150;
  const maxAreaVal = Math.max(...areaChartData.map(d => d.value), 1);
  const points = areaChartData.map((d, i) => {
    const x = (i / (areaChartData.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - 25 - (d.value / maxAreaVal) * (svgHeight - 50);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp2x = cp1x;
    return `${acc} C ${cp1x} ${prev.y}, ${cp2x} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - 15} L ${points[0].x} ${svgHeight - 15} Z`;

  // 7. Donut Chart Calculations for Brand Status
  const donutApproved = approvedBrands.length;
  const donutPending = pendingBrands.length;
  const donutDeclined = declinedBrands.length;
  const donutTotal = Math.max(donutApproved + donutPending + donutDeclined, 1);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const approvedDash = (donutApproved / donutTotal) * circumference;
  const pendingDash = (donutPending / donutTotal) * circumference;
  const declinedDash = (donutDeclined / donutTotal) * circumference;

  const approvedOffset = 0;
  const pendingOffset = -approvedDash;
  const declinedOffset = -(approvedDash + pendingDash);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* 1. Header with Timeframe dropdown */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f1a3d", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
            Dashboard Overview
          </h1>
          <p style={{ fontSize: "14px", color: "#4a5878", margin: 0, fontWeight: "500" }}>
            {pendingBrands.length > 0 ? (
              <span style={{ color: "#ea580c", fontWeight: "700" }}>
                {pendingBrands.length} brands are waiting for your approval.
              </span>
            ) : (
              "All brand listings are up to date."
            )}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            defaultValue="30"
            aria-label="Select overview timeframe"
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              border: "1px solid #d9e2fa",
              backgroundColor: "#ffffff",
              fontSize: "13px",
              fontWeight: "600",
              color: "#0f1a3d",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">This year</option>
          </select>
        </div>
      </div>

      {/* 2. Top 6 Stat Cards in a 3x2 Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "18px"
        }}
      >
        <StatCard
          icon={Building}
          value={totalBrands}
          label="Total Registered Brands"
          color="blue"
          sparkline={true}
          trend="+ 12 this month"
          trendType="positive"
          loading={loading}
        />
        <StatCard
          icon={Clock}
          value={pendingBrands.length}
          label="Pending Approvals Queue"
          color="orange"
          sparkline={true}
          trend={pendingBrands.length > 0 ? "Needs action" : "All cleared"}
          trendType={pendingBrands.length > 0 ? "warning" : "positive"}
          loading={loading}
        />
        <StatCard
          icon={Users}
          value={totalInvestors}
          label="Registered Investor Leads"
          color="green"
          sparkline={true}
          trend="+ 5 this week"
          trendType="positive"
          loading={loading}
        />
        <StatCard
          icon={FileText}
          value={totalBlogs}
          label="Total Blog Posts"
          color="purple"
          loading={loading}
        />
        <StatCard
          icon={Wrench}
          value={totalServices}
          label="Managed Services"
          color="blue"
          loading={loading}
        />
        <StatCard
          icon={Megaphone}
          value={totalAds}
          label="Active Ad Banners"
          color="orange"
          loading={loading}
        />
      </div>

      {/* 3. Main Dashboard Two-Column Layout */}
      <div
        className="admin-dashboard-two-col"
        style={{
          display: "grid",
          gridTemplateColumns: "1.65fr 1fr",
          gap: "24px",
          alignItems: "start"
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Pending Approvals Queue Card */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #d9e2fa",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid #eef2fb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f1a3d", margin: 0 }}>
                  Pending Approvals Queue
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onTabChange("brands")}
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#2563eb",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                View All Brands
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ width: "100%", overflowX: "auto" }}>
              {pendingBrands.length === 0 ? (
                <div style={{ padding: "36px 20px", textAlign: "center", color: "#64748b" }}>
                  <CheckCircle size={28} style={{ color: "#15803d", margin: "0 auto 8px auto" }} />
                  <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>No brands pending approval</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8faff", borderBottom: "1px solid #eef2fb", color: "#4a5878", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>
                      <th style={{ padding: "12px 18px" }}>Brand Name</th>
                      <th style={{ padding: "12px 16px" }}>Category</th>
                      <th style={{ padding: "12px 16px" }}>Investment</th>
                      <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBrands.slice(0, 4).map((brand) => {
                      const initials = (brand.name || "B").substring(0, 2).toUpperCase();
                      return (
                        <tr key={brand.id || brand._id} className="admin-table-row" style={{ borderBottom: "1px solid #f1f5ff" }}>
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "10px",
                                  backgroundColor: "#eff6ff",
                                  color: "#1d4ed8",
                                  fontWeight: "800",
                                  fontSize: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0
                                }}
                              >
                                {initials}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontWeight: "800", color: "#0f1a3d" }}>
                                  {brand.name}
                                </span>
                                {brand.company && (
                                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                                    {brand.company}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", color: "#4a5878" }}>
                            {brand.category || "General"}
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: "700", color: "#0f1a3d" }}>
                            {brand.investment_range || brand.minInvestment ? `₹${brand.minInvestment ? brand.minInvestment / 100000 + " Lakh" : brand.investment_range}` : "₹2.0 - 5.0 Lakh"}
                          </td>
                          <td style={{ padding: "14px 18px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => onApproveBrand && onApproveBrand(brand)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger-outline"
                                size="sm"
                                onClick={() => onDeclineBrand && onDeclineBrand(brand)}
                              >
                                Decline
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {pendingBrands.length > 4 && (
              <div style={{ padding: "10px 18px", backgroundColor: "#f8faff", borderTop: "1px solid #eef2fb", fontSize: "12px", color: "#64748b" }}>
                + {pendingBrands.length - 4} more brands waiting in queue
              </div>
            )}
          </div>

          {/* Investor Leads Over Time Area Chart */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #d9e2fa",
              borderRadius: "16px",
              padding: "20px 22px",
              boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f1a3d", margin: 0 }}>
                  Investor Leads by Date & Time
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#64748b" }}>
                  Actual enquiries grouped by {leadTimeframe === "daily" ? "day" : leadTimeframe === "monthly" ? "month" : "week"}
                </p>
              </div>
              <select
                value={leadTimeframe}
                onChange={(e) => setLeadTimeframe(e.target.value)}
                aria-label="Timeframe for leads chart"
                style={{
                  padding: "5px 10px",
                  borderRadius: "8px",
                  border: "1px solid #d9e2fa",
                  backgroundColor: "#ffffff",
                  fontSize: "12px",
                  color: "#0f1a3d",
                  fontWeight: "600",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* SVG Area Chart */}
            <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
              {activeTooltip && (
                <div
                  style={{
                    position: "absolute",
                    left: `${(activeTooltip.x / svgWidth) * 100}%`,
                    top: `${Math.max(8, (activeTooltip.y / svgHeight) * 100 - 18)}%`,
                    transform: "translateX(-50%)",
                    backgroundColor: "#0f1a3d",
                    color: "#ffffff",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: "700",
                    pointerEvents: "none",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    zIndex: 10,
                    whiteSpace: "nowrap"
                  }}
                >
                  <div>{activeTooltip.label}</div>
                  <div style={{ color: "#93c5fd" }}>{activeTooltip.leads} new leads</div>
                  <div style={{ color: "#bfdbfe", marginTop: "2px", fontWeight: "500" }}>{activeTooltip.detail}</div>
                </div>
              )}

              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                style={{ width: "100%", height: "auto", display: "block" }}
              >
                <defs>
                  <linearGradient id="leadAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                <line x1="20" y1="35" x2={svgWidth - 20} y2="35" stroke="#f1f5ff" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="75" x2={svgWidth - 20} y2="75" stroke="#f1f5ff" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1="115" x2={svgWidth - 20} y2="115" stroke="#f1f5ff" strokeWidth="1" strokeDasharray="3 3" />

                {/* Area and Line */}
                <path d={areaD} fill="url(#leadAreaGradient)" />
                <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

                {/* Data Points */}
                {points.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={activeTooltip?.label === pt.label ? 6 : 4}
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                    onMouseEnter={() => setActiveTooltip(pt)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  />
                ))}

                {points.map((pt, idx) => (
                  <text
                    key={`value-${idx}`}
                    x={pt.x}
                    y={Math.max(12, pt.y - 10)}
                    textAnchor="middle"
                    fill="#2563eb"
                    fontSize="10"
                    fontWeight="800"
                  >
                    {pt.leads}
                  </text>
                ))}

                {/* X Axis Labels */}
                {points.map((pt, idx) => (
                  <text
                    key={idx}
                    x={pt.x}
                    y={svgHeight - 2}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {pt.shortLabel || pt.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* Two Progress Bar Cards Side-by-Side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            {/* Where Leads Come From (City) */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #d9e2fa",
                borderRadius: "16px",
                padding: "20px 22px",
                boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)"
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0f1a3d", margin: "0 0 16px 0" }}>
                Investor Leads by City
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {cityStats.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                      <span style={{ fontWeight: "600", color: "#0f1a3d" }}>{item.name}</span>
                      <span style={{ fontWeight: "700", color: "#4a5878" }}>{item.count}</span>
                    </div>
                    <div style={{ width: "100%", height: "7px", backgroundColor: "#f1f5ff", borderRadius: "999px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${item.pct}%`,
                          height: "100%",
                          backgroundColor: item.color,
                          borderRadius: "999px",
                          transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brands by Category */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #d9e2fa",
                borderRadius: "16px",
                padding: "20px 22px",
                boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)"
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0f1a3d", margin: "0 0 16px 0" }}>
                Registered Brands by Category
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {categoryStats.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                      <span style={{ fontWeight: "600", color: "#0f1a3d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
                        {item.name}
                      </span>
                      <span style={{ fontWeight: "700", color: "#4a5878" }}>{item.count}</span>
                    </div>
                    <div style={{ width: "100%", height: "7px", backgroundColor: "#f1f5ff", borderRadius: "999px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${item.pct}%`,
                          height: "100%",
                          backgroundColor: item.color,
                          borderRadius: "999px",
                          transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leads by Budget Range Column Chart */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #d9e2fa",
              borderRadius: "16px",
              padding: "20px 22px",
              boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)"
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0f1a3d", margin: "0 0 18px 0" }}>
              Leads by Budget Range
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${budgetStats.length}, minmax(0, 1fr))`, gap: "12px", alignItems: "end", minHeight: "150px", paddingBottom: "10px" }}>
              {budgetStats.map((b, idx) => (
                <div key={idx} title={`${b.count} investors | ${formatCompactAmount(b.amountTotal)}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", height: "100%", justifyContent: "flex-end", minWidth: 0 }}>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#0f1a3d" }}>
                    {b.count} leads
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b" }}>
                    {b.amountTotal ? formatCompactAmount(b.amountTotal) : "-"}
                  </span>
                  <div
                    style={{
                      width: "36px",
                      height: `${b.heightPct}%`,
                      backgroundColor: "#2563eb",
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                  />
                  <span style={{ fontSize: "10px", fontWeight: "600", color: "#64748b", textAlign: "center", lineHeight: 1.2 }}>
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Ad Banners Table */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #d9e2fa",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #eef2fb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f1a3d", margin: 0 }}>
                Active Ad Banners
              </h3>
              <button
                type="button"
                onClick={() => onTabChange("ads")}
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#2563eb",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                Manage Ads
                <ArrowRight size={14} />
              </button>
            </div>
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8faff", borderBottom: "1px solid #eef2fb", color: "#4a5878", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "10px 18px" }}>Banner</th>
                    <th style={{ padding: "10px 16px" }}>Status</th>
                    <th style={{ padding: "10px 18px", textAlign: "right" }}>Ends</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeAds.length > 0 ? activeAds.slice(0, 4) : [
                    { id: 1, title: "[Home page banner]", isActive: true, ends: "In 5 days" },
                    { id: 2, title: "[Brands page banner]", isActive: true, ends: "In 20 days" },
                    { id: 3, title: "[Blog sidebar banner]", isActive: false, ends: "Ending soon" }
                  ]).map((ad, i) => (
                    <tr key={ad.id || i} className="admin-table-row" style={{ borderBottom: "1px solid #f1f5ff" }}>
                      <td style={{ padding: "12px 18px", fontWeight: "700", color: "#0f1a3d" }}>
                        {ad.title || `[Banner #${i + 1}]`}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <StatusChip status={ad.isActive !== false ? "Live" : "Ending soon"} />
                      </td>
                      <td style={{ padding: "12px 18px", textAlign: "right", color: "#64748b", fontWeight: "600", fontSize: "12px" }}>
                        {ad.ends || (ad.isActive ? "In 15 days" : "Paused")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Recent Investor Enquiries List */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #d9e2fa",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #eef2fb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f1a3d", margin: 0 }}>
                Recent Investor Enquiries
              </h3>
              <button
                type="button"
                onClick={() => onTabChange("investors")}
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#2563eb",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                View All Leads
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {recentInvestors.length === 0 ? (
                <div style={{ padding: "30px 20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                  No investor enquiries yet.
                </div>
              ) : (
                recentInvestors.map((inv, idx) => {
                  const dateStr = inv.createdAt || inv.appliedAt ? new Date(inv.createdAt || inv.appliedAt).toLocaleDateString() : "Recent";
                  const maxBudget = inv.max_investment_limit || inv.investment_range || inv.investmentCapacity || "Not shared";
                  return (
                    <div
                      key={inv.id || inv._id || idx}
                      className="admin-table-row"
                      style={{
                        padding: "14px 20px",
                        borderBottom: idx < recentInvestors.length - 1 ? "1px solid #f1f5ff" : "none",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "10px"
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f1a3d" }}>
                          {inv.name || inv.fullName || "Investor Lead"}
                        </span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          Prefers: <strong style={{ color: "#0f1a3d" }}>{inv.preferredLocation || inv.city || "All India"}</strong> | Budget Max: <strong style={{ color: "#0f1a3d" }}>{maxBudget}</strong>
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", flexShrink: 0 }}>
                        {dateStr}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Brand Status Donut Chart Card */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #d9e2fa",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)"
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f1a3d", margin: "0 0 18px 0" }}>
              Brand Status
            </h3>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              {/* Donut SVG */}
              <div style={{ position: "relative", width: "130px", height: "130px", flexShrink: 0 }}>
                <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
                  {/* Background track */}
                  <circle cx="65" cy="65" r={radius} fill="none" stroke="#f1f5ff" strokeWidth="16" />

                  {/* Approved segment (Blue) */}
                  {donutApproved > 0 && (
                    <circle
                      cx="65"
                      cy="65"
                      r={radius}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="16"
                      strokeDasharray={`${approvedDash} ${circumference}`}
                      strokeDashoffset={approvedOffset}
                    />
                  )}

                  {/* Pending segment (Orange) */}
                  {donutPending > 0 && (
                    <circle
                      cx="65"
                      cy="65"
                      r={radius}
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="16"
                      strokeDasharray={`${pendingDash} ${circumference}`}
                      strokeDashoffset={pendingOffset}
                    />
                  )}

                  {/* Declined segment (Red) */}
                  {donutDeclined > 0 && (
                    <circle
                      cx="65"
                      cy="65"
                      r={radius}
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="16"
                      strokeDasharray={`${declinedDash} ${circumference}`}
                      strokeDashoffset={declinedOffset}
                    />
                  )}
                </svg>

                {/* Donut Central Total */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: "1.1"
                  }}
                >
                  <span style={{ fontSize: "22px", fontWeight: "900", color: "#0f1a3d", letterSpacing: "-0.02em" }}>
                    {totalBrands}
                  </span>
                  <span style={{ fontSize: "10.5px", fontWeight: "600", color: "#64748b", marginTop: "2px" }}>
                    Total Brands
                  </span>
                </div>
              </div>

              {/* Donut Legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flexGrow: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#2563eb" }} />
                    <span style={{ color: "#4a5878", fontWeight: "600" }}>Approved</span>
                  </div>
                  <strong style={{ color: "#0f1a3d" }}>{donutApproved}</strong>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#ea580c" }} />
                    <span style={{ color: "#4a5878", fontWeight: "600" }}>Pending</span>
                  </div>
                  <strong style={{ color: "#0f1a3d" }}>{donutPending}</strong>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#dc2626" }} />
                    <span style={{ color: "#4a5878", fontWeight: "600" }}>Declined</span>
                  </div>
                  <strong style={{ color: "#0f1a3d" }}>{donutDeclined}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Audit Logs */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #d9e2fa",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)",
              overflow: "hidden"
            }}
          >
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #eef2fb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f1a3d", margin: 0 }}>
                Recent Activity
              </h3>
              <button
                type="button"
                onClick={() => onTabChange("logs")}
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#2563eb",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                Audit logs
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {logs.length === 0 ? (
                <div style={{ padding: "30px 20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                  No recent activity.
                </div>
              ) : logs.slice(0, 4).map((log, i) => (
                <div
                  key={log.id || log._id || i}
                  style={{
                    padding: "12px 20px",
                    borderBottom: i < 3 ? "1px solid #f1f5ff" : "none",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "12.5px"
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: log.color || (log.action?.includes("APPROVED") ? "#15803d" : log.action?.includes("DECLINED") ? "#dc2626" : "#2563eb"),
                      marginTop: "6px",
                      flexShrink: 0
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontWeight: "700", color: "#0f1a3d" }}>
                      {log.description || log.action}
                    </span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : log.time || "Recent"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #d9e2fa",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)"
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f1a3d", margin: "0 0 16px 0" }}>
              Quick Actions
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTabChange("brands")}
              >
                + Add brand
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenBlogModal}
              >
                Write blog
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAdModal}
              >
                New banner
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenServiceModal}
              >
                Add service
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTabChange("investors")}
              >
                Export leads
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTabChange("logs")}
              >
                View logs
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

