"use client";

import { useState, useMemo } from "react";
import { Users, Clock, CheckCircle, XCircle, Download, Check, X } from "lucide-react";
import StatCard from "./StatCard";
import FilterTabs from "./FilterTabs";
import SearchInput from "./SearchInput";
import StatusChip from "./StatusChip";
import Button from "./Button";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import SkeletonLoader from "./SkeletonLoader";
import { BRAND_CATEGORIES } from "@/lib/brandConstants";
import { downloadCSV } from "@/lib/exportCsv";
import { toast, Swal } from "@/lib/swal";

// Client-side soft detection flags (never blocks actions)
function computeInvestorFlags(investor, allInvestors = []) {
  const flags = [];
  const name = (investor.name || investor.fullName || "").toLowerCase();
  const email = (investor.email || "").toLowerCase();
  const phone = (investor.phone || "").replace(/\D/g, "");

  // 1. "Test data" flag
  if (name.includes("test") || email.includes("test") || email.includes("unknown")) {
    flags.push("Test data");
  }

  // 2. "Check data" flag: name is only digits or very short/invalid
  if (/^\d+$/.test(name.replace(/\s/g, "")) || (email && !email.includes("@"))) {
    flags.push("Check data");
  }

  // 3. "Same investor, 2 brands" flag: same email or phone appears > 1 time
  if (email || phone) {
    const dupCount = allInvestors.filter(other => {
      const otherEmail = (other.email || "").toLowerCase();
      const otherPhone = (other.phone || "").replace(/\D/g, "");
      return (email && otherEmail === email) || (phone && otherPhone === phone);
    }).length;

    if (dupCount > 1) {
      flags.push("Same investor, 2 brands");
    }
  }

  return flags;
}

// Format budget cleanly without "N/A - N/A"
function formatBudget(investor) {
  const budget = investor.investment_range || investor.max_investment_limit || investor.investmentCapacity;
  if (!budget || budget === "N/A" || budget.includes("N/A - N/A") || budget === "Not Specified") {
    return <span style={{ color: "#94a3b8", fontWeight: "500" }}>Not shared</span>;
  }
  return <strong style={{ color: "#0f1a3d" }}>{budget}</strong>;
}

