import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') return NextResponse.next();
  const token = req.cookies.get('ipcms_session')?.value;
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me-please-32chars!!');
  try {
    if (!token) throw new Error('no token');
    await jwtVerify(token, secret);
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }
}

export const config = { matcher: ['/admin/:path*'] };
