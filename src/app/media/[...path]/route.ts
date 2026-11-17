import { NextRequest } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

function uploadDir() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const name = path.basename(parts.join('/'));
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return new Response('Not found', { status: 404 });
  try {
    const buf = await readFile(path.join(uploadDir(), name));
    return new Response(new Uint8Array(buf), {
      headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' }
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
