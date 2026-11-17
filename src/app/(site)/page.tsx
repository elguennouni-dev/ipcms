import Link from 'next/link';
import { getSettings, siteUrl } from '@/lib/settings';
import { getFaqs, getMedia, getPlans, getReviews, getSections } from '@/lib/data';
import { Slot } from '@/components/Slot';
import { PlanPick } from '@/components/PlanPick';
import { OrderForm } from '@/components/OrderForm';
import { Check, ImgIcon } from '@/components/Icons';

export const dynamic = 'force-dynamic';

const TILES = [
  ['#1E3A8A,#0B1230', '#BFD0FF', 'SPORT', 'Live matches'], ['#7C2D6B,#220B1E', '#F5C2E8', 'MOVIES', 'Blockbusters'], ['#0F766E,#04201E', '#A7F3E6', 'SERIES', 'Box sets'],
  ['#B45309,#2A1203', '#FFD9A8', 'KIDS', 'Family time'], ['#0B3FB3,#071A5C', '#BCD0FF', 'NEWS', '24/7 channels'], ['#9F1239,#2B0612', '#FFC0CF', 'DOCS', 'Discover']
];
const GRADS = ['#1E3A8A,#0B1230', '#7C2D6B,#220B1E', '#0F766E,#04201E', '#B45309,#2A1203', '#0B3FB3,#071A5C', '#9F1239,#2B0612', '#0E7490,#06212A', '#1D4ED8,#0A1B4D', '#15803D,#052E16', '#BE185D,#2D0A1B', '#475569,#0F172A', '#A16207,#271903'];
const FEATURES = [
  ['Sharp HD & 4K', 'Stable, high-quality streams tuned for big screens and fast UK broadband.', 'M3 4h18v12H3zM8 20h8M12 16v4'],
  ['Works on every device', 'Smart TVs, Fire Stick, Android, iPhone, iPad, MAG boxes and more.', 'M7 2h10v20H7zM11 18h2'],
  ['Fast activation', 'No sign-up, no passwords to invent. Order, and we send your details on WhatsApp.', 'M13 2L4 14h7l-1 8 9-12h-7l1-8z'],
  ['Real human support', 'Message us any time. A real person helps you install and fix issues fast.', 'M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.2A8 8 0 1 1 21 12z']
];

