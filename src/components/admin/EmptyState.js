"use client";

import { Inbox } from "lucide-react";
import Button from "./Button";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "No records found",
  description = "There are no entries matching your current filters or search query.",
  actionLabel,
  onAction,
  className = "",
  style = {}
}) {
  return (
    <div
      className={`admin-empty-state ${className}`}
      style={{
        padding: "48px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "12px",
        backgroundColor: "#ffffff",
        ...style
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "14px",
          backgroundColor: "#f1f5ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Icon size={26} />
      </div>
      <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#0f1a3d", margin: 0 }}>
        {title}
      </h4>
      <p style={{ fontSize: "13.5px", color: "#4a5878", maxWidth: "380px", margin: 0, lineHeight: 1.4 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} style={{ marginTop: "6px" }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

