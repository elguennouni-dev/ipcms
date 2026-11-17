import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from './db';

const COOKIE = 'ipcms_session';
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me-please-32chars!!');

export async function login(email: string, password: string) {
  const user = await db.adminUser.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return false;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return false;
  const token = await new SignJWT({ uid: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
  return true;
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession() {
  const jar = await cookies();
  const t = jar.get(COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, secret());
    return { uid: Number(payload.uid), role: String(payload.role) };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s) throw new Error('Unauthorized');
  return s;
}
