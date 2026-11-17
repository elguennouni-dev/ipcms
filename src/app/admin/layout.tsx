import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { AdminNav } from '@/components/AdminNav';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sess = await getSession();
  if (!sess) return <div className="adm">{children}</div>;
  const [newOrders, dmcaOpen, s] = await Promise.all([db.order.count({ where: { status: 'New' } }), db.dmcaNotice.count({ where: { status: 'Open' } }), getSettings()]);
  return (
    <div className="adm">
      <AdminNav newOrders={newOrders} dmcaOpen={dmcaOpen} siteName={s.siteName} />
      <main>{children}</main>
    </div>
  );
}
