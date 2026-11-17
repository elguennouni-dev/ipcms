import Link from 'next/link';
import { db } from '@/lib/db';
import { Head, Saved } from '@/components/AdminUI';
import { nextDmcaStatus, saveLegal } from '../actions';

export default async function Legal({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const [pages, notices] = await Promise.all([db.legalPage.findMany({ orderBy: { id: 'asc' } }), db.dmcaNotice.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })]);
  const cur = pages.find((p) => p.slug === sp.page) || pages[0];
  return (
    <>
      <Head title="Legal & DMCA" sub="Terms, privacy, refunds, cookies, DMCA policy and incoming notices." />
      <Saved sp={sp} />
      <div className="cols2">
        <div className="box" style={{ padding: 0, overflow: 'hidden' }}>
          <h2 style={{ padding: '18px 22px', margin: 0, borderBottom: '1px solid #E3E5EF' }}>Legal pages</h2>
          {pages.map((p) => (
            <Link key={p.slug} href={`/admin/legal?page=${p.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 60, padding: '0 22px', borderTop: '1px solid #ECEEF5', background: cur?.slug === p.slug ? '#F3F0FF' : '#fff' }}>
              <span style={{ flex: 1 }}><b>{p.title}</b><div className="sub">/legal/{p.slug} · updated {p.updatedAt.toLocaleDateString('en-GB')}</div></span>
            </Link>
          ))}
        </div>
        {cur && (
          <form action={saveLegal} className="box" key={cur.slug}>
            <h2>Edit: {cur.title}</h2>
            <input type="hidden" name="slug" value={cur.slug} />
            <div className="f"><label htmlFor="lt">Title</label><input id="lt" name="title" className="in" defaultValue={cur.title} required /></div>
            <div className="f"><label htmlFor="lb">Text</label><textarea id="lb" name="body" defaultValue={cur.body} style={{ minHeight: 320 }} /></div>
            <div className="sub" style={{ marginBottom: 12 }}>Formatting: <code>## Heading</code>, <code>- list item</code>, blank line between paragraphs.</div>
            <button className="btn">Save &amp; publish</button>
          </form>
        )}
      </div>
      <div className="box" style={{ marginTop: 16 }}>
        <h2>DMCA notices inbox ({notices.filter((n) => n.status === 'Open').length} open)</h2>
        {notices.length === 0 && <div className="sub">No notices received.</div>}
        {notices.map((n) => (
          <div key={n.id} style={{ borderTop: '1px solid #ECEEF5', padding: '14px 0' }}>
            <div className="row2" style={{ justifyContent: 'space-between' }}>
              <div><b>{n.name}</b> · <a href={`mailto:${n.email}`}>{n.email}</a><div className="sub">{n.createdAt.toLocaleString('en-GB')}</div></div>
              <form action={nextDmcaStatus}><input type="hidden" name="id" value={n.id} /><button className={`st ${n.status}`}>{n.status}</button></form>
            </div>
            <div style={{ marginTop: 8, fontSize: 14 }}><b>Work:</b> {n.work}</div>
            <div style={{ fontSize: 14 }}><b>Location:</b> {n.location}</div>
            <div className="sub">Signed: {n.signature}</div>
          </div>
        ))}
      </div>
    </>
  );
}
