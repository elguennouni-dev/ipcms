import { getSettings, getIndexNowKey, siteUrl } from '@/lib/settings';
import { robotsBody, llmsBody, agentsBody, humansBody, securityBody } from '@/lib/textfiles';
import { Head, Saved, Toggle } from '@/components/AdminUI';
import { saveCrawlers, saveFiles, saveIndexNow, saveSeo, saveSeoPages, submitAllIndexNow } from '../actions';

export default async function Seo({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const s = await getSettings();
  const base = siteUrl();
  const key = await getIndexNowKey();
  const [robots, llms, agents, humans, security] = await Promise.all([robotsBody(), llmsBody(), agentsBody(), humansBody(), securityBody()]);
  const FILES: [string, string, string, string][] = [
    ['llmsTxt', 'llms.txt', 'A readable summary of your site for AI assistants (ChatGPT, Claude, Perplexity). Auto-generated from your guides and posts.', llms],
    ['agentsTxt', 'agents.txt', 'Rules for AI agents acting on your site. An emerging convention, not enforced by search engines.', agents],
    ['humansTxt', 'humans.txt', 'Credits and site information.', humans],
    ['securityTxt', '.well-known/security.txt', 'Where people can report security problems.', security]
  ];
  return (
    <>
      <Head title="SEO & analytics" sub="Everything WordPress SEO plugins do: titles, sitemap, robots, redirects, schema and instant indexing." />
      <Saved sp={sp} />
      {sp.error === 'indexnow' && <div className="er" role="alert">IndexNow did not accept the request. It only works on a live domain (not localhost) with indexing allowed.</div>}
      <div className="cols2">
        <div>
          <form action={saveSeo} className="box">
            <h2>Home page &amp; verification</h2>
            <div className="f"><label htmlFor="st">Home page title (under 60 characters)</label><input id="st" name="seoTitle" className="in" defaultValue={s.seoTitle} maxLength={120} /></div>
            <div className="f"><label htmlFor="sd">Home page meta description (under 160)</label><textarea id="sd" name="seoDescription" defaultValue={s.seoDescription} maxLength={300} /></div>
            <div className="f"><label htmlFor="gs">Google Search Console verification</label><input id="gs" name="gscVerification" className="in" defaultValue={s.gscVerification} placeholder="google-site-verification=…" /></div>
            <div className="f"><label htmlFor="bv">Bing Webmaster verification (msvalidate.01 content)</label><input id="bv" name="bingVerification" className="in" defaultValue={s.bingVerification} /></div>
            <div className="f"><label htmlFor="ga">Google Analytics 4 ID (loads only after cookie consent)</label><input id="ga" name="ga4" className="in" defaultValue={s.ga4} placeholder="G-XXXXXXXXXX" /></div>
            <div className="f"><label htmlFor="tw">X / Twitter handle</label><input id="tw" name="twitterHandle" className="in" defaultValue={s.twitterHandle} placeholder="@yourbrand" /></div>
            <div className="f"><label htmlFor="sa">Social profile URLs (one per line, for Organization schema)</label><textarea id="sa" name="sameAs" defaultValue={s.sameAs} style={{ minHeight: 80 }} /></div>
            <Toggle name="schemaEnabled" on={s.schemaEnabled === '1'} label="Structured data (JSON-LD)" desc="Organization, WebSite, FAQ, Product offers, Article and Breadcrumbs." />
            <button className="btn">Save</button>
          </form>

          <form action={saveSeoPages} className="box">
            <h2>Titles &amp; descriptions of other pages</h2>
            {[['faq', 'FAQ page'], ['guides', 'Guides index'], ['blog', 'Blog index']].map(([k, l]) => (
              <div key={k} style={{ borderTop: '1px solid #ECEEF5', paddingTop: 14, marginTop: 14 }}>
                <b>{l}</b>
                <div className="f" style={{ marginTop: 8 }}><label htmlFor={`${k}t`}>Title</label><input id={`${k}t`} name={`${k}Title`} className="in" defaultValue={s[`${k}Title`]} /></div>
                <div className="f"><label htmlFor={`${k}d`}>Description</label><textarea id={`${k}d`} name={`${k}Description`} defaultValue={s[`${k}Description`]} style={{ minHeight: 70 }} /></div>
              </div>
            ))}
            <button className="btn">Save</button>
            <div className="sub" style={{ marginTop: 10 }}>Article titles, descriptions, canonicals and noindex are set inside each article.</div>
          </form>
        </div>

        <div>
          <form action={saveCrawlers} className="box">
            <h2>Crawlers &amp; robots.txt</h2>
            <Toggle name="allowIndexing" on={s.allowIndexing === '1'} label="Allow search engines" desc="Turn off while building: adds noindex, empties the sitemap and blocks everything in robots.txt." />
            <div className="f" style={{ marginTop: 10 }}><label htmlFor="ai">AI crawlers (GPTBot, ClaudeBot, Google-Extended, CCBot...)</label>
              <select id="ai" name="aiBots" defaultValue={s.aiBots}><option value="allow">Allow (helps appear in AI answers)</option><option value="block">Block</option></select></div>
            <div className="f"><label htmlFor="rb">Custom robots.txt (empty = automatic)</label><textarea id="rb" name="robotsTxt" defaultValue={s.robotsTxt} placeholder={robots} style={{ minHeight: 150, fontFamily: 'ui-monospace,monospace', fontSize: 13 }} /></div>
            <div className="row2"><button className="btn">Save</button><a className="btn out" href="/robots.txt" target="_blank">View robots.txt</a><a className="btn out" href="/sitemap.xml" target="_blank">View sitemap.xml</a><a className="btn out" href="/feed.xml" target="_blank">RSS feed</a></div>
          </form>

          <form action={saveIndexNow} className="box">
            <h2>Instant indexing (IndexNow)</h2>
            <div className="sub" style={{ marginBottom: 8 }}>Pings Bing, Yandex and other IndexNow engines the moment you publish. Key file: <code>{base}/{key}.txt</code></div>
            <Toggle name="indexnowEnabled" on={s.indexnowEnabled === '1'} label="Notify search engines on publish" />
            <div className="row2"><button className="btn">Save</button><button className="btn out" formAction={submitAllIndexNow}>Submit all URLs now</button></div>
            <div className="sub" style={{ marginTop: 10 }}>Google does not use IndexNow. For Google, add the site in Search Console and submit <code>{base}/sitemap.xml</code>.</div>
          </form>

          <form action={saveFiles} className="box">
            <h2>Text files</h2>
            <div className="sub" style={{ marginBottom: 8 }}>Leave a field empty to use the automatic version (shown as the placeholder).</div>
            {FILES.map(([name, label, help, auto]) => (
              <details key={name} style={{ borderTop: '1px solid #ECEEF5', padding: '12px 0' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{label} <a href={label.startsWith('.') ? `/${label}` : `/${label}`} target="_blank" style={{ fontWeight: 400, fontSize: 13, marginLeft: 8, color: '#1D3FB8' }}>view</a></summary>
                <div className="sub" style={{ margin: '6px 0 8px' }}>{help}</div>
                <textarea name={name} defaultValue={s[name]} placeholder={auto} style={{ minHeight: 180, fontFamily: 'ui-monospace,monospace', fontSize: 13 }} />
              </details>
            ))}
            <button className="btn" style={{ marginTop: 10 }}>Save files</button>
          </form>
        </div>
      </div>
    </>
  );
}
