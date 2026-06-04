// theme.js — Design tokens for mydrop web app
//
// All colors, spacing, typography, and shadow values live here.
// Import this file in any component that needs styling.
//
// Usage:
//   import { colors, shadows, radius } from '../theme'
//   style={{ background: colors.primary, borderRadius: radius.md }}
//
// When we move to a proper CSS-in-JS solution or Tailwind later,
// this file becomes the migration source.

export const colors = {
  // ── Brand ──────────────────────────────────────────────────────────
  primary: '#F97316',           // orange — buttons, active states, accents
  primaryDark: '#EA6C0A',       // darker orange — hover states
  primaryLight: '#FFF7ED',      // light orange — backgrounds, badges

  // ── Sidebar / Dark surfaces ─────────────────────────────────────────
  navy: '#1E293B',              // dark navy — sidebar background
  navyLight: '#334155',         // lighter navy — sidebar hover states
  navyBorder: 'rgba(255,255,255,0.08)', // subtle border on dark backgrounds
  navyText: 'rgba(255,255,255,0.9)',    // primary text on dark background
  navyTextMuted: 'rgba(255,255,255,0.5)', // secondary text on dark background

  // ── Semantic ────────────────────────────────────────────────────────
  success: '#22C55E',           // green — delivered, active, positive
  successLight: '#F0FDF4',
  warning: '#F59E0B',           // amber — in transit, caution
  warningLight: '#FFFBEB',
  error: '#EF4444',             // red — failed, destructive
  errorLight: '#FEF2F2',
  info: '#3B82F6',              // blue — informational
  infoLight: '#EFF6FF',

  // ── Neutrals ────────────────────────────────────────────────────────
  text: '#0F172A',              // primary text
  textSecondary: '#64748B',     // secondary text, labels
  textMuted: '#94A3B8',         // placeholder, hints
  border: '#E2E8F0',            // default border
  borderStrong: '#CBD5E1',      // stronger border
  background: '#F8FAFC',        // page background
  surface: '#FFFFFF',           // card/panel background
  surfaceHover: '#F1F5F9',      // hover state on surfaces

  // ── Order status colors ─────────────────────────────────────────────
  // Used consistently across all status badges and indicators
  status: {
    PENDING: '#94A3B8',
    ASSIGNED: '#F59E0B',
    PICKED_UP: '#F97316',
    IN_TRANSIT: '#3B82F6',
    DELIVERED: '#22C55E',
    FAILED: '#EF4444',
  },
}

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  md: '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)',
  lg: '0 10px 15px rgba(0,0,0,0.07), 0 4px 6px rgba(0,0,0,0.05)',
  xl: '0 20px 25px rgba(0,0,0,0.08), 0 10px 10px rgba(0,0,0,0.04)',
}

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
}

export const typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 14,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,

  // Font weights
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}

// ── Sidebar nav items ───────────────────────────────────────────────────
// Reused in DashboardLayout
export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '▦' },
  { path: '/orders', label: 'Orders', icon: '◫' },
  { path: '/orders/new', label: 'New Order', icon: '+' },
  { path: '/riders', label: 'Riders', icon: '◉' },
]

// ── Status helpers ──────────────────────────────────────────────────────

/**
 * Returns the color for a given order status.
 * @param {string} status - OrderStatus enum value
 * @returns {string} hex color
 */
export function getStatusColor(status) {
  return colors.status[status] || colors.textMuted
}

/**
 * Returns a human-readable label for a given order status.
 * Used where business_type is not available (e.g. order lists).
 * @param {string} status - OrderStatus enum value
 * @returns {string}
 */
export function getStatusLabel(status) {
  const labels = {
    PENDING: 'Pending',
    ASSIGNED: 'Assigned',
    PICKED_UP: 'Picked Up',
    IN_TRANSIT: 'In Transit',
    DELIVERED: 'Delivered',
    FAILED: 'Failed',
  }
  return labels[status] || status
}