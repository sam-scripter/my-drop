// DashboardPage.jsx — Main dispatch overview
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBusiness, getUser } from '../auth'
import api from '../api'
import DashboardLayout from '../components/DashboardLayout'
import OnboardingWizard from '../components/OnboardingWizard'

const STATUS_COLORS = {
  PENDING: '#9AA0A6',
  ASSIGNED: '#FBBC04',
  PICKED_UP: '#FF6D00',
  IN_TRANSIT: '#1A73E8',
  DELIVERED: '#34A853',
  FAILED: '#EA4335',
}

export default function DashboardPage() {
  const business = getBusiness()
  const user = getUser()
  const [analytics, setAnalytics] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  // Show onboarding wizard if this is a new user (not dismissed before)
  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem('mydrop_onboarding_done') !== 'true'
  )

  async function loadData() {
    setLoading(true)
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        api.get('/analytics/today'),
        api.get('/orders?limit=5'),
      ])
      setAnalytics(analyticsRes.data.summary)
      setRecentOrders(ordersRes.data.orders)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <DashboardLayout>
      {/* Onboarding wizard — shown only on first visit */}
      {showOnboarding && (
        <OnboardingWizard onDismiss={() => setShowOnboarding(false)} />
      )}
      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={styles.subtitle}>
              {business?.name} · Here's what's happening today
            </p>
          </div>
          <Link to="/orders/new" style={styles.newOrderBtn}>
            + New Order
          </Link>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <>
            {/* Summary cards */}
            <div style={styles.cards}>
              <SummaryCard
                label="Orders Today"
                value={analytics?.orders_created ?? 0}
                icon="📦"
                color="#1A73E8"
              />
              <SummaryCard
                label="Delivered"
                value={analytics?.delivered ?? 0}
                icon="✅"
                color="#34A853"
              />
              <SummaryCard
                label="Failed"
                value={analytics?.failed ?? 0}
                icon="❌"
                color="#EA4335"
              />
              <SummaryCard
                label="Avg Delivery Time"
                value={analytics?.avg_delivery_minutes
                  ? `${analytics.avg_delivery_minutes}m`
                  : '--'}
                icon="⏱️"
                color="#FBBC04"
              />
            </div>

            {/* Recent orders */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Recent Orders</h2>
                <Link to="/orders" style={styles.seeAll}>See all →</Link>
              </div>

              {recentOrders.length === 0 ? (
                <div style={styles.empty}>
                  <p>No orders yet today.</p>
                  <Link to="/orders/new" style={styles.emptyLink}>
                    Create your first order
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
                  {recentOrders.map((order) => (
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

function SummaryCard({ label, value, icon, color }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.cardIcon, background: color + '18' }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
      </div>
      <div style={{ ...styles.cardValue, color }}>{value}</div>
      <div style={styles.cardLabel}>{label}</div>
    </div>
  )
}

function OrderRow({ order }) {
  const status = order.status
  const color = STATUS_COLORS[status] || '#9AA0A6'

  return (
    <div style={styles.tableRow}>
      <div>
        <div style={styles.customerName}>{order.customer_name}</div>
        <div style={styles.customerPhone}>{order.customer_phone}</div>
      </div>
      <div style={styles.address}>{order.customer_address}</div>
      <div>
        <span style={{ ...styles.badge, background: color + '20', color }}>
          {status.replace('_', ' ')}
        </span>
      </div>
      <div style={styles.riderName}>
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
    padding: 32,
    marginLeft: 240,
    minHeight: '100vh',
    background: '#F8F9FA',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: '0 0 4px',
  },
  subtitle: {
    color: '#5F6368',
    margin: 0,
    fontSize: 14,
  },
  newOrderBtn: {
    background: '#1A73E8',
    color: 'white',
    padding: '10px 20px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: 14,
  },
  loading: {
    textAlign: 'center',
    padding: 48,
    color: '#5F6368',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    background: 'white',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 1,
    marginBottom: 4,
  },
  cardLabel: {
    color: '#5F6368',
    fontSize: 13,
  },
  section: {
    background: 'white',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    margin: 0,
  },
  seeAll: {
    color: '#1A73E8',
    textDecoration: 'none',
    fontSize: 14,
  },
  empty: {
    textAlign: 'center',
    padding: '32px 0',
    color: '#5F6368',
  },
  emptyLink: {
    color: '#1A73E8',
    textDecoration: 'none',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 2fr 1fr 1fr 0.5fr',
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6368',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #E8EAED',
    marginBottom: 4,
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 2fr 1fr 1fr 0.5fr',
    padding: '12px',
    alignItems: 'center',
    borderBottom: '1px solid #F1F3F4',
    fontSize: 14,
  },
  customerName: {
    fontWeight: '500',
  },
  customerPhone: {
    color: '#5F6368',
    fontSize: 12,
  },
  address: {
    color: '#5F6368',
    fontSize: 13,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badge: {
    padding: '3px 8px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: '600',
  },
  riderName: {
    color: '#5F6368',
    fontSize: 13,
  },
  trackLink: {
    color: '#1A73E8',
    textDecoration: 'none',
    fontSize: 13,
  },
}