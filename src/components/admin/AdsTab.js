"use client";

import { useState, useMemo } from "react";
import { Megaphone, Plus, Edit3, Trash2, Link as LinkIcon, CheckCircle, PauseCircle } from "lucide-react";
import StatCard from "./StatCard";
import SearchInput from "./SearchInput";
import StatusChip from "./StatusChip";
import Button from "./Button";
import ToggleSwitch from "./ToggleSwitch";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import SkeletonLoader from "./SkeletonLoader";
import ConfirmDialog from "./ConfirmDialog";

export default function AdsTab({
  ads = [],
  totalAds = 0,
  searchTerm = "",
  onSearchChange,
  onClearSearch,
  positionFilter = "all",
  onPositionFilterChange,
  statusFilter = "all",
  onStatusFilterChange,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onPerPageChange,
  onOpenCreateAd,
  onEditAd,
  onToggleAdActive,
  onDeleteAd,
  loading = false
}) {
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  const activeNowCount = useMemo(() => {
    return ads.filter(a => a.isActive !== false).length;
  }, [ads]);

  const pausedCount = useMemo(() => {
    return ads.filter(a => a.isActive === false).length;
  }, [ads]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* 1. Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f1a3d", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
            Manage Advertising Space
          </h1>
          <p style={{ fontSize: "14px", color: "#4a5878", margin: 0, fontWeight: "500" }}>
            Create, publish, toggle, and delete promotional ad banners.
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
            onClick={onOpenCreateAd}
            icon={Plus}
          >
            + Create New Ad Banner
          </Button>
        </div>
      </div>

      {/* 2. Top 3 Modern Dynamic Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        {/* Card 1: Total Ad Banners */}
        <div
          className="admin-ad-stat-card"
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid #dbeafe",
            borderRadius: "20px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px -2px rgba(37, 99, 235, 0.08), 0 2px 6px rgba(15, 26, 61, 0.04)",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 14px 30px -4px rgba(37, 99, 235, 0.18), 0 4px 10px rgba(15, 26, 61, 0.06)";
            e.currentTarget.style.borderColor = "#93c5fd";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px -2px rgba(37, 99, 235, 0.08), 0 2px 6px rgba(15, 26, 61, 0.04)";
            e.currentTarget.style.borderColor = "#dbeafe";
          }}
        >
          {/* Top Row: Icon + Badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 6px 16px -2px rgba(37, 99, 235, 0.4)"
              }}
            >
              <Megaphone size={22} strokeWidth={2.4} />
            </div>

            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#1d4ed8",
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                padding: "4px 11px",
                borderRadius: "9999px"
              }}
            >
              All Slots
            </span>
          </div>

          {/* Middle: Number + Label */}
          <div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: "900",
                color: "#0f172a",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: "6px"
              }}
            >
              {totalAds}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#334155" }}>
              Total Ad Banners
            </div>
          </div>

          {/* Bottom helper */}
          <div
            style={{
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "600"
            }}
          >
            <span>Promotional banner slots</span>
            <span style={{ color: "#2563eb", fontWeight: "800" }}>Live Inventory</span>
          </div>
        </div>

        {/* Card 2: Active Now */}
        <div
          className="admin-ad-stat-card"
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid #bbf7d0",
            borderRadius: "20px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px -2px rgba(16, 185, 129, 0.08), 0 2px 6px rgba(15, 26, 61, 0.04)",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 14px 30px -4px rgba(16, 185, 129, 0.2), 0 4px 10px rgba(15, 26, 61, 0.06)";
            e.currentTarget.style.borderColor = "#86efac";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px -2px rgba(16, 185, 129, 0.08), 0 2px 6px rgba(15, 26, 61, 0.04)";
            e.currentTarget.style.borderColor = "#bbf7d0";
          }}
        >
          {/* Top Row: Icon + Pulsing Live Badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 6px 16px -2px rgba(16, 185, 129, 0.4)"
              }}
            >
              <CheckCircle size={22} strokeWidth={2.4} />
            </div>

            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#059669",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                padding: "4px 11px",
                borderRadius: "9999px"
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  boxShadow: "0 0 8px #10b981"
                }}
              />
              Live On Site
            </span>
          </div>

          {/* Middle: Number + Label */}
          <div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: "900",
                color: "#059669",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: "6px"
              }}
            >
              {activeNowCount}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#334155" }}>
              Active Now
            </div>
          </div>

          {/* Bottom helper */}
          <div
            style={{
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "600"
            }}
          >
            <span>Delivering live visitor views</span>
            <span style={{ color: "#059669", fontWeight: "800" }}>
              {totalAds > 0 ? `${Math.round((activeNowCount / totalAds) * 100)}% Running` : "100%"}
            </span>
          </div>
        </div>

        {/* Card 3: Paused */}
        <div
          className="admin-ad-stat-card"
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid #fecdd3",
            borderRadius: "20px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px -2px rgba(244, 63, 94, 0.08), 0 2px 6px rgba(15, 26, 61, 0.04)",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 14px 30px -4px rgba(244, 63, 94, 0.18), 0 4px 10px rgba(15, 26, 61, 0.06)";
            e.currentTarget.style.borderColor = "#fda4af";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px -2px rgba(244, 63, 94, 0.08), 0 2px 6px rgba(15, 26, 61, 0.04)";
            e.currentTarget.style.borderColor = "#fecdd3";
          }}
        >
          {/* Top Row: Icon + Badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 6px 16px -2px rgba(244, 63, 94, 0.35)"
              }}
            >
              <PauseCircle size={22} strokeWidth={2.4} />
            </div>

            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: pausedCount > 0 ? "#e11d48" : "#64748b",
                backgroundColor: pausedCount > 0 ? "#fff1f2" : "#f8fafc",
                border: `1px solid ${pausedCount > 0 ? "#fecdd3" : "#e2e8f0"}`,
                padding: "4px 11px",
                borderRadius: "9999px"
              }}
            >
              {pausedCount > 0 ? "On Hold" : "Standby"}
            </span>
          </div>

          {/* Middle: Number + Label */}
          <div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: "900",
                color: pausedCount > 0 ? "#e11d48" : "#64748b",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: "6px"
              }}
            >
              {pausedCount}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#334155" }}>
              Paused Banners
            </div>
          </div>

          {/* Bottom helper */}
          <div
            style={{
              marginTop: "16px",
              paddingTop: "14px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "600"
            }}
          >
            <span>{pausedCount > 0 ? "Temporarily hidden slots" : "All banners currently active"}</span>
            <span style={{ color: pausedCount > 0 ? "#e11d48" : "#10b981", fontWeight: "800" }}>
              {pausedCount > 0 ? "Needs Review" : "Optimal"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search, Filter Bar and Actions */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #d9e2fa",
          borderRadius: "16px",
          padding: "16px 20px",
          boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <SearchInput
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          onClear={onClearSearch}
          placeholder="Search ad banners by title..."
          style={{ maxWidth: "460px" }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <select
            value={positionFilter || "all"}
            onChange={(e) => onPositionFilterChange && onPositionFilterChange(e.target.value)}
            aria-label="Filter by banner position"
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
            <option value="all">All positions</option>
            <option value="homepage_banner">Homepage Banner + Partner Spotlight</option>
            <option value="brand_sidebar">Brand Sidebar</option>
            <option value="investor_dashboard">Investor Dashboard</option>
          </select>

          <select
            value={statusFilter || "all"}
            onChange={(e) => onStatusFilterChange && onStatusFilterChange(e.target.value)}
            aria-label="Filter by banner status"
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
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>

          <Button
            variant="primary"
            size="md"
            onClick={onOpenCreateAd}
            icon={Plus}
          >
            + Create New Ad Banner
          </Button>
        </div>
      </div>

      {/* 4. 3-Column Card Grid Layout */}
      {(loading && ads.length === 0) ? (
        <SkeletonLoader type="cards" count={3} />
      ) : ads.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #d9e2fa", borderRadius: "16px", overflow: "hidden" }}>
          <EmptyState
            title="No ad banners found"
            description="Create commercial advertisements and sponsorship banners to promote brands across Franchise Roots."
            actionLabel="+ Create First Ad Banner"
            onAction={onOpenCreateAd}
          />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "22px"
          }}
        >
          {ads.map((ad, idx) => {
            const id = ad.id || ad._id;
            const badge = (ad.badge || (idx === 1 ? "FEATURED AD" : "SPONSORED")).toUpperCase();
            const isSponsored = badge.includes("SPONSOR");
            const position = ad.position || "homepage_banner";
            const link = ad.link || "/brand-registration";
            const isActive = ad.isActive !== false;
            const mediaType = ad.mediaType === "video" ? "video" : "image";
            const textColor = /^#[0-9a-f]{6}$/i.test(String(ad.textColor || "")) ? ad.textColor : "#ffffff";

            // Sample banner visuals if image not set
            const bgGradient = idx === 0
              ? "linear-gradient(135deg, #f472b6 0%, #db2777 100%)"
              : idx === 1
                ? "linear-gradient(135deg, #1e3a8a 0%, #0284c7 50%, #dc2626 100%)"
                : "linear-gradient(135deg, #475569 0%, #1e293b 100%)";

            return (
              <div
                key={id}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #d9e2fa",
                  borderRadius: "18px",
                  overflow: "hidden",
                  boxShadow: "0 2px 10px rgba(15, 26, 61, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
              >
                {/* Banner Graphic Frame with Badge */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "170px",
                    background: ad.image ? "#0f172a" : bgGradient,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {ad.image && (mediaType === "video" ? (
                    <video src={ad.image} muted loop autoPlay playsInline preload="metadata" aria-label={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <img src={ad.image} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ))}

                  {/* Top Badge */}
                  <div style={{ position: "absolute", top: "14px", left: "14px", zIndex: 2 }}>
                    <StatusChip variant={isSponsored ? "sponsored" : "featured"}>
                      {badge}
                    </StatusChip>
                  </div>
                </div>

                {/* Content Details */}
                <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "10px", flexGrow: 1 }}>
                  <h4 style={{ fontSize: "16px", fontWeight: "800", color: textColor, margin: 0, lineHeight: "1.3" }}>
                    {ad.title}
                  </h4>

                  {ad.subtitle && (
                    <p style={{ fontSize: "12.5px", color: textColor, margin: 0, lineHeight: "1.4" }}>
                      {ad.subtitle}
                    </p>
                  )}

                  {/* Position & Link Chips */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                    <span
                      style={{
                        backgroundColor: "#eff6ff",
                        color: "#1d4ed8",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}
                    >
                      {position === "homepage_banner" ? "Homepage Banner" : (position === "brand_sidebar" || position === "brands_sidebar") ? "Brand Sidebar" : position === "investor_dashboard" ? "Investor Dashboard" : position}
                    </span>
                    <span
                      className="admin-monospace"
                      style={{
                        backgroundColor: "#f8fafc",
                        color: "#475569",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        fontSize: "11px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {link}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div
                  style={{
                    padding: "14px 20px",
                    borderTop: "1px solid #f1f5ff",
                    backgroundColor: "#fcfdff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <ToggleSwitch
                    checked={isActive}
                    onChange={(checked) => onToggleAdActive && onToggleAdActive(ad, checked)}
                    label={isActive ? "Active" : "Paused"}
                  />

                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Button
                      variant="soft-blue"
                      size="sm"
                      onClick={() => onEditAd && onEditAd(ad)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger-outline"
                      size="sm"
                      onClick={() => setDeleteConfirmTarget(ad)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalAds > 0 && (
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #d9e2fa", borderRadius: "16px", overflow: "hidden" }}>
          <Pagination
            currentPage={currentPage}
            totalItems={totalAds}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
          />
        </div>
      )}

      {/* Confirm Dialog for Ad Delete */}
      <ConfirmDialog
        isOpen={!!deleteConfirmTarget}
        title="Delete Ad Banner?"
        message={`Are you sure you want to permanently delete advertisement "${deleteConfirmTarget?.title}"?`}
        confirmLabel="Delete Banner"
        onConfirm={() => {
          if (deleteConfirmTarget && onDeleteAd) {
            onDeleteAd(deleteConfirmTarget.id || deleteConfirmTarget._id);
          }
          setDeleteConfirmTarget(null);
        }}
        onClose={() => setDeleteConfirmTarget(null)}
      />
    </div>
  );
}

