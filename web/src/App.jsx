// App.jsx — Route definitions
import { Routes, Route } from 'react-router-dom'
import TrackingPage from './pages/TrackingPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      {/* Public tracking page — the URL customers receive */}
      <Route path="/track/:token" element={<TrackingPage />} />

      {/* Landing page — shown at root URL */}
      <Route path="/" element={<LandingPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

// Simple landing page for the root URL
function LandingPage() {
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
      <div style={{
        width: 80,
        height: 80,
        background: '#1A73E8',
        borderRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
        marginBottom: 16,
      }}>
        🚚
      </div>
      <h1 style={{ color: '#1A73E8', fontSize: 32, marginBottom: 8 }}>
        mydrop
      </h1>
      <p style={{ color: '#5F6368', fontSize: 16 }}>
        Real-time delivery tracking for businesses in Kenya
      </p>
    </div>
  )
}