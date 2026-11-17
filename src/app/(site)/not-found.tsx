import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: '96px 0', textAlign: 'center' }}>
      <div className="eyebrow">404</div>
      <h1 style={{ fontSize: 48, margin: '12px 0' }}>Page not found</h1>
      <p className="muted">The page you are looking for does not exist or has moved.</p>
      <div className="row" style={{ justifyContent: 'center', marginTop: 28 }}>
        <Link href="/" className="btn">Back to home</Link>
        <Link href="/guides" className="btn ghost">Setup guides</Link>
      </div>
    </div>
  );
}
