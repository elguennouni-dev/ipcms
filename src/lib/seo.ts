import { headingsOf, stripMarkdown, wordCount } from './markdown';

export type Check = { id: string; status: 'good' | 'ok' | 'bad'; label: string; msg: string };
export type SeoInput = {
  type: string; title: string; slug: string; excerpt: string; body: string;
  seoTitle: string; seoDescription: string; focusKeyword: string; coverFile?: string; coverAlt?: string; siteHost?: string;
};

export function analyze(i: SeoInput): { score: number; checks: Check[]; words: number } {
  const c: Check[] = [];
  const add = (id: string, status: Check['status'], label: string, msg: string) => c.push({ id, status, label, msg });
  const kw = i.focusKeyword.trim().toLowerCase();
  const title = (i.seoTitle || i.title).trim();
  const desc = (i.seoDescription || i.excerpt).trim();
  const plain = stripMarkdown(i.body);
  const lower = plain.toLowerCase();
  const words = wordCount(i.body);
  const hs = headingsOf(i.body);
  const min = i.type === 'guide' ? 400 : 700;

  if (!kw) add('kw', 'bad', 'Focus keyword', 'Set a focus keyword (the phrase people search for, e.g. "iptv uk").');
  else add('kw', 'good', 'Focus keyword', `Targeting "${kw}".`);

  add('titlelen', title.length >= 30 && title.length <= 60 ? 'good' : title.length > 0 && title.length <= 70 ? 'ok' : 'bad', 'SEO title length',
    `${title.length} characters. Aim for 30-60 so Google does not cut it.`);
  add('desclen', desc.length >= 70 && desc.length <= 160 ? 'good' : desc.length >= 40 && desc.length <= 175 ? 'ok' : 'bad', 'Meta description length',
    `${desc.length} characters. Aim for 70-160.`);

  if (kw) {
    add('kwtitle', title.toLowerCase().includes(kw) ? (title.toLowerCase().startsWith(kw) ? 'good' : 'ok') : 'bad', 'Keyword in SEO title',
      title.toLowerCase().includes(kw) ? (title.toLowerCase().startsWith(kw) ? 'At the start of the title. Great.' : 'Present. Starting the title with it is even better.') : 'Add the keyword to the SEO title.');
    add('kwdesc', desc.toLowerCase().includes(kw) ? 'good' : 'bad', 'Keyword in meta description', desc.toLowerCase().includes(kw) ? 'Present.' : 'Add the keyword to the meta description.');
    add('kwslug', i.slug.includes(kw.replace(/\s+/g, '-')) ? 'good' : 'ok', 'Keyword in URL', i.slug.includes(kw.replace(/\s+/g, '-')) ? 'Present.' : 'Include the keyword in the slug if natural.');
    const first = lower.split(' ').slice(0, 120).join(' ');
    add('kwintro', first.includes(kw) ? 'good' : 'bad', 'Keyword in introduction', first.includes(kw) ? 'Present in the first 120 words.' : 'Mention the keyword in the first paragraph.');
    add('kwh2', hs.some((h) => h.level === 2 && h.text.toLowerCase().includes(kw)) ? 'good' : 'ok', 'Keyword in a subheading', hs.some((h) => h.level === 2 && h.text.toLowerCase().includes(kw)) ? 'Present in an H2.' : 'Use the keyword (or a close variant) in one H2.');
    const count = kw ? lower.split(kw).length - 1 : 0;
    const dens = words ? (count * kw.split(' ').length * 100) / words : 0;
    add('density', dens >= 0.5 && dens <= 2.5 ? 'good' : dens > 0 && dens < 3.5 ? 'ok' : 'bad', 'Keyword density', `${dens.toFixed(1)}% (${count}x). Aim for about 0.5-2.5%.`);
  }

  add('length', words >= min ? 'good' : words >= min * 0.6 ? 'ok' : 'bad', 'Content length', `${words} words. Aim for ${min}+ for this content type.`);
  add('h2', hs.filter((h) => h.level === 2).length >= 2 ? 'good' : 'bad', 'Subheadings', `${hs.filter((h) => h.level === 2).length} H2 headings. Use at least 2 to structure the page.`);

  const links = [...i.body.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map((m) => m[1]);
  const internal = links.filter((l) => l.startsWith('/') || (i.siteHost && l.includes(i.siteHost))).length;
  const external = links.filter((l) => /^https?:\/\//.test(l) && !(i.siteHost && l.includes(i.siteHost))).length;
  add('internal', internal >= 1 ? 'good' : 'bad', 'Internal links', internal ? `${internal} internal link(s).` : 'Link to at least one other page (for example /#plans or another guide).');
  add('external', external >= 1 ? 'good' : 'ok', 'Outbound links', external ? `${external} outbound link(s).` : 'Consider linking to one authoritative source.');

  if (i.coverFile) add('cover', i.coverAlt ? (kw && i.coverAlt.toLowerCase().includes(kw) ? 'good' : 'ok') : 'bad', 'Cover image alt text', i.coverAlt ? 'Alt text set.' : 'Add alt text to the cover image.');
  else add('cover', 'ok', 'Cover image', 'Add a cover image for social sharing and cards.');

  const sentences = plain.split(/[.!?]+\s/).filter(Boolean);
  const avg = sentences.length ? words / sentences.length : 0;
  add('sentences', avg > 0 && avg <= 20 ? 'good' : avg <= 26 ? 'ok' : 'bad', 'Sentence length', `${avg.toFixed(0)} words on average. Shorter is easier to read.`);
  const longParas = i.body.split(/\n\s*\n/).filter((p) => p.trim().split(/\s+/).length > 150).length;
  add('paras', longParas === 0 ? 'good' : 'ok', 'Paragraph length', longParas ? `${longParas} paragraph(s) over 150 words. Split them.` : 'Paragraphs are a good length.');
  add('slug', i.slug.length > 0 && i.slug.length <= 60 ? 'good' : 'ok', 'URL length', `${i.slug.length} characters. Keep it short and descriptive.`);

  const pts = c.reduce((s, x) => s + (x.status === 'good' ? 100 : x.status === 'ok' ? 55 : 0), 0);
  return { score: Math.round(pts / c.length), checks: c, words };
}
