// SignupPage.jsx — New business registration
//
// Updated with orange/navy theme.
// Includes business type dropdown added in Phase 7.1.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { saveAuth } from '../auth'
import { colors, shadows, radius, typography, spacing } from '../theme'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    businessName: '',
    businessPhone: '',
    businessEmail: '',
    managerName: '',
    password: '',
    confirmPassword: '',
    businessType: 'OTHER',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post(`${API_BASE}/auth/register`, {
        businessName: form.businessName,
        businessPhone: form.businessPhone,
        businessEmail: form.businessEmail,
        managerName: form.managerName,
        password: form.password,
        businessType: form.businessType,
      })

      saveAuth(data.token, data.user, data.business)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <Link to="/" style={styles.logo}>🚚 mydrop</Link>
          <h1 style={styles.title}>Get started free</h1>
          <p style={styles.subtitle}>
            Set up your business and start tracking deliveries in minutes.
            14-day free trial — no credit card required.
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>

          <div style={styles.sectionLabel}>Business details</div>

          <div style={styles.field}>
            <label style={styles.label}>Business name *</label>
            <input
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g. Mama's Kitchen"
              required
            />
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Business phone *</label>
              <input
                name="businessPhone"
                value={form.businessPhone}
                onChange={handleChange}
                style={styles.input}
                placeholder="07XXXXXXXX"
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Business email *</label>
              <input
                type="email"
                name="businessEmail"
                value={form.businessEmail}
                onChange={handleChange}
                style={styles.input}
                placeholder="info@business.com"
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Type of business *</label>
            <select
              name="businessType"
              value={form.businessType}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="FOOD">Food & Restaurant</option>
              <option value="RETAIL">Retail & Clothing</option>
              <option value="PHARMACY">Pharmacy & Healthcare</option>
              <option value="COURIER">Courier & Logistics</option>
              <option value="OTHER">Other</option>
            </select>
            <p style={styles.fieldHint}>
              Helps us use the right language for your customers
            </p>
          </div>

          <div style={styles.sectionLabel}>Your account</div>

          <div style={styles.field}>
            <label style={styles.label}>Your full name *</label>
            <input
              name="managerName"
              value={form.managerName}
              onChange={handleChange}
              style={styles.input}
              placeholder="Full name"
              required
            />
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                style={styles.input}
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirm password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                style={styles.input}
                placeholder="Repeat password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? 'Creating your account...'
              : 'Create account & start free trial →'}
          </button>

        </form>

        <p style={styles.loginLink}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: colors.primary }}>
            Sign in
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
    maxWidth: 600,
    boxShadow: shadows.xl,
    border: `1px solid ${colors.border}`,
  },
  header: { marginBottom: spacing.xl },
  logo: {
    display: 'inline-block',
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.primary,
    textDecoration: 'none',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.text,
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    margin: 0,
    lineHeight: 1.5,
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
  sectionLabel: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    paddingBottom: 8,
    borderBottom: `1px solid ${colors.border}`,
  },
  row: { display: 'flex', gap: spacing.md },
  field: { flex: 1, marginBottom: spacing.md },
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
    fontFamily: 'inherit',
    color: colors.text,
    background: colors.surface,
  },
  fieldHint: {
    fontSize: typography.xs,
    color: colors.textMuted,
    margin: '4px 0 0',
  },
  button: {
    width: '100%',
    padding: '14px',
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
  loginLink: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
}