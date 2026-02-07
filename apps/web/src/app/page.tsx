export default function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Welcome to FreeFlow</h1>
      <p>Next.js frontend running on port 3000</p>
      <div style={{ marginTop: '2rem' }}>
        <h2>Quick Links:</h2>
        <ul>
          <li>
            <a href="/api/health">Health Check</a>
          </li>
        </ul>
      </div>
    </main>
  );
}
