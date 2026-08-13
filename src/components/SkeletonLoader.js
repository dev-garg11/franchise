"use client";

export function ProductSkeletonCard({ style }) {
  return (
    <div className="skeleton-card" style={style}>
      {/* Image Banner Skeleton */}
      <div className="skeleton-box" style={{ height: "170px", width: "100%", borderRadius: "0" }} />

      {/* Card Content Body Skeleton */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        {/* Category Tag */}
        <div className="skeleton-box" style={{ height: "16px", width: "90px", marginBottom: "12px", borderRadius: "12px" }} />

        {/* Brand/Product Title */}
        <div className="skeleton-box" style={{ height: "22px", width: "70%", marginBottom: "14px", borderRadius: "6px" }} />

        {/* Description lines */}
        <div className="skeleton-box" style={{ height: "13px", width: "100%", marginBottom: "8px", borderRadius: "4px" }} />
        <div className="skeleton-box" style={{ height: "13px", width: "85%", marginBottom: "18px", borderRadius: "4px" }} />

        {/* Key Metrics 2x2 Box */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "12px 14px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "18px",
            border: "1px solid #f1f5f9"
          }}
        >
          <div>
            <div className="skeleton-box" style={{ height: "10px", width: "70px", marginBottom: "6px" }} />
            <div className="skeleton-box" style={{ height: "16px", width: "90px" }} />
          </div>
          <div>
            <div className="skeleton-box" style={{ height: "10px", width: "70px", marginBottom: "6px" }} />
            <div className="skeleton-box" style={{ height: "16px", width: "80px" }} />
          </div>
          <div>
            <div className="skeleton-box" style={{ height: "10px", width: "70px", marginBottom: "6px" }} />
            <div className="skeleton-box" style={{ height: "16px", width: "85px" }} />
          </div>
          <div>
            <div className="skeleton-box" style={{ height: "10px", width: "70px", marginBottom: "6px" }} />
            <div className="skeleton-box" style={{ height: "16px", width: "60px" }} />
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div className="skeleton-box" style={{ height: "38px", borderRadius: "8px" }} />
          <div className="skeleton-box" style={{ height: "38px", borderRadius: "8px" }} />
        </div>
      </div>
    </div>
  );
}

export function ProductSkeletonGrid({ count = 6, minWidth = "300px", gap = "24px" }) {
  const items = Array.from({ length: count });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
        gap: gap
      }}
    >
      {items.map((_, index) => (
        <ProductSkeletonCard key={index} />
      ))}
    </div>
  );
}

export function ProductSkeletonSlider({ count = 3 }) {
  const items = Array.from({ length: count });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(320px, 1fr))`,
        gap: "24px"
      }}
    >
      {items.map((_, index) => (
        <ProductSkeletonCard key={index} />
      ))}
    </div>
  );
}

export default ProductSkeletonGrid;
