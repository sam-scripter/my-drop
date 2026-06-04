// LoginPage.jsx — Manager login
//
// Updated with orange/navy theme.
// Redirects to dashboard on success.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { saveAuth } from '../auth'
import { colors, shadows, radius, typography, spacing } from '../theme'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      })

      if (data.user.role !== 'MANAGER') {
        setError('This dashboard is for managers only. Use the mobile app instead.')
        return
      }

      saveAuth(data.token, data.user, data.business)

      if (data.must_change_password) {
        navigate('/change-password')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🚚</span>
          <h1 style={styles.logoText}>mydrop</h1>
          <p style={styles.logoSub}>Management Dashboard</p>
        </div>

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@business.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
            <div style={{ textAlign: 'right', marginTop: 6 }}>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={styles.signupLink}>
          New business?{' '}
          <Link to="/signup" style={{ color: colors.primary }}>
            Create an account
          </Link>
        </p>

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
    background: colors.background,
    padding: spacing.lg,
  },
  card: {
    background: colors.surface,
    borderRadius: radius.xl,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    boxShadow: shadows.xl,
    border: `1px solid ${colors.border}`,
  },
  logo: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  logoIcon: { fontSize: 48 },
  logoText: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.primary,
    margin: '4px 0 0',
  },
  logoSub: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    margin: 4,
  },
  error: {
    background: colors.errorLight,
    border: `1px solid ${colors.error}40`,
    color: colors.error,
    padding: '12px 16px',
    borderRadius: radius.md,
    fontSize: typography.sm,
    marginBottom: spacing.md,
  },
  field: { marginBottom: spacing.md },
  label: {
    display: 'block',
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize: typography.base,
    outline: 'none',
    boxSizing: 'border-box',
    color: colors.text,
    background: colors.surface,
  },
  forgotLink: {
    color: colors.primary,
    fontSize: typography.xs,
    textDecoration: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: radius.md,
    fontSize: typography.md,
    fontWeight: typography.semibold,
    cursor: 'pointer',
    marginTop: 8,
    boxShadow: shadows.sm,
  },
  signupLink: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
}