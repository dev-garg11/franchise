import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function JoinCard({ tone, tag, icon: Icon, title, description, points, href, action }) {
  return (
    <article className={`public-join-card public-join-card--${tone}`}>
      <span className="public-join-tag">{tag}</span>
      <div className="public-join-icon" aria-hidden="true"><Icon size={24} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
      <ul>{points.map((point) => <li key={point}><span aria-hidden="true">✓</span>{point}</li>)}</ul>
      <Link href={href} className="public-join-action">{action} <ArrowRight size={16} /></Link>
    </article>
  );
}
