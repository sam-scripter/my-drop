// SignupPage.jsx — New business registration
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { setAuth } from '../auth'

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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      const response = await axios.post(`${API_BASE}/auth/register`, {
        businessName: form.businessName,
        businessPhone: form.businessPhone,
        businessEmail: form.businessEmail,
        managerName: form.managerName,
        password: form.password,
        businessType: form.businessType, 
      })

      const { token, user, business } = response.data
      setAuth(token, user, business)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Get started with mydrop</h1>
          <p style={styles.subtitle}>
            Set up your business and start tracking deliveries in minutes
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.section}>Business details</div>

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
                placeholder="0712345678"
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
          {/* Business type selector */}
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
              This helps us use the right language for your customers
            </p>
          </div>

          <div style={styles.section}>Your account</div>

          <div style={styles.field}>
            <label style={styles.label}>Your name *</label>
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
            {loading ? 'Creating account...' : 'Create account & get started'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1A73E8' }}>Sign in</Link>
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
    background: '#F8F9FA',
    padding: 24,
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: 40,
    width: '100%',
    maxWidth: 600,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#202124',
    margin: '0 0 8px',
  },
  subtitle: {
    color: '#5F6368',
    fontSize: 14,
    margin: 0,
  },
  section: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6368',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 12,
    marginTop: 8,
  },
  error: {
    background: '#FFF5F5',
    border: '1px solid #FECACA',
    color: '#EA4335',
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
  },
  row: {
    display: 'flex',
    gap: 16,
  },
  field: {
    flex: 1,
    marginBottom: 16,
  },
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
  loginLink: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    color: '#5F6368',
  },
  fieldHint: {
    fontSize: 12,
    color: '#5F6368',
    marginTop: 4,
  },
}