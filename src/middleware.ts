import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PROD = process.env.NODE_ENV === 'production';
const COOKIE = PROD ? '__Host-ipcms_session' : 'ipcms_session';

function harden(res: NextResponse) {
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Cache-Control', 'no-store, max-age=0');
  return res;
}

/** First line of defence: signature + expiry. The full check (user exists, not revoked) runs in every page and action. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/admin/login') return harden(NextResponse.next());
  const token = req.cookies.get(COOKIE)?.value;
  try {
    const s = process.env.AUTH_SECRET || '';
    if (PROD && (s.length < 32 || s.includes('change-me'))) throw new Error('weak secret');
    if (!token) throw new Error('no token');
    await jwtVerify(token, new TextEncoder().encode(s || 'dev-only-secret-not-for-production-use!!'), { algorithms: ['HS256'] });
    return harden(NextResponse.next());
  } catch {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return harden(NextResponse.redirect(url));
  }
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
