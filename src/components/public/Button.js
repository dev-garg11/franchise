import Link from "next/link";

export default function Button({ children, href, variant = "blue", className = "", ...props }) {
  const classes = `public-button public-button--${variant} ${className}`.trim();
  if (href) return <Link href={href} className={classes} {...props}>{children}</Link>;
  return <button className={classes} {...props}>{children}</button>;
}
