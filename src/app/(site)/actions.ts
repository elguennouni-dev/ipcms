'use server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { db } from '@/lib/db';

export type FormState = { ok?: boolean; error?: string };

const hits = new Map<string, number[]>();
function limited(key: string, max = 5, windowMs = 3600_000) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) { hits.set(key, arr); return true; }
  arr.push(now); hits.set(key, arr);
  return false;
}
async function ip() {
  const h = await headers();
  return (h.get('x-forwarded-for') || h.get('x-real-ip') || 'unknown').split(',')[0].trim();
}

const orderSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  whatsapp: z.string().trim().regex(/^[+0-9()\s-]{7,20}$/, 'Please enter a valid WhatsApp number'),
  email: z.string().trim().email('Please enter a valid email').or(z.literal('')).optional(),
  plan: z.string().trim().max(20)
});

export async function submitOrder(_: FormState, fd: FormData): Promise<FormState> {
  if (String(fd.get('website') || '')) return { ok: true }; // honeypot
  if (limited('order:' + (await ip()))) return { error: 'Too many requests. Please try again later or message us on WhatsApp.' };
  const parsed = orderSchema.safeParse({ name: fd.get('name'), whatsapp: fd.get('whatsapp'), email: fd.get('email') || '', plan: fd.get('plan') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, whatsapp, email, plan } = parsed.data;
  let planName = '24-Hour Free Trial';
  if (plan !== 'trial') {
    const p = await db.plan.findUnique({ where: { slug: plan } });
    if (!p) return { error: 'Please choose a plan.' };
    planName = p.name;
  }
  await db.order.create({ data: { name, whatsapp, email: email || '', planSlug: plan, planName } });
  return { ok: true };
}

const dmcaSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email('Please enter a valid email'),
  work: z.string().trim().min(3).max(2000),
  location: z.string().trim().min(3).max(4000),
  signature: z.string().trim().min(2).max(120),
  agree: z.literal('on', { errorMap: () => ({ message: 'Please confirm the declaration.' }) })
});

export async function submitDmca(_: FormState, fd: FormData): Promise<FormState> {
  if (String(fd.get('website') || '')) return { ok: true };
  if (limited('dmca:' + (await ip()), 3)) return { error: 'Too many requests. Please email us instead.' };
  const parsed = dmcaSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { agree: _a, ...data } = parsed.data;
  await db.dmcaNotice.create({ data });
  return { ok: true };
}
