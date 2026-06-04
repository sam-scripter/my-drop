// OrdersPage.jsx — All orders with filtering and rider assignment
//
// Updated with orange/navy theme via theme.js tokens.
// Filters by status, shows assignment modal for pending orders.

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import api from '../api'
import {
  colors, shadows, radius, typography, spacing,
  getStatusColor, getStatusLabel
} from '../theme'

const STATUS_FILTERS = [
  { label: 'All', value: null },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Picked Up', value: 'PICKED_UP' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Failed', value: 'FAILED' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [riders, setRiders] = useState([])
  const [statusFilter, setStatusFilter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [assignOrderId, setAssignOrderId] = useState(null)

  useEffect(() => {
    loadOrders()
    loadRiders()
  }, [statusFilter])

  async function loadOrders() {
    setLoading(true)
    try {
      const url = statusFilter ? `/orders?status=${statusFilter}` : '/orders'
      const res = await api.get(url)
      setOrders(res.data.orders)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadRiders() {
    try {
      const res = await api.get('/users/riders')
      setRiders(res.data.riders.filter(r => r.is_active))
    } catch (err) {
      console.error(err)
    }
  }

  async function handleAssign(orderId, riderId) {
    try {
      await api.post(`/orders/${orderId}/assign`, { riderId })
      setAssignOrderId(null)
      loadOrders()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign rider')
    }
  }

  return (
    <DashboardLayout>
      <div style={styles.page}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Orders</h1>
            <p style={styles.pageSubtitle}>
              Manage and track all your deliveries
            </p>
          </div>
          <Link to="/orders/new" style={styles.newBtn}>
            + New Order
          </Link>
        </div>

        {/* ── Status filters ───────────────────────────────────────── */}
        <div style={styles.filters}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.label}
              onClick={() => setStatusFilter(f.value)}
              style={{
                ...styles.filterBtn,
                background: statusFilter === f.value
                  ? colors.primary
                  : colors.surface,
                color: statusFilter === f.value
                  ? 'white'
                  : colors.textSecondary,
                border: `1px solid ${statusFilter === f.value
                  ? colors.primary
                  : colors.border}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Table ───────────────────────────────────────────────── */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <span>Customer</span>
            <span>Address</span>
            <span>Items</span>
            <span>Status</span>
            <span>Rider</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={styles.empty}>
              No orders found.{' '}
              <Link to="/orders/new" style={{ color: colors.primary }}>
                Create one →
              </Link>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} style={styles.tableRow}>
                <div>
                  <div style={styles.customerName}>
                    {order.customer_name}
                  </div>
                  <div style={styles.customerPhone}>
                    {order.customer_phone}
                  </div>
                </div>
                <div style={styles.cellMuted}>
                  {order.customer_address}
                </div>
                <div style={styles.cellMuted}>
                  {order.items_description || '—'}
                </div>
                <div>
                  <span style={{
                    ...styles.badge,
                    background: getStatusColor(order.status) + '18',
                    color: getStatusColor(order.status),
                  }}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div style={styles.cellMuted}>
                  {order.delivery?.rider?.name || (
                    order.status === 'PENDING' ? (
                      <button
                        onClick={() => setAssignOrderId(order.id)}
                        style={styles.assignBtn}
                      >
                        Assign
                      </button>
                    ) : '—'
                  )}
                </div>
                <div>
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.trackLink}
                  >
                    Track
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Assign rider modal ───────────────────────────────────── */}
        {assignOrderId && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Assign Rider</h3>

              {riders.length === 0 ? (
                <p style={{ color: colors.textSecondary }}>
                  No active riders available.{' '}
                  <Link to="/riders" style={{ color: colors.primary }}>
                    Add a rider →
                  </Link>
                </p>
              ) : (
                riders.map(rider => (
                  <div key={rider.id} style={styles.riderOption}>
                    <div style={styles.riderAvatar}>
                      {rider.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.riderInfo}>
                      <div style={styles.riderName}>{rider.name}</div>
                      <div style={styles.riderPhone}>{rider.phone}</div>
                    </div>
                    <button
                      onClick={() => handleAssign(assignOrderId, rider.id)}
                      style={styles.selectBtn}
                    >
                      Select
                    </button>
                  </div>
                ))
              )}

              <button
                onClick={() => setAssignOrderId(null)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
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
  newBtn: {
    background: colors.primary,
    color: 'white',
    padding: '10px 20px',
    borderRadius: radius.md,
    textDecoration: 'none',
    fontWeight: typography.semibold,
    fontSize: typography.base,
    boxShadow: shadows.sm,
  },
  filters: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  filterBtn: {
    padding: '6px 14px',
    borderRadius: radius.full,
    cursor: 'pointer',
    fontSize: typography.sm,
    fontWeight: typography.medium,
    transition: 'all 0.15s ease',
  },
  tableCard: {
    background: colors.surface,
    borderRadius: radius.lg,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 1fr 0.5fr',
    padding: '12px 16px',
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: colors.background,
    borderBottom: `1px solid ${colors.border}`,
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 1fr 0.5fr',
    padding: '14px 16px',
    alignItems: 'center',
    borderBottom: `1px solid ${colors.border}`,
    fontSize: typography.base,
    transition: 'background 0.1s ease',
  },
  loading: {
    padding: spacing.xxl,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  empty: {
    padding: spacing.xxl,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  customerName: {
    fontWeight: typography.medium,
    color: colors.text,
  },
  customerPhone: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  cellMuted: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badge: {
    padding: '3px 10px',
    borderRadius: radius.full,
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  assignBtn: {
    background: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: radius.sm,
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: typography.xs,
    fontWeight: typography.medium,
  },
  trackLink: {
    color: colors.primary,
    textDecoration: 'none',
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
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: shadows.xl,
  },
  modalTitle: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.text,
    margin: '0 0 16px',
  },
  riderOption: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    borderBottom: `1px solid ${colors.border}`,
  },
  riderAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: typography.bold,
    fontSize: typography.base,
    flexShrink: 0,
  },
  riderInfo: { flex: 1 },
  riderName: {
    fontWeight: typography.medium,
    fontSize: typography.base,
    color: colors.text,
  },
  riderPhone: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  selectBtn: {
    background: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: radius.md,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
  cancelBtn: {
    width: '100%',
    marginTop: spacing.md,
    padding: '12px',
    background: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    cursor: 'pointer',
    fontSize: typography.base,
    color: colors.textSecondary,
  },
}