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
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PricingPage from './pages/PricingPage'
import LandingPage from './pages/LandingPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ContactPage from './pages/ContactPage'
import ReportsPage from './pages/ReportsPage'

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

      {/* Root — show landing page, redirect to dashboard if logged in */}
      <Route
        path="/"
        element={isLoggedIn() ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />
      {/* Password reset routes — public, no auth needed */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Public pricing page */}
      <Route path="/pricing" element={<PricingPage />} />

      {/* Public contact page */}
      <Route path="/contact" element={<ContactPage />} />

      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />

      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
