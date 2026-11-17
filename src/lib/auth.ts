import { SignJWT, jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { verifyTotp } from './totp';

const PROD = process.env.NODE_ENV === 'production';
export const COOKIE = PROD ? '__Host-ipcms_session' : 'ipcms_session';
const SESSION_HOURS = 8;
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60_000;

export function authSecret() {
  const s = process.env.AUTH_SECRET || '';
  if (PROD && (s.length < 32 || s.includes('change-me'))) throw new Error('AUTH_SECRET is missing or too weak. Set a random value of 32+ characters in .env');
  return new TextEncoder().encode(s || 'dev-only-secret-not-for-production-use!!');
}

export async function clientIp() {
  const h = await headers();
  return (h.get('x-real-ip') || (h.get('x-forwarded-for') || '').split(',')[0] || 'unknown').trim().slice(0, 64);
}

/** Same-origin check for state-changing requests that are not server actions. */
export async function sameOrigin() {
  const h = await headers();
  const origin = h.get('origin');
  if (!origin) return false;
  try { return new URL(origin).host === (h.get('x-forwarded-host') || h.get('host')); } catch { return false; }
}

const DUMMY = bcrypt.hashSync('not-a-real-password', 12);

export type LoginResult = 'ok' | 'bad' | 'locked';

export async function login(email: string, password: string, otp: string): Promise<LoginResult> {
  const mail = email.trim().toLowerCase().slice(0, 200);
  const keys = [`ip:${await clientIp()}`, `email:${mail}`];
  const since = new Date(Date.now() - WINDOW_MS);
  const counts = await Promise.all(keys.map((key) => db.loginAttempt.count({ where: { key, createdAt: { gte: since } } })));
  if (counts.some((n) => n >= MAX_FAILS)) return 'locked';

  const user = await db.adminUser.findUnique({ where: { email: mail } });
  const pwOk = await bcrypt.compare(password.slice(0, 200), user?.passwordHash ?? DUMMY); // same work whether or not the user exists
  let ok = !!user && pwOk;
  let step = 0;
  if (ok && user!.totpEnabled) {
    const s = verifyTotp(user!.totpSecret, otp, user!.lastTotpStep);
    if (s === null) ok = false; else step = s;
  }
  if (!ok) {
    await db.loginAttempt.createMany({ data: keys.map((key) => ({ key })) });
    await db.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 3600_000) } } });
    return 'bad';
  }
  await db.loginAttempt.deleteMany({ where: { key: { in: keys } } });
  if (step) await db.adminUser.update({ where: { id: user!.id }, data: { lastTotpStep: step } });
  await startSession(user!.id, user!.role, user!.tokenVersion);
  return 'ok';
}

export async function startSession(uid: number, role: string, ver: number) {
  const token = await new SignJWT({ uid, role, ver })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(authSecret());
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, sameSite: 'strict', secure: PROD, path: '/', maxAge: SESSION_HOURS * 3600 });
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Verifies the signature AND that the account still exists and the session was not revoked. */
export async function getSession() {
  const jar = await cookies();
  const t = jar.get(COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, authSecret(), { algorithms: ['HS256'] });
    const user = await db.adminUser.findUnique({ where: { id: Number(payload.uid) }, select: { id: true, role: true, tokenVersion: true } });
    if (!user || user.tokenVersion !== Number(payload.ver)) return null;
    return { uid: user.id, role: user.role };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s) throw new Error('Unauthorized');
  return s;
}
