"use client";

export default function StatusChip({ status, variant, children, className = "", style = {} }) {
  const norm = (variant || status || "").toString().toLowerCase().trim();

  let bg = "#dbeafe";
  let color = "#1d4ed8";
  let border = "transparent";

  if (["approved", "active", "live", "published", "success"].includes(norm)) {
    bg = "#dcfce7";
    color = "#15803d";
    border = "#bbf7d0";
  } else if (["pending", "waiting", "ending soon", "needs action", "warning"].includes(norm)) {
    bg = "#fff1d6";
    color = "#7a4a00";
    border = "#fed7aa";
  } else if (["declined", "rejected", "paused", "danger", "error"].includes(norm)) {
    bg = "#fde8e6";
    color = "#dc2626";
    border = "#fecaca";
  } else if (["sponsored"].includes(norm)) {
    bg = "#fef3c7";
    color = "#92400e";
    border = "#fde68a";
  } else if (["featured", "featured ad"].includes(norm)) {
    bg = "#dbeafe";
    color = "#1e40af";
    border = "#bfdbfe";
  } else if (["flag", "soft-warning", "duplicate", "test data", "check data"].includes(norm) || norm.includes("same")) {
    bg = "#fee2e2";
    color = "#b91c1c";
    border = "#fca5a5";
  }

  return (
    <span
      className={`admin-status-chip ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        padding: "3px 9px",
        borderRadius: "9999px",
        fontSize: "11.5px",
        fontWeight: "700",
        lineHeight: "1.2",
        letterSpacing: "0.01em",
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...style
      }}
    >
      {children || status}
    </span>
  );
}

