import { notFound, permanentRedirect, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Page not found', robots: { index: false, follow: false } };

/** Handles every URL that has no page: 301/302 redirects from the CMS, otherwise a logged 404. */
export default async function CatchAll({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = ('/' + slug.map((s) => decodeURIComponent(s)).join('/')).toLowerCase().replace(/\/+$/, '') || '/';
  const hit = await db.redirect.findUnique({ where: { fromPath: path } });
  if (hit) {
    await db.redirect.update({ where: { id: hit.id }, data: { hits: { increment: 1 } } }).catch(() => {});
    if (hit.code === 302) redirect(hit.toPath);
    permanentRedirect(hit.toPath);
  }
  if (path.length < 200) {
    try {
      const exists = await db.notFoundLog.findUnique({ where: { path } });
      if (exists) await db.notFoundLog.update({ where: { path }, data: { hits: { increment: 1 }, lastAt: new Date() } });
      else if ((await db.notFoundLog.count()) < 2000) await db.notFoundLog.create({ data: { path } });
    } catch {}
  }
  notFound();
}
