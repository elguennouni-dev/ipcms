import Link from 'next/link';

const GR = ['#1E40AF,#0B1B52', '#B91C1C,#3B0A12', '#0B3FB3,#071A5C', '#0F766E,#04201E', '#7C2D6B,#220B1E', '#1D4ED8,#0A1B4D'];

export type CardPost = { id?: number; type: string; slug: string; title: string; excerpt: string; coverFile: string; coverAlt?: string; category?: string; publishedAt: Date | null };

export function PostCard({ p, i = 0 }: { p: CardPost; i?: number }) {
  const href = `/${p.type === 'guide' ? 'guides' : 'blog'}/${p.slug}`;
  return (
    <Link href={href} className="pcard">
      <div className="im" style={p.coverFile ? undefined : { background: `linear-gradient(150deg,${GR[(p.id ?? i) % GR.length]})` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.coverFile ? <img src={`/media/${p.coverFile}`} alt={p.coverAlt || p.title} loading="lazy" decoding="async" /> : <span>{p.title}</span>}
      </div>
      <div className="tx">
        {p.category && <div className="eyebrow" style={{ fontSize: 12 }}>{p.category}</div>}
        <h3>{p.title}</h3>
        {p.excerpt && <p>{p.excerpt.length > 130 ? p.excerpt.slice(0, 127) + '…' : p.excerpt}</p>}
        <div className="by">{p.publishedAt?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
      </div>
    </Link>
  );
}
