"use client";

import { useState, useMemo } from "react";
import { Building, Clock, CheckCircle, Eye, Edit3, Check, X, Download } from "lucide-react";
import StatCard from "./StatCard";
import FilterTabs from "./FilterTabs";
import SearchInput from "./SearchInput";
import StatusChip from "./StatusChip";
import Button from "./Button";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import SkeletonLoader from "./SkeletonLoader";
import { BRAND_CATEGORIES, ALL_INDIAN_STATES } from "@/lib/brandConstants";
import { downloadCSV } from "@/lib/exportCsv";
import { toast, Swal } from "@/lib/swal";

// Formatter to display the investment range cleanly without duplicates
function formatInvestment(brand) {
  const range = brand.investment_range;
  const maxLimit = brand.max_investment_limit;
  const minVal = brand.minInvestment;
  const maxVal = brand.maxInvestment;

  let result = "";
  if (range && maxLimit && range !== maxLimit) {
    const minPart = range.split("-")[0]?.trim() || range;
    const maxPart = maxLimit.split("-").pop()?.trim() || maxLimit;
    result = `${minPart} - ${maxPart}`;
  } else if (range) {
    result = range;
  } else if (maxLimit) {
    result = maxLimit;
  } else if (minVal && maxVal) {
    const minStr = minVal >= 10000000 ? `₹${minVal / 10000000} Cr` : `₹${minVal / 100000} Lakh`;
    const maxStr = maxVal >= 10000000 ? `₹${maxVal / 10000000} Cr` : `₹${maxVal / 100000} Lakh`;
    result = `${minStr} - ${maxStr}`;
  } else if (minVal) {
    result = `Above ₹${minVal >= 10000000 ? minVal / 10000000 + " Cr" : minVal / 100000 + " Lakh"}`;
  } else {
    return "Not specified";
  }

  // If result has redundant multiple dashes (e.g. "Rs. 10 Lakh - 20 Lakh - Rs. 2 Crore - 5 Crore")
  const parts = result.split("-").map((p) => p.trim());
  if (parts.length > 2) {
    return `${parts[0]} - ${parts[parts.length - 1]}`;
  }
  return result;
}

