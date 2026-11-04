"use client";

export default function DataTable({
  children,
  headerActions,
  title,
  subtitle,
  className = "",
  style = {}
}) {
  return (
    <div
      className={`admin-datatable-card ${className}`}
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #d9e2fa",
        borderRadius: "16px",
        boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...style
      }}
    >
      {(title || headerActions) && (
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #eef2fb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px"
          }}
        >
          {title && (
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f1a3d", margin: 0 }}>
                {title}
              </h3>
              {subtitle && (
                <p style={{ fontSize: "12.5px", color: "#4a5878", margin: "2px 0 0 0" }}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {headerActions && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Responsive Horizontal Scroll Container */}
      <div
        className="admin-table-scroll-container"
        style={{
          width: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {children}
      </div>
    </div>
  );
}

