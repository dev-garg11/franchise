"use client";

import { useEffect, useState, useRef } from "react";

export default function StatCard({
  icon: Icon,
  value = 0,
  label,
  subtext,
  subtextColor,
  trend, // string e.g. "+ 12 this month"
  trendType = "neutral", // positive, warning, negative, neutral
  color = "blue", // blue, orange, green, purple, red
  solid = false, // if true, full card background is colored (used in Ads page)
  sparkline = false,
  loading = false,
  className = "",
  style = {}
}) {
  const numeric = typeof value === "number" ? value : parseInt(value, 10);
  const target = !isNaN(numeric) && numeric >= 0 ? numeric : 0;

  const [displayValue, setDisplayValue] = useState(0);
  const currentValRef = useRef(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // If data is still loading from backend, do not animate yet
    if (loading) return;

    // If target is 0:
    if (target === 0) {
      if (hasAnimatedRef.current) return;
      setDisplayValue(0);
      currentValRef.current = 0;
      hasAnimatedRef.current = true;
      return;
    }

    // If target equals the displayed value and already animated, do nothing
    if (hasAnimatedRef.current && currentValRef.current === target) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setDisplayValue(target);
      currentValRef.current = target;
      hasAnimatedRef.current = true;
      return;
    }

    const start = hasAnimatedRef.current ? currentValRef.current : 0;
    const duration = 600;
    const startTime = performance.now();
    let animationFrameId;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (target - start) * ease);
      setDisplayValue(current);
      currentValRef.current = current;

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
        currentValRef.current = target;
        hasAnimatedRef.current = true;
      }
    }

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, loading]);

  const colorThemes = {
    blue: {
      tileBg: "#eff6ff",
      tileColor: "#2563eb",
      solidBg: "#2563eb",
      solidColor: "#ffffff"
    },
    orange: {
      tileBg: "#fff7ed",
      tileColor: "#ea580c",
      solidBg: "#ea580c",
      solidColor: "#ffffff"
    },
    green: {
      tileBg: "#f0fdf4",
      tileColor: "#15803d",
      solidBg: "#15803d",
      solidColor: "#ffffff"
    },
    purple: {
      tileBg: "#faf5ff",
      tileColor: "#7c3aed",
      solidBg: "#7c3aed",
      solidColor: "#ffffff"
    },
    red: {
      tileBg: "#fef2f2",
      tileColor: "#dc2626",
      solidBg: "#dc2626",
      solidColor: "#ffffff"
    }
  };

  const theme = colorThemes[color] || colorThemes.blue;

  // Render shimmer skeleton if card data is in initial loading state
  if (loading && displayValue === 0) {
    if (solid) {
      return (
        <div
          className={`admin-shimmer ${className}`}
          style={{
            backgroundColor: theme.solidBg,
            borderRadius: "16px",
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "130px",
            opacity: 0.85,
            ...style
          }}
        >
          <div style={{ width: "60px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.3)" }} />
          <div style={{ width: "100px", height: "16px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.3)", marginTop: "8px" }} />
        </div>
      );
    }

    return (
      <div
        className={`admin-stat-card admin-shimmer ${className}`}
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #d9e2fa",
          borderRadius: "16px",
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          minHeight: "88px",
          boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)",
          ...style
        }}
      >
        <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#eef2fb", flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
          <div style={{ width: "50px", height: "26px", borderRadius: "6px", backgroundColor: "#eef2fb" }} />
          <div style={{ width: "110px", height: "14px", borderRadius: "4px", backgroundColor: "#eef2fb" }} />
        </div>
      </div>
    );
  }

  if (solid) {
    return (
      <div
        className={`admin-stat-card-solid ${className}`}
        style={{
          backgroundColor: theme.solidBg,
          color: theme.solidColor,
          borderRadius: "16px",
          padding: "22px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "130px",
          boxShadow: "0 2px 10px rgba(15, 26, 61, 0.08)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          ...style
        }}
      >
        <span
          style={{
            fontSize: "36px",
            fontWeight: "900",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          {displayValue}
        </span>
        <span style={{ fontSize: "14px", fontWeight: "600", opacity: 0.95, marginTop: "8px" }}>
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`admin-stat-card ${className}`}
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #d9e2fa",
        borderRadius: "16px",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "14px",
        boxShadow: "0 2px 8px rgba(15, 26, 61, 0.04)",
        transition: "all 0.18s ease",
        ...style
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {Icon && (
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: theme.tileBg,
              color: theme.tileColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Icon size={22} strokeWidth={2.2} />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontSize: "26px",
                fontWeight: "800",
                color: "#0f1a3d",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
            >
              {displayValue}
            </span>
          </div>

          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#4a5878",
              marginTop: "2px"
            }}
          >
            {label}
          </span>

          {subtext && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: subtextColor || "#ea580c",
                marginTop: "2px"
              }}
            >
              {subtext}
            </span>
          )}

          {trend && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: trendType === "positive" ? "#15803d" : trendType === "warning" ? "#ea580c" : "#2563eb",
                marginTop: "2px",
                display: "inline-flex",
                alignItems: "center",
                gap: "2px"
              }}
            >
              {trend}
            </span>
          )}
        </div>
      </div>

      {sparkline && (
        <div style={{ width: "64px", height: "24px", opacity: 0.85, flexShrink: 0 }}>
          <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
            <path
              d={
                color === "green"
                  ? "M2 18 C 14 16, 22 14, 32 8 C 42 3, 50 8, 62 4"
                  : color === "orange"
                  ? "M2 8 C 14 12, 24 16, 36 10 C 46 6, 52 14, 62 12"
                  : "M2 16 C 14 14, 26 18, 38 10 C 48 4, 54 8, 62 2"
              }
              stroke={theme.tileColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
