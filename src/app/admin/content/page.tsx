import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { Head, Saved, Toggle } from '@/components/AdminUI';
import { deleteFaq, deleteReview, saveFaq, saveHero, saveReview } from '../actions';

export default async function Content({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const [s, faqs, reviews] = await Promise.all([getSettings(), db.faqItem.findMany({ orderBy: { sort: 'asc' } }), db.review.findMany({ orderBy: { sort: 'asc' } })]);
  return (
    <>
      <Head title="Site content" sub="Edit the hero text, numbers, FAQ and reviews." />
      <Saved sp={sp} />
      <form action={saveHero} className="box">
        <h2>Hero section</h2>
        <div className="f"><label htmlFor="ht">Headline</label><input id="ht" name="heroTitle" className="in" defaultValue={s.heroTitle} required /></div>
        <div className="f"><label htmlFor="hs">Sub-headline</label><textarea id="hs" name="heroSub" defaultValue={s.heroSub} /></div>
        <div className="f"><label htmlFor="hc">Main button text</label><input id="hc" name="heroCta" className="in" defaultValue={s.heroCta} /></div>
        <div className="cols2">
          <div className="f"><label htmlFor="sc">Stat: live channels</label><input id="sc" name="statChannels" className="in" defaultValue={s.statChannels} /></div>
          <div className="f"><label htmlFor="sv">Stat: films & series</label><input id="sv" name="statVod" className="in" defaultValue={s.statVod} /></div>
        </div>
        <button className="btn">Save hero</button>
      </form>

      <div className="box">
        <h2>FAQ</h2>
        {faqs.map((f) => (
          <form key={f.id} action={saveFaq} style={{ borderTop: '1px solid #ECEEF5', paddingTop: 16, marginTop: 16 }}>
            <input type="hidden" name="id" value={f.id} />
            <div className="f"><label>Question</label><input name="question" className="in" defaultValue={f.question} required /></div>
            <div className="f"><label>Answer</label><textarea name="answer" defaultValue={f.answer} required /></div>
            <Toggle name="visible" on={f.visible} label="Visible" />
            <div className="row2"><button className="btn">Save</button><button className="btn out" formAction={deleteFaq}>Delete</button></div>
          </form>
        ))}
        <form action={saveFaq} style={{ borderTop: '1px dashed #B9BDD0', paddingTop: 16, marginTop: 16 }}>
          <b>Add question</b>
          <div className="f" style={{ marginTop: 10 }}><label>Question</label><input name="question" className="in" required /></div>
          <div className="f"><label>Answer</label><textarea name="answer" required /></div>
          <input type="hidden" name="visible" value="on" />
          <button className="btn dark">+ Add</button>
        </form>
      </div>

      <div className="box">
        <h2>Reviews & testimonials</h2>
        <div className="sub" style={{ marginBottom: 8 }}>Only add real customer reviews. The Reviews section is hidden until you switch it on in Pages & sections.</div>
        {reviews.map((r) => (
          <form key={r.id} action={saveReview} style={{ borderTop: '1px solid #ECEEF5', paddingTop: 16, marginTop: 16 }}>
            <input type="hidden" name="id" value={r.id} />
            <div className="cols2">
              <div className="f"><label>Name</label><input name="author" className="in" defaultValue={r.author} required /></div>
              <div className="f"><label>Rating (1-5)</label><input name="rating" type="number" min="1" max="5" className="in" defaultValue={r.rating} /></div>
            </div>
            <div className="f"><label>Review</label><textarea name="text" defaultValue={r.text} required /></div>
            <Toggle name="visible" on={r.visible} label="Visible" />
            <div className="row2"><button className="btn">Save</button><button className="btn out" formAction={deleteReview}>Delete</button></div>
          </form>
        ))}
        <form action={saveReview} style={{ borderTop: '1px dashed #B9BDD0', paddingTop: 16, marginTop: 16 }}>
          <b>Add review</b>
          <div className="cols2" style={{ marginTop: 10 }}>
            <div className="f"><label>Name</label><input name="author" className="in" required /></div>
            <div className="f"><label>Rating (1-5)</label><input name="rating" type="number" min="1" max="5" className="in" defaultValue={5} /></div>
          </div>
          <div className="f"><label>Review</label><textarea name="text" required /></div>
          <input type="hidden" name="visible" value="on" />
          <button className="btn dark">+ Add</button>
        </form>
      </div>
    </>
  );
}
