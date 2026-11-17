'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/admin/actions';

const items: [string, string, string, string?][] = [
  ['/admin', 'Orders', 'OPERATIONS'], ['/admin/plans', 'Plans & prices', ''],
  ['/admin/sections', 'Pages & sections', 'WEBSITE'], ['/admin/content', 'Site content', ''], ['/admin/media', 'Media library', ''],
  ['/admin/legal', 'Legal & DMCA', 'COMPLIANCE'], ['/admin/seo', 'SEO & analytics', 'GROWTH'], ['/admin/settings', 'Settings & payments', 'SYSTEM']
];

export function AdminNav({ newOrders, dmcaOpen, siteName }: { newOrders: number; dmcaOpen: number; siteName: string }) {
  const path = usePathname();
  return (
    <aside>
      <div className="logo"><i style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--ac)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>▶</i>{siteName} CMS</div>
      <nav aria-label="Admin">
        {items.map(([href, label, group]) => {
          const on = href === '/admin' ? path === '/admin' : path.startsWith(href);
          const chip = href === '/admin' ? newOrders : href === '/admin/legal' ? dmcaOpen : 0;
          return (
            <div key={href}>
              {group && <div className="grp">{group}</div>}
              <Link href={href} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>{label}{chip > 0 && <span className="chip">{chip}</span>}</Link>
            </div>
          );
        })}
      </nav>
      <form action={logoutAction} style={{ marginTop: 'auto' }}><button className="lo">Log out</button></form>
    </aside>
  );
}
