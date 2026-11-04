"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Building,
  Users,
  FileText,
  Wrench,
  Megaphone,
  ShieldCheck,
  Sparkles,
  LogOut,
  X
} from "lucide-react";

export default function AdminSidebar({
  activeTab,
  onTabChange,
  counts = {},
  adminName = "Administrator",
  onLogout,
  mobileOpen = false,
  onMobileClose
}) {
  const {
    totalBrands = 0,
    pendingBrandsCount = 0,
    totalInvestors = 0,
    totalBlogs = 0,
    totalServices = 0,
    totalAds = 0
  } = counts;

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard Overview",
      href: "/admin",
      icon: LayoutDashboard
    },
    {
      id: "brands",
      label: totalBrands > 0 ? `Manage Brands (${totalBrands})` : "Manage Brands",
      href: "/admin/brands",
      icon: Building,
      badge: pendingBrandsCount > 0 ? pendingBrandsCount : null
    },
    {
      id: "seo",
      label: "SEO & AI Engine",
      href: "/admin/seo",
      icon: Sparkles
    },
    {
      id: "investors",
      label: totalInvestors > 0 ? `Investor Leads (${totalInvestors})` : "Investor Leads",
      href: "/admin/investors",
      icon: Users
    },
    {
      id: "blogs",
      label: totalBlogs > 0 ? `Manage Blogs (${totalBlogs})` : "Manage Blogs",
      href: "/admin/blogs",
      icon: FileText
    },
    {
      id: "services",
      label: totalServices > 0 ? `Manage Services (${totalServices})` : "Manage Services",
      href: "/admin/services",
      icon: Wrench
    },
    {
      id: "ads",
      label: totalAds > 0 ? `Manage Ads (${totalAds})` : "Manage Ads",
      href: "/admin/ads",
      icon: Megaphone
    },
    {
      id: "logs",
      label: "Activity & Audit Logs",
      href: "/admin/logs",
      icon: ShieldCheck
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          role="presentation"
          onClick={onMobileClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 26, 61, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 9998
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`admin-redesigned-sidebar ${mobileOpen ? "mobile-open" : ""}`}
        style={{
          width: "270px",
          minWidth: "270px",
          backgroundColor: "#1d4ed8",
          color: "#e3ebff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "24px 18px",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 9999,
          boxShadow: "4px 0 24px rgba(15, 26, 61, 0.08)",
          overflowY: "auto",
          scrollbarWidth: "none",
          transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Header Branding */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Link
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                onTabChange("dashboard");
                if (onMobileClose) onMobileClose();
              }}
              style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.1" }}>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "900",
                    color: "#ffffff",
                    letterSpacing: "-0.01em",
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                >
                  FRANCHISE
                </span>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "900",
                    color: "#84cc16",
                    letterSpacing: "-0.01em",
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                >
                  ROOTS
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: "700",
                    color: "rgba(255, 255, 255, 0.75)",
                    letterSpacing: "0.12em",
                    marginTop: "4px",
                    textTransform: "uppercase"
                  }}
                >
                  GEN BUSINESS CONSULTING
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onMobileClose}
              className="admin-sidebar-mobile-close"
              aria-label="Close sidebar"
              style={{
                display: "none",
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#ffffff",
                padding: "6px",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Admin Navigation">
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const IconComponent = item.icon;

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        onTabChange(item.id);
                        if (onMobileClose) onMobileClose();
                      }}
                      className={`admin-nav-item-btn ${isActive ? "active" : ""}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        fontSize: "13.5px",
                        fontWeight: isActive ? "700" : "600",
                        textDecoration: "none",
                        color: isActive ? "#1d4ed8" : "#e3ebff",
                        backgroundColor: isActive ? "#ffffff" : "transparent",
                        boxShadow: isActive ? "0 4px 14px rgba(0, 0, 0, 0.12)" : "none",
                        transition: "all 0.15s ease",
                        position: "relative"
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "#2f5fe8";
                          e.currentTarget.style.color = "#ffffff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#e3ebff";
                        }
                      }}
                    >
                      <IconComponent size={18} style={{ flexShrink: 0 }} />
                      <span style={{ flexGrow: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          style={{
                            backgroundColor: "#dc2626",
                            color: "#ffffff",
                            fontSize: "11px",
                            fontWeight: "800",
                            padding: "1px 7px",
                            borderRadius: "9999px",
                            lineHeight: "1.4",
                            boxShadow: "0 2px 4px rgba(220, 38, 38, 0.4)"
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Footer Admin Info & Logout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.15)", paddingTop: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "#ffffff",
                  color: "#1d4ed8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "800",
                  flexShrink: 0
                }}
              >
                AD
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#ffffff" }}>
                  {adminName}
                </span>
                <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.75)" }}>
                  Super admin
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              aria-label="Logout session"
              title="Logout Session"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                border: "none",
                color: "#ffffff",
                padding: "8px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.4)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)"}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

