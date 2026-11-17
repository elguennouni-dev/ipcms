import type { Metadata } from 'next';
import { PostIndex } from '@/components/PostPage';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: { absolute: s.guidesTitle }, description: s.guidesDescription, alternates: { canonical: '/guides' } };
}

export default function Page() {
  return <PostIndex type="guide" />;
}
