import { getIndexNowKey } from '@/lib/settings';
import { text } from '@/lib/textfiles';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  const real = await getIndexNowKey();
  if (key !== real) return new Response('Not found', { status: 404 });
  return text(real);
}
