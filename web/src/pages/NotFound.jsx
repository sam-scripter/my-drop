// NotFound.jsx — 404 page
export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
      <h2 style={{ marginBottom: 8 }}>Tracking link not found</h2>
      <p style={{ color: '#5F6368' }}>
        This link may have expired or is invalid.
      </p>
    </div>
  )
}