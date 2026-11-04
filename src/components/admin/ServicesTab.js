"use client";

import { useState } from "react";
import { Wrench, Plus, Edit3, Trash2, CheckCircle } from "lucide-react";
import StatCard from "./StatCard";
import SearchInput from "./SearchInput";
import StatusChip from "./StatusChip";
import Button from "./Button";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import SkeletonLoader from "./SkeletonLoader";
import ConfirmDialog from "./ConfirmDialog";

export default function ServicesTab({
  services = [],
  totalServices = 0,
  searchTerm = "",
  onSearchChange,
  onClearSearch,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onPerPageChange,
  onOpenCreateService,
  onEditService,
  onDeleteService,
  loading = false
}) {
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* 1. Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f1a3d", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
            Manage Company Services
          </h1>
          <p style={{ fontSize: "14px", color: "#4a5878", margin: 0, fontWeight: "500" }}>
            Create, publish, edit, and delete managed consulting and franchise services.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="outline"
            size="md"
            onClick={() => window.open("/services", "_blank")}
          >
            View Portal
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onOpenCreateService}
            icon={Plus}
          >
            + Add New Service
          </Button>
        </div>
      </div>

      {/* 2. Top Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" }}>
        <StatCard
          icon={Wrench}
          value={totalServices}
          label="Total Managed Services"
          color="blue"
          loading={loading}
        />
        <StatCard
          icon={CheckCircle}
          value={totalServices}
          label="Active Offerings"
          color="green"
          loading={loading}
        />
      </div>

      {/* 3. Services Directory Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #d9e2fa",
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)",
          overflow: "hidden"
        }}
      >
        {/* Title & Search Bar */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #eef2fb", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f1a3d", margin: 0 }}>
            Services Directory
          </h3>

          <SearchInput
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            onClear={onClearSearch}
            placeholder="Search services by title..."
            style={{ maxWidth: "420px" }}
          />
        </div>

        {/* Table Content */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          {(loading && services.length === 0) ? (
            <SkeletonLoader type="table" rows={4} cols={4} />
          ) : services.length === 0 ? (
            <EmptyState
              title="No services found"
              description="Offer consulting, marketing, or expansion services to businesses and franchise seekers."
              actionLabel="+ Add First Service"
              onAction={onOpenCreateService}
            />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8faff", borderBottom: "1px solid #eef2fb", color: "#4a5878", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "12px 18px", width: "90px" }}>Cover</th>
                  <th style={{ padding: "12px 18px" }}>Service Title & Description</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                  <th style={{ padding: "12px 16px" }}>Created</th>
                  <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc) => {
                  const id = svc.id || svc._id;
                  const dateStr = svc.createdAt ? new Date(svc.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Active";
                  const snippet = svc.content ? svc.content.replace(/<[^>]*>/g, "").substring(0, 95) + "..." : svc.description || "Comprehensive consulting service.";

                  return (
                    <tr key={id} className="admin-table-row" style={{ borderBottom: "1px solid #f1f5ff" }}>
                      {/* Image Thumbnail */}
                      <td style={{ padding: "14px 18px" }}>
                        <div
                          style={{
                            width: "68px",
                            height: "48px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            backgroundColor: "#1e293b",
                            border: "1px solid #d9e2fa",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {svc.image ? (
                            <img
                              src={svc.image}
                              alt={svc.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <Wrench size={18} style={{ color: "#93c5fd" }} />
                          )}
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f1a3d" }}>
                            {svc.title}
                          </span>
                          <span style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>
                            {snippet}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 16px" }}>
                        <StatusChip status="Active" />
                      </td>

                      {/* Created Date */}
                      <td style={{ padding: "14px 16px", color: "#4a5878", whiteSpace: "nowrap" }}>
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 18px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Button
                            variant="soft-blue"
                            size="sm"
                            onClick={() => onEditService && onEditService(svc)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="soft-red"
                            size="sm"
                            onClick={() => setDeleteConfirmTarget(svc)}
                          >
                            Delete
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

        {/* Pagination Footer */}
        {totalServices > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalServices}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
          />
        )}
      </div>

      {/* Confirm Dialog for Service Delete */}
      <ConfirmDialog
        isOpen={!!deleteConfirmTarget}
        title="Delete Service?"
        message={`Are you sure you want to permanently delete service "${deleteConfirmTarget?.title}"?`}
        confirmLabel="Delete Service"
        onConfirm={() => {
          if (deleteConfirmTarget && onDeleteService) {
            onDeleteService(deleteConfirmTarget.id || deleteConfirmTarget._id);
          }
          setDeleteConfirmTarget(null);
        }}
        onClose={() => setDeleteConfirmTarget(null)}
      />
    </div>
  );
}

