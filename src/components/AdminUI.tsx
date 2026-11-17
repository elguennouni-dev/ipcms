export function Saved({ sp }: { sp: { saved?: string; error?: string } }) {
  if (sp.saved) return <div className="ok" role="status">Saved ✓ — the live site is updated.</div>;
  if (sp.error === 'size') return <div className="er" role="alert">Image is larger than 10 MB.</div>;
  if (sp.error === 'type') return <div className="er" role="alert">That file is not a valid image.</div>;
  if (sp.error === 'slug') return <div className="er" role="alert">That URL slug is already used by another article.</div>;
  if (sp.error === 'required') return <div className="er" role="alert">Title and slug are required.</div>;
  if (sp.error === 'current') return <div className="er" role="alert">Current password is wrong.</div>;
  if (sp.error === 'otp') return <div className="er" role="alert">That code is not valid. Check the clock on your phone and try the next code.</div>;
  if (sp.error === '2fa') return <div className="er" role="alert">Password or code is wrong, so 2-step login was not turned off.</div>;
  if (sp.error === 'pw') return <div className="er" role="alert">Password must be at least 12 characters with lower and upper case letters or numbers.</div>;
  return null;
}
export function Head({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  return (
    <div className="top">
      <div><h1>{title}</h1><div className="sub">{sub}</div></div>
      <div className="row2"><a href="/" target="_blank" className="btn out" style={{ display: 'inline-flex', alignItems: 'center' }}>View live site</a>{right}</div>
    </div>
  );
}
export function Toggle({ name, on, label, desc }: { name: string; on: boolean; label: string; desc?: string }) {
  return (
    <label className="sw">
      <div><b>{label}</b>{desc && <small>{desc}</small>}</div>
      <input className="chk" type="checkbox" name={name} defaultChecked={on} />
    </label>
  );
}
