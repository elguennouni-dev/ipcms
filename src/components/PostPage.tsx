import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPost, getPosts, getRelated } from '@/lib/data';
import { getSettings, siteUrl } from '@/lib/settings';
import { headingsOf, parseFaq, readingMinutes, renderMarkdown } from '@/lib/markdown';
import { Breadcrumbs, crumbLd } from './Breadcrumbs';
import { PostCard } from './PostCard';

const SEG = (type: string) => (type === 'guide' ? 'guides' : 'blog');
const LABEL = (type: string) => (type === 'guide' ? 'Guides' : 'Blog');

export async function postMetadata(type: string, slug: string): Promise<Metadata> {
  const p = await getPost(type, slug);
  if (!p) return { title: 'Not found', robots: { index: false } };
  const s = await getSettings();
  const path = `/${SEG(type)}/${p.slug}`;
  const title = p.seoTitle || p.title;
  const description = p.seoDescription || p.excerpt || s.seoDescription;
  const img = p.coverFile ? `/media/${p.coverFile}` : '/brand/og-default.png';
  return {
    title: { absolute: title.includes(s.siteName) ? title : `${title} | ${s.siteName}` },
    description,
    alternates: { canonical: p.canonical || path },
    robots: p.noindex ? { index: false, follow: true } : undefined,
    openGraph: { type: 'article', title, description, url: path, publishedTime: p.publishedAt?.toISOString(), modifiedTime: p.updatedAt.toISOString(), images: [{ url: img, width: 1200, height: 630, alt: p.coverAlt || p.title }] },
    twitter: { card: 'summary_large_image', title, description, images: [img] }
  };
}

export async function PostPage({ type, slug }: { type: string; slug: string }) {
  const p = await getPost(type, slug);
  if (!p) notFound();
  const [s, related] = await Promise.all([getSettings(), getRelated(type, slug, p.category)]);
  const base = siteUrl();
  const path = `/${SEG(type)}/${p.slug}`;
  const hs = headingsOf(p.body);
  const faq = parseFaq(p.faq);
  const crumbs = [{ name: 'Home', href: '/' }, { name: LABEL(type), href: `/${SEG(type)}` }, { name: p.title, href: path }];
  const author = p.author || s.siteName;
  const ld: object[] = [crumbLd(crumbs, base), {
    '@context': 'https://schema.org', '@type': type === 'guide' ? 'TechArticle' : 'BlogPosting',
    headline: p.title, description: p.seoDescription || p.excerpt, mainEntityOfPage: `${base}${path}`,
    image: p.coverFile ? [`${base}/media/${p.coverFile}`] : [`${base}/brand/og-default.png`],
    datePublished: p.publishedAt?.toISOString(), dateModified: p.updatedAt.toISOString(),
    author: { '@type': p.author ? 'Person' : 'Organization', name: author },
    publisher: { '@type': 'Organization', name: s.siteName, logo: { '@type': 'ImageObject', url: `${base}/brand/logo.png` } },
    inLanguage: 'en-GB'
  }];
  if (faq.length && s.schemaEnabled === '1') ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });

  return (
    <article className="wrap art">
      <Breadcrumbs items={crumbs} />
      <header>
        <div className="eyebrow">{p.category || (type === 'guide' ? 'Setup guide' : 'Blog')}</div>
        <h1>{p.title}</h1>
        {p.excerpt && <p className="lead">{p.excerpt}</p>}
        <div className="meta">
          <span>By {author}</span>
          <span>Published <time dateTime={p.publishedAt?.toISOString()}>{p.publishedAt?.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time></span>
          {p.updatedAt.getTime() - (p.publishedAt?.getTime() || 0) > 86_400_000 && <span>Updated <time dateTime={p.updatedAt.toISOString()}>{p.updatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time></span>}
          <span>{readingMinutes(p.body)} min read</span>
        </div>
      </header>
      {p.coverFile && (
        <div className="cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/media/${p.coverFile}`} alt={p.coverAlt || p.title} fetchPriority="high" decoding="async" />
        </div>
      )}
      <div className="layout">
        {hs.length >= 3 && (
          <nav className="toc" aria-label="Table of contents">
            <b>ON THIS PAGE</b>
            {hs.map((h) => <a key={h.id} href={`#${h.id}`} className={h.level === 3 ? 'l3' : ''}>{h.text}</a>)}
          </nav>
        )}
        <div className="prose">
          {renderMarkdown(p.body)}
          {faq.length > 0 && (
            <>
              <h2 id="faq">Frequently asked questions</h2>
              <div className="faq" style={{ margin: '16px 0 0', maxWidth: 'none' }}>
                {faq.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
              </div>
            </>
          )}
        </div>
      </div>
      <aside className="cta" aria-label="Get started">
        <div><h2>Ready to watch?</h2><p className="muted" style={{ margin: '6px 0 0' }}>Try the 24-hour free trial. Setup help is included on WhatsApp.</p></div>
        <Link href="/#order" className="btn">Request free trial</Link>
      </aside>
      {related.length > 0 && (
        <section className="related" aria-label="Related articles">
          <h2 style={{ fontSize: 28, marginBottom: 20 }}>Keep reading</h2>
          <div className="cards">{related.map((r, i) => <PostCard key={r.id} p={r} i={i} />)}</div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    </article>
  );
}

export async function PostIndex({ type }: { type: string }) {
  const [s, posts] = await Promise.all([getSettings(), getPosts(type)]);
  const base = siteUrl();
  const isGuide = type === 'guide';
  const crumbs = [{ name: 'Home', href: '/' }, { name: LABEL(type), href: `/${SEG(type)}` }];
  const h1 = isGuide ? 'Setup guides for every device' : 'Streaming news, tips and advice';
  const intro = isGuide
    ? 'Clear, step-by-step instructions to get watching on your TV, phone, tablet or computer. Need a hand? Message us on WhatsApp.'
    : 'Practical advice for UK viewers: choosing a subscription, getting the best picture quality and fixing common problems.';
  const ld = [crumbLd(crumbs, base), { '@context': 'https://schema.org', '@type': 'CollectionPage', name: h1, url: `${base}/${SEG(type)}`, inLanguage: 'en-GB', hasPart: posts.slice(0, 20).map((p) => ({ '@type': 'Article', headline: p.title, url: `${base}/${SEG(type)}/${p.slug}` })) }];
  void s;
  return (
    <div className="wrap" style={{ paddingBottom: 24 }}>
      <Breadcrumbs items={crumbs} />
      <div className="pagehead"><div className="eyebrow">{isGuide ? 'Guides' : 'Blog'}</div><h1>{h1}</h1><p>{intro}</p></div>
      <div className="cards" style={{ marginTop: 40 }}>
        {posts.map((p, i) => <PostCard key={p.id} p={p} i={i} />)}
      </div>
      {posts.length === 0 && <p className="muted" style={{ marginTop: 32 }}>New articles are coming soon.</p>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    </div>
  );
}
