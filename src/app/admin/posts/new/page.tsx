import { Head } from '@/components/AdminUI';
import { PostEditor } from '@/components/PostEditor';
import { siteUrl } from '@/lib/settings';

export default async function NewPost({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const host = new URL(siteUrl()).host;
  return (
    <>
      <Head title="New article" sub="Write in simple Markdown. The SEO analysis updates as you type." />
      <PostEditor host={host} post={{ id: 0, type: type === 'guide' ? 'guide' : 'blog', slug: '', title: '', excerpt: '', body: '', coverFile: '', coverAlt: '', category: '', tags: '', author: '', status: 'draft', publishedAt: '', faq: '', seoTitle: '', seoDescription: '', focusKeyword: '', canonical: '', noindex: false }} />
    </>
  );
}
