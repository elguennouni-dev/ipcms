import { NextRequest, NextResponse } from 'next/server';
import { getSession, sameOrigin } from '@/lib/auth';
import { saveImage } from '@/lib/upload';

export const dynamic = 'force-dynamic';

/** Used by the article editor to upload inline images. Admin only. */
export async function POST(req: NextRequest) {
  if (!(await sameOrigin())) return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const fd = await req.formData();
  const file = fd.get('file');
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Max 10 MB' }, { status: 400 });
  try {
    const { name } = await saveImage(file, 'img', 1400);
    return NextResponse.json({ url: `/media/${name}` });
  } catch {
    return NextResponse.json({ error: 'Not a valid image' }, { status: 400 });
  }
}