export default async function Home() {
  const [s, secs, plans, faqs, reviews, media] = await Promise.all([getSettings(), getSections(), getPlans(), getFaqs(), getReviews(), getMedia()]);
  const url = siteUrl();
  const trial = s.trialEnabled === '1';
  const defaultPlan = plans.find((p) => p.badge === 'MOST POPULAR')?.slug || plans[0]?.slug || 'trial';
  const hasChannels = Array.from({ length: 12 }, (_, i) => media[`channel-${i + 1}`]).some(Boolean);
  const hasPosters = Array.from({ length: 12 }, (_, i) => media[`poster-${i + 1}`]).some(Boolean);

  const blocks: Record<string, React.ReactNode> = {
    hero: (
      <section className="wrap hero" id="top">
        <div className="l">
          <div className="pill"><b />Authorised reseller · Serving the United Kingdom</div>
          <h1>{s.heroTitle}</h1>
          <p className="lead">{s.heroSub}</p>
          <div className="row" style={{ marginTop: 36 }}>
            <PlanPick slug="trial" label={s.heroCta} className="btn" />
            <Link href="#plans" className="btn ghost">View plans</Link>
          </div>
          <div className="ticks"><span><Check />No account needed</span><span><Check />Set up over WhatsApp</span><span><Check />Friendly UK support</span></div>
        </div>
        <div className="r">
          {media['hero'] ? (
            <Slot media={media} slot="hero" label="Hero" style={{ aspectRatio: '4/3', borderRadius: 28 }} priority />
          ) : (
            <div className="frame"><div className="tiles">
              {TILES.map((t, i) => (
                <div key={i} className="tile" style={{ background: `linear-gradient(160deg,${t[0]})` }}><small style={{ color: t[1] }}>{t[2]}</small><span>{t[3]}</span></div>
              ))}
            </div></div>
          )}
        </div>
      </section>
    ),
    stats: (
      <section className="wrap" style={{ paddingTop: 56 }}>
        <div className="stats">
          <div><b>{s.statChannels}</b><span>Live channels</span></div>
          <div><b>{s.statVod}</b><span>Films &amp; series on demand</span></div>
          <div><b>4K</b><span>Ultra HD quality</span></div>
          <div><b>24/7</b><span>Customer support</span></div>
        </div>
      </section>
    ),
    features: (
      <section className="wrap sec" id="features">
        <div style={{ maxWidth: 620 }}><div className="eyebrow">Why {s.siteName}</div><h2 className="h2">Built for the way you actually watch</h2></div>
        <div className="grid" style={{ marginTop: 48 }}>
          {FEATURES.map(([t, d, p]) => (
            <div className="card" key={t}>
              <div className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7FA6FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={p} /></svg></div>
              <h3>{t}</h3><p>{d}</p>
            </div>
          ))}
        </div>
      </section>
    ),
    channels: (
      <section className="wrap sec" id="channels">
        <div style={{ maxWidth: 620 }}><div className="eyebrow">Live TV</div><h2 className="h2">Thousands of channels in one place</h2></div>
        <div className="chgrid" style={{ marginTop: 40 }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).filter((i) => !hasChannels || media[`channel-${i}`]).map((i) => (
            <Slot key={i} media={media} slot={`channel-${i}`} label={`CHANNEL ${i}`} className="ch" />
          ))}
        </div>
      </section>
    ),
    sport: (
      <section className="wrap" style={{ paddingTop: 64 }}>
        <div className="banner">
          {media['sport-banner'] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={`/media/${media['sport-banner'].file}?v=${media['sport-banner'].v}`} alt={media['sport-banner'].alt || 'Live sport'} loading="lazy" />}
          <div className="in">
            <span className="live">LIVE SPORT</span>
            <h2 style={{ fontSize: 38, margin: '14px 0 8px', fontWeight: 700 }}>Never miss a big match night</h2>
            <p style={{ margin: 0, color: '#D3DBFF' }}>Football, rugby, cricket, boxing and more, live in HD and 4K.</p>
          </div>
        </div>
      </section>
    ),
    vod: (
      <section className="wrap sec" id="vod">
        <div style={{ maxWidth: 620 }}><div className="eyebrow">On demand</div><h2 className="h2">Films and box sets, whenever you want</h2></div>
        <div className="pgrid" style={{ marginTop: 40 }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).filter((i) => !hasPosters || media[`poster-${i}`]).map((i) => (
            <Slot key={i} media={media} slot={`poster-${i}`} label={`POSTER ${i}`} className="poster" style={hasPosters ? undefined : { background: `linear-gradient(160deg,${GRADS[i - 1]})`, color: '#E6E8F2' }} />
          ))}
        </div>
      </section>
    ),
    devices: (
      <section className="wrap" style={{ paddingTop: 96 }}>
        <div className="dev">
          <div>
            <div className="eyebrow">Watch anywhere</div>
            <h2 className="h2" style={{ fontSize: 38 }}>Your living room, your phone, your laptop</h2>
            <p className="muted" style={{ marginTop: 16 }}>Install on Smart TVs, Fire Stick, Android, iPhone, iPad, MAG boxes and computers. We guide you step by step on WhatsApp.</p>
          </div>
          <div><Slot media={media} slot="devices" label="DEVICES" className="pic" /></div>
        </div>
      </section>
    ),
    plans: (
      <section className="wrap sec" id="plans">
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div className="eyebrow">Plans &amp; pricing</div>
          <h2 className="h2">Simple plans. The longer you stay, the more you save.</h2>
        </div>
        <div className="plans">
          {plans.map((p) => {
            const feat = !!p.badge;
            return (
              <div key={p.slug} className={`plan${feat ? ' feat' : ''}`}>
                {p.badge && <div className={`badge${p.months >= 12 ? ' gold' : ''}`}>{p.badge}</div>}
                <h3>{p.name}</h3>
                <div className="price">£{p.price}</div>
                <div className="muted" style={{ fontSize: 14, minHeight: 22 }}>{p.months > 1 ? `£${(p.price / p.months).toFixed(2)} per month` : 'Flexible, cancel anytime'}</div>
                <ul>{p.features.split('\n').filter(Boolean).map((f) => <li key={f}>{f}</li>)}</ul>
                <PlanPick slug={p.slug} label="Choose plan" className={`btn ${feat ? 'light' : 'ghost'}`} />
              </div>
            );
          })}
        </div>
        {trial && (
          <div className="trial">
            <div><h3>Not sure yet? Try it free for 24 hours.</h3><p className="muted" style={{ margin: '4px 0 0' }}>Test the channels, the quality and your devices before you commit.</p></div>
            <PlanPick slug="trial" label="Request free trial" className="btn wa" />
          </div>
        )}
      </section>
    ),
    how: (
      <section className="wrap sec steps" id="how">
        <div style={{ maxWidth: 620 }}><div className="eyebrow">How it works</div><h2 className="h2">Watching in three steps</h2></div>
        <div className="grid" style={{ marginTop: 48 }}>
          {[['01', 'Choose your plan', 'Pick a plan, or start with the 24-hour free trial.'], ['02', 'Send your request', 'Leave your name and WhatsApp number, or message us directly.'], ['03', 'Start watching', 'We reply on WhatsApp with your login and a quick setup guide.']].map(([n, t, d]) => (
            <div className="card" key={n} style={{ padding: 32 }}><div className="num">{n}</div><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>
    ),
    reviews: reviews.length ? (
      <section className="wrap sec" id="reviews">
        <div style={{ maxWidth: 620 }}><div className="eyebrow">Reviews</div><h2 className="h2">What customers say</h2></div>
        <div className="grid" style={{ marginTop: 40 }}>
          {reviews.map((r) => (
            <div className="card review" key={r.id}><div className="stars" aria-label={`${r.rating} out of 5`}>{'★'.repeat(r.rating)}</div><p style={{ color: '#D8DAE6' }}>{r.text}</p><b style={{ fontSize: 14 }}>{r.author}</b></div>
          ))}
        </div>
      </section>
    ) : null,
    order: (
      <section className="wrap sec" id="order">
        <OrderForm plans={plans.map((p) => ({ slug: p.slug, name: p.name, price: p.price, months: p.months }))} trial={trial} whatsapp={s.whatsapp} defaultPlan={defaultPlan} />
      </section>
    ),
    faq: faqs.length ? (
      <section className="wrap sec" id="faq" style={{ maxWidth: 884 }}>
        <h2 className="h2" style={{ textAlign: 'center', marginTop: 0 }}>Questions, answered</h2>
        <div className="faq">
          {faqs.map((f, i) => (
            <details key={f.id} open={i === 0}><summary>{f.question}</summary><p>{f.answer}</p></details>
          ))}
        </div>
      </section>
    ) : null
  };

  const ld = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: s.siteName, url, logo: `${url}/brand/logo.png`, email: s.supportEmail },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: s.siteName, url },
    ...(faqs.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }] : []),
    ...(plans.length ? [{
      '@context': 'https://schema.org', '@type': 'Product', name: `${s.siteName} streaming subscription`, description: s.seoDescription,
      offers: { '@type': 'AggregateOffer', priceCurrency: 'GBP', lowPrice: Math.min(...plans.map((p) => p.price)), highPrice: Math.max(...plans.map((p) => p.price)), offerCount: plans.length,
        offers: plans.map((p) => ({ '@type': 'Offer', name: p.name, price: p.price, priceCurrency: 'GBP', url: `${url}/#plans`, availability: 'https://schema.org/InStock' })) }
    }] : [])
  ];

  return (
    <>
      {secs.filter((x) => x.visible).map((x) => <div key={x.key}>{blocks[x.key]}</div>)}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    </>
  );
}