export default function BrandsTab({
  brands = [],
  allBrands = [],
  totalBrands = 0,
  allCount = totalBrands,
  pendingCount = 0,
  approvedCount = 0,
  declinedCount = 0,
  searchTerm = "",
  onSearchChange,
  onClearSearch,
  statusFilter = "all", // all, Approved, Pending, Declined
  onStatusFilterChange,
  categoryFilter = "",
  onCategoryFilterChange,
  stateFilter = "",
  onStateFilterChange,
  sortOrder = "newest",
  onSortOrderChange,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onPerPageChange,
  onViewDetails,
  onEditBrand,
  onApproveBrand,
  onDeclineBrand,
  onOpenAddBrand,
  loading = false
}) {
  const [selectedBrands, setSelectedBrands] = useState([]);

  // Filter tabs definition
  const filterTabs = [
    { id: "all", label: "All", count: allCount },
    { id: "Approved", label: "Approved", count: approvedCount },
    { id: "Pending", label: "Pending", count: pendingCount },
    { id: "Declined", label: "Declined", count: declinedCount }
  ];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBrands(brands.map(b => b.id || b._id));
    } else {
      setSelectedBrands([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedBrands(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isAllSelected = brands.length > 0 && selectedBrands.length === brands.length;

  const handleExportCSV = () => {
    const dataSource = allBrands && allBrands.length > 0 ? allBrands : brands;
    let brandsToExport = dataSource;

    if (selectedBrands.length > 0) {
      brandsToExport = dataSource.filter(b => selectedBrands.includes(b.id || b._id));
    }

    if (!brandsToExport || brandsToExport.length === 0) {
      toast.warning("No brands to export.");
      return;
    }

    const rows = brandsToExport.map((b, idx) => ({
      "S.No": idx + 1,
      "Brand Name": b.name || "N/A",
      "Company Name": b.company || "N/A",
      "Category": b.category || "N/A",
      "Sector": b.sector || "N/A",
      "Investment Range": b.investment_range ? (b.max_investment_limit && b.max_investment_limit !== b.investment_range ? `${b.investment_range} - ${b.max_investment_limit}` : b.investment_range) : "N/A",
      "Franchise Fee": b.franchiseFee || "N/A",
      "Royalty Fee": b.royaltyFee || "N/A",
      "Area Required": b.areaRequired || "N/A",
      "HQ State": b.hq || "N/A",
      "City": b.location || "N/A",
      "Pincode": b.pincode || "N/A",
      "Status": b.status || "Pending",
      "Contact Email": b.email || "N/A",
      "Contact Phone": b.phone || "N/A",
      "Website": b.website || "N/A",
      "Registered Date": b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN") : "N/A"
    }));

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = selectedBrands.length > 0
      ? `franchise_brands_selected_${dateStr}.csv`
      : `franchise_brands_${dateStr}.csv`;

    downloadCSV(filename, rows);
    toast.success(`Exported ${rows.length} franchise brands to CSV successfully!`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* 1. Header with Add Brand Action */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f1a3d", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
            Manage Franchise Brands
          </h1>
          <p style={{ fontSize: "14px", color: "#4a5878", margin: 0, fontWeight: "500" }}>
            Welcome back, Administrator. Review pending listings submitted by brand owners.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="outline"
            size="md"
            onClick={() => window.open("/", "_blank")}
          >
            View Portal
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onOpenAddBrand}
          >
            + Add Brand
          </Button>
        </div>
      </div>

      {/* 2. Top 3 Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
        <StatCard
          icon={Building}
          value={allCount}
          label="Total Brands"
          color="blue"
          loading={loading}
        />
        <StatCard
          icon={Clock}
          value={pendingCount}
          label="Waiting for approval"
          color="orange"
          loading={loading}
        />
        <StatCard
          icon={CheckCircle}
          value={approvedCount}
          label="Approved & live"
          color="green"
          loading={loading}
        />
      </div>

      {/* 3. Main Brand Directory Table Card */}
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
            Brand Directory List
          </h3>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
            {/* Filter Tabs */}
            <FilterTabs
              tabs={filterTabs}
              activeTab={statusFilter}
              onChange={onStatusFilterChange}
              loading={loading}
            />

            {/* Filter Controls Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
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
                value={stateFilter || ""}
                onChange={(e) => onStateFilterChange && onStateFilterChange(e.target.value)}
                aria-label="Filter by State"
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
                <option value="">State: All</option>
                {ALL_INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
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

              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExportCSV}
                title={selectedBrands.length > 0 ? `Export ${selectedBrands.length} Selected Brands (CSV)` : "Export Brands (CSV)"}
              >
                {selectedBrands.length > 0 ? `Export (${selectedBrands.length})` : "Export"}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div>
            <SearchInput
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              onClear={onClearSearch}
              placeholder="Search brands, parent company..."
              style={{ maxWidth: "460px" }}
            />
          </div>
        </div>

        {/* Table Content */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          {(loading && brands.length === 0) ? (
            <SkeletonLoader type="table" rows={6} cols={8} />
          ) : brands.length === 0 ? (
            <EmptyState
              title="No brands found"
              description="No brand records match your search criteria or selected filters."
              actionLabel="Clear Filters"
              onAction={() => {
                if (onClearSearch) onClearSearch();
                if (onStatusFilterChange) onStatusFilterChange("all");
                if (onCategoryFilterChange) onCategoryFilterChange("");
                if (onStateFilterChange) onStateFilterChange("");
              }}
            />
          ) : (
            <table style={{ width: "100%", minWidth: "1120px", tableLayout: "fixed", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <colgroup>
                <col style={{ width: "52px" }} />
                <col style={{ width: "210px" }} />
                <col style={{ width: "160px" }} />
                <col style={{ width: "180px" }} />
                <col style={{ width: "150px" }} />
                <col style={{ width: "125px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "140px" }} />
                <col style={{ width: "260px" }} />
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: "#f8faff", borderBottom: "1px solid #eef2fb", color: "#4a5878", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "12px 18px", width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      aria-label="Select all brands on page"
                      style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#2563eb" }}
                    />
                  </th>
                  <th style={{ padding: "12px 16px" }}>Brand</th>
                  <th style={{ padding: "12px 16px" }}>Category</th>
                  <th style={{ padding: "12px 16px" }}>Investment</th>
                  <th style={{ padding: "12px 16px" }}>HQ</th>
                  <th style={{ padding: "12px 16px" }}>Registered</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "center" }}>Leads</th>
                  <th style={{ padding: "12px 18px", textAlign: "right", position: "sticky", right: 0, zIndex: 2, backgroundColor: "#f8faff", boxShadow: "-8px 0 12px rgba(15, 26, 61, 0.04)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => {
                  const id = brand.id || brand._id;
                  const isSelected = selectedBrands.includes(id);
                  const initials = (brand.name || "B").substring(0, 2).toUpperCase();
                  const isPending = brand.status === "Pending";
                  const regDate = brand.createdAt ? new Date(brand.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A";
                  const hqText = `${brand.hq || brand.location || "India"}${brand.pincode ? ` (${brand.pincode})` : ""}`;
                  const leadCount = brand.investorsCount || 0;
                  const approvedLeadCount = brand.approvedLeadsCount || 0;
                  const investedCount = brand.investedInvestorsCount || 0;

                  return (
                    <tr
                      key={id}
                      className="admin-table-row"
                      style={{
                        borderBottom: "1px solid #f1f5ff",
                        backgroundColor: isSelected ? "#f0f7ff" : "#ffffff"
                      }}
                    >
                      <td style={{ padding: "14px 18px" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(id)}
                          aria-label={`Select ${brand.name}`}
                          style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#2563eb" }}
                        />
                      </td>

                      {/* Brand Logo & Name */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: "800", color: "#0f1a3d", fontSize: "13.5px" }}>
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

                      {/* Category */}
                      <td style={{ padding: "14px 16px", color: "#4a5878", fontWeight: "500" }}>
                        {brand.category || "General"}
                      </td>

                      {/* Investment Range - displayed in a clean badge box */}
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "5px 11px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "700",
                            backgroundColor: "#f8faff",
                            color: "#0f1a3d",
                            border: "1px solid #d9e2fa",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {formatInvestment(brand)}
                        </span>
                      </td>

                      {/* HQ */}
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "500",
                            backgroundColor: "#f8fafc",
                            color: "#475569",
                            border: "1px solid #e2e8f0",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {hqText}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 9px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "500",
                            backgroundColor: "#f8fafc",
                            color: "#64748b",
                            border: "1px solid #eef2f6"
                          }}
                        >
                          {regDate}
                        </span>
                      </td>

                      {/* Status Chip */}
                      <td style={{ padding: "14px 16px" }}>
                        <StatusChip status={brand.status || "Pending"} />
                      </td>

                      {/* Unified Smart Leads & Performance Column */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        {leadCount === 0 ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "32px",
                              height: "26px",
                              padding: "0 8px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "700",
                              backgroundColor: "#f8fafc",
                              color: "#94a3b8",
                              border: "1px solid #e2e8f0"
                            }}
                            title="No investor inquiries yet"
                          >
                            0
                          </span>
                        ) : investedCount > 0 ? (
                          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "nowrap" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "4px 9px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: "700",
                                backgroundColor: "#eff6ff",
                                color: "#1d4ed8",
                                border: "1px solid #bfdbfe",
                                whiteSpace: "nowrap"
                              }}
                              title={`${leadCount} investor lead(s)`}
                            >
                              {leadCount} {leadCount === 1 ? "Lead" : "Leads"}
                            </span>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "4px 8px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: "700",
                                backgroundColor: "#faf5ff",
                                color: "#7c3aed",
                                border: "1px solid #e9d5ff",
                                whiteSpace: "nowrap"
                              }}
                              title={`${investedCount} deal(s) closed / invested`}
                            >
                              {investedCount} Deal ✓
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "700",
                              backgroundColor: "#eff6ff",
                              color: "#1d4ed8",
                              border: "1px solid #bfdbfe",
                              whiteSpace: "nowrap"
                            }}
                            title={`${leadCount} investor lead(s)`}
                          >
                            {leadCount} {leadCount === 1 ? "Lead" : "Leads"}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 18px", textAlign: "right", whiteSpace: "nowrap", position: "sticky", right: 0, zIndex: 1, backgroundColor: isSelected ? "#f0f7ff" : "#ffffff", boxShadow: "-8px 0 12px rgba(15, 26, 61, 0.04)" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetails && onViewDetails(brand)}
                          >
                            Details
                          </Button>
                          <Button
                            variant="soft-blue"
                            size="sm"
                            onClick={() => onEditBrand && onEditBrand(brand)}
                          >
                            Edit
                          </Button>

                          {isPending && (
                            <>
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
                            </>
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
        {totalBrands > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalBrands}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
          />
        )}
      </div>
    </div>
  );
}

