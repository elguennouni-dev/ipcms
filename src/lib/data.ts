import { unstable_cache } from 'next/cache';
import { db } from './db';

export const getPlans = unstable_cache(
  async () => {
    const plans = await db.plan.findMany({ where: { visible: true }, orderBy: { sort: 'asc' } });
    return plans.map((p) => ({ ...p, price: Number(p.price) }));
  },
  ['plans'],
  { tags: ['plans'] }
);

export const getSections = unstable_cache(
  async () => db.section.findMany({ orderBy: { sort: 'asc' } }),
  ['sections'],
  { tags: ['sections'] }
);

export const getFaqs = unstable_cache(
  async () => db.faqItem.findMany({ where: { visible: true }, orderBy: { sort: 'asc' } }),
  ['faqs'],
  { tags: ['faqs'] }
);

export const getReviews = unstable_cache(
  async () => db.review.findMany({ where: { visible: true }, orderBy: { sort: 'asc' } }),
  ['reviews'],
  { tags: ['reviews'] }
);

export const getMedia = unstable_cache(
  async () => {
    const rows = await db.media.findMany();
    const map: Record<string, { file: string; alt: string; v: number }> = {};
    for (const m of rows) if (m.file) map[m.slot] = { file: m.file, alt: m.alt, v: m.updatedAt.getTime() };
    return map;
  },
  ['media'],
  { tags: ['media'] }
);

export const getLegalPages = unstable_cache(
  async () => db.legalPage.findMany({ orderBy: { id: 'asc' } }),
  ['legal'],
  { tags: ['legal'] }
);

export const getLegalPage = (slug: string) =>
  unstable_cache(async () => db.legalPage.findUnique({ where: { slug } }), ['legal', slug], { tags: ['legal'] })();

export const mediaUrl = (m?: { file: string; v: number }) => (m ? `/media/${m.file}?v=${m.v}` : null);
