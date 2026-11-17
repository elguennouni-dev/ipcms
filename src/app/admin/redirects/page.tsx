import { db } from '@/lib/db';
import { Head, Saved } from '@/components/AdminUI';
import { addRedirect, clearNotFound, deleteRedirect } from '../actions';

export default async function Redirects({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const [reds, logs] = await Promise.all([db.redirect.findMany({ orderBy: { createdAt: 'desc' } }), db.notFoundLog.findMany({ orderBy: [{ hits: 'desc' }], take: 50 })]);
  return (
    <>
      <Head title="Redirects & 404 monitor" sub="Keep old links ranking: send visitors and Google to the right page with a permanent (301) redirect." />
      <Saved sp={sp} />
      {sp.error === 'redirect' && <div className="er" role="alert">Enter a valid &quot;from&quot; and &quot;to&quot; (they must differ).</div>}
      <form action={addRedirect} className="box">
        <h2>Add a redirect</h2>
        <div className="cols2" style={{ gridTemplateColumns: '1fr 1fr 160px auto', alignItems: 'end' }}>
          <div className="f"><label htmlFor="rf">From path</label><input id="rf" name="fromPath" className="in" placeholder="/old-page" required /></div>
          <div className="f"><label htmlFor="rt">To (path or full URL)</label><input id="rt" name="toPath" className="in" placeholder="/guides/new-page" required /></div>
          <div className="f"><label htmlFor="rc">Type</label><select id="rc" name="code"><option value="301">301 Permanent</option><option value="302">302 Temporary</option></select></div>
          <div className="f"><button className="btn">Add</button></div>
        </div>
        <div className="sub">Changing an article&apos;s URL creates its redirect automatically.</div>
      </form>

      <div className="tbl" style={{ marginBottom: 16 }}><table>
        <thead><tr><th>FROM</th><th>TO</th><th>TYPE</th><th>HITS</th><th></th></tr></thead>
        <tbody>
          {reds.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#5B6075' }}>No redirects yet.</td></tr>}
          {reds.map((r) => (
            <tr key={r.id}><td><code>{r.fromPath}</code></td><td><code>{r.toPath}</code></td><td>{r.code}</td><td>{r.hits}</td>
              <td><form action={deleteRedirect}><input type="hidden" name="id" value={r.id} /><button className="btn out">Delete</button></form></td></tr>
          ))}
        </tbody>
      </table></div>

      <div className="box">
        <div className="row2" style={{ justifyContent: 'space-between' }}><h2 style={{ margin: 0 }}>404 monitor</h2>
          {logs.length > 0 && <form action={clearNotFound}><button className="btn out">Clear log</button></form>}</div>
        <div className="sub" style={{ margin: '6px 0 12px' }}>Broken URLs people (and Google) tried to open. Redirect the important ones.</div>
        {logs.length === 0 && <div className="sub">No broken links recorded.</div>}
        {logs.map((l) => (
          <form key={l.id} action={addRedirect} className="row2" style={{ borderTop: '1px solid #ECEEF5', padding: '10px 0' }}>
            <input type="hidden" name="fromPath" value={l.path} /><input type="hidden" name="code" value="301" />
            <code style={{ flex: '1 1 220px' }}>{l.path}</code><span className="sub">{l.hits} hit{l.hits > 1 ? 's' : ''}</span>
            <input name="toPath" className="in" placeholder="Redirect to…" style={{ flex: '1 1 200px', minHeight: 40 }} aria-label={`Redirect ${l.path} to`} required />
            <button className="btn" style={{ minHeight: 40 }}>Redirect</button>
          </form>
        ))}
      </div>
    </>
  );
}
