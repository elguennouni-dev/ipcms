import { createHmac, randomBytes } from 'crypto';

const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const newSecret = () => {
  const b = randomBytes(20); let bits = '', out = '';
  for (const x of b) bits += x.toString(2).padStart(8, '0');
  for (let i = 0; i < bits.length; i += 5) out += A[parseInt(bits.slice(i, i + 5), 2)];
  return out;
};
function decode(s: string) {
  let bits = '';
  for (const c of s.replace(/=+$/, '').toUpperCase()) bits += A.indexOf(c).toString(2).padStart(5, '0');
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}
function code(secret: string, step: number) {
  const buf = Buffer.alloc(8); buf.writeBigUInt64BE(BigInt(step));
  const h = createHmac('sha1', decode(secret)).update(buf).digest();
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, '0');
}
/** Returns the matching time step (so it can be stored and never accepted twice) or null. */
export function verifyTotp(secret: string, token: string, after = 0): number | null {
  const t = token.replace(/\s/g, '');
  if (!/^\d{6}$/.test(t)) return null;
  const now = Math.floor(Date.now() / 30000);
  for (const d of [-1, 0, 1]) {
    const step = now + d;
    if (step > after && code(secret, step) === t) return step;
  }
  return null;
}
export const otpauthUri = (secret: string, account: string, issuer: string) =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30`;
