"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SEOGeoTags({ categoryName = "Business", basePath = "/brands" }) {
    const [expanded, setExpanded] = useState(false);

    // Common high-value target states/locations mapped internally to valid directories for SEO
    const targetStates = [
        "Delhi", "Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu",
        "Haryana", "Punjab", "Rajasthan", "Uttar Pradesh", "Kerala",
        "West Bengal", "Andhra Pradesh", "Chandigarh", "Uttarakhand",
        "Himachal Pradesh", "Jammu and Kashmir", "Madhya Pradesh", "Odisha"
    ];

    const generateSEOLink = (state) => {
        // Build an internal, actually operable filtering link for the directory.
        const query = new URLSearchParams();
        if (categoryName !== "Business") {
            query.set("category", categoryName);
        }
        query.set("state", state);

        return `${basePath}?${query.toString()}`;
    };

    const initialCount = 10;
    const visibleStates = expanded ? targetStates : targetStates.slice(0, initialCount);

    return (
        <div style={{
            marginTop: "60px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px 30px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
        }}>
            <h4 style={{
                fontSize: "15px",
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
            }}>
                Explore More Location Options
            </h4>

            <div style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "10px",
                fontSize: "13.5px",
                color: "#64748b",
                lineHeight: "1.8"
            }}>
                <span style={{ fontWeight: "700", color: "#334155", marginRight: "4px" }}>Tags:</span>

                {visibleStates.map((state, index) => (
                    <span key={state} style={{ display: "inline-flex", alignItems: "center" }}>
                        <Link
                            href={generateSEOLink(state)}
                            style={{
                                color: "var(--primary)",
                                textDecoration: "none",
                                fontWeight: "600",
                                transition: "color 0.2s ease"
                            }}
                            className="seo-geo-link"
                            title={`${categoryName} Business Franchise in ${state}`}
                        >
                            {categoryName} Business Franchise in {state}
                        </Link>
                        {(index < visibleStates.length - 1 || expanded) && (
                            <span style={{ color: "#cbd5e1", marginLeft: "10px" }}>|</span>
                        )}
                    </span>
                ))}

                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        background: "none",
                        border: "none",
                        color: "#0f172a",
                        cursor: "pointer",
                        fontWeight: "700",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "13px",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        transition: "background 0.2s"
                    }}
                    className="seo-geo-toggle"
                >
                    {expanded ? "Show less" : "Show more"}
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            <style jsx>{`
                .seo-geo-link:hover {
                    color: var(--secondary) !important;
                    text-decoration: underline !important;
                }
                .seo-geo-toggle:hover {
                    background: #f1f5f9;
                }
            `}</style>
        </div>
    );
}
