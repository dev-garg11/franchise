import Link from "next/link";

export default function SectionHeader({ eyebrow, title, accent, subtitle, action, align = "left" }) {
  return (
    <div className={`public-section-header public-section-header--${align}`}>
      {eyebrow && <span className="public-eyebrow">{eyebrow}</span>}
      <div className="public-section-heading-row">
        <div>
          <h2>{title}{accent && <span className="public-heading-accent">{accent}</span>}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && (
          <Link className="public-ghost-button" href={action.href}>{action.label} <span aria-hidden="true">→</span></Link>
        )}
      </div>
    </div>
  );
}
