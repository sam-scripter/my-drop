// FeedbackPage.jsx — Customer ratings and feedback
//
// Shows all delivery ratings submitted by customers via the
// tracking page. Data comes from the Delivery table where
// rating is stored after the customer rates their experience.
//
// Sections:
//   - Summary cards: avg rating, positive/neutral/negative %
//   - Filter by rating range
//   - Individual feedback entries with rider and order info

import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import api from '../api'
import {
  colors, shadows, radius, typography, spacing
} from '../theme'

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | positive | neutral | negative

  useEffect(() => { loadFeedback() }, [])

  async function loadFeedback() {
    setLoading(true)
    try {
      const res = await api.get('/feedback')
      setFeedback(res.data.feedback)
      setSummary(res.data.summary)
    } catch (err) {
      console.error('Failed to load feedback:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter feedback client-side
  const filteredFeedback = feedback.filter(item => {
    if (filter === 'all') return true
    if (filter === 'positive') return item.rating >= 4
    if (filter === 'neutral') return item.rating === 3
    if (filter === 'negative') return item.rating <= 2
    return true
  })

  return (
    <DashboardLayout>
      <div style={styles.page}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Customer Feedback</h1>
            <p style={styles.pageSubtitle}>
              Monitor customer satisfaction and delivery ratings
            </p>
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading feedback...</div>
        ) : (
          <>
            {/* ── Summary cards ───────────────────────────────────── */}
            {summary && (
              <div style={styles.summaryGrid}>
                <div style={styles.avgRatingCard}>
                  <div style={styles.avgRatingValue}>
                    {summary.avg_rating || '—'}
                  </div>
                  <div style={styles.avgRatingStars}>
                    {summary.avg_rating
                      ? renderStars(parseFloat(summary.avg_rating))
                      : ''}
                  </div>
                  <div style={styles.avgRatingLabel}>
                    Average Rating
                  </div>
                  <div style={styles.avgRatingCount}>
                    from {summary.total_ratings} ratings
                  </div>
                </div>

                {[
                  {
                    label: 'Positive',
                    value: summary.positive_percent,
                    icon: '👍',
                    color: colors.success,
                    filter: 'positive',
                  },
                  {
                    label: 'Neutral',
                    value: summary.neutral_percent,
                    icon: '😐',
                    color: colors.warning,
                    filter: 'neutral',
                  },
                  {
                    label: 'Negative',
                    value: summary.negative_percent,
                    icon: '👎',
                    color: colors.error,
                    filter: 'negative',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.sentimentCard,
                      border: filter === item.filter
                        ? `2px solid ${item.color}`
                        : `1px solid ${colors.border}`,
                      cursor: 'pointer',
                    }}
                    onClick={() => setFilter(
                      filter === item.filter ? 'all' : item.filter
                    )}
                  >
                    <div style={styles.sentimentIcon}>{item.icon}</div>
                    <div style={{
                      ...styles.sentimentValue,
                      color: item.color,
                    }}>
                      {item.value}%
                    </div>
                    <div style={styles.sentimentLabel}>{item.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Filter pills ─────────────────────────────────────── */}
            <div style={styles.filterRow}>
              {[
                { label: 'All feedback', value: 'all' },
                { label: '⭐⭐⭐⭐⭐ 5 stars', value: '5' },
                { label: '⭐⭐⭐⭐ 4 stars', value: '4' },
                { label: '⭐⭐⭐ 3 stars', value: '3' },
                { label: '⭐⭐ 2 stars', value: '2' },
                { label: '⭐ 1 star', value: '1' },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => {
                    if (['1','2','3','4','5'].includes(f.value)) {
                      // Star filter — filter by exact rating
                      setFilter(f.value)
                    } else {
                      setFilter(f.value)
                    }
                  }}
                  style={{
                    ...styles.filterPill,
                    background: filter === f.value
                      ? colors.primary
                      : colors.surface,
                    color: filter === f.value
                      ? 'white'
                      : colors.textSecondary,
                    border: `1px solid ${filter === f.value
                      ? colors.primary
                      : colors.border}`,
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* ── Feedback list ────────────────────────────────────── */}
            {filteredFeedback.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 48, marginBottom: spacing.md }}>
                  ⭐
                </div>
                <h3 style={styles.emptyTitle}>No feedback yet</h3>
                <p style={styles.emptyText}>
                  Customer ratings will appear here after deliveries
                  are completed and rated.
                </p>
              </div>
            ) : (
              <div style={styles.feedbackList}>
                {filteredFeedback.map((item, i) => (
                  <FeedbackCard key={i} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function FeedbackCard({ item }) {
  const ratingColor = item.rating >= 4
    ? colors.success
    : item.rating === 3
    ? colors.warning
    : colors.error

  const sentiment = item.rating >= 4
    ? 'Positive'
    : item.rating === 3
    ? 'Neutral'
    : 'Negative'

  return (
    <div style={styles.feedbackCard}>
      <div style={styles.feedbackHeader}>
        <div style={styles.feedbackCustomer}>
          <div style={styles.customerAvatar}>
            {item.customer_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={styles.customerName}>
              {item.customer_name}
            </div>
            <div style={styles.feedbackMeta}>
              Order #{item.order_id?.slice(-6).toUpperCase()} ·{' '}
              {new Date(item.rated_at).toLocaleDateString('en-KE', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        <div style={styles.feedbackRight}>
          <span style={{
            ...styles.sentimentBadge,
            background: ratingColor + '18',
            color: ratingColor,
          }}>
            {sentiment}
          </span>
          <div style={styles.ratingDisplay}>
            {renderStars(item.rating)}
          </div>
        </div>
      </div>

      <div style={styles.feedbackDetails}>
        {item.rider_name && (
          <div style={styles.feedbackDetail}>
            <span style={styles.detailLabel}>Rider:</span>
            <span style={styles.detailValue}>{item.rider_name}</span>
          </div>
        )}
        {item.customer_address && (
          <div style={styles.feedbackDetail}>
            <span style={styles.detailLabel}>Delivered to:</span>
            <span style={styles.detailValue}>
              {item.customer_address}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Render star icons for a given rating
function renderStars(rating) {
  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      style={{
        color: i < Math.round(rating) ? '#FBBC04' : colors.border,
        fontSize: 16,
      }}
    >
      ★
    </span>
  ))
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
  loading: {
    padding: spacing.xxl,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avgRatingCard: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
    textAlign: 'center',
  },
  avgRatingValue: {
    fontSize: 52,
    fontWeight: typography.bold,
    color: '#FBBC04',
    lineHeight: 1,
    marginBottom: 8,
  },
  avgRatingStars: {
    marginBottom: 8,
    display: 'flex',
    justifyContent: 'center',
    gap: 2,
  },
  avgRatingLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  avgRatingCount: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  sentimentCard: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    boxShadow: shadows.sm,
    textAlign: 'center',
    transition: 'border 0.15s ease',
  },
  sentimentIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  sentimentValue: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    lineHeight: 1,
    marginBottom: 4,
  },
  sentimentLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  filterRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  filterPill: {
    padding: '6px 14px',
    borderRadius: radius.full,
    cursor: 'pointer',
    fontSize: typography.sm,
    fontWeight: typography.medium,
    transition: 'all 0.15s ease',
  },
  feedbackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  feedbackCard: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
  },
  feedbackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  feedbackCustomer: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  customerAvatar: {
    width: 40,
    height: 40,
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
  customerName: {
    fontWeight: typography.semibold,
    fontSize: typography.base,
    color: colors.text,
  },
  feedbackMeta: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  feedbackRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  sentimentBadge: {
    padding: '2px 10px',
    borderRadius: radius.full,
    fontSize: typography.xs,
    fontWeight: typography.semibold,
  },
  ratingDisplay: {
    display: 'flex',
    gap: 1,
  },
  feedbackDetails: {
    display: 'flex',
    gap: spacing.lg,
    flexWrap: 'wrap',
    paddingTop: spacing.sm,
    borderTop: `1px solid ${colors.border}`,
  },
  feedbackDetail: {
    display: 'flex',
    gap: 6,
    fontSize: typography.sm,
  },
  detailLabel: {
    color: colors.textMuted,
    fontWeight: typography.medium,
  },
  detailValue: {
    color: colors.textSecondary,
  },
  emptyState: {
    textAlign: 'center',
    padding: `${spacing.xxxl}px 0`,
    background: colors.surface,
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
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