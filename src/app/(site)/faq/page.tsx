import Link from 'next/link';
import type { Metadata } from 'next';
import { getFaqs } from '@/lib/data';
import { getSettings, siteUrl } from '@/lib/settings';
import { Breadcrumbs, crumbLd } from '@/components/Breadcrumbs';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: { absolute: s.faqTitle }, description: s.faqDescription, alternates: { canonical: '/faq' } };
}

export default async function FaqPage() {
  const [faqs, s] = await Promise.all([getFaqs(), getSettings()]);
  const base = siteUrl();
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'FAQ', href: '/faq' }];
  const ld: object[] = [crumbLd(crumbs, base)];
  if (faqs.length && s.schemaEnabled === '1') ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) });
  return (
    <div className="wrap" style={{ paddingBottom: 24 }}>
      <Breadcrumbs items={crumbs} />
      <div className="pagehead"><div className="eyebrow">FAQ</div><h1>Frequently asked questions</h1><p>Everything about devices, the free trial, setup, payment and support. Cannot find your answer? Message us on WhatsApp.</p></div>
      <div className="faq" style={{ margin: '36px 0 0', maxWidth: 820 }}>
        {faqs.map((f, i) => <details key={f.id} open={i === 0}><summary>{f.question}</summary><p>{f.answer}</p></details>)}
      </div>
      <div className="cta" style={{ margin: '48px 0 0', maxWidth: 820 }}>
        <div><h2>Still have a question?</h2><p className="muted" style={{ margin: '6px 0 0' }}>Start with the free 24-hour trial and we will help you set up.</p></div>
        <Link href="/#order" className="btn">Request free trial</Link>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    </div>
  );
}
