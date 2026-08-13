"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function Pagination({
  totalItems = 0,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 25, 50, 100]
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers array with smart ellipsis truncation
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages, currentPage + 1);

      if (currentPage <= 2) {
        end = Math.min(totalPages, maxVisible - 1);
      } else if (currentPage >= totalPages - 1) {
        start = Math.max(1, totalPages - (maxVisible - 2));
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalItems <= 0) {
    return (
      <div className="admin-pagination">
        <span className="pagination-info">No entries to display</span>
      </div>
    );
  }

  return (
    <div className="admin-pagination">
      {/* Left: Info & Per-Page Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <span className="pagination-info">
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
        </span>

        {onItemsPerPageChange && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            <span style={{ color: "#64748b" }}>Per page:</span>
            <select
              className="pagination-select"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      <div className="pagination-controls">
        {/* First Page */}
        <button
          className="pagination-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First Page"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous Page */}
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Numeric Page Buttons */}
        {getPageNumbers().map((num, idx) => {
          if (num === "...") {
            return (
              <span key={`dots-${idx}`} style={{ padding: "0 6px", color: "#94a3b8", fontSize: "13px" }}>
                ...
              </span>
            );
          }
          return (
            <button
              key={num}
              className={`pagination-btn ${currentPage === num ? "active" : ""}`}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>

        {/* Last Page */}
        <button
          className="pagination-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Last Page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
