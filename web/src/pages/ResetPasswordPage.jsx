// ResetPasswordPage.jsx — Set a new password using the reset token
//
// Opened when the user clicks the reset link in their email.
// Reads the token from the URL query parameter, validates it
// via the API, and allows the user to set a new password.

import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // No token in URL — show an error immediately
  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>❌</div>
          <h2 style={styles.title}>Invalid reset link</h2>
          <p style={styles.subtitle}>
            This password reset link is invalid or has expired.
          </p>
          <Link to="/forgot-password" style={styles.button}>
            Request a new reset link
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      await axios.post(`${API_BASE}/auth/reset-password`, {
        token,
        newPassword,
      })
      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'This link has expired or already been used. Please request a new one.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>✅</div>
          <h2 style={styles.title}>Password reset successfully</h2>
          <p style={styles.subtitle}>
            Your password has been updated. Redirecting you to login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🚚</div>
          <h1 style={styles.logoText}>mydrop</h1>
        </div>

        <h2 style={styles.title}>Set new password</h2>
        <p style={styles.subtitle}>
          Choose a strong password — at least 8 characters.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              placeholder="Repeat your new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8F9FA',
    padding: 24,
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  logo: { textAlign: 'center', marginBottom: 24 },
  logoIcon: { fontSize: 40, marginBottom: 4 },
  logoText: { fontSize: 24, fontWeight: 'bold', color: '#1A73E8', margin: 0 },
  title: { fontSize: 20, fontWeight: 'bold', margin: '0 0 8px' },
  subtitle: { color: '#5F6368', fontSize: 14, margin: '0 0 24px', lineHeight: 1.5 },
  error: {
    background: '#FFF5F5',
    border: '1px solid #FECACA',
    color: '#EA4335',
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
  },
  field: { marginBottom: 16 },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '12px',
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: 8,
    textDecoration: 'none',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
}