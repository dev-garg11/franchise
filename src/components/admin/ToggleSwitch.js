"use client";

import { useId } from "react";

export default function ToggleSwitch({
  checked = false,
  onChange,
  label,
  disabled = false,
  id,
  className = "",
  style = {}
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <label
      htmlFor={inputId}
      className={`admin-toggle-switch ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        userSelect: "none",
        ...style
      }}
    >
      <div
        style={{
          position: "relative",
          width: "44px",
          height: "24px",
          backgroundColor: checked ? "#15803d" : "#cbd5e1",
          borderRadius: "9999px",
          transition: "background-color 0.18s ease"
        }}
      >
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
          style={{
            position: "absolute",
            opacity: 0,
            width: 0,
            height: 0,
            margin: 0
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "22px" : "2px",
            width: "20px",
            height: "20px",
            backgroundColor: "#ffffff",
            borderRadius: "50%",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            transition: "left 0.18s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        />
      </div>
      {label && (
        <span style={{ fontSize: "13px", fontWeight: "700", color: checked ? "#15803d" : "#4a5878" }}>
          {label}
        </span>
      )}
    </label>
  );
}

