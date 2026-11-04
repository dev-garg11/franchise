"use client";

export default function SkeletonLoader({
  type = "table", // table, stats, cards
  count = 5,
  rows = 5,
  cols = 6,
  className = "",
  style = {}
}) {
  if (type === "stats") {
    return (
      <div
        className={`admin-skeleton-stats-grid ${className}`}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          ...style
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="admin-shimmer"
            style={{
              height: "90px",
              backgroundColor: "#ffffff",
              border: "1px solid #d9e2fa",
              borderRadius: "16px"
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div
        className={`admin-skeleton-cards-grid ${className}`}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          ...style
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="admin-shimmer"
            style={{
              height: "260px",
              backgroundColor: "#ffffff",
              border: "1px solid #d9e2fa",
              borderRadius: "16px"
            }}
          />
        ))}
      </div>
    );
  }

  // Default table shimmer
  return (
    <div
      className={`admin-skeleton-table ${className}`}
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        ...style
      }}
    >
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: "flex", gap: "16px" }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="admin-shimmer"
              style={{
                flex: c === 0 ? "0 0 40px" : c === 1 ? "2" : "1",
                height: "24px",
                backgroundColor: "#e2e8f0",
                borderRadius: "6px"
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

