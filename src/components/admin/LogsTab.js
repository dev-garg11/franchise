"use client";

import { useState, useMemo } from "react";
import { ShieldCheck, User, Building, Users, RefreshCw, Trash2, Calendar } from "lucide-react";
import StatCard from "./StatCard";
import FilterTabs from "./FilterTabs";
import SearchInput from "./SearchInput";
import StatusChip from "./StatusChip";
import Button from "./Button";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import SkeletonLoader from "./SkeletonLoader";
import ConfirmDialog from "./ConfirmDialog";

export default function LogsTab({
  logs = [],
  totalLogs = 0,
  panelCounts = null,
  searchTerm = "",
  onSearchChange,
  onClearSearch,
  panelFilter = "all", // all, admin, brand, investor
  onPanelFilterChange,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onPerPageChange,
  onRefreshLogs,
  onDeleteLog,
  onClearAllLogs,
  loading = false
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [clearAllConfirmOpen, setClearAllConfirmOpen] = useState(false);

  // Derive counts
  const adminCount = useMemo(() => {
    if (panelCounts && typeof panelCounts.admin === "number") return panelCounts.admin;
    return logs.filter(l => (l.panel || "").toLowerCase() === "admin").length;
  }, [logs, panelCounts]);

  const brandCount = useMemo(() => {
    if (panelCounts && typeof panelCounts.brand === "number") return panelCounts.brand;
    return logs.filter(l => (l.panel || "").toLowerCase() === "brand").length;
  }, [logs, panelCounts]);

  const investorCount = useMemo(() => {
    if (panelCounts && typeof panelCounts.investor === "number") return panelCounts.investor;
    return logs.filter(l => (l.panel || "").toLowerCase() === "investor").length;
  }, [logs, panelCounts]);

  const filterTabs = [
    { id: "all", label: "All Panels", count: totalLogs },
    { id: "admin", label: "Admin Actions", count: adminCount },
    { id: "brand", label: "Brand Logs", count: brandCount },
    { id: "investor", label: "Investor Logs", count: investorCount }
  ];

  // Group logs by day
  const groupedLogs = useMemo(() => {
    const groups = {};
    logs.forEach(log => {
      const d = log.createdAt ? new Date(log.createdAt) : new Date();
      const dayKey = d.toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      });
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(log);
    });
    return groups;
  }, [logs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* 1. Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f1a3d", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
            Activity & Audit Logs
          </h1>
          <p style={{ fontSize: "14px", color: "#4a5878", margin: 0, fontWeight: "500" }}>
            Audit and monitor all platform activities, admin operations, brand updates, and investor leads.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={onRefreshLogs}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Trash2}
            onClick={() => setClearAllConfirmOpen(true)}
          >
            Clear Logs
          </Button>
        </div>
      </div>

      {/* 2. Top 4 Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
        <StatCard
          icon={ShieldCheck}
          value={totalLogs}
          label="Total Audit Logs"
          color="blue"
          loading={loading}
        />
        <StatCard
          icon={User}
          value={adminCount}
          label="Admin Actions"
          color="purple"
          loading={loading}
        />
        <StatCard
          icon={Building}
          value={brandCount}
          label="Brand Logs"
          color="green"
          loading={loading}
        />
        <StatCard
          icon={Users}
          value={investorCount}
          label="Investor Logs"
          color="orange"
          loading={loading}
        />
      </div>

      {/* 3. Main Logs Directory Card */}
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
            <FilterTabs
              tabs={filterTabs}
              activeTab={panelFilter}
              onChange={onPanelFilterChange}
              loading={loading}
            />

            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={onRefreshLogs}
            >
              Refresh Logs
            </Button>
          </div>

          <SearchInput
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            onClear={onClearSearch}
            placeholder="Search by action, email, description..."
            style={{ maxWidth: "460px" }}
          />
        </div>

        {/* Logs Table with Sticky Day Headers */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          {(loading && logs.length === 0) ? (
            <SkeletonLoader type="table" rows={6} cols={5} />
          ) : logs.length === 0 ? (
            <EmptyState
              title="No audit logs found"
              description="Platform operations, approvals, and user updates will appear here automatically."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {Object.entries(groupedLogs).map(([dayKey, dayLogs]) => (
                <div key={dayKey} style={{ display: "flex", flexDirection: "column" }}>
                  {/* Sticky Day Header */}
                  <div
                    style={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#f8faff",
                      borderBottom: "1px solid #eef2fb",
                      borderTop: "1px solid #eef2fb",
                      padding: "8px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#1d4ed8",
                      zIndex: 2
                    }}
                  >
                    <Calendar size={14} />
                    <span>{dayKey}</span>
                    <span style={{ color: "#94a3b8", fontWeight: "600" }}>({dayLogs.length} events)</span>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f1f5ff", color: "#64748b", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>
                        <th style={{ padding: "10px 24px", width: "140px" }}>Timestamp</th>
                        <th style={{ padding: "10px 16px", width: "110px" }}>Panel</th>
                        <th style={{ padding: "10px 16px", width: "180px" }}>Action</th>
                        <th style={{ padding: "10px 16px", width: "180px" }}>User / Email</th>
                        <th style={{ padding: "10px 16px" }}>Description</th>
                        <th style={{ padding: "10px 24px", width: "70px", textAlign: "right" }}>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayLogs.map((log) => {
                        const id = log.id || log._id;
                        const timeStr = log.createdAt ? new Date(log.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "N/A";
                        const panel = (log.panel || "admin").toLowerCase();
                        const action = log.action || "OPERATION";
                        const isApprove = action.includes("APPROV") || action.includes("ASSIGN");
                        const isDecline = action.includes("DECLIN") || action.includes("REJECT") || action.includes("DELETE");

                        return (
                          <tr key={id} className="admin-table-row" style={{ borderBottom: "1px solid #f1f5ff" }}>
                            {/* Timestamp */}
                            <td style={{ padding: "12px 24px", color: "#64748b", fontWeight: "600", fontSize: "12px", whiteSpace: "nowrap" }}>
                              {timeStr}
                            </td>

                            {/* Panel Chip */}
                            <td style={{ padding: "12px 16px" }}>
                              <StatusChip
                                variant={panel === "investor" ? "warning" : panel === "brand" ? "approved" : "info"}
                              >
                                {panel.toUpperCase()}
                              </StatusChip>
                            </td>

                            {/* Action Tag in Monospace */}
                            <td style={{ padding: "12px 16px" }}>
                              <span
                                className="admin-monospace"
                                style={{
                                  backgroundColor: isApprove ? "#f0fdf4" : isDecline ? "#fef2f2" : "#f8fafc",
                                  color: isApprove ? "#15803d" : isDecline ? "#dc2626" : "#0f1a3d",
                                  border: `1px solid ${isApprove ? "#bbf7d0" : isDecline ? "#fecaca" : "#e2e8f0"}`,
                                  borderRadius: "6px",
                                  padding: "2px 8px",
                                  fontWeight: "700",
                                  display: "inline-block",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                {action}
                              </span>
                            </td>

                            {/* User / Email */}
                            <td style={{ padding: "12px 16px", color: "#0f1a3d", fontWeight: "600", fontSize: "12.5px" }}>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span>{log.userName || "Admin"}</span>
                                {log.userEmail && (
                                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>
                                    {log.userEmail}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Description */}
                            <td style={{ padding: "12px 16px", color: "#4a5878", lineHeight: "1.4" }}>
                              {log.description || "System activity recorded."}
                            </td>

                            {/* Delete Action */}
                            <td style={{ padding: "12px 24px", textAlign: "right" }}>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(id)}
                                aria-label="Delete log record"
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#94a3b8",
                                  cursor: "pointer",
                                  padding: "6px",
                                  borderRadius: "6px",
                                  transition: "all 0.15s ease"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = "#dc2626";
                                  e.currentTarget.style.backgroundColor = "#fee2e2";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "#94a3b8";
                                  e.currentTarget.style.backgroundColor = "transparent";
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalLogs > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalLogs}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onPerPageChange={onPerPageChange}
          />
        )}
      </div>

      {/* Delete Single Log Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Delete Log Entry?"
        message="Are you sure you want to delete this activity record from the audit trail?"
        confirmLabel="Delete Log"
        onConfirm={() => {
          if (deleteConfirmId && onDeleteLog) {
            onDeleteLog(deleteConfirmId);
          }
          setDeleteConfirmId(null);
        }}
        onClose={() => setDeleteConfirmId(null)}
      />

      {/* Clear All Logs Confirm Dialog */}
      <ConfirmDialog
        isOpen={clearAllConfirmOpen}
        title="Clear Audit Logs?"
        message={`Are you sure you want to permanently clear all logs${panelFilter !== "all" ? ` for ${panelFilter} panel` : ""}? This operation cannot be reversed.`}
        confirmLabel="Clear All Logs"
        onConfirm={() => {
          if (onClearAllLogs) onClearAllLogs();
          setClearAllConfirmOpen(false);
        }}
        onClose={() => setClearAllConfirmOpen(false)}
      />
    </div>
  );
}

