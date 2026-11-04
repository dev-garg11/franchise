"use client";

export default function PageHeader({
  theme,
  eyebrow,
  titleBefore,
  titleAccent,
  titleAfter,
  subtitle,
  breadcrumb,
  leftExtra,
  rightVisual,
  children,
  centered = false
}) {
  return (
    <header className={`page-header page-header--${theme || "blue"}${centered ? " page-header--centered" : ""}`}>
      <span className="page-header-blob page-header-blob--one" aria-hidden="true" />
      <span className="page-header-blob page-header-blob--two" aria-hidden="true" />
      <span className="page-header-dots" aria-hidden="true" />

      <div className="page-header-grid">
        <div className="page-header-copy">
          {breadcrumb && (
            <nav className="page-header-breadcrumb" aria-label="Breadcrumb">
              {breadcrumb}
            </nav>
          )}
          <div className="page-header-eyebrow">{eyebrow}</div>
          <h1>
            {titleBefore}
            {titleAccent && <span>{titleAccent}</span>}
            {titleAfter}
          </h1>
          <p className="page-header-subtitle">{subtitle}</p>
          {leftExtra}
        </div>

        {rightVisual && <div className="page-header-visual">{rightVisual}</div>}
        {children}
      </div>
    </header>
  );
}
