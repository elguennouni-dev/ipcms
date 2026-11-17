import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { getLegalPages, getMedia, mediaUrl } from '@/lib/data';
import { CookieConsent } from '@/components/CookieConsent';
import { WaIcon } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, legal, media] = await Promise.all([getSettings(), getLegalPages(), getMedia()]);
  const logo = mediaUrl(media['logo']);
  return (
    <>
      {s.announceEnabled === '1' && s.announceText && <div className="announce">{s.announceText}</div>}
      <div className="hdrbar">
        <div className="wrap">
          <header className="hdr">
            <Link href="/" aria-label={s.siteName}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo || '/brand/logo.png'} alt={s.siteName} className="brandlogo" width={171} height={56} />
            </Link>
            <nav className="nav" aria-label="Main">
              <Link href="/#features">Features</Link>
              <Link href="/#plans">Plans</Link>
              <Link href="/#how">How it works</Link>
              <Link href="/#faq">FAQ</Link>
            </nav>
            <Link href="/#order" className="btn sm">Get started</Link>
          </header>
        </div>
      </div>
      {children}
      <footer className="ftr">
        <div className="wrap">
          <div className="cols">
            <div style={{ maxWidth: 380 }}>
              <span className="plate"><img src={logo || '/brand/logo.png'} alt={s.siteName} loading="lazy" /></span>
              <p className="muted" style={{ fontSize: 14, margin: '10px 0 0' }}>Authorised reseller of licensed streaming subscriptions for customers in the United Kingdom. Content availability varies by plan and region.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48 }}>
              <div><h4>Company</h4><Link href="/#plans">Plans</Link><Link href="/#faq">FAQ</Link><Link href="/legal/contact">Contact</Link></div>
              <div><h4>Legal</h4>{legal.filter((l) => l.slug !== 'contact').map((l) => <Link key={l.slug} href={`/legal/${l.slug}`}>{l.title}</Link>)}</div>
            </div>
          </div>
          <small>
            {s.siteName} is an independent reseller. We are not affiliated with, endorsed by or sponsored by any broadcaster, studio, sports body or trademark owner. All names, logos and artwork shown belong to their respective owners and are used for identification only. We respect intellectual property rights and respond to valid notices under our DMCA / Copyright policy.
          </small>
          <small>© {new Date().getFullYear()} {s.companyName} · Company no. {s.companyNumber} · Registered in England &amp; Wales. All rights reserved.</small>
        </div>
      </footer>
      {s.whatsappFloat === '1' && (
        <a href={`https://wa.me/${s.whatsapp}`} className="wafab" aria-label="Chat on WhatsApp" target="_blank" rel="noopener noreferrer"><WaIcon s={28} /></a>
      )}
      <CookieConsent banner={s.cookieBanner === '1'} ga4={s.ga4.trim()} />
    </>
  );
}