export default function InvestorsTab({
  investors = [],
  allInvestors = [],
  totalInvestors = 0,
  allCount = totalInvestors,
  pendingCount = 0,
  approvedCount = 0,
  rejectedCount = 0,
  allBrands = [],
  searchTerm = "",
  onSearchChange,
  onClearSearch,
  statusFilter = "all", // all, Pending, Approved, Rejected
  onStatusFilterChange,
  brandFilter = "",
  onBrandFilterChange,
  categoryFilter = "",
  onCategoryFilterChange,
  sortOrder = "newest",
  onSortOrderChange,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onPerPageChange,
  onViewDetails,
  onApproveInvestor,
  onDeclineInvestor,
  onMarkInvested,
  loading = false
}) {
  const [selectedLeads, setSelectedLeads] = useState([]);

  const uniqueBrands = useMemo(() => {
    const seen = new Set();
    const list = [];
    (allBrands || []).forEach(b => {
      const status = String(b.status || "Approved").trim().toLowerCase();
      if (status === "declined" || status === "rejected") return;
      const name = (b.name || "").trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({ id: b.id || b._id || name, name });
      }
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [allBrands]);

  const filterTabs = [
    { id: "all", label: "All", count: allCount },
    { id: "Pending", label: "Pending", count: pendingCount },
    { id: "Approved", label: "Approved", count: approvedCount },
    { id: "Rejected", label: "Rejected", count: rejectedCount }
  ];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(investors.map(inv => inv.id || inv._id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedLeads(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isAllSelected = investors.length > 0 && selectedLeads.length === investors.length;

  const handleExportCSV = () => {
    const dataSource = allInvestors && allInvestors.length > 0 ? allInvestors : investors;
    let leadsToExport = dataSource;

    if (selectedLeads.length > 0) {
      leadsToExport = dataSource.filter(inv => selectedLeads.includes(inv.id || inv._id));
    }

    if (!leadsToExport || leadsToExport.length === 0) {
      toast.warning("No investor leads to export.");
      return;
    }

    const rows = leadsToExport.map((inv, idx) => ({
      "S.No": idx + 1,
      "Investor Name": inv.name || inv.fullName || "N/A",
      "Email": inv.email || "N/A",
      "Phone": inv.phone || "N/A",
      "Applied For Brand": inv.brandName || ((allBrands || []).find(b => String(b.id || b._id) === String(inv.brandId))?.name) || (inv.brandId ? `Brand ID: ${inv.brandId}` : (inv.assignedBrands?.length > 0 ? "General Lead (Assigned)" : "General Lead")),
      "Finalized Franchise": inv.brandName || "N/A",
      "Investment Status": inv.investmentStatus || "Not Started",
      "Investment Amount": inv.investmentAmount ? `₹${Number(inv.investmentAmount).toLocaleString("en-IN")}` : "N/A",
      "Category / Industry": inv.category || inv.interestedCategory || (Array.isArray(inv.industries) ? inv.industries.join("; ") : "N/A"),
      "Investment Budget": inv.investment_range || inv.max_investment_limit || inv.investmentCapacity || "Not specified",
      "Location": inv.city || inv.location || inv.preferredLocation || "N/A",
      "State": inv.state || "N/A",
      "Status": inv.status || "Pending",
      "Date Applied": inv.createdAt || inv.appliedAt ? new Date(inv.createdAt || inv.appliedAt).toLocaleDateString("en-IN") : "N/A",
      "Remarks / Notes": inv.comments || inv.message || ""
    }));

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = selectedLeads.length > 0
      ? `investor_leads_selected_${dateStr}.csv`
      : `investor_leads_${dateStr}.csv`;

    downloadCSV(filename, rows);
    toast.success(`Exported ${rows.length} investor leads to CSV successfully!`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* 1. Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f1a3d", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
            Investor Profiles & Leads
          </h1>
          <p style={{ fontSize: "14px", color: "#4a5878", margin: 0, fontWeight: "500" }}>
            Review enquiries from investors and follow up quickly.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="outline"
            size="md"
            icon={Download}
            onClick={handleExportCSV}
            title={selectedLeads.length > 0 ? `Export ${selectedLeads.length} Selected Leads (CSV)` : "Export All Leads (CSV)"}
          >
            {selectedLeads.length > 0 ? `Export Selected (${selectedLeads.length})` : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* 2. Top 4 Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
        <StatCard
          icon={Users}
          value={totalInvestors}
          label="Total Leads"
          color="blue"
          loading={loading}
        />
        <StatCard
          icon={Clock}
          value={pendingCount}
          label="Pending"
          color="orange"
          loading={loading}
        />
        <StatCard
          icon={CheckCircle}
          value={approvedCount}
          label="Approved"
          color="green"
          loading={loading}
        />
        <StatCard
          icon={XCircle}
          value={rejectedCount}
          label="Rejected"
          color="red"
          loading={loading}
        />
      </div>

      {/* 3. Main Leads Table Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #d9e2fa",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)",
          overflow: "hidden"
        }}
      >
        {/* Title & Toolbar */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef2fb", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f1a3d", margin: 0 }}>
            All Investor Leads
          </h3>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
            <FilterTabs
              tabs={filterTabs}
              activeTab={statusFilter}
              onChange={onStatusFilterChange}
              loading={loading}
            />

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <select
                value={brandFilter || ""}
                onChange={(e) => onBrandFilterChange && onBrandFilterChange(e.target.value)}
                aria-label="Filter by Brand"
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1px solid #d9e2fa",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",
                  color: "#0f1a3d",
                  fontWeight: "600",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="">Brand: All</option>
                <option value="general">General / No Brand</option>
                {uniqueBrands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              <select
                value={categoryFilter || ""}
                onChange={(e) => onCategoryFilterChange && onCategoryFilterChange(e.target.value)}
                aria-label="Filter by Category"
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1px solid #d9e2fa",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",
                  color: "#0f1a3d",
                  fontWeight: "600",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="">Category: All</option>
                {BRAND_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={sortOrder || "newest"}
                onChange={(e) => onSortOrderChange && onSortOrderChange(e.target.value)}
                aria-label="Sort order"
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1px solid #d9e2fa",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",
                  color: "#0f1a3d",
                  fontWeight: "600",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {/* Search Bar & Bulk Selection Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <SearchInput
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              onClear={onClearSearch}
              placeholder="Search Name, email or phone..."
              style={{ maxWidth: "460px" }}
            />

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                {selectedLeads.length} selected. Select rows to approve or decline in bulk.
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={true}
                title="Bulk Approve (Backend pending)"
              >
                Approve selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={true}
                title="Bulk Decline (Backend pending)"
              >
                Decline selected
              </Button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          {(loading && investors.length === 0) ? (
            <SkeletonLoader type="table" rows={6} cols={6} />
          ) : investors.length === 0 ? (
            <EmptyState
              title="No investor leads found"
              description="No investor records match your search query or selected filters."
              actionLabel="Clear Filters"
              onAction={() => {
                if (onClearSearch) onClearSearch();
                if (onStatusFilterChange) onStatusFilterChange("all");
                if (onBrandFilterChange) onBrandFilterChange("");
                if (onCategoryFilterChange) onCategoryFilterChange("");
              }}
            />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8faff", borderBottom: "1px solid #eef2fb", color: "#4a5878", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "12px 18px", width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      aria-label="Select all leads on page"
                      style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#2563eb" }}
                    />
                  </th>
                  <th style={{ padding: "12px 16px" }}>Investor</th>
                  <th style={{ padding: "12px 16px" }}>Applied For</th>
                  <th style={{ padding: "12px 16px" }}>Budget</th>
                  <th style={{ padding: "12px 16px" }}>Location</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                  <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((inv) => {
                  const id = inv.id || inv._id;
                  const isSelected = selectedLeads.includes(id);
                  const name = inv.name || inv.fullName || "Investor";
                  const initials = name.substring(0, 2).toUpperCase();
                  const flags = computeInvestorFlags(inv, (Array.isArray(allInvestors) && allInvestors.length > 0) ? allInvestors : investors);
                  const isPending = inv.status === "Pending";
                  const isRejected = inv.status === "Rejected" || inv.status === "Declined";
                  const isInvested = inv.investmentStatus === "Invested" || inv.investmentStatus === "Closed";
                  const dateStr = inv.createdAt || inv.appliedAt ? new Date(inv.createdAt || inv.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A";
                  let resolvedBrandName = inv.brandName || "";
                  if (!resolvedBrandName && inv.brandId) {
                    const match = (allBrands || []).find(b => String(b.id || b._id) === String(inv.brandId));
                    resolvedBrandName = match ? match.name : inv.brandId;
                  }
                  const assignedBrandNames = (Array.isArray(inv.assignedBrands) ? inv.assignedBrands : [])
                    .map(bId => {
                      const match = (allBrands || []).find(b => String(b.id || b._id) === String(bId));
                      return match ? match.name : bId;
                    })
                    .filter(Boolean);
                  const brandTarget = resolvedBrandName;

                  return (
                    <tr
                      key={id}
                      className="admin-table-row"
                      style={{
                        borderBottom: "1px solid #f1f5ff",
                        backgroundColor: isSelected ? "#f0f7ff" : "transparent"
                      }}
                    >
                      <td style={{ padding: "14px 18px" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(id)}
                          aria-label={`Select ${name}`}
                          style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#2563eb" }}
                        />
                      </td>

                      {/* Investor details + soft flags */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
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
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontWeight: "800", color: "#0f1a3d", fontSize: "13.5px" }}>
                              {name}
                            </span>
                            {inv.email && (
                              <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                                {inv.email}
                              </span>
                            )}
                            {inv.phone && (
                              <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                                {inv.phone}
                              </span>
                            )}
                            {flags.length > 0 && (
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "3px" }}>
                                {flags.map((f, i) => (
                                  <StatusChip key={i} variant="flag" style={{ fontSize: "10px", padding: "1px 6px" }}>
                                    {f}
                                  </StatusChip>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Applied For */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          {brandTarget ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <span style={{ fontWeight: "700", color: "#0f1a3d" }}>
                                {brandTarget}
                              </span>
                              {isInvested && (
                                <span style={{
                                  fontSize: "10.5px",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  backgroundColor: "#ecfdf5",
                                  color: "#059669",
                                  border: "1px solid #a7f3d0",
                                  fontWeight: "700"
                                }}>
                                  Deal Closed ✓
                                </span>
                              )}
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                              <StatusChip status="General Lead" variant="info" style={{ width: "fit-content" }} />
                              {assignedBrandNames.length > 0 && (
                                <span style={{ fontSize: "11px", color: "#4338ca", backgroundColor: "#eef2ff", padding: "1px 6px", borderRadius: "4px", width: "fit-content", fontWeight: "600", border: "1px solid #c7d2fe" }}>
                                  Assigned: {assignedBrandNames.join(", ")}
                                </span>
                              )}
                            </div>
                          )}
                          <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                            {inv.category || inv.interestedCategory || "General Consultation"}
                          </span>
                        </div>
                      </td>

                      {/* Budget */}
                      <td style={{ padding: "14px 16px" }}>
                        {formatBudget(inv)}
                      </td>

                      {/* Location */}
                      <td style={{ padding: "14px 16px", color: "#4a5878" }}>
                        {inv.preferredLocation || inv.city || "Not specified"}
                      </td>

                      {/* Status + Date underneath */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <StatusChip status={inv.status || "Pending"} />
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                            {dateStr}
                          </span>
                          {inv.investmentStatus && inv.investmentStatus !== "Not Started" && (
                            <span style={{ fontSize: "11px", color: isInvested ? "#15803d" : "#7c3aed", fontWeight: "700" }}>
                              Investment: {inv.investmentStatus}{isInvested && Number(inv.investmentAmount) > 0 ? ` · ₹${Number(inv.investmentAmount).toLocaleString("en-IN")}` : ""}
                              {isInvested && brandTarget ? ` (${brandTarget})` : ""}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions: Details, Approve, Decline, Restore */}
                      <td style={{ padding: "14px 18px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetails && onViewDetails(inv)}
                          >
                            Details
                          </Button>

                          {isPending && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => onApproveInvestor && onApproveInvestor(inv)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger-outline"
                                size="sm"
                                onClick={() => onDeclineInvestor && onDeclineInvestor(inv)}
                              >
                                Decline
                              </Button>
                            </>
                          )}

                          {isRejected && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={true}
                              title="Restore rejected lead (Backend pending)"
                            >
                              Restore
                            </Button>
                          )}

                          {inv.status === "Approved" && (
                            <Button
                              variant={isInvested ? "outline" : "soft-blue"}
                              size="sm"
                              onClick={() => onMarkInvested && onMarkInvested(inv)}
                              title={isInvested ? "Update finalized brand or investment amount" : "Mark investment completed and select brand"}
                            >
                              {isInvested ? "Edit Deal" : "Mark Invested"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {totalInvestors > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalInvestors}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
          />
        )}
      </div>
    </div>
  );
}

