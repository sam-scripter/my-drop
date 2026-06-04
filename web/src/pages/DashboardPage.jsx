// DashboardPage.jsx — Main dashboard / Command Center
//
// Shows today's analytics summary and recent orders.
// Uses the new orange/navy theme via theme.js tokens.

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import OnboardingWizard from '../components/OnboardingWizard'
import api from '../api'
import { colors, shadows, radius, typography, spacing, getStatusColor, getStatusLabel } from '../theme'
import { getUser, getBusiness } from '../auth'

export default function DashboardPage() {
  const user = getUser()
  const business = getBusiness()
  const [summary, setSummary] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem('mydrop_onboarding_done') !== 'true'
  )

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        api.get('/analytics/today'),
        api.get('/orders?limit=5'),
      ])
      setSummary(analyticsRes.data.summary)
      setRecentOrders(ordersRes.data.orders)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12
    ? 'Good morning'
    : hour < 17
    ? 'Good afternoon'
    : 'Good evening'

  const STAT_CARDS = [
    {
      label: 'Orders Today',
      value: summary?.orders_created ?? 0,
      icon: '📦',
      color: colors.primary,
    },
    {
      label: 'Delivered',
      value: summary?.delivered ?? 0,
      icon: '✅',
      color: colors.success,
    },
    {
      label: 'Failed',
      value: summary?.failed ?? 0,
      icon: '❌',
      color: colors.error,
    },
    {
      label: 'Avg Delivery Time',
      value: summary?.avg_delivery_minutes
        ? `${summary.avg_delivery_minutes}m`
        : '--',
      icon: '⏱',
      color: colors.warning,
    },
  ]

  return (
    <DashboardLayout>
      {showOnboarding && (
        <OnboardingWizard onDismiss={() => setShowOnboarding(false)} />
      )}

      <div style={styles.page}>

        {/* ── Page header ───────────────────────────────────────────── */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={styles.pageSubtitle}>
              {business?.name} · Here's what's happening today
            </p>
          </div>
          <Link to="/orders/new" style={styles.newOrderBtn}>
            + New Order
          </Link>
        </div>

        {/* ── Stat cards ────────────────────────────────────────────── */}
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <>
            <div style={styles.statsGrid}>
              {STAT_CARDS.map((card, i) => (
                <div key={i} style={styles.statCard}>
                  <div style={{
                    ...styles.statIconWrapper,
                    background: card.color + '18',
                  }}>
                    <span style={styles.statIcon}>{card.icon}</span>
                  </div>
                  <div style={{ ...styles.statValue, color: card.color }}>
                    {card.value}
                  </div>
                  <div style={styles.statLabel}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* ── Recent orders ──────────────────────────────────────── */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Recent Orders</h2>
                <Link to="/orders" style={styles.seeAll}>See all →</Link>
              </div>

              {recentOrders.length === 0 ? (
                <div style={styles.empty}>
                  <p style={styles.emptyText}>No orders yet today.</p>
                  <Link to="/orders/new" style={styles.emptyLink}>
                    Create your first order →
                  </Link>
                </div>
              ) : (
                <div style={styles.table}>
                  <div style={styles.tableHeader}>
                    <span>Customer</span>
                    <span>Address</span>
                    <span>Status</span>
                    <span>Rider</span>
                    <span>Actions</span>
                  </div>
                  {recentOrders.map(order => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function OrderRow({ order }) {
  const statusColor = getStatusColor(order.status)
  const statusLabel = getStatusLabel(order.status)

  return (
    <div style={styles.tableRow}>
      <div>
        <div style={styles.customerName}>{order.customer_name}</div>
        <div style={styles.customerPhone}>{order.customer_phone}</div>
      </div>
      <div style={styles.cellMuted}>{order.customer_address}</div>
      <div>
        <span style={{
          ...styles.badge,
          background: statusColor + '18',
          color: statusColor,
        }}>
          {statusLabel}
        </span>
      </div>
      <div style={styles.cellMuted}>
        {order.delivery?.rider?.name || '—'}
      </div>
      <div>
        <a
          href={order.tracking_url}
          target="_blank"
          rel="noreferrer"
          style={styles.trackLink}
        >
          Track →
        </a>
      </div>
    </div>
  )
}

const styles = {
  page: {
    padding: spacing.xl,
    maxWidth: 1200,
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
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
  newOrderBtn: {
    background: colors.primary,
    color: 'white',
    padding: '10px 20px',
    borderRadius: radius.md,
    textDecoration: 'none',
    fontWeight: typography.semibold,
    fontSize: typography.base,
    boxShadow: shadows.sm,
  },
  loading: {
    textAlign: 'center',
    padding: spacing.xxl,
    color: colors.textSecondary,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statIcon: { fontSize: 22 },
  statValue: {
    fontSize: 36,
    fontWeight: typography.bold,
    lineHeight: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  section: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    margin: 0,
  },
  seeAll: {
    color: colors.primary,
    textDecoration: 'none',
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
  empty: {
    textAlign: 'center',
    padding: `${spacing.xxl}px 0`,
  },
  emptyText: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyLink: {
    color: colors.primary,
    textDecoration: 'none',
    fontWeight: typography.medium,
  },
  table: { width: '100%' },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 2fr 1fr 1fr 0.5fr',
    padding: '8px 12px',
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: 4,
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 2fr 1fr 1fr 0.5fr',
    padding: '12px',
    alignItems: 'center',
    borderBottom: `1px solid ${colors.border}`,
    fontSize: typography.base,
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
  trackLink: {
    color: colors.primary,
    textDecoration: 'none',
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
}