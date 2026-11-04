"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, MapPin, ArrowUpRight } from "lucide-react";

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
        <div className="seo-geo-panel" style={{
            marginTop: "60px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px 30px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
        }}>
            <div className="seo-geo-header">
                <div className="seo-geo-title-wrap">
                    <span className="seo-geo-icon"><MapPin size={17} /></span>
                    <div>
                        <span className="seo-geo-kicker">Explore by location</span>
                        <h4>Find opportunities near you</h4>
                    </div>
                </div>
                <span className="seo-geo-count">{targetStates.length} locations</span>
            </div>

            <div style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "10px",
                fontSize: "13.5px",
                color: "#64748b",
                lineHeight: "1.8"
            }}>
                <span className="seo-geo-label">Popular locations</span>

                {visibleStates.map((state, index) => (
                    <span key={state} className="seo-geo-chip-wrap">
                        <Link
                            href={generateSEOLink(state)}
                            className="seo-geo-link"
                            title={`${categoryName} Business Franchise in ${state}`}
                        >
                            <MapPin size={12} />
                            <span>{state}</span>
                            <ArrowUpRight size={12} />
                        </Link>
                    </span>
                ))}

                <button
                    onClick={() => setExpanded(!expanded)}
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
