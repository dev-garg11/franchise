"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Button from "./Button";

export default function PageHeader({
  title,
  subtitle,
  portalLink = "/",
  portalLabel = "View Portal",
  primaryAction, // { label: string, onClick?: () => void, href?: string, icon?: React.ComponentType }
  extraActions
}) {
  return (
    <div
      className="admin-page-header"
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "28px",
        flexWrap: "wrap"
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: "800",
            color: "#0f1a3d",
            letterSpacing: "-0.025em",
            margin: "0 0 4px 0",
            lineHeight: 1.2
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: "13.5px",
              color: "#4a5878",
              margin: 0,
              fontWeight: "500",
              lineHeight: 1.4
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        {portalLink && (
          <Link href={portalLink} target="_blank" style={{ textDecoration: "none" }}>
            <Button variant="outline" size="md">
              {portalLabel}
            </Button>
          </Link>
        )}

        {extraActions}

        {primaryAction && (
          primaryAction.href ? (
            <Link href={primaryAction.href} style={{ textDecoration: "none" }}>
              <Button variant="primary" size="md" icon={primaryAction.icon}>
                {primaryAction.label}
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={primaryAction.onClick}
              icon={primaryAction.icon}
            >
              {primaryAction.label}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

