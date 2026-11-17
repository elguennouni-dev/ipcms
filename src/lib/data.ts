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

/* ---------- posts (blog + guides) ---------- */
const publishedWhere = () => ({ status: 'published', publishedAt: { lte: new Date() } });

export const getPosts = (type: string, take = 60) =>
  unstable_cache(
    async () => db.post.findMany({ where: { type, ...publishedWhere() }, orderBy: { publishedAt: 'desc' }, take }),
    ['posts', type, String(take)],
    { tags: ['posts'], revalidate: 300 }
  )();

export const getPost = (type: string, slug: string) =>
  unstable_cache(
    async () => db.post.findFirst({ where: { type, slug, ...publishedWhere() } }),
    ['post', type, slug],
    { tags: ['posts'], revalidate: 300 }
  )();

export const getRelated = (type: string, slug: string, category: string) =>
  unstable_cache(
    async () => {
      const same = category ? await db.post.findMany({ where: { type, slug: { not: slug }, category, ...publishedWhere() }, orderBy: { publishedAt: 'desc' }, take: 3 }) : [];
      if (same.length >= 3) return same;
      const more = await db.post.findMany({ where: { type, slug: { notIn: [slug, ...same.map((p) => p.slug)] }, ...publishedWhere() }, orderBy: { publishedAt: 'desc' }, take: 3 - same.length });
      return [...same, ...more];
    },
    ['related', type, slug],
    { tags: ['posts'], revalidate: 300 }
  )();

export const allPublished = unstable_cache(
  async () => db.post.findMany({ where: publishedWhere(), orderBy: { publishedAt: 'desc' }, select: { type: true, slug: true, title: true, excerpt: true, updatedAt: true, publishedAt: true, noindex: true, coverFile: true, seoDescription: true } }),
  ['all-posts'],
  { tags: ['posts'], revalidate: 300 }
);
