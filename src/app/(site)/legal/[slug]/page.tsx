import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLegalPage, getLegalPages } from '@/lib/data';
import { getSettings } from '@/lib/settings';
import { DmcaForm } from '@/components/DmcaForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getLegalPage(slug);
  if (!p) return {};
  return { title: p.title, alternates: { canonical: `/legal/${slug}` }, description: `${p.title} - read our policy.` };
}

function render(body: string) {
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) { out.push(<ul key={`u${out.length}`}>{list.map((l, i) => <li key={i}>{l}</li>)}</ul>); list = []; } };
  body.split('\n').forEach((raw, i) => {
    const line = raw.trim();
    if (line.startsWith('- ')) { list.push(line.slice(2)); return; }
    flush();
    if (!line) return;
    if (line.startsWith('## ')) out.push(<h2 key={i}>{line.slice(3)}</h2>);
    else if (line.startsWith('> ')) out.push(<blockquote key={i}>{line.slice(2)}</blockquote>);
    else out.push(<p key={i}>{line}</p>);
  });
  flush();
  return out;
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page, pages, s] = await Promise.all([getLegalPage(slug), getLegalPages(), getSettings()]);
  if (!page) notFound();
  return (
    <div className="wrap legal">
      <aside aria-label="Legal pages">
        <div className="eyebrow" style={{ padding: '0 14px 8px', color: '#8A8FA6' }}>Legal</div>
        {pages.map((p) => <Link key={p.slug} href={`/legal/${p.slug}`} className={p.slug === slug ? 'on' : ''}>{p.title}</Link>)}
      </aside>
      <main>
        <div className="eyebrow">{slug === 'dmca' ? 'Copyright' : 'Legal'}</div>
        <h1>{page.title}</h1>
        <p className="muted" style={{ fontSize: 14 }}>Last updated: {page.updatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        {render(page.body)}
        {slug === 'dmca' && (<><h2>Submit a notice online</h2><DmcaForm email={s.dmcaEmail} /></>)}
      </main>
    </div>
  );
}
