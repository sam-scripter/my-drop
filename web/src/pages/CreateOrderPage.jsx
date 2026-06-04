// CreateOrderPage.jsx — Create a new delivery order
//
// Updated with orange/navy theme.
// On success shows the tracking link with copy button.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import api from '../api'
import {
  colors, shadows, radius, typography, spacing
} from '../theme'

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
  const [error, setError] = useState('')
  const [createdOrder, setCreatedOrder] = useState(null)
  const [copied, setCopied] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/orders', form)
      setCreatedOrder(res.data.order)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(createdOrder.tracking_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Success state ────────────────────────────────────────────────────
  if (createdOrder) {
    return (
      <DashboardLayout>
        <div style={styles.page}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>🎉</div>
            <h2 style={styles.successTitle}>Order Created!</h2>
            <p style={styles.successSubtitle}>
              For {createdOrder.customer_name}
            </p>

            <div style={styles.trackingBox}>
              <div style={styles.trackingLabel}>Tracking link</div>
              <div style={styles.trackingUrl}>
                {createdOrder.tracking_url}
              </div>
              <button onClick={handleCopy} style={styles.copyBtn}>
                {copied ? '✓ Copied!' : 'Copy link'}
              </button>
            </div>

            <p style={styles.trackingHint}>
              Share this link with your customer via WhatsApp or SMS.
              They can track their order in real time.
            </p>

            <div style={styles.successActions}>
              <button
                onClick={() => navigate('/orders')}
                style={styles.primaryBtn}
              >
                Assign a Rider →
              </button>
              <button
                onClick={() => setCreatedOrder(null)}
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

  // ── Form state ───────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div style={styles.page}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>New Order</h1>
          <p style={styles.pageSubtitle}>
            Enter the delivery details below
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.formCard}>
          <form onSubmit={handleSubmit}>

            <div style={styles.sectionLabel}>Customer details</div>

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
                  placeholder="07XXXXXXXX"
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

            <div style={styles.sectionLabel}>Order details</div>

            <div style={styles.field}>
              <label style={styles.label}>Items description</label>
              <textarea
                name="items_description"
                value={form.items_description}
                onChange={handleChange}
                style={{ ...styles.input, height: 80, resize: 'vertical' }}
                placeholder="e.g. 2x Ankara dress, 1x earrings set"
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
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.7 : 1,
                }}
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
  page: { padding: spacing.xl },
  pageHeader: { marginBottom: spacing.lg },
  pageTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.text,
    margin: '0 0 4px',
  },
  pageSubtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    margin: 0,
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
  formCard: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    maxWidth: 680,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
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
  },
  formActions: {
    display: 'flex',
    gap: spacing.sm,
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
  },
  cancelBtn: {
    padding: '10px 24px',
    background: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    cursor: 'pointer',
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  submitBtn: {
    padding: '10px 24px',
    background: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: radius.md,
    cursor: 'pointer',
    fontSize: typography.base,
    fontWeight: typography.semibold,
    boxShadow: shadows.sm,
  },

  // Success state
  successCard: {
    background: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    maxWidth: 500,
    margin: '0 auto',
    textAlign: 'center',
    boxShadow: shadows.lg,
    border: `1px solid ${colors.border}`,
  },
  successIcon: { fontSize: 64, marginBottom: spacing.md },
  successTitle: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.text,
    margin: '0 0 8px',
  },
  successSubtitle: {
    color: colors.textSecondary,
    margin: '0 0 24px',
  },
  trackingBox: {
    background: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    textAlign: 'left',
    border: `1px solid ${colors.border}`,
  },
  trackingLabel: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 4,
  },
  trackingUrl: {
    color: colors.primary,
    fontSize: typography.sm,
    wordBreak: 'break-all',
    marginBottom: 8,
  },
  copyBtn: {
    background: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: radius.sm,
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: typography.xs,
    fontWeight: typography.medium,
  },
  trackingHint: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 1.5,
    margin: '0 0 24px',
  },
  successActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  primaryBtn: {
    padding: '14px',
    background: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: radius.md,
    cursor: 'pointer',
    fontSize: typography.base,
    fontWeight: typography.semibold,
    boxShadow: shadows.sm,
  },
  secondaryBtn: {
    padding: '14px',
    background: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    cursor: 'pointer',
    fontSize: typography.base,
    color: colors.textSecondary,
  },
}