import { db } from '@/lib/db';
import { Head, Saved } from '@/components/AdminUI';
import { removeMedia, uploadMedia } from '../actions';

export default async function MediaPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const rows = await db.media.findMany({ orderBy: { id: 'asc' } });
  const group = (r: { slot: string }) => (r.slot.startsWith('channel') ? 'Channel logos' : r.slot.startsWith('poster') ? 'Movie & series posters' : 'Site images');
  const groups = ['Site images', 'Channel logos', 'Movie & series posters'];
  return (
    <>
      <Head title="Media library" sub="Every image on the site. Uploads are resized and converted to WebP automatically (max 10 MB)." />
      <Saved sp={sp} />
      <div className="box" style={{ background: '#FFF8E6', borderColor: '#F3DFA6' }}>
        <b>Use images you are allowed to use.</b>
        <div className="sub" style={{ color: '#6B4A12' }}>Do not upload logos, posters or artwork you do not have permission for. Original or licensed artwork protects the site from takedowns and from Google penalties.</div>
      </div>
      {groups.map((g) => (
        <section key={g} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, margin: '8px 0 12px' }}>{g}</h2>
          <div className="mg">
            {rows.filter((r) => group(r) === g).map((r) => (
              <div className="mc" key={r.slot}>
                <div className="pv">
                  {r.file ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={`/media/${r.file}?v=${r.updatedAt.getTime()}`} alt={r.alt} /> : 'No image yet'}
                </div>
                <form action={uploadMedia} encType="multipart/form-data">
                  <input type="hidden" name="slot" value={r.slot} />
                  <b>{r.label}</b>
                  <input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/avif" aria-label={`Upload ${r.label}`} style={{ fontSize: 12 }} />
                  <input name="alt" className="in" placeholder="Alt text (for SEO & accessibility)" defaultValue={r.alt} aria-label="Alt text" style={{ minHeight: 40 }} />
                  <div className="row2"><button className="btn" style={{ minHeight: 40 }}>Save</button>{r.file && <button className="btn out" style={{ minHeight: 40 }} formAction={removeMedia}>Remove</button>}</div>
                </form>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
