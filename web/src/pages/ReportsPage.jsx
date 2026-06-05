// ReportsPage.jsx — Analytics and performance reports
//
// Shows real delivery and revenue data from the API.
// Period selector: Today, This Week, This Month.
// Sections: summary cards, delivery trends chart,
// top performing riders.

import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import api from '../api'
import {
  colors, shadows, radius, typography, spacing,
} from '../theme'

const PERIODS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState('month')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadReports() }, [period])

  async function loadReports() {
    setLoading(true)
    try {
      const res = await api.get(`/reports?period=${period}`)
      setData(res.data)
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div style={styles.page}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Reports</h1>
            <p style={styles.pageSubtitle}>
              Analytics and performance insights
            </p>
          </div>

          {/* Period selector */}
          <div style={styles.periodSelector}>
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{
                  ...styles.periodBtn,
                  background: period === p.value
                    ? colors.primary
                    : colors.surface,
                  color: period === p.value
                    ? 'white'
                    : colors.textSecondary,
                  border: `1px solid ${period === p.value
                    ? colors.primary
                    : colors.border}`,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading reports...</div>
        ) : !data ? (
          <div style={styles.loading}>Failed to load reports.</div>
        ) : (
          <>
            {/* ── Summary cards ───────────────────────────────────── */}
            <div style={styles.statsGrid}>
              {[
                {
                  label: 'Total Orders',
                  value: data.summary.total_orders,
                  icon: '📦',
                  color: colors.primary,
                  sub: null,
                },
                {
                  label: 'Delivered',
                  value: data.summary.delivered,
                  icon: '✅',
                  color: colors.success,
                  sub: `${data.summary.delivery_rate}% success rate`,
                },
                {
                  label: 'Failed',
                  value: data.summary.failed,
                  icon: '❌',
                  color: colors.error,
                  sub: null,
                },
                {
                  label: 'Total Revenue',
                  value: data.summary.total_revenue > 0
                    ? `KES ${data.summary.total_revenue.toLocaleString()}`
                    : '—',
                  icon: '💰',
                  color: colors.warning,
                  sub: data.summary.delivery_revenue > 0
                    ? `KES ${data.summary.delivery_revenue.toLocaleString()} delivery fees`
                    : null,
                },
                {
                  label: 'Avg Delivery Time',
                  value: data.summary.avg_delivery_time
                    ? `${data.summary.avg_delivery_time}m`
                    : '—',
                  icon: '⏱',
                  color: colors.info || '#3B82F6',
                  sub: null,
                },
                {
                  label: 'Avg Rating',
                  value: data.summary.avg_rating
                    ? `${data.summary.avg_rating} ★`
                    : '—',
                  icon: '⭐',
                  color: '#FBBC04',
                  sub: null,
                },
              ].map((card, i) => (
                <div key={i} style={styles.statCard}>
                  <div style={{
                    ...styles.statIcon,
                    background: card.color + '18',
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ ...styles.statValue, color: card.color }}>
                    {card.value}
                  </div>
                  <div style={styles.statLabel}>{card.label}</div>
                  {card.sub && (
                    <div style={styles.statSub}>{card.sub}</div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Daily breakdown chart ────────────────────────────── */}
            {data.daily_breakdown.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Delivery Trends</h2>
                <SimpleBarChart data={data.daily_breakdown} />
              </div>
            )}

            {/* ── Top riders ──────────────────────────────────────── */}
            {data.rider_stats.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  Top Performing Riders
                </h2>
                <div style={styles.riderTable}>
                  <div style={styles.riderTableHeader}>
                    <span>#</span>
                    <span>Rider</span>
                    <span>Deliveries</span>
                    <span>Failed</span>
                    <span>Avg Rating</span>
                    <span>Revenue</span>
                  </div>
                  {data.rider_stats.map((rider, i) => (
                    <div key={rider.id} style={styles.riderTableRow}>
                      <span style={styles.riderRank}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </span>
                      <span style={styles.riderName}>
                        {rider.name}
                      </span>
                      <span style={{ color: colors.success, fontWeight: typography.semibold }}>
                        {rider.deliveries}
                      </span>
                      <span style={{ color: colors.error }}>
                        {rider.failed}
                      </span>
                      <span style={{ color: '#FBBC04' }}>
                        {rider.avgRating ? `${rider.avgRating} ★` : '—'}
                      </span>
                      <span style={{ color: colors.textSecondary }}>
                        {rider.revenue > 0
                          ? `KES ${rider.revenue.toLocaleString()}`
                          : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Empty state ──────────────────────────────────────── */}
            {data.summary.total_orders === 0 && (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 48, marginBottom: spacing.md }}>
                  📊
                </div>
                <h3 style={styles.emptyTitle}>No data for this period</h3>
                <p style={styles.emptyText}>
                  Create some orders to start seeing reports here.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

// ── Simple bar chart using pure CSS/HTML ─────────────────────────────────
// No charting library needed for this simple visualization.
// Each bar's height is proportional to the max value in the dataset.

function SimpleBarChart({ data }) {
  const maxOrders = Math.max(...data.map(d => d.orders), 1)

  return (
    <div style={chartStyles.wrapper}>
      <div style={chartStyles.bars}>
        {data.map((day, i) => (
          <div key={i} style={chartStyles.barGroup}>
            <div style={chartStyles.barWrapper}>
              {/* Delivered bar (green) */}
              <div style={{
                ...chartStyles.bar,
                height: `${(day.delivered / maxOrders) * 100}%`,
                background: colors.success,
              }} />
              {/* Total bar (orange, behind) */}
              <div style={{
                ...chartStyles.bar,
                height: `${(day.orders / maxOrders) * 100}%`,
                background: colors.primary + '40',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
              }} />
            </div>
            <div style={chartStyles.barLabel}>
              {new Date(day.date).toLocaleDateString('en-KE', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div style={chartStyles.barValue}>{day.orders}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={chartStyles.legend}>
        <div style={chartStyles.legendItem}>
          <div style={{
            ...chartStyles.legendDot,
            background: colors.success,
          }} />
          <span>Delivered</span>
        </div>
        <div style={chartStyles.legendItem}>
          <div style={{
            ...chartStyles.legendDot,
            background: colors.primary + '40',
          }} />
          <span>Total orders</span>
        </div>
      </div>
    </div>
  )
}

const chartStyles = {
  wrapper: {
    padding: `${spacing.md}px 0`,
  },
  bars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 4,
    height: 160,
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: 0,
    overflowX: 'auto',
  },
  barGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 40,
    flex: 1,
  },
  barWrapper: {
    width: '100%',
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    position: 'relative',
    justifyContent: 'center',
  },
  bar: {
    width: '60%',
    minHeight: 2,
    borderRadius: '3px 3px 0 0',
    transition: 'height 0.3s ease',
    position: 'relative',
    zIndex: 1,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    whiteSpace: 'nowrap',
  },
  barValue: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
  },
  legend: {
    display: 'flex',
    gap: spacing.md,
    marginTop: spacing.sm,
    justifyContent: 'flex-end',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
}

const styles = {
  page: { padding: spacing.xl },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.md,
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
  periodSelector: {
    display: 'flex',
    gap: 8,
  },
  periodBtn: {
    padding: '8px 16px',
    borderRadius: radius.full,
    cursor: 'pointer',
    fontSize: typography.sm,
    fontWeight: typography.medium,
    transition: 'all 0.15s ease',
  },
  loading: {
    padding: spacing.xxl,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
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
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    lineHeight: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  statSub: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    margin: '0 0 16px',
  },
  riderTable: { width: '100%' },
  riderTableHeader: {
    display: 'grid',
    gridTemplateColumns: '40px 1fr 100px 80px 100px 120px',
    padding: '8px 12px',
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: 4,
  },
  riderTableRow: {
    display: 'grid',
    gridTemplateColumns: '40px 1fr 100px 80px 100px 120px',
    padding: '12px',
    alignItems: 'center',
    borderBottom: `1px solid ${colors.border}`,
    fontSize: typography.base,
  },
  riderRank: { fontSize: typography.lg },
  riderName: {
    fontWeight: typography.medium,
    color: colors.text,
  },
  emptyState: {
    textAlign: 'center',
    padding: `${spacing.xxxl}px 0`,
  },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.text,
    margin: '0 0 8px',
  },
  emptyText: {
    color: colors.textSecondary,
    margin: 0,
  },
}