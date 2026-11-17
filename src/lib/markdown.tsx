import React from 'react';

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const SAFE_HREF = /^(https?:\/\/|\/(?!\/)|#|mailto:|tel:)/i;
const isExternal = (h: string) => /^https?:\/\//i.test(h);

function inline(text: string, base: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const key = `${base}-${i++}`;
    if (t.startsWith('**')) out.push(<strong key={key}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith('`')) out.push(<code key={key}>{t.slice(1, -1)}</code>);
    else if (t.startsWith('*')) out.push(<em key={key}>{t.slice(1, -1)}</em>);
    else {
      const lm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(t)!;
      const href = SAFE_HREF.test(lm[2]) ? lm[2] : '#';
      out.push(<a key={key} href={href} {...(isExternal(href) ? { rel: 'noopener noreferrer', target: '_blank' } : {})}>{lm[1]}</a>);
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export type Heading = { level: 2 | 3; text: string; id: string };

export function headingsOf(md: string): Heading[] {
  const seen = new Map<string, number>();
  const hs: Heading[] = [];
  for (const line of md.split('\n')) {
    const m = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line.trim());
    if (!m) continue;
    const text = m[2].replace(/[*`]/g, '');
    let id = slugify(text) || 'section';
    const n = seen.get(id) || 0; seen.set(id, n + 1);
    if (n) id = `${id}-${n + 1}`;
    hs.push({ level: m[1].length as 2 | 3, text, id });
  }
  return hs;
}

export function renderMarkdown(md: string): React.ReactNode[] {
  const hs = headingsOf(md);
  let hi = 0;
  const out: React.ReactNode[] = [];
  const lines = md.replace(/\r/g, '').split('\n');
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const k = () => `b${out.length}`;
  const flushPara = () => { if (para.length) { out.push(<p key={k()}>{inline(para.join(' '), k())}</p>); para = []; } };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((it, i) => <li key={i}>{inline(it, `${k()}l${i}`)}</li>);
    out.push(list.ordered ? <ol key={k()}>{items}</ol> : <ul key={k()}>{items}</ul>);
    list = null;
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    let m: RegExpExecArray | null;
    if ((m = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line))) {
      flushPara(); flushList();
      const h = hs[hi++];
      out.push(m[1].length === 2 ? <h2 key={k()} id={h?.id}>{inline(m[2], k())}</h2> : <h3 key={k()} id={h?.id}>{inline(m[2], k())}</h3>);
    } else if ((m = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(line))) {
      flushPara(); flushList();
      const src = SAFE_HREF.test(m[2]) ? m[2] : '';
      if (src) out.push(<figure key={k()}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={src} alt={m[1]} loading="lazy" decoding="async" />{m[1] && <figcaption>{m[1]}</figcaption>}</figure>);
    } else if (/^(-{3,}|\*{3,})$/.test(line)) {
      flushPara(); flushList(); out.push(<hr key={k()} />);
    } else if ((m = /^>\s?(.*)$/.exec(line))) {
      flushPara(); flushList(); out.push(<blockquote key={k()}>{inline(m[1], k())}</blockquote>);
    } else if ((m = /^[-*]\s+(.*)$/.exec(line))) {
      flushPara();
      if (!list || list.ordered) { flushList(); list = { ordered: false, items: [] }; }
      list.items.push(m[1]);
    } else if ((m = /^\d+[.)]\s+(.*)$/.exec(line))) {
      flushPara();
      if (!list || !list.ordered) { flushList(); list = { ordered: true, items: [] }; }
      list.items.push(m[1]);
    } else {
      flushList(); para.push(line);
    }
  }
  flushPara(); flushList();
  return out;
}

export const stripMarkdown = (md: string) =>
  md.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[#>*`_-]+/g, ' ').replace(/\s+/g, ' ').trim();

export const wordCount = (md: string) => { const t = stripMarkdown(md); return t ? t.split(' ').length : 0; };
export const readingMinutes = (md: string) => Math.max(1, Math.round(wordCount(md) / 220));

export type FaqPair = { q: string; a: string };
export function parseFaq(src: string): FaqPair[] {
  const pairs: FaqPair[] = [];
  for (const block of src.replace(/\r/g, '').split(/\n\s*\n/)) {
    const q = /^Q:\s*(.+)$/m.exec(block)?.[1]?.trim();
    const a = /^A:\s*([\s\S]+)$/m.exec(block)?.[1]?.trim().replace(/\n+/g, ' ');
    if (q && a) pairs.push({ q, a });
  }
  return pairs;
}
