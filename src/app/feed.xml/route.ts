import { allPublished } from '@/lib/data';
import { getSettings, siteUrl } from '@/lib/settings';
import { text } from '@/lib/textfiles';

export const dynamic = 'force-dynamic';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
  const [s, posts] = await Promise.all([getSettings(), allPublished()]);
  const base = siteUrl();
  const items = posts.filter((p) => !p.noindex).slice(0, 40).map((p) => {
    const url = `${base}/${p.type === 'guide' ? 'guides' : 'blog'}/${p.slug}`;
    return `<item><title>${esc(p.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${(p.publishedAt || p.updatedAt).toUTCString()}</pubDate><description>${esc(p.excerpt || p.seoDescription || '')}</description></item>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(s.siteName)}</title><link>${base}</link><description>${esc(s.seoDescription)}</description><language>en-gb</language><atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return text(xml, 'application/rss+xml');
}
