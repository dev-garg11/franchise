"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import Button from "./Button";

export default function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger", // danger, warning, primary
  onConfirm,
  onClose,
  loading = false
}) {
  const dialogRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 26, 61, 0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        ref={dialogRef}
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#ffffff",
          borderRadius: "18px",
          border: "1px solid #d9e2fa",
          boxShadow: "0 20px 45px rgba(15, 26, 61, 0.2)",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          animation: "adminDialogScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              backgroundColor: variant === "danger" ? "#fef2f2" : "#fff7ed",
              color: variant === "danger" ? "#dc2626" : "#ea580c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            {variant === "danger" ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div style={{ flexGrow: 1 }}>
            <h3
              id="confirm-dialog-title"
              style={{
                fontSize: "17px",
                fontWeight: "800",
                color: "#0f1a3d",
                margin: "0 0 6px 0",
                letterSpacing: "-0.01em"
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: "13.5px",
                color: "#4a5878",
                margin: 0,
                lineHeight: "1.4"
              }}
            >
              {message}
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
          <Button
            variant="outline"
            size="md"
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            size="md"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

