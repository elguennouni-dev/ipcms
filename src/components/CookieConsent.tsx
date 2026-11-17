'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';

export function CookieConsent({ banner, ga4, accent }: { banner: boolean; ga4: string; accent?: string }) {
  const [choice, setChoice] = useState<string | null>('pending');
  useEffect(() => {
    try { setChoice(localStorage.getItem('cookie-consent')); } catch { setChoice(null); }
  }, []);
  const save = (v: string) => { try { localStorage.setItem('cookie-consent', v); } catch {} setChoice(v); };
  // If the banner is disabled in the CMS, analytics only loads with explicit consent anyway.
  const analytics = !!ga4 && choice === 'all';
  return (
    <>
      {analytics && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga4}',{anonymize_ip:true});`}</Script>
        </>
      )}
      {banner && choice === null && (
        <div className="cookie" role="dialog" aria-label="Cookie consent">
          <h3 style={{ fontSize: 17 }}>We value your privacy</h3>
          <p>We use essential cookies to run the site and, with your consent, analytics cookies to improve it. See our <Link href="/legal/cookies" style={{ color: 'var(--acl)', textDecoration: 'underline' }}>Cookie Policy</Link>.</p>
          <div className="row">
            <button className="btn sm" style={{ flex: '1 1 100px', background: accent }} onClick={() => save('all')}>Accept all</button>
            <button className="btn sm ghost" style={{ flex: '1 1 100px' }} onClick={() => save('essential')}>Essential only</button>
          </div>
        </div>
      )}
    </>
  );
}
