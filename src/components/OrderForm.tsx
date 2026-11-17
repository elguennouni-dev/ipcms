'use client';
import { useActionState, useEffect, useState } from 'react';
import { submitOrder, type FormState } from '@/app/(site)/actions';
import { WaIcon, Check } from './Icons';

type P = { slug: string; name: string; price: number; months: number };

export function OrderForm({ plans, trial, whatsapp, defaultPlan }: { plans: P[]; trial: boolean; whatsapp: string; defaultPlan: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitOrder, {});
  const options = [...(trial ? [{ slug: 'trial', name: 'Free trial', price: 0, months: 0 }] : []), ...plans];
  const [plan, setPlan] = useState(defaultPlan);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const h = (e: Event) => setPlan((e as CustomEvent).detail);
    window.addEventListener('pickplan', h);
    return () => window.removeEventListener('pickplan', h);
  }, []);
  useEffect(() => { if (state.ok) setDone(true); }, [state]);
  const cur = options.find((o) => o.slug === plan) || options[0];
  const text = encodeURIComponent(`Hi, I'd like to order the ${cur?.slug === 'trial' ? '24-hour free trial' : cur?.name + ' plan'}.`);
  const waLink = `https://wa.me/${whatsapp}?text=${text}`;

  return (
    <div className="order">
      <div className="a">
        <div className="eyebrow" style={{ color: '#BCD0FF' }}>Order</div>
        <h2 className="h2" style={{ fontSize: 40 }}>Tell us where to send your details</h2>
        <p style={{ margin: '18px 0 0', color: '#CFDCFF' }}>Two fields and you are done. We will message you on WhatsApp within minutes.</p>
        <div className="sel">
          <div style={{ fontSize: 13, color: '#BCD0FF' }}>Your selection</div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 26 }}>{cur?.slug === 'trial' ? '24-Hour Free Trial' : cur?.name}</div>
          <div style={{ color: '#E4ECFF' }}>{cur?.slug === 'trial' ? 'Free for 24 hours' : `£${cur?.price}`}</div>
        </div>
      </div>
      <div className="b">
        {done ? (
          <div className="ok">
            <span style={{ width: 56, height: 56, borderRadius: '50%', background: '#3DDC84', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check c="#06210F" s={28} /></span>
            <h3 style={{ fontSize: 28 }}>Request received</h3>
            <p className="muted" style={{ margin: 0 }}>Thank you. We will contact you on WhatsApp shortly with the next steps.</p>
          </div>
        ) : (
          <form action={action} className="form">
            <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="field"><label htmlFor="f-name">Full name</label><input id="f-name" name="name" className="inp" required placeholder="e.g. James Wilson" autoComplete="name" /></div>
            <div className="field"><label htmlFor="f-wa">WhatsApp number</label><input id="f-wa" name="whatsapp" type="tel" className="inp" required placeholder="+44 7XXX XXXXXX" autoComplete="tel" /></div>
            <div className="field"><label htmlFor="f-mail">Email <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label><input id="f-mail" name="email" type="email" className="inp" placeholder="you@example.com" autoComplete="email" /></div>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="lbl" style={{ marginBottom: 8 }}>Plan</legend>
              <div className="pills">
                {options.map((o) => (
                  <label key={o.slug}>
                    <input type="radio" name="plan" value={o.slug} checked={plan === o.slug} onChange={() => setPlan(o.slug)} />
                    <span>{o.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {state.error && <div className="err" role="alert">{state.error}</div>}
            <div className="row" style={{ marginTop: 6 }}>
              <button type="submit" className="btn" style={{ flex: '1 1 180px' }} disabled={pending}>{pending ? 'Sending…' : 'Send request'}</button>
              <a href={waLink} className="btn wa" style={{ flex: '1 1 180px' }} target="_blank" rel="noopener noreferrer"><WaIcon />Order on WhatsApp</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
