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
  paypalSecret: '',
  faqTitle: 'FAQ: UK Streaming Subscriptions Explained',
  faqDescription: 'Answers about devices, free trial, setup, payment and support for UK streaming subscriptions.',
  blogTitle: 'Blog: Streaming News, Tips and Buying Advice',
  blogDescription: 'Practical advice for UK viewers: choosing a streaming subscription, getting the best picture quality and fixing common problems.',
  guidesTitle: 'Setup Guides: Install Streaming on Any Device',
  guidesDescription: 'Step-by-step setup guides for Fire Stick, Android TV, Smart TVs, iPhone, iPad, Windows and Mac.',
  bingVerification: '',
  twitterHandle: '',
  sameAs: '',
  schemaEnabled: '1',
  aiBots: 'allow',
  robotsTxt: '',
  llmsTxt: '',
  agentsTxt: '',
  humansTxt: '',
  securityTxt: '',
  indexnowEnabled: '1',
  indexnowKey: ''
};

const cachedSettings = unstable_cache(
  async () => {
    const rows = await db.setting.findMany();
    const map: Record<string, string> = { ...DEFAULTS };
    for (const r of rows) map[r.key] = r.value;
    return map;
  },
  ['settings'],
  { tags: ['settings'] }
);
// DEFAULTS merged again so a cache written by an older version never lacks new keys
export const getSettings = async (): Promise<Record<string, string>> => ({ ...DEFAULTS, ...(await cachedSettings()) });

export async function saveSettings(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  revalidateTag('settings');
}

export const siteUrl = () => (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function getIndexNowKey() {
  // read straight from the DB and never revalidate here: this runs during page render
  const row = await db.setting.findUnique({ where: { key: 'indexnowKey' } });
  if (row?.value) return row.value;
  const key = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  await db.setting.upsert({ where: { key: 'indexnowKey' }, update: { value: key }, create: { key: 'indexnowKey', value: key } });
  return key;
}

export async function pingIndexNow(urls: string[]) {
  try {
    const s = await getSettings();
    const base = siteUrl();
    if (s.indexnowEnabled !== '1' || s.allowIndexing !== '1' || /localhost|127\.0\.0\.1/.test(base) || !urls.length) return false;
    const key = await getIndexNowKey();
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(base).host, key, keyLocation: `${base}/${key}.txt`, urlList: urls.slice(0, 9000) }),
      signal: AbortSignal.timeout(8000)
    });
    return res.ok || res.status === 202;
  } catch { return false; }
}
