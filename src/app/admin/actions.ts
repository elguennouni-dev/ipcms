'use server';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getSession, login, logout, requireAdmin } from '@/lib/auth';
import { saveSettings } from '@/lib/settings';

const s = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const done = (to: string): never => redirect(`${to}${to.includes('?') ? '&' : '?'}saved=1`);

/* ---------- auth ---------- */
export async function loginAction(fd: FormData) {
  const ok = await login(s(fd, 'email'), String(fd.get('password') ?? ''));
  if (!ok) redirect('/admin/login?error=1');
  redirect('/admin');
}
export async function logoutAction() {
  await logout();
  redirect('/admin/login');
}
export async function changePassword(fd: FormData) {
  const sess = await requireAdmin();
  const pw = String(fd.get('password') ?? '');
  if (pw.length < 10) redirect('/admin/settings?error=pw');
  await db.adminUser.update({ where: { id: sess.uid }, data: { passwordHash: await bcrypt.hash(pw, 12) } });
  done('/admin/settings');
}

/* ---------- orders ---------- */
const ORDER = ['New', 'Contacted', 'Active', 'Done'];
export async function nextOrderStatus(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id'));
  const o = await db.order.findUnique({ where: { id } });
  if (!o) return;
  await db.order.update({ where: { id }, data: { status: ORDER[(ORDER.indexOf(o.status) + 1) % ORDER.length] } });
  revalidatePath('/admin');
}
export async function deleteOrder(fd: FormData) {
  await requireAdmin();
  await db.order.delete({ where: { id: Number(fd.get('id')) } });
  revalidatePath('/admin');
}

/* ---------- plans ---------- */
export async function savePlan(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id'));
  await db.plan.update({
    where: { id },
    data: { name: s(fd, 'name'), price: Math.max(0, Number(fd.get('price') || 0)), badge: s(fd, 'badge'), features: String(fd.get('features') ?? ''), visible: fd.get('visible') === 'on' }
  });
  revalidateTag('plans');
  done('/admin/plans');
}
export async function saveTrial(fd: FormData) {
  await requireAdmin();
  await saveSettings({ trialEnabled: fd.get('trialEnabled') === 'on' ? '1' : '0' });
  done('/admin/plans');
}

