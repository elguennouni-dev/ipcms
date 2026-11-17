'use client';
import { useActionState } from 'react';
import { submitDmca, type FormState } from '@/app/(site)/actions';

export function DmcaForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitDmca, {});
  if (state.ok) return <div className="card"><h3 style={{ margin: 0 }}>Notice received</h3><p>Our copyright agent will review it and reply by email.</p></div>;
  return (
    <form action={action} className="card form">
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="field"><label htmlFor="d-name">Full legal name</label><input id="d-name" name="name" className="inp" required /></div>
      <div className="field"><label htmlFor="d-mail">Email</label><input id="d-mail" name="email" type="email" className="inp" required /></div>
      <div className="field"><label htmlFor="d-work">Copyrighted work you own</label><input id="d-work" name="work" className="inp" required /></div>
      <div className="field"><label htmlFor="d-loc">Where the material appears (channel name or URL)</label><textarea id="d-loc" name="location" className="inp" required /></div>
      <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: '#CBD3EE' }}>
        <input type="checkbox" name="agree" required style={{ width: 20, height: 20, marginTop: 2, accentColor: '#E3202B' }} />
        <span>I have a good-faith belief that the use is not authorised, and I declare under penalty of perjury that this information is accurate and that I am the owner or authorised to act for the owner.</span>
      </label>
      <div className="field"><label htmlFor="d-sig">Electronic signature (type your full name)</label><input id="d-sig" name="signature" className="inp" required /></div>
      {state.error && <div className="err" role="alert">{state.error}</div>}
      <button className="btn" style={{ alignSelf: 'flex-start' }} disabled={pending}>{pending ? 'Sending…' : 'Submit notice'}</button>
      <p className="muted" style={{ fontSize: 13, margin: 0 }}>Prefer email? Write to {email}.</p>
    </form>
  );
}
