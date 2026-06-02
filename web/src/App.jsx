// App.jsx — Route definitions
import { Routes, Route, Navigate } from 'react-router-dom'
import TrackingPage from './pages/TrackingPage'
import NotFound from './pages/NotFound'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import OrdersPage from './pages/OrdersPage'
import CreateOrderPage from './pages/CreateOrderPage'
import RidersPage from './pages/RidersPage'
import ProtectedRoute from './components/ProtectedRoute'
import { isLoggedIn } from './auth'

export default function App() {
  return (
    <Routes>
      {/* Public tracking page — the URL customers receive */}
      <Route path="/track/:token" element={<TrackingPage />} />

      {/* Manager login/signup */}
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/login"
        element={isLoggedIn()
          ? <Navigate to="/dashboard" replace />
          : <LoginPage />}
      />

      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute><OrdersPage /></ProtectedRoute>
      } />
      <Route path="/orders/new" element={
        <ProtectedRoute><CreateOrderPage /></ProtectedRoute>
      } />
      <Route path="/riders" element={
        <ProtectedRoute><RidersPage /></ProtectedRoute>
      } />

      {/* Landing page — shown at root URL */}
      {/* Root redirect */}
      <Route path="/" element={
        isLoggedIn()
          ? <Navigate to="/dashboard" replace />
          : <Navigate to="/login" replace />
      } />

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