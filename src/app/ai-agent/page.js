"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";

function RedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home and trigger SEO AI Agent popup automatically
    router.replace("/?agent=open");
  }, [router]);

  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
      color: "#0f172a",
      padding: "20px",
      textAlign: "center"
    }}>
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        border: "3px solid #6366f1",
        borderTopColor: "transparent",
        animation: "spin 1s linear infinite",
        marginBottom: "16px"
      }} />
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
        Opening Franchise Roots FR AI Agent...
      </h2>
      <p style={{ color: "#64748b", fontSize: "14px" }}>
        Directing you to the AI Advisor popup for live franchise recommendations and direct brand links.
      </p>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function AiAgentPage() {
  return (
    <Suspense fallback={null}>
      <RedirectHandler />
    </Suspense>
  );
}
