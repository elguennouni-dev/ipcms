import type { MetadataRoute } from 'next';
import { getSettings, siteUrl } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSettings();
  const base = siteUrl();
  if (s.allowIndexing !== '1') return { rules: [{ userAgent: '*', disallow: '/' }] };
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }], sitemap: `${base}/sitemap.xml`, host: base };
}
