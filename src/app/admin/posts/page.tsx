import Link from 'next/link';
import { db } from '@/lib/db';
import { Head, Saved } from '@/components/AdminUI';

export default async function Posts({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const type = sp.type === 'guide' || sp.type === 'blog' ? sp.type : undefined;
  const posts = await db.post.findMany({ where: type ? { type } : {}, orderBy: { updatedAt: 'desc' }, take: 300 });
  const now = new Date();
  const state = (p: (typeof posts)[number]) => p.status !== 'published' ? ['Draft', 'Done'] : p.publishedAt && p.publishedAt > now ? ['Scheduled', 'Contacted'] : ['Published', 'Active'];
  return (
    <>
      <Head title="Blog & guides" sub="Write, schedule and optimise articles. Every save updates the live site." right={<Link href={`/admin/posts/new${type ? `?type=${type}` : ''}`} className="btn" style={{ display: 'inline-flex', alignItems: 'center' }}>+ New article</Link>} />
      <Saved sp={sp} />
      <div className="row2" style={{ marginBottom: 12 }}>
        {[['', 'All'], ['blog', 'Blog posts'], ['guide', 'Guides']].map(([v, l]) => <Link key={v} href={v ? `/admin/posts?type=${v}` : '/admin/posts'} className={`btn ${(type || '') === v ? 'dark' : 'out'}`}>{l}</Link>)}
      </div>
      <div className="tbl"><table>
        <thead><tr><th>TITLE</th><th>TYPE</th><th>STATUS</th><th>DATE</th><th>SEO</th><th></th></tr></thead>
        <tbody>
          {posts.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#5B6075' }}>No articles yet.</td></tr>}
          {posts.map((p) => {
            const [label, cls] = state(p);
            const c = p.seoScore >= 75 ? '#12B76A' : p.seoScore >= 50 ? '#F79009' : '#F04438';
            return (
              <tr key={p.id}>
                <td><Link href={`/admin/posts/${p.id}`}><b>{p.title}</b></Link><div className="sub">/{p.type === 'guide' ? 'guides' : 'blog'}/{p.slug}</div></td>
                <td><span className="tag">{p.type === 'guide' ? 'Guide' : 'Blog'}</span></td>
                <td><span className={`st ${cls}`} style={{ display: 'inline-block', lineHeight: '36px' }}>{label}</span></td>
                <td className="sub">{(p.publishedAt || p.updatedAt).toLocaleDateString('en-GB')}</td>
                <td><b style={{ color: c }}>{p.seoScore}</b></td>
                <td><div className="row2"><Link className="btn out" href={`/admin/posts/${p.id}`}>Edit</Link>{p.status === 'published' && <a className="btn out" target="_blank" href={`/${p.type === 'guide' ? 'guides' : 'blog'}/${p.slug}`}>View</a>}</div></td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
    </>
  );
}
