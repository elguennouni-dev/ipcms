import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <div style={{ padding: '96px 24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 48 }}>Page not found</h1>
      <p style={{ color: '#A9B4D6' }}>The page you are looking for does not exist.</p>
      <Link href="/" style={{ color: '#7FA6FF' }}>Back to home</Link>
    </div>
  );
}
