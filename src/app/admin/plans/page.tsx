import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { Head, Saved, Toggle } from '@/components/AdminUI';
import { savePlan, saveTrial } from '../actions';

export default async function Plans({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const [plans, s] = await Promise.all([db.plan.findMany({ orderBy: { sort: 'asc' } }), getSettings()]);
  return (
    <>
      <Head title="Plans & prices" sub="Change prices, badges and features. The site updates instantly." />
      <Saved sp={sp} />
      <div className="cols2">
        {plans.map((p) => (
          <form key={p.id} action={savePlan} className="box">
            <input type="hidden" name="id" value={p.id} />
            <h2>{p.name}</h2>
            <div className="f"><label htmlFor={`n${p.id}`}>Plan name</label><input id={`n${p.id}`} name="name" className="in" defaultValue={p.name} required /></div>
            <div className="f"><label htmlFor={`p${p.id}`}>Price (GBP)</label><input id={`p${p.id}`} name="price" type="number" step="0.01" min="0" className="in" defaultValue={Number(p.price)} required /></div>
            <div className="f"><label htmlFor={`b${p.id}`}>Badge (optional, e.g. MOST POPULAR)</label><input id={`b${p.id}`} name="badge" className="in" defaultValue={p.badge} /></div>
            <div className="f"><label htmlFor={`f${p.id}`}>Features (one per line)</label><textarea id={`f${p.id}`} name="features" defaultValue={p.features} /></div>
            <Toggle name="visible" on={p.visible} label="Visible on site" />
            <button className="btn">Save plan</button>
          </form>
        ))}
      </div>
      <form action={saveTrial} className="box">
        <h2>24-hour free trial</h2>
        <Toggle name="trialEnabled" on={s.trialEnabled === '1'} label="Offer the free trial" desc="Shows the trial banner and the trial option in the order form." />
        <button className="btn">Save</button>
      </form>
    </>
  );
}
