"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 25, 50],
  className = "",
  style = {}
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const pages = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div
      className={`admin-pagination ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 22px",
        flexWrap: "wrap",
        gap: "14px",
        fontSize: "13px",
        color: "#4a5878",
        borderTop: "1px solid #eef2fb",
        ...style
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <span>
          Showing <strong style={{ color: "#0f1a3d" }}>{startItem}</strong> to{" "}
          <strong style={{ color: "#0f1a3d" }}>{endItem}</strong> of{" "}
          <strong style={{ color: "#0f1a3d" }}>{totalItems}</strong> entries
        </span>

        {onPerPageChange && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span>· Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              aria-label="Items per page"
              style={{
                padding: "3px 8px",
                borderRadius: "6px",
                border: "1px solid #d9e2fa",
                backgroundColor: "#ffffff",
                fontSize: "12.5px",
                color: "#0f1a3d",
                fontWeight: "600",
                cursor: "pointer",
                outline: "none"
              }}
            >
              {perPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #d9e2fa",
            backgroundColor: "#ffffff",
            color: currentPage <= 1 ? "#94a3b8" : "#0f1a3d",
            cursor: currentPage <= 1 ? "not-allowed" : "pointer",
            fontSize: "12.5px",
            fontWeight: "600",
            transition: "all 0.15s ease"
          }}
        >
          <ChevronLeft size={14} />
          Prev
        </button>

        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={isActive ? "page" : undefined}
              style={{
                minWidth: "32px",
                height: "32px",
                padding: "0 6px",
                borderRadius: "8px",
                border: isActive ? "none" : "1px solid #d9e2fa",
                backgroundColor: isActive ? "#1d4ed8" : "#ffffff",
                color: isActive ? "#ffffff" : "#0f1a3d",
                fontWeight: isActive ? "700" : "600",
                fontSize: "12.5px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #d9e2fa",
            backgroundColor: "#ffffff",
            color: currentPage >= totalPages ? "#94a3b8" : "#0f1a3d",
            cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
            fontSize: "12.5px",
            fontWeight: "600",
            transition: "all 0.15s ease"
          }}
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

