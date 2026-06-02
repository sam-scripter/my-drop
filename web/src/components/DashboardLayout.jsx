// DashboardLayout.jsx — Sidebar navigation for the dashboard
import { NavLink, useNavigate } from 'react-router-dom'
import { clearAuth, getBusiness, getUser } from '../auth'

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

        {/* User info + logout */}
        <div style={styles.userSection}>
          <div style={styles.userName}>{user?.name}</div>
          <div style={styles.userRole}>Manager</div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Sign out
          </button>
        </div>
      </aside>

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
}