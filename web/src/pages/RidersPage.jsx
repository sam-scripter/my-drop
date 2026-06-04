// RidersPage.jsx — Manage riders
//
// Card grid layout showing rider status, contact details,
// and delivery stats. Updated with orange/navy theme.

import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import api from '../api'
import {
  colors, shadows, radius, typography, spacing
} from '../theme'

export default function RidersPage() {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  useEffect(() => { loadRiders() }, [])

  async function loadRiders() {
    setLoading(true)
    try {
      const res = await api.get('/users/riders')
      setRiders(res.data.riders)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddRider(e) {
    e.preventDefault()
    setAddLoading(true)
    setAddError('')
    setAddSuccess('')

    try {
      await api.post('/users/rider', form)
      setAddSuccess(
        `Rider account created. Login credentials sent to ${form.email}.`
      )
      setForm({ name: '', phone: '', email: '' })
      loadRiders()
    } catch (err) {
      setAddError(
        err.response?.data?.message || 'Failed to create rider account'
      )
    } finally {
      setAddLoading(false)
    }
  }

  async function handleToggle(riderId) {
    try {
      await api.put(`/users/riders/${riderId}/toggle`)
      loadRiders()
    } catch (err) {
      console.error(err)
    }
  }

  const activeCount = riders.filter(r => r.is_active).length
  const inactiveCount = riders.length - activeCount

  return (
    <DashboardLayout>
      <div style={styles.page}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Riders</h1>
            <p style={styles.pageSubtitle}>
              Manage your delivery fleet
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={styles.addBtn}
          >
            + Add Rider
          </button>
        </div>

        {/* ── Summary row ─────────────────────────────────────────── */}
        <div style={styles.summaryRow}>
          {[
            { label: 'Total Riders', value: riders.length, color: colors.text },
            { label: 'Active', value: activeCount, color: colors.success },
            { label: 'Inactive', value: inactiveCount, color: colors.textMuted },
          ].map((item, i) => (
            <div key={i} style={styles.summaryCard}>
              <div style={{ ...styles.summaryValue, color: item.color }}>
                {item.value}
              </div>
              <div style={styles.summaryLabel}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* ── Rider cards ─────────────────────────────────────────── */}
        {loading ? (
          <div style={styles.loading}>Loading riders...</div>
        ) : riders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🏍️</div>
            <h3 style={styles.emptyTitle}>No riders yet</h3>
            <p style={styles.emptyText}>
              Add your first rider to start assigning deliveries.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              style={styles.emptyBtn}
            >
              Add your first rider
            </button>
          </div>
        ) : (
          <div style={styles.riderGrid}>
            {riders.map(rider => (
              <RiderCard
                key={rider.id}
                rider={rider}
                onToggle={() => handleToggle(rider.id)}
              />
            ))}
          </div>
        )}

        {/* ── Add rider modal ──────────────────────────────────────── */}
        {showAddModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Add New Rider</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setAddError('')
                    setAddSuccess('')
                  }}
                  style={styles.closeBtn}
                >
                  ✕
                </button>
              </div>

              {addSuccess ? (
                <div>
                  <div style={styles.successMsg}>{addSuccess}</div>
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      setAddSuccess('')
                    }}
                    style={styles.doneBtn}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddRider}>
                  {addError && (
                    <div style={styles.errorMsg}>{addError}</div>
                  )}

                  <div style={styles.field}>
                    <label style={styles.label}>Full name *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      style={styles.input}
                      placeholder="Rider's full name"
                      required
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Phone number *</label>
                    <input
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      style={styles.input}
                      placeholder="07XXXXXXXX"
                      required
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Email address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      style={styles.input}
                      placeholder="rider@example.com"
                      required
                    />
                    <p style={styles.fieldHint}>
                      Login credentials will be sent to this email.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={addLoading}
                    style={{
                      ...styles.submitBtn,
                      opacity: addLoading ? 0.7 : 1,
                    }}
                  >
                    {addLoading ? 'Creating...' : 'Create rider account'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}

function RiderCard({ rider, onToggle }) {
  const initials = rider.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div style={styles.riderCard}>
      <div style={styles.cardTop}>
        <div style={styles.avatar}>{initials}</div>
        <div style={{
          ...styles.statusBadge,
          background: rider.is_active
            ? colors.success + '18'
            : colors.textMuted + '18',
          color: rider.is_active ? colors.success : colors.textMuted,
        }}>
          {rider.is_active ? 'Active' : 'Inactive'}
        </div>
      </div>

      <h3 style={styles.riderName}>{rider.name}</h3>
      <p style={styles.riderEmail}>{rider.email}</p>

      <div style={styles.riderDetails}>
        <div style={styles.riderDetail}>
          <span style={styles.detailIcon}>📞</span>
          <span style={styles.detailText}>{rider.phone}</span>
        </div>
      </div>

      <div style={styles.cardActions}>
        <button
          onClick={onToggle}
          style={{
            ...styles.toggleBtn,
            background: rider.is_active
              ? colors.errorLight
              : colors.successLight,
            color: rider.is_active ? colors.error : colors.success,
            border: `1px solid ${rider.is_active
              ? colors.error + '40'
              : colors.success + '40'}`,
          }}
        >
          {rider.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: { padding: spacing.xl },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
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
  addBtn: {
    background: colors.primary,
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: radius.md,
    fontWeight: typography.semibold,
    fontSize: typography.base,
    cursor: 'pointer',
    boxShadow: shadows.sm,
  },
  summaryRow: {
    display: 'flex',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: `${spacing.md}px ${spacing.lg}px`,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
    minWidth: 120,
  },
  summaryValue: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    lineHeight: 1,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  loading: {
    padding: spacing.xxl,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  emptyState: {
    textAlign: 'center',
    padding: `${spacing.xxxl}px 0`,
  },
  emptyIcon: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.text,
    margin: '0 0 8px',
  },
  emptyText: {
    color: colors.textSecondary,
    margin: '0 0 24px',
  },
  emptyBtn: {
    background: colors.primary,
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: radius.md,
    fontWeight: typography.semibold,
    cursor: 'pointer',
  },
  riderGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: spacing.md,
  },
  riderCard: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: typography.bold,
    fontSize: typography.lg,
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: radius.full,
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  riderName: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    margin: '0 0 2px',
  },
  riderEmail: {
    fontSize: typography.sm,
    color: colors.textMuted,
    margin: '0 0 12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  riderDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: spacing.md,
  },
  riderDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: { fontSize: 14 },
  detailText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  cardActions: {
    borderTop: `1px solid ${colors.border}`,
    paddingTop: spacing.sm,
  },
  toggleBtn: {
    width: '100%',
    padding: '8px',
    borderRadius: radius.md,
    cursor: 'pointer',
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: 420,
    boxShadow: shadows.xl,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.text,
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 18,
    color: colors.textMuted,
    cursor: 'pointer',
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
  },
  fieldHint: {
    fontSize: typography.xs,
    color: colors.textMuted,
    margin: '4px 0 0',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: radius.md,
    fontSize: typography.base,
    fontWeight: typography.semibold,
    cursor: 'pointer',
    marginTop: 8,
  },
  successMsg: {
    background: colors.successLight,
    border: `1px solid ${colors.success}40`,
    color: colors.success,
    padding: '12px 16px',
    borderRadius: radius.md,
    fontSize: typography.sm,
    marginBottom: spacing.md,
    lineHeight: 1.5,
  },
  errorMsg: {
    background: colors.errorLight,
    border: `1px solid ${colors.error}40`,
    color: colors.error,
    padding: '12px 16px',
    borderRadius: radius.md,
    fontSize: typography.sm,
    marginBottom: spacing.md,
  },
  doneBtn: {
    width: '100%',
    padding: '12px',
    background: colors.success,
    color: 'white',
    border: 'none',
    borderRadius: radius.md,
    fontSize: typography.base,
    fontWeight: typography.semibold,
    cursor: 'pointer',
  },
}