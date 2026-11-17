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
      <Link href="/admin" className="plate" aria-label={`${siteName} admin`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt={siteName} />
      </Link>
      <div style={{ padding: '0 14px 8px', fontSize: 12, color: '#7C8BC4', letterSpacing: '.1em', fontWeight: 600 }}>CMS</div>
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
