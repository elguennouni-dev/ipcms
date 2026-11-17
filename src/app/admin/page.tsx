import { db } from '@/lib/db';
import { Head } from '@/components/AdminUI';
import { deleteOrder, nextOrderStatus } from './actions';
import Link from 'next/link';

const FILTERS = ['all', 'New', 'Contacted', 'Active', 'Done'];

export default async function Orders({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f = 'all' } = await searchParams;
  const [orders, counts] = await Promise.all([
    db.order.findMany({ where: f === 'all' ? {} : { status: f }, orderBy: { createdAt: 'desc' }, take: 200 }),
    db.order.groupBy({ by: ['status'], _count: true })
  ]);
  const c = (s: string) => counts.find((x) => x.status === s)?._count ?? 0;
  const trials = await db.order.count({ where: { planSlug: 'trial' } });
  return (
    <>
      <Head title="Orders" sub="Track every request from the form." />
      <div className="kpis">
        <div className="kpi"><small>New orders</small><b>{c('New')}</b></div>
        <div className="kpi"><small>Awaiting reply</small><b>{c('Contacted')}</b></div>
        <div className="kpi"><small>Free trials (all time)</small><b>{trials}</b></div>
        <div className="kpi"><small>Active customers</small><b>{c('Active')}</b></div>
      </div>
      <div className="row2" style={{ marginBottom: 12 }}>
        {FILTERS.map((x) => <Link key={x} href={x === 'all' ? '/admin' : `/admin?f=${x}`} className={`btn ${f === x ? 'dark' : 'out'}`}>{x === 'all' ? 'All' : x}</Link>)}
      </div>
      <div className="tbl">
        <table>
          <thead><tr><th>CUSTOMER</th><th>WHATSAPP</th><th>PLAN</th><th>RECEIVED</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#5B6075' }}>No orders yet.</td></tr>}
            {orders.map((o) => (
              <tr key={o.id}>
                <td><b>{o.name}</b><div className="sub">{o.email || '—'}</div></td>
                <td>{o.whatsapp}</td>
                <td><span className="tag">{o.planName}</span></td>
                <td className="sub">{o.createdAt.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td><form action={nextOrderStatus}><input type="hidden" name="id" value={o.id} /><button className={`st ${o.status}`} title="Click to change status">● {o.status}</button></form></td>
                <td>
                  <div className="row2">
                    <a className="btn out" href={`https://wa.me/${o.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    <form action={deleteOrder}><input type="hidden" name="id" value={o.id} /><button className="btn out" aria-label="Delete order">Delete</button></form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
