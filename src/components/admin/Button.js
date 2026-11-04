"use client";

export default function Button({
  children,
  variant = "outline", // primary, success, danger, danger-outline, soft-blue, outline, ghost
  size = "md",         // sm, md, lg
  onClick,
  disabled = false,
  type = "button",
  icon: Icon,
  className = "",
  style = {},
  title,
  ariaLabel
}) {
  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontWeight: "600",
    borderRadius: "10px",
    border: "1px solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: "inherit",
    outline: "none",
    whiteSpace: "nowrap",
    userSelect: "none"
  };

  // Sizes: ensuring minimum 44px touch target on mobile/standard
  const sizeStyles = {
    sm: { padding: "7px 12px", fontSize: "12.5px", minHeight: "36px" },
    md: { padding: "9px 16px", fontSize: "13.5px", minHeight: "40px" },
    lg: { padding: "12px 22px", fontSize: "15px", minHeight: "46px" }
  };

  let variantStyles = {};
  switch (variant) {
    case "primary": // Red CTA button "+ Add Brand", "+ Create New Blog"
      variantStyles = {
        backgroundColor: "#dc2626",
        color: "#ffffff",
        borderColor: "#dc2626",
        boxShadow: "0 2px 6px rgba(220, 38, 38, 0.25)"
      };
      break;
    case "success": // Solid green for Approve
      variantStyles = {
        backgroundColor: "#15803d",
        color: "#ffffff",
        borderColor: "#15803d",
        boxShadow: "0 2px 6px rgba(21, 128, 61, 0.25)"
      };
      break;
    case "danger": // Solid red for Delete
      variantStyles = {
        backgroundColor: "#dc2626",
        color: "#ffffff",
        borderColor: "#dc2626"
      };
      break;
    case "danger-outline": // Outline red for Decline
      variantStyles = {
        backgroundColor: "#ffffff",
        color: "#dc2626",
        borderColor: "#fca5a5"
      };
      break;
    case "soft-blue": // Soft blue for Edit
      variantStyles = {
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
        borderColor: "#bfdbfe"
      };
      break;
    case "soft-red": // Soft red for Delete in tables
      variantStyles = {
        backgroundColor: "#fef2f2",
        color: "#dc2626",
        borderColor: "#fecaca"
      };
      break;
    case "soft-gray": // Soft gray for View
      variantStyles = {
        backgroundColor: "#f8fafc",
        color: "#334155",
        borderColor: "#e2e8f0"
      };
      break;
    case "ghost":
      variantStyles = {
        backgroundColor: "transparent",
        color: "#4a5878",
        borderColor: "transparent"
      };
      break;
    case "outline":
    default:
      variantStyles = {
        backgroundColor: "#ffffff",
        color: "#0f1a3d",
        borderColor: "#d9e2fa",
        boxShadow: "0 1px 3px rgba(15, 26, 61, 0.04)"
      };
      break;
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel || (typeof children === "string" ? children : undefined)}
      className={`admin-btn admin-btn-${variant} ${className}`}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles,
        ...style
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-1px)";
        if (variant === "primary") e.currentTarget.style.backgroundColor = "#b91c1c";
        else if (variant === "success") e.currentTarget.style.backgroundColor = "#166534";
        else if (variant === "danger-outline") e.currentTarget.style.backgroundColor = "#fef2f2";
        else if (variant === "soft-blue") e.currentTarget.style.backgroundColor = "#dbeafe";
        else if (variant === "outline") {
          e.currentTarget.style.borderColor = "#2563eb";
          e.currentTarget.style.color = "#1d4ed8";
        }
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "none";
        if (variant === "primary") e.currentTarget.style.backgroundColor = "#dc2626";
        else if (variant === "success") e.currentTarget.style.backgroundColor = "#15803d";
        else if (variant === "danger-outline") e.currentTarget.style.backgroundColor = "#ffffff";
        else if (variant === "soft-blue") e.currentTarget.style.backgroundColor = "#eff6ff";
        else if (variant === "outline") {
          e.currentTarget.style.borderColor = "#d9e2fa";
          e.currentTarget.style.color = "#0f1a3d";
        }
      }}
    >
      {Icon && <Icon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />}
      {children}
    </button>
  );
}

