import './globals.css';
import type { Metadata, Viewport } from 'next';
import { getSettings, siteUrl } from '@/lib/settings';
import { getMedia, mediaUrl } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = { themeColor: '#050E2B', width: 'device-width', initialScale: 1 };

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const media = await getMedia();
  const og = mediaUrl(media['og']);
  const token = s.gscVerification.replace(/^google-site-verification=/, '').trim();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.seoTitle, template: `%s | ${s.siteName}` },
    description: s.seoDescription,
    alternates: { canonical: '/' },
    robots: s.allowIndexing === '1' ? { index: true, follow: true } : { index: false, follow: false },
    verification: token ? { google: token } : undefined,
    openGraph: {
      type: 'website', locale: 'en_GB', siteName: s.siteName, title: s.seoTitle, description: s.seoDescription, url: '/',
      images: [{ url: og || '/brand/og-default.png', width: 1200, height: 630 }]
    },
    twitter: { card: 'summary_large_image', title: s.seoTitle, description: s.seoDescription }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
