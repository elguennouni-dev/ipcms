import { robotsBody, text } from '@/lib/textfiles';

export const dynamic = 'force-dynamic';

export async function GET() {
  return text(await robotsBody());
}
