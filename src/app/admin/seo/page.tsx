import { getSettings, siteUrl } from '@/lib/settings';
import { Head, Saved, Toggle } from '@/components/AdminUI';
import { saveSeo } from '../actions';

export default async function Seo({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const s = await getSettings();
  const base = siteUrl();
  return (
    <>
      <Head title="SEO & analytics" sub="Control how Google sees and shows your site." />
      <Saved sp={sp} />
      <div className="cols2">
        <form action={saveSeo} className="box">
          <h2>Search appearance (home page)</h2>
          <div className="f"><label htmlFor="st">Page title (aim for under 60 characters)</label><input id="st" name="seoTitle" className="in" defaultValue={s.seoTitle} maxLength={120} /></div>
          <div className="f"><label htmlFor="sd">Meta description (aim for under 160 characters)</label><textarea id="sd" name="seoDescription" defaultValue={s.seoDescription} maxLength={300} /></div>
          <h2 style={{ marginTop: 24 }}>Google &amp; analytics</h2>
          <div className="f"><label htmlFor="gs">Search Console verification (meta tag content, or the full code)</label><input id="gs" name="gscVerification" className="in" defaultValue={s.gscVerification} placeholder="google-site-verification=…" /></div>
          <div className="f"><label htmlFor="ga">Google Analytics 4 ID (loads only after cookie consent)</label><input id="ga" name="ga4" className="in" defaultValue={s.ga4} placeholder="G-XXXXXXXXXX" /></div>
          <Toggle name="allowIndexing" on={s.allowIndexing === '1'} label="Allow search engines" desc="Turn off while building: adds noindex and blocks crawling in robots.txt." />
          <button className="btn">Save SEO settings</button>
        </form>
        <div className="box">
          <h2>Google preview</h2>
          <div className="pre"><div className="sub">{base.replace(/^https?:\/\//, '')}</div><div className="t">{s.seoTitle}</div><div className="sub" style={{ color: '#4A4F66' }}>{s.seoDescription}</div></div>
          <h2 style={{ marginTop: 24 }}>Generated automatically</h2>
          <ul style={{ paddingLeft: 18, lineHeight: 1.9 }}>
            <li><a href="/sitemap.xml" target="_blank">/sitemap.xml</a></li>
            <li><a href="/robots.txt" target="_blank">/robots.txt</a></li>
            <li>Structured data: Organization, WebSite, FAQ, Product offers</li>
            <li>Canonical URLs, Open Graph &amp; Twitter cards (upload the Social share image in Media)</li>
          </ul>
          <div className="sub">After launch: add the domain in Google Search Console and submit the sitemap.</div>
        </div>
      </div>
    </>
  );
}
