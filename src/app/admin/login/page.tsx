import { loginAction } from '../actions';

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <form action={loginAction} className="login">
      <span className="plate">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/logo.png" alt="UK Channel TV" /></span>
      <h1 style={{ fontSize: 28 }}>Admin login</h1>
      <p className="sub" style={{ margin: '6px 0 22px' }}>Sign in to manage your site.</p>
      {sp.error && <div className="er" role="alert">{sp.error === 'locked' ? 'Too many failed attempts. Try again in 15 minutes.' : 'Wrong email, password or code.'}</div>}
      <div className="f"><label htmlFor="e">Email</label><input id="e" name="email" type="email" className="in" required autoComplete="username" /></div>
      <div className="f"><label htmlFor="p">Password</label><input id="p" name="password" type="password" className="in" required autoComplete="current-password" /></div>
      <div className="f"><label htmlFor="o">2-step code <span style={{ fontWeight: 400 }}>(only if enabled)</span></label><input id="o" name="otp" className="in" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]*" /></div>
      <button className="btn" style={{ width: '100%' }}>Sign in</button>
    </form>
  );
}
