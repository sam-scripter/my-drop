// DashboardLayout.jsx — Sidebar navigation for the dashboard
import { NavLink, useNavigate } from 'react-router-dom'
import { clearAuth, getBusiness, getUser } from '../auth'
import { useEffect, useState } from 'react'
import api from '../api'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/orders', label: 'Orders', icon: '📦' },
  { path: '/orders/new', label: 'New Order', icon: '➕' },
  { path: '/riders', label: 'Riders', icon: '🏍️' },
]

export default function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const business = getBusiness()
  const user = getUser()

  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    api.get('/subscription')
      .then(res => setSubscription(res.data))
      .catch(() => {}) // fail silently — don't break the layout
  }, [])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🚚</span>
          <span style={styles.logoText}>mydrop</span>
        </div>

        {/* Business name */}
        <div style={styles.businessName}>
          {business?.name || 'My Business'}
        </div>

        {/* Nav links */}
        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              style={({ isActive }) => ({
                ...styles.navItem,
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontWeight: isActive ? '600' : '400',
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Usage indicator in sidebar */}
        {subscription && subscription.usage.monthly_order_limit && (
          <div style={styles.usageSection}>
            <div style={styles.usageLabel}>
              {subscription.usage.monthly_orders} / {subscription.usage.monthly_order_limit} orders
            </div>
            <div style={styles.usageBar}>
              <div style={{
                ...styles.usageFill,
                width: `${Math.min(subscription.usage.usage_percent, 100)}%`,
                background: subscription.usage.is_at_limit
                  ? '#EA4335'
                  : subscription.usage.is_near_limit
                  ? '#FBBC04'
                  : '#34A853',
              }} />
            </div>
            <div style={styles.usageTier}>
              {subscription.subscription.effective_tier} plan
            </div>
          </div>
        )}

        {/* User info + logout */}
        <div style={styles.userSection}>
          <div style={styles.userName}>{user?.name}</div>
          <div style={styles.userRole}>Manager</div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Subscription usage banner */}
      {subscription && (
        <div style={styles.main}>
          {/* Trial expiry warning */}
          {subscription.subscription.status === 'TRIAL' &&
          subscription.subscription.days_remaining <= 4 && (
            <div style={bannerStyles.warning}>
              ⚠️ Your free trial ends in{' '}
              <strong>{subscription.subscription.days_remaining} days</strong>.{' '}
              <a href="/pricing" style={bannerStyles.link}>Upgrade now →</a>
            </div>
          )}

          {/* Order limit warning at 80%+ */}
          {subscription.usage.is_near_limit && !subscription.usage.is_at_limit && (
            <div style={bannerStyles.caution}>
              📊 You've used <strong>{subscription.usage.monthly_orders}</strong> of your{' '}
              <strong>{subscription.usage.monthly_order_limit}</strong> monthly orders.{' '}
              <a href="/pricing" style={bannerStyles.link}>Upgrade for more →</a>
            </div>
          )}

          {/* Order limit reached */}
          {subscription.usage.is_at_limit && (
            <div style={bannerStyles.error}>
              🚫 You've reached your monthly order limit.{' '}
              <a href="/pricing" style={bannerStyles.link}>Upgrade to create more orders →</a>
            </div>
          )}
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────── */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: 240,
    background: '#1A73E8',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 24px 8px',
  },
  logoIcon: { fontSize: 24 },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  businessName: {
    padding: '0 24px 24px',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '0 12px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    color: 'white',
    textDecoration: 'none',
    fontSize: 14,
    transition: 'background 0.15s ease',
  },
  navIcon: { fontSize: 18 },
  userSection: {
    padding: '16px 24px',
    borderTop: '1px solid rgba(255,255,255,0.2)',
    marginTop: 'auto',
  },
  userName: {
    fontWeight: '600',
    fontSize: 14,
  },
  userRole: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 13,
    width: '100%',
  },
  usageSection: {
    padding: '12px 24px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  usageBar: {
    height: 4,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  usageFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  usageTier: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}

const bannerStyles = {
  warning: {
    background: '#FFF8E1',
    border: '1px solid #FBBC04',
    color: '#856404',
    padding: '10px 16px',
    fontSize: 14,
    marginBottom: 0,
  },
  caution: {
    background: '#FFF3E0',
    border: '1px solid #FF9800',
    color: '#6D4C00',
    padding: '10px 16px',
    fontSize: 14,
    marginBottom: 0,
  },
  error: {
    background: '#FFF5F5',
    border: '1px solid #EA4335',
    color: '#C62828',
    padding: '10px 16px',
    fontSize: 14,
    marginBottom: 0,
  },
  link: {
    color: 'inherit',
    fontWeight: '600',
  },
}