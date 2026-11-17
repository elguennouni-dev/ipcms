import type { Metadata } from 'next';
import { PostPage, postMetadata } from '@/components/PostPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return postMetadata('guide', (await params).slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <PostPage type="guide" slug={(await params).slug} />;
}
