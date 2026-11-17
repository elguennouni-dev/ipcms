import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Head, Saved } from '@/components/AdminUI';
import { PostEditor } from '@/components/PostEditor';
import { siteUrl } from '@/lib/settings';

const local = (d: Date | null) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const p = await db.post.findUnique({ where: { id: Number(id) } });
  if (!p) notFound();
  return (
    <>
      <Head title="Edit article" sub={`/${p.type === 'guide' ? 'guides' : 'blog'}/${p.slug}`} />
      <Saved sp={sp} />
      <PostEditor host={new URL(siteUrl()).host} post={{ id: p.id, type: p.type, slug: p.slug, title: p.title, excerpt: p.excerpt, body: p.body, coverFile: p.coverFile, coverAlt: p.coverAlt, category: p.category, tags: p.tags, author: p.author, status: p.status, publishedAt: local(p.publishedAt), faq: p.faq, seoTitle: p.seoTitle, seoDescription: p.seoDescription, focusKeyword: p.focusKeyword, canonical: p.canonical, noindex: p.noindex }} />
    </>
  );
}
