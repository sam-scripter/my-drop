// DashboardLayout.jsx — Main layout wrapper for all dashboard pages
//
// Provides the dark navy sidebar with orange accents and the main
// content area. All authenticated pages render inside this component.
//
// Sidebar contains:
// - Brand logo
// - Business name
// - Navigation links
// - Subscription usage bar
// - User info + sign out

import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { colors, shadows, typography, spacing } from '../theme'
import { clearAuth, getBusiness, getUser } from '../auth'
import api from '../api'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '⊞', end: true },
  { path: '/orders', label: 'Orders', icon: '📦', end: false },
  { path: '/orders/new', label: 'New Order', icon: '+', end: true },
  { path: '/riders', label: 'Riders', icon: '🏍', end: true },
  { path: '/reports', label: 'Reports', icon: '📊', end: true }, 
]

export default function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const business = getBusiness()
  const user = getUser()
  const [subscription, setSubscription] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    api.get('/subscription')
      .then(res => setSubscription(res.data))
      .catch(() => {})
  }, [])

  function handleSignOut() {
    clearAuth()
    navigate('/login')
  }

  const usagePercent = subscription
    ? Math.min(subscription.usage.usage_percent, 100)
    : 0

  const usageColor = usagePercent >= 100
    ? colors.error
    : usagePercent >= 80
    ? colors.warning
    : colors.success

  return (
    <div style={styles.container}>

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside style={styles.sidebar}>

        {/* Brand */}
        <div style={styles.brand}>
          <Link to="/dashboard" style={styles.brandLink}>
            <span style={styles.brandIcon}>🚚</span>
            <span style={styles.brandName}>mydrop</span>
          </Link>
        </div>

        {/* Business name */}
        <div style={styles.businessName}>
          {business?.name || 'My Business'}
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                ...styles.navItem,
                background: isActive
                  ? colors.primary
                  : 'transparent',
                color: isActive
                  ? 'white'
                  : colors.navyTextMuted,
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Subscription usage */}
        {subscription?.usage?.monthly_order_limit && (
          <div style={styles.usageSection}>
            <div style={styles.usageHeader}>
              <span style={styles.usageLabel}>Monthly orders</span>
              <span style={styles.usageCount}>
                {subscription.usage.monthly_orders} /
                {subscription.usage.monthly_order_limit}
              </span>
            </div>
            <div style={styles.usageBar}>
              <div style={{
                ...styles.usageFill,
                width: `${usagePercent}%`,
                background: usageColor,
              }} />
            </div>
            <div style={styles.usageTier}>
              {subscription.subscription.effective_tier} plan
            </div>
            {subscription.usage.is_near_limit && (
              <Link to="/pricing" style={styles.upgradeLink}>
                Upgrade plan →
              </Link>
            )}
          </div>
        )}

        {/* Trial banner */}
        {subscription?.subscription?.status === 'TRIAL' &&
         subscription?.subscription?.days_remaining <= 4 && (
          <div style={styles.trialBanner}>
            ⚠️ Trial ends in{' '}
            <strong>{subscription.subscription.days_remaining} days</strong>
            <Link to="/pricing" style={styles.trialLink}>Upgrade →</Link>
          </div>
        )}

        {/* User section */}
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            {user?.name?.charAt(0)?.toUpperCase() || 'M'}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>Manager</div>
          </div>
          <button onClick={handleSignOut} style={styles.signOutBtn}
            title="Sign out"
          >
            ⎋
          </button>
        </div>

      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
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
    background: colors.background,
  },

  // Sidebar
  sidebar: {
    width: 240,
    background: colors.navy,
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    overflowY: 'auto',
  },
  brand: {
    padding: '24px 20px 8px',
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
  },
  brandIcon: { fontSize: 26 },
  brandName: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: 'white',
    letterSpacing: '-0.5px',
  },
  businessName: {
    padding: '4px 20px 20px',
    fontSize: typography.sm,
    color: colors.navyTextMuted,
    borderBottom: `1px solid ${colors.navyBorder}`,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // Navigation
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '8px 12px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: typography.base,
    fontWeight: typography.medium,
    transition: 'all 0.15s ease',
  },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  navLabel: {},

  // Usage
  usageSection: {
    margin: '0 12px',
    padding: '14px 12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    marginBottom: 8,
  },
  usageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  usageLabel: {
    fontSize: typography.xs,
    color: colors.navyTextMuted,
  },
  usageCount: {
    fontSize: typography.xs,
    color: colors.navyTextMuted,
  },
  usageBar: {
    height: 4,
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  usageFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  usageTier: {
    fontSize: typography.xs,
    color: colors.navyTextMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  upgradeLink: {
    display: 'block',
    marginTop: 6,
    fontSize: typography.xs,
    color: colors.primary,
    textDecoration: 'none',
    fontWeight: typography.semibold,
  },

  // Trial banner
  trialBanner: {
    margin: '0 12px 8px',
    padding: '10px 12px',
    background: 'rgba(245,158,11,0.15)',
    borderRadius: 8,
    fontSize: typography.xs,
    color: '#FCD34D',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  trialLink: {
    color: colors.primary,
    textDecoration: 'none',
    fontWeight: typography.semibold,
    fontSize: typography.xs,
  },

  // User section
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px',
    borderTop: `1px solid ${colors.navyBorder}`,
    margin: '8px 0 0',
  },
  userAvatar: {
    width: 34,
    height: 34,
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
  userInfo: { flex: 1, overflow: 'hidden' },
  userName: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.navyText,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userRole: {
    fontSize: typography.xs,
    color: colors.navyTextMuted,
  },
  signOutBtn: {
    background: 'none',
    border: 'none',
    color: colors.navyTextMuted,
    cursor: 'pointer',
    fontSize: 18,
    padding: 4,
    flexShrink: 0,
  },

  // Main
  main: {
    marginLeft: 240,
    flex: 1,
    minHeight: '100vh',
    background: colors.background,
  },
}