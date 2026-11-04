"use client";

import { Search, X } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  className = "",
  style = {}
}) {
  return (
    <div
      className={`admin-search-wrapper ${className}`}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        width: "100%",
        maxWidth: "380px",
        ...style
      }}
    >
      <Search
        size={16}
        style={{
          position: "absolute",
          left: "14px",
          color: "#64748b",
          pointerEvents: "none"
        }}
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{
          width: "100%",
          padding: "9px 36px 9px 38px",
          backgroundColor: "#ffffff",
          border: "1px solid #d9e2fa",
          borderRadius: "10px",
          fontSize: "13.5px",
          color: "#0f1a3d",
          outline: "none",
          transition: "all 0.2s ease"
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#2563eb";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.12)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#d9e2fa";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          style={{
            position: "absolute",
            right: "10px",
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#0f1a3d"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

