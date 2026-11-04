export default function Chip({ children, tone = "blue", active = false }) {
  return <span className={`public-chip public-chip--${tone}${active ? " is-active" : ""}`}>{children}</span>;
}
