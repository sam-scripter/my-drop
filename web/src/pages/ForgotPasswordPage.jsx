// ForgotPasswordPage.jsx — Request a password reset link
//
// The user enters their email and we send them a reset link.
// We always show the same success message whether the email
// exists or not — to prevent email enumeration attacks.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email })
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>
            📧
          </div>
          <h2 style={styles.title}>Check your email</h2>
          <p style={styles.subtitle}>
            If an account exists for <strong>{email}</strong>, we've sent
            a password reset link. Check your inbox and spam folder.
          </p>
          <p style={styles.subtitle}>
            The link expires in 1 hour.
          </p>
          <Link to="/login" style={styles.backLink}>
            ← Back to login
          </Link>
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

        <h2 style={styles.title}>Forgot your password?</h2>
        <p style={styles.subtitle}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@business.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <Link to="/login" style={styles.backLink}>
          ← Back to login
        </Link>
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
  },
  backLink: {
    display: 'block',
    textAlign: 'center',
    marginTop: 24,
    color: '#1A73E8',
    textDecoration: 'none',
    fontSize: 14,
  },
}