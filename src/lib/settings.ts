import { unstable_cache, revalidateTag } from 'next/cache';
import { db } from './db';

export const DEFAULTS: Record<string, string> = {
  siteName: 'UK Channel TV',
  whatsapp: '447000000000',
  supportEmail: 'support@ukchanneltv.com',
  dmcaEmail: 'dmca@ukchanneltv.com',
  companyName: '[Your Company Ltd]',
  companyNumber: '[00000000]',
  heroTitle: 'Every screen. Every game. One subscription.',
  heroSub: 'Live TV, sport, films and series in crisp HD and 4K, on every device you own. Pick a plan, send us a message, and you are watching within minutes.',
  heroCta: 'Start 24-hour free trial',
  trialEnabled: '1',
  announceEnabled: '0',
  announceText: '',
  cookieBanner: '1',
  whatsappFloat: '1',
  statChannels: '[00,000]+',
  statVod: '[00,000]+',
  seoTitle: 'UK Channel TV | Premium UK Streaming Subscriptions',
  seoDescription: 'Live TV, sport, films and series in HD and 4K. Flexible monthly to 12-month plans and a 24-hour free trial.',
  gscVerification: '',
  ga4: '',
  allowIndexing: '1',
  paypalEnabled: '0',
  paypalMode: 'sandbox',
  paypalClientId: '',
  paypalSecret: ''
};

export const getSettings = unstable_cache(
  async () => {
    const rows = await db.setting.findMany();
    const map: Record<string, string> = { ...DEFAULTS };
    for (const r of rows) map[r.key] = r.value;
    return map;
  },
  ['settings'],
  { tags: ['settings'] }
);

export async function saveSettings(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  revalidateTag('settings');
}

export const siteUrl = () => (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
