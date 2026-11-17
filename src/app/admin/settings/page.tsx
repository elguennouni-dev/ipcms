import { getSettings } from '@/lib/settings';
import { db } from '@/lib/db';
import { Head, Saved, Toggle } from '@/components/AdminUI';
import QRCode from 'qrcode';
import { changePassword, saveBusiness, savePaypal, start2fa, confirm2fa, disable2fa, logoutEverywhere } from '../actions';
import { getSession } from '@/lib/auth';
import { otpauthUri } from '@/lib/totp';

export default async function Settings({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const [s, users, sess] = await Promise.all([getSettings(), db.adminUser.findMany(), getSession()]);
  const me = users.find((u) => u.id === sess?.uid);
  const setup = !!me && !me.totpEnabled && !!me.totpSecret && sp.setup2fa === '1';
  const qr = setup && me ? await QRCode.toDataURL(otpauthUri(me.totpSecret, me.email, s.siteName), { margin: 1, width: 220 }) : '';
  const pp = s.paypalEnabled === '1';
  return (
    <>
      <Head title="Settings & payments" sub="Business details, site behaviour, PayPal and account." />
      <Saved sp={sp} />
      <div className="cols2">
        <form action={saveBusiness} className="box">
          <h2>Business &amp; contact</h2>
          <div className="f"><label htmlFor="b1">Site / business name</label><input id="b1" name="siteName" className="in" defaultValue={s.siteName} required /></div>
          <div className="f"><label htmlFor="b2">WhatsApp number (international, digits only, e.g. 447700900123)</label><input id="b2" name="whatsapp" className="in" defaultValue={s.whatsapp} required /></div>
          <div className="f"><label htmlFor="b3">Support email</label><input id="b3" name="supportEmail" type="email" className="in" defaultValue={s.supportEmail} /></div>
          <div className="f"><label htmlFor="b4">DMCA / copyright email</label><input id="b4" name="dmcaEmail" type="email" className="in" defaultValue={s.dmcaEmail} /></div>
          <div className="f"><label htmlFor="b5">Company name</label><input id="b5" name="companyName" className="in" defaultValue={s.companyName} /></div>
          <div className="f"><label htmlFor="b6">Company number</label><input id="b6" name="companyNumber" className="in" defaultValue={s.companyNumber} /></div>
          <h2 style={{ marginTop: 20 }}>Site behaviour</h2>
          <Toggle name="announceEnabled" on={s.announceEnabled === '1'} label="Announcement bar" desc="Promo message above the header." />
          <div className="f"><label htmlFor="b7">Announcement text</label><input id="b7" name="announceText" className="in" defaultValue={s.announceText} /></div>
          <Toggle name="cookieBanner" on={s.cookieBanner === '1'} label="Cookie consent banner" desc="Required for analytics under UK GDPR / PECR." />
          <Toggle name="whatsappFloat" on={s.whatsappFloat === '1'} label="Floating WhatsApp button" />
          <button className="btn">Save settings</button>
        </form>

        <div>
          <form action={savePaypal} className="box">
            <h2>PayPal payments</h2>
            <div className="sub" style={{ marginBottom: 12 }}>{pp ? 'Enabled in settings. The checkout button is wired in a later update.' : 'Off. Orders go through WhatsApp for now. Switch on when you are ready.'}</div>
            <Toggle name="paypalEnabled" on={pp} label="Enable PayPal" />
            <div className="f"><label htmlFor="p1">Mode</label><select id="p1" name="paypalMode" defaultValue={s.paypalMode}><option value="sandbox">Sandbox (testing)</option><option value="live">Live</option></select></div>
            <div className="f"><label htmlFor="p2">Client ID</label><input id="p2" name="paypalClientId" className="in" defaultValue={s.paypalClientId} /></div>
            <div className="f"><label htmlFor="p3">Secret key {s.paypalSecret ? '(saved - leave blank to keep)' : ''}</label><input id="p3" name="paypalSecret" type="password" className="in" autoComplete="new-password" placeholder={s.paypalSecret ? '••••••••••••' : ''} /></div>
            <button className="btn">Save PayPal</button>
          </form>
          <form action={changePassword} className="box">
            <h2>Your account</h2>
            <div className="sub" style={{ marginBottom: 12 }}>{users.map((u) => u.email).join(', ')}</div>
            <div className="f"><label htmlFor="cp">Current password</label><input id="cp" name="current" type="password" className="in" autoComplete="current-password" required /></div>
            <div className="f"><label htmlFor="pw">New password (min. 12 characters, mixed case or numbers)</label><input id="pw" name="password" type="password" className="in" minLength={12} autoComplete="new-password" required /></div>
            <button className="btn dark">Change password</button>
          </form>
          <div className="box">
            <h2>2-step login (strongly recommended)</h2>
            {me?.totpEnabled ? (
              <form action={disable2fa}>
                <div className="sub" style={{ marginBottom: 12 }}>On. Login needs your password and a 6-digit code from your authenticator app.</div>
                <div className="f"><label htmlFor="d1">Password</label><input id="d1" name="current" type="password" className="in" required autoComplete="current-password" /></div>
                <div className="f"><label htmlFor="d2">Current 6-digit code</label><input id="d2" name="otp" className="in" inputMode="numeric" maxLength={6} required autoComplete="one-time-code" /></div>
                <button className="btn dark">Turn off 2-step login</button>
              </form>
            ) : setup ? (
              <form action={confirm2fa}>
                <div className="sub" style={{ marginBottom: 12 }}>Scan this with Google Authenticator, Microsoft Authenticator, Authy or 1Password, then type the 6-digit code it shows.</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="2-step login QR code" width={220} height={220} style={{ background: '#fff', borderRadius: 12, display: 'block', marginBottom: 10 }} />
                <div className="sub" style={{ marginBottom: 12 }}>Or enter this key by hand: <b style={{ letterSpacing: 1 }}>{me?.totpSecret}</b></div>
                <div className="f"><label htmlFor="c1">6-digit code</label><input id="c1" name="otp" className="in" inputMode="numeric" maxLength={6} required autoComplete="one-time-code" /></div>
                <button className="btn">Turn on 2-step login</button>
              </form>
            ) : (
              <form action={start2fa}>
                <div className="sub" style={{ marginBottom: 12 }}>Off. With it on, a stolen password alone cannot open the dashboard.</div>
                <button className="btn">Set up 2-step login</button>
              </form>
            )}
          </div>
          <form action={logoutEverywhere} className="box">
            <h2>Sessions</h2>
            <div className="sub" style={{ marginBottom: 12 }}>Sessions last 8 hours. Use this if you logged in on a shared device.</div>
            <button className="btn dark">Sign out on all devices</button>
          </form>
        </div>
      </div>
    </>
  );
}
