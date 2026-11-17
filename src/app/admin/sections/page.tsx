import { db } from '@/lib/db';
import { Head } from '@/components/AdminUI';
import { moveSection, toggleSection } from '../actions';

export default async function Sections() {
  const secs = await db.section.findMany({ orderBy: { sort: 'asc' } });
  return (
    <>
      <Head title="Pages & sections" sub="Show, hide and reorder every block of the home page." />
      <div className="box" style={{ padding: 0, overflow: 'hidden' }}>
        {secs.map((x, i) => (
          <div key={x.id} className="row2" style={{ padding: '14px 22px', borderTop: i ? '1px solid #ECEEF5' : 0, opacity: x.visible ? 1 : 0.5 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F0F1F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#5B6075' }}>{i + 1}</div>
            <div style={{ flex: '1 1 200px' }}><b>{x.name}</b><div className="sub">{x.descr}</div></div>
            <form action={moveSection}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="dir" value="up" /><button className="btn out" aria-label={`Move ${x.name} up`} disabled={i === 0}>↑</button></form>
            <form action={moveSection}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="dir" value="down" /><button className="btn out" aria-label={`Move ${x.name} down`} disabled={i === secs.length - 1}>↓</button></form>
            <form action={toggleSection}><input type="hidden" name="id" value={x.id} /><button className={`btn ${x.visible ? '' : 'out'}`}>{x.visible ? 'Visible' : 'Hidden'}</button></form>
          </div>
        ))}
      </div>
    </>
  );
}
