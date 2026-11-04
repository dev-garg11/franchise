"use client";

export default function FilterTabs({
  tabs = [], // [{ id, label, count }]
  activeTab,
  onChange,
  loading = false,
  className = "",
  style = {}
}) {
  return (
    <div
      role="tablist"
      className={`admin-filter-tabs ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: "#ffffff",
        padding: "4px",
        borderRadius: "12px",
        border: "1px solid #d9e2fa",
        flexWrap: "wrap",
        ...style
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              padding: "7px 14px",
              borderRadius: "9px",
              fontSize: "13px",
              fontWeight: isActive ? "700" : "600",
              color: isActive ? "#ffffff" : "#4a5878",
              backgroundColor: isActive ? "#1d4ed8" : "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.18s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              userSelect: "none"
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "#f1f5ff";
                e.currentTarget.style.color = "#0f1a3d";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#4a5878";
              }
            }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (!loading || tab.count > 0) && (
              <span
                style={{
                  fontSize: "11.5px",
                  fontWeight: "700",
                  opacity: isActive ? 0.9 : 0.75
                }}
              >
                · {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

