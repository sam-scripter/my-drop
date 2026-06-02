// CreateOrderPage.jsx — Create a new delivery order
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import DashboardLayout from '../components/DashboardLayout'

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    items_description: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(null)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/orders', form)
      setCreated(res.data.order)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    return (
      <DashboardLayout>
        <div style={styles.page}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>🎉</div>
            <h2 style={styles.successTitle}>Order Created!</h2>
            <p style={styles.successSub}>For {created.customer_name}</p>

            <div style={styles.trackingBox}>
              <div style={styles.trackingLabel}>Tracking link</div>
              <div style={styles.trackingUrl}>{created.tracking_url}</div>
              <button
                onClick={() => navigator.clipboard.writeText(created.tracking_url)}
                style={styles.copyBtn}
              >
                Copy link
              </button>
            </div>

            <div style={styles.successActions}>
              <button
                onClick={() => navigate('/orders')}
                style={styles.primaryBtn}
              >
                Assign a Rider →
              </button>
              <button
                onClick={() => setCreated(null)}
                style={styles.secondaryBtn}
              >
                Create Another Order
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div style={styles.page}>
        <h1 style={styles.title}>New Order</h1>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div style={styles.section}>Customer details</div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Customer name *</label>
                <input
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Full name"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Phone number *</label>
                <input
                  name="customer_phone"
                  value={form.customer_phone}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="0712345678"
                  required
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Delivery address *</label>
              <input
                name="customer_address"
                value={form.customer_address}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g. Kilimani, Nairobi"
                required
              />
            </div>

            <div style={styles.section}>Order details</div>

            <div style={styles.field}>
              <label style={styles.label}>Items description</label>
              <textarea
                name="items_description"
                value={form.items_description}
                onChange={handleChange}
                style={{ ...styles.input, height: 80, resize: 'vertical' }}
                placeholder="e.g. 2x Chicken burger, 1x Fries"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Notes for rider</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                style={{ ...styles.input, height: 60, resize: 'vertical' }}
                placeholder="e.g. Call on arrival, gate code: 1234"
              />
            </div>

            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() => navigate('/orders')}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

const styles = {
  page: {
    padding: 32,
    marginLeft: 240,
    minHeight: '100vh',
    background: '#F8F9FA',
  },
  title: { fontSize: 24, fontWeight: 'bold', margin: '0 0 24px' },
  error: {
    background: '#FFF5F5',
    border: '1px solid #FECACA',
    color: '#EA4335',
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
  },
  formCard: {
    background: 'white',
    borderRadius: 12,
    padding: 32,
    maxWidth: 640,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  section: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6368',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 16,
    marginTop: 8,
    paddingBottom: 8,
    borderBottom: '1px solid #F1F3F4',
  },
  row: { display: 'flex', gap: 16 },
  field: { flex: 1, marginBottom: 16 },
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
    fontFamily: 'inherit',
  },
  formActions: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '10px 24px',
    background: '#F1F3F4',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    color: '#5F6368',
  },
  submitBtn: {
    padding: '10px 24px',
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '600',
  },
  successCard: {
    background: 'white',
    borderRadius: 16,
    padding: 48,
    maxWidth: 480,
    margin: '0 auto',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: 'bold', margin: '0 0 8px' },
  successSub: { color: '#5F6368', margin: '0 0 24px' },
  trackingBox: {
    background: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    textAlign: 'left',
  },
  trackingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6368',
    marginBottom: 4,
  },
  trackingUrl: {
    color: '#1A73E8',
    fontSize: 13,
    wordBreak: 'break-all',
    marginBottom: 8,
  },
  copyBtn: {
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: 12,
  },
  successActions: { display: 'flex', flexDirection: 'column', gap: 12 },
  primaryBtn: {
    padding: '12px',
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryBtn: {
    padding: '12px',
    background: '#F1F3F4',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    color: '#5F6368',
  },
}