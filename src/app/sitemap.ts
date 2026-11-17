import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { allPublished } from '@/lib/data';
import { getSettings, siteUrl } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const s = await getSettings();
  if (s.allowIndexing !== '1') return [];
  const [legal, posts] = await Promise.all([db.legalPage.findMany(), allPublished()]);
  const now = new Date();
  const latest = (t: string) => posts.filter((p) => p.type === t)[0]?.updatedAt ?? now;
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/guides`, lastModified: latest('guide'), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/blog`, lastModified: latest('blog'), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...posts.filter((p) => !p.noindex).map((p) => ({
      url: `${base}/${p.type === 'guide' ? 'guides' : 'blog'}/${p.slug}`,
      lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: p.type === 'guide' ? 0.8 : 0.6,
      ...(p.coverFile ? { images: [`${base}/media/${p.coverFile}`] } : {})
    })),
    ...legal.map((p) => ({ url: `${base}/legal/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'yearly' as const, priority: 0.3 }))
  ];
}
