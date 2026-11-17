'use client';
import { useMemo, useRef, useState } from 'react';
import { analyze } from '@/lib/seo';
import { slugify } from '@/lib/markdown';
import { savePost, deletePost } from '@/app/admin/actions';

type P = {
  id: number; type: string; slug: string; title: string; excerpt: string; body: string; coverFile: string; coverAlt: string; category: string; tags: string;
  author: string; status: string; publishedAt: string; faq: string; seoTitle: string; seoDescription: string; focusKeyword: string; canonical: string; noindex: boolean;
};

const dot = { good: '#12B76A', ok: '#F79009', bad: '#F04438' } as const;

export function PostEditor({ post, host }: { post: P; host: string }) {
  const [f, setF] = useState(post);
  const [slugTouched, setSlugTouched] = useState(!!post.id);
  const [msg, setMsg] = useState('');
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const set = <K extends keyof P>(k: K, v: P[K]) => setF((s) => ({ ...s, [k]: v }));
  const res = useMemo(() => analyze({ ...f, siteHost: host }), [f, host]);
  const scoreColor = res.score >= 75 ? dot.good : res.score >= 50 ? dot.ok : dot.bad;
  const title = f.seoTitle || f.title;
  const desc = f.seoDescription || f.excerpt;
  const path = `/${f.type === 'guide' ? 'guides' : 'blog'}/${f.slug || 'your-slug'}`;

  const wrap = (before: string, after = before) => {
    const ta = bodyRef.current; if (!ta) return;
    const { selectionStart: a, selectionEnd: b, value } = ta;
    const sel = value.slice(a, b) || 'text';
    set('body', value.slice(0, a) + before + sel + after + value.slice(b));
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(a + before.length, a + before.length + sel.length); });
  };
  const line = (prefix: string) => {
    const ta = bodyRef.current; if (!ta) return;
    const a = ta.selectionStart; const start = ta.value.lastIndexOf('\n', a - 1) + 1;
    set('body', ta.value.slice(0, start) + prefix + ta.value.slice(start));
  };
  const upload = async (file: File) => {
    setMsg('Uploading…');
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const j = await r.json();
    if (!r.ok) { setMsg(j.error || 'Upload failed'); return; }
    const ta = bodyRef.current; const pos = ta?.selectionStart ?? f.body.length;
    set('body', f.body.slice(0, pos) + `\n\n![Describe the image](${j.url})\n\n` + f.body.slice(pos));
    setMsg('Image inserted. Edit its description (alt text).');
  };

  return (
    <form action={savePost} encType="multipart/form-data" className="cols2" style={{ gridTemplateColumns: 'minmax(0,1.6fr) minmax(300px,1fr)' }}>
      <input type="hidden" name="id" value={f.id} />
      <div>
        <div className="box">
          <div className="f"><label htmlFor="title">Title</label>
            <input id="title" name="title" className="in" value={f.title} required style={{ fontSize: 20, fontWeight: 600 }}
              onChange={(e) => { set('title', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)); }} /></div>
          <div className="cols2" style={{ gridTemplateColumns: '140px 1fr' }}>
            <div className="f"><label htmlFor="type">Type</label>
              <select id="type" name="type" value={f.type} onChange={(e) => set('type', e.target.value)}><option value="blog">Blog post</option><option value="guide">Guide</option></select></div>
            <div className="f"><label htmlFor="slug">URL slug <span style={{ fontWeight: 400 }}>({path})</span></label>
              <input id="slug" name="slug" className="in" value={f.slug} required onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} /></div>
          </div>
          <div className="f"><label htmlFor="excerpt">Summary (shown under the title and on cards)</label>
            <textarea id="excerpt" name="excerpt" value={f.excerpt} onChange={(e) => set('excerpt', e.target.value)} style={{ minHeight: 70 }} /></div>
          <div className="f"><label htmlFor="body">Article</label>
            <div className="row2" style={{ marginBottom: 8 }}>
              <button type="button" className="btn out" onClick={() => line('## ')}>H2</button>
              <button type="button" className="btn out" onClick={() => line('### ')}>H3</button>
              <button type="button" className="btn out" onClick={() => wrap('**')}><b>B</b></button>
              <button type="button" className="btn out" onClick={() => wrap('*')}><i>I</i></button>
              <button type="button" className="btn out" onClick={() => line('- ')}>• List</button>
              <button type="button" className="btn out" onClick={() => line('1. ')}>1. List</button>
              <button type="button" className="btn out" onClick={() => wrap('[', '](https://)')}>Link</button>
              <button type="button" className="btn out" onClick={() => line('> ')}>Quote</button>
              <label className="btn out" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>Image
                <input type="file" accept="image/*" hidden onChange={(e) => { const x = e.target.files?.[0]; if (x) upload(x); e.target.value = ''; }} /></label>
            </div>
            <textarea id="body" name="body" ref={bodyRef} value={f.body} onChange={(e) => set('body', e.target.value)} required style={{ minHeight: 480, fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 14, lineHeight: 1.6 }} />
            <div className="sub">{msg || `${res.words} words. Use ## for headings, **bold**, [text](/link), - lists, > quotes.`}</div>
          </div>
        </div>

        <div className="box">
          <h2>FAQ for this article (adds FAQ rich-result markup)</h2>
          <textarea name="faq" value={f.faq} onChange={(e) => set('faq', e.target.value)} placeholder={'Q: Does it work on a Fire Stick?\nA: Yes. Follow the steps above...\n\nQ: Next question?\nA: Answer...'} style={{ minHeight: 150, fontSize: 14 }} />
          <div className="sub">Blank line between questions. Keep answers short and factual.</div>
        </div>

        <div className="box">
          <h2>SEO settings</h2>
          <div className="f"><label htmlFor="focusKeyword">Focus keyword</label><input id="focusKeyword" name="focusKeyword" className="in" value={f.focusKeyword} onChange={(e) => set('focusKeyword', e.target.value)} placeholder="e.g. iptv fire stick uk" /></div>
          <div className="f"><label htmlFor="seoTitle">SEO title <span style={{ fontWeight: 400 }}>({title.length}/60)</span></label><input id="seoTitle" name="seoTitle" className="in" value={f.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} placeholder={f.title} /></div>
          <div className="f"><label htmlFor="seoDescription">Meta description <span style={{ fontWeight: 400 }}>({desc.length}/160)</span></label><textarea id="seoDescription" name="seoDescription" value={f.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} style={{ minHeight: 80 }} /></div>
          <div className="f"><label htmlFor="canonical">Canonical URL (leave empty for the default)</label><input id="canonical" name="canonical" className="in" value={f.canonical} onChange={(e) => set('canonical', e.target.value)} /></div>
          <label className="sw"><div><b>Hide from search engines (noindex)</b><small>Also removed from the sitemap and llms.txt.</small></div><input className="chk" type="checkbox" name="noindex" checked={f.noindex} onChange={(e) => set('noindex', e.target.checked)} /></label>
        </div>
      </div>

      <div style={{ position: 'sticky', top: 16, alignSelf: 'start' }}>
        <div className="box">
          <h2>Publish</h2>
          <div className="f"><label htmlFor="status">Status</label>
            <select id="status" name="status" value={f.status} onChange={(e) => set('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></div>
          <div className="f"><label htmlFor="publishedAt">Publish date &amp; time <span style={{ fontWeight: 400 }}>(future = scheduled)</span></label>
            <input id="publishedAt" name="publishedAt" type="datetime-local" className="in" value={f.publishedAt} onChange={(e) => set('publishedAt', e.target.value)} /></div>
          <div className="cols2" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="f"><label htmlFor="category">Category</label><input id="category" name="category" className="in" value={f.category} onChange={(e) => set('category', e.target.value)} /></div>
            <div className="f"><label htmlFor="author">Author</label><input id="author" name="author" className="in" value={f.author} onChange={(e) => set('author', e.target.value)} /></div>
          </div>
          <div className="f"><label htmlFor="tags">Tags (comma separated)</label><input id="tags" name="tags" className="in" value={f.tags} onChange={(e) => set('tags', e.target.value)} /></div>
          <div className="f"><label htmlFor="cover">Cover image {f.coverFile && <a href={`/media/${f.coverFile}`} target="_blank" style={{ color: '#1D3FB8' }}>(current)</a>}</label>
            <input id="cover" name="cover" type="file" accept="image/*" style={{ fontSize: 13 }} /></div>
          <div className="f"><label htmlFor="coverAlt">Cover alt text</label><input id="coverAlt" name="coverAlt" className="in" value={f.coverAlt} onChange={(e) => set('coverAlt', e.target.value)} /></div>
          <div className="row2"><button className="btn">Save</button>{f.id > 0 && <button className="btn out" formAction={deletePost} formNoValidate>Delete</button>}</div>
        </div>

        <div className="box">
          <h2>Google preview</h2>
          <div className="pre"><div className="sub">{host}{path}</div><div className="t">{title.slice(0, 62) || 'Your title'}</div><div className="sub" style={{ color: '#4A4F66' }}>{desc.slice(0, 160) || 'Your meta description appears here.'}</div></div>
        </div>

        <div className="box">
          <div className="row2" style={{ justifyContent: 'space-between' }}><h2 style={{ margin: 0 }}>SEO analysis</h2>
            <span style={{ fontWeight: 700, fontSize: 22, color: scoreColor }}>{res.score}<span className="sub">/100</span></span></div>
          <div style={{ height: 8, borderRadius: 99, background: '#E9EAF3', margin: '12px 0' }}><div style={{ width: `${res.score}%`, height: 8, borderRadius: 99, background: scoreColor }} /></div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...res.checks].sort((a, b) => (a.status === b.status ? 0 : a.status === 'bad' ? -1 : b.status === 'bad' ? 1 : a.status === 'ok' ? -1 : 1)).map((c) => (
              <li key={c.id} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                <span aria-label={c.status} style={{ flex: 'none', width: 10, height: 10, borderRadius: '50%', background: dot[c.status], marginTop: 5 }} />
                <span><b>{c.label}.</b> {c.msg}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </form>
  );
}
