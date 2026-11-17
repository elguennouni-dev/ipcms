import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { siteUrl } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages = await db.legalPage.findMany();
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...pages.map((p) => ({ url: `${base}/legal/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'yearly' as const, priority: 0.3 }))
  ];
}