/* ---------- sections ---------- */
export async function moveSection(fd: FormData) {
  await requireAdmin();
  const all = await db.section.findMany({ orderBy: { sort: 'asc' } });
  const i = all.findIndex((x) => x.id === Number(fd.get('id')));
  const j = i + (fd.get('dir') === 'up' ? -1 : 1);
  if (i < 0 || j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  await db.$transaction(all.map((x, n) => db.section.update({ where: { id: x.id }, data: { sort: n } })));
  revalidateTag('sections');
  revalidatePath('/admin/sections');
}
export async function toggleSection(fd: FormData) {
  await requireAdmin();
  const x = await db.section.findUnique({ where: { id: Number(fd.get('id')) } });
  if (!x) return;
  await db.section.update({ where: { id: x.id }, data: { visible: !x.visible } });
  revalidateTag('sections');
  revalidatePath('/admin/sections');
}

/* ---------- content ---------- */
export async function saveHero(fd: FormData) {
  await requireAdmin();
  await saveSettings({ heroTitle: s(fd, 'heroTitle'), heroSub: s(fd, 'heroSub'), heroCta: s(fd, 'heroCta'), statChannels: s(fd, 'statChannels'), statVod: s(fd, 'statVod') });
  done('/admin/content');
}
export async function saveFaq(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id') || 0);
  const data = { question: s(fd, 'question'), answer: String(fd.get('answer') ?? '').trim(), visible: fd.get('visible') === 'on' };
  if (!data.question || !data.answer) return done('/admin/content');
  if (id) await db.faqItem.update({ where: { id }, data });
  else await db.faqItem.create({ data: { ...data, sort: (await db.faqItem.count()) + 1 } });
  revalidateTag('faqs');
  done('/admin/content');
}
export async function deleteFaq(fd: FormData) {
  await requireAdmin();
  await db.faqItem.delete({ where: { id: Number(fd.get('id')) } });
  revalidateTag('faqs');
  done('/admin/content');
}
export async function saveReview(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id') || 0);
  const data = { author: s(fd, 'author'), text: String(fd.get('text') ?? '').trim(), rating: Math.min(5, Math.max(1, Number(fd.get('rating') || 5))), visible: fd.get('visible') === 'on' };
  if (!data.author || !data.text) return done('/admin/content');
  if (id) await db.review.update({ where: { id }, data });
  else await db.review.create({ data: { ...data, sort: (await db.review.count()) + 1 } });
  revalidateTag('reviews');
  done('/admin/content');
}
export async function deleteReview(fd: FormData) {
  await requireAdmin();
  await db.review.delete({ where: { id: Number(fd.get('id')) } });
  revalidateTag('reviews');
  done('/admin/content');
}

/* ---------- media ---------- */
const MAX_W: Record<string, number> = { hero: 1400, 'sport-banner': 1600, devices: 1400, logo: 900, og: 1200 };
function maxWidth(slot: string) {
  return MAX_W[slot] ?? (slot.startsWith('poster') ? 600 : 400);
}
export async function uploadMedia(fd: FormData) {
  await requireAdmin();
  const slot = s(fd, 'slot');
  const file = fd.get('file');
  const alt = s(fd, 'alt');
  const row = await db.media.findUnique({ where: { slot } });
  if (!row) return done('/admin/media');
  if (file instanceof File && file.size > 0) {
    if (file.size > 10 * 1024 * 1024) redirect('/admin/media?error=size');
    const dir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    await mkdir(dir, { recursive: true });
    let out: Buffer, info: sharp.OutputInfo;
    try {
      ({ data: out, info } = await sharp(Buffer.from(await file.arrayBuffer()))
        .rotate().resize({ width: maxWidth(slot), withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true }));
    } catch {
      redirect('/admin/media?error=type');
    }
    const name = `${slot}-${Date.now()}.webp`;
    await writeFile(path.join(dir, name), out);
    if (row.file) await unlink(path.join(dir, path.basename(row.file))).catch(() => {});
    await db.media.update({ where: { slot }, data: { file: name, alt, width: info.width, height: info.height } });
  } else {
    await db.media.update({ where: { slot }, data: { alt } });
  }
  revalidateTag('media');
  done('/admin/media');
}
export async function removeMedia(fd: FormData) {
  await requireAdmin();
  const slot = s(fd, 'slot');
  const row = await db.media.findUnique({ where: { slot } });
  if (row?.file) {
    const dir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    await unlink(path.join(dir, path.basename(row.file))).catch(() => {});
    await db.media.update({ where: { slot }, data: { file: '', alt: '', width: 0, height: 0 } });
  }
  revalidateTag('media');
  done('/admin/media');
}

/* ---------- legal ---------- */
export async function saveLegal(fd: FormData) {
  await requireAdmin();
  await db.legalPage.update({ where: { slug: s(fd, 'slug') }, data: { title: s(fd, 'title'), body: String(fd.get('body') ?? '') } });
  revalidateTag('legal');
  done(`/admin/legal?page=${s(fd, 'slug')}`);
}
const DM = ['Open', 'Reviewing', 'Resolved'];
export async function nextDmcaStatus(fd: FormData) {
  await requireAdmin();
  const n = await db.dmcaNotice.findUnique({ where: { id: Number(fd.get('id')) } });
  if (!n) return;
  await db.dmcaNotice.update({ where: { id: n.id }, data: { status: DM[(DM.indexOf(n.status) + 1) % DM.length] } });
  revalidatePath('/admin/legal');
}

/* ---------- seo & settings ---------- */
export async function saveSeo(fd: FormData) {
  await requireAdmin();
  await saveSettings({
    seoTitle: s(fd, 'seoTitle'), seoDescription: s(fd, 'seoDescription'),
    gscVerification: s(fd, 'gscVerification'), ga4: s(fd, 'ga4'),
    allowIndexing: fd.get('allowIndexing') === 'on' ? '1' : '0'
  });
  done('/admin/seo');
}
export async function saveBusiness(fd: FormData) {
  await requireAdmin();
  await saveSettings({
    siteName: s(fd, 'siteName'), whatsapp: s(fd, 'whatsapp').replace(/[^0-9]/g, ''), supportEmail: s(fd, 'supportEmail'), dmcaEmail: s(fd, 'dmcaEmail'),
    companyName: s(fd, 'companyName'), companyNumber: s(fd, 'companyNumber'),
    announceEnabled: fd.get('announceEnabled') === 'on' ? '1' : '0', announceText: s(fd, 'announceText'),
    cookieBanner: fd.get('cookieBanner') === 'on' ? '1' : '0', whatsappFloat: fd.get('whatsappFloat') === 'on' ? '1' : '0'
  });
  done('/admin/settings');
}
export async function savePaypal(fd: FormData) {
  await requireAdmin();
  const vals: Record<string, string> = { paypalEnabled: fd.get('paypalEnabled') === 'on' ? '1' : '0', paypalMode: s(fd, 'paypalMode') || 'sandbox', paypalClientId: s(fd, 'paypalClientId') };
  const secret = s(fd, 'paypalSecret');
  if (secret) vals.paypalSecret = secret; // keep the old secret if the field is left blank
  await saveSettings(vals);
  done('/admin/settings');
}
export async function whoAmI() {
  return getSession();
}
