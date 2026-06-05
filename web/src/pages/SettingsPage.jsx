// SettingsPage.jsx — Account and business settings
//
// Four sections:
//   1. Profile settings — update manager name and phone
//   2. Company settings — update business name, phone, type
//   3. Change password — current + new password
//   4. Subscription — current plan, usage, renewal date
//
// Each section saves independently so a failure in one
// doesn't affect the others.

import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import api from '../api'
import {
  colors, shadows, radius, typography, spacing
} from '../theme'
import { getUser, getBusiness, setAuth as saveAuth, getToken } from '../auth'

export default function SettingsPage() {
  const user = getUser()
  const business = getBusiness()

  // ── Profile state ────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null) // { type, text }

  // ── Company state ────────────────────────────────────────────────
  const [company, setCompany] = useState({
    name: business?.name || '',
    phone: business?.phone || '',
    email: business?.email || '',
    business_type: business?.business_type || 'OTHER',
  })
  const [companyLoading, setCompanyLoading] = useState(false)
  const [companyMsg, setCompanyMsg] = useState(null)

  // ── Password state ────────────────────────────────────────────────
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState(null)

  // ── Subscription state ───────────────────────────────────────────
  const [subscription, setSubscription] = useState(null)
  const [subLoading, setSubLoading] = useState(true)

  useEffect(() => {
    api.get('/subscription')
      .then(res => setSubscription(res.data))
      .catch(() => {})
      .finally(() => setSubLoading(false))
  }, [])

  // ── Handlers ─────────────────────────────────────────────────────

  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg(null)
    try {
      const res = await api.put('/users/me', profile)
      // Update stored user data
      saveAuth(getToken(), res.data.user, business)
      setProfileMsg({
        type: 'success',
        text: 'Profile updated successfully.',
      })
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      })
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleCompanySave(e) {
    e.preventDefault()
    setCompanyLoading(true)
    setCompanyMsg(null)
    try {
      const res = await api.put('/business/me', company)
      // Update stored business data
      saveAuth(getToken(), user, res.data.business)
      setCompanyMsg({
        type: 'success',
        text: 'Business details updated successfully.',
      })
    } catch (err) {
      setCompanyMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update business.',
      })
    } finally {
      setCompanyLoading(false)
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault()
    setPasswordMsg(null)

    if (password.newPassword !== password.confirmPassword) {
      setPasswordMsg({
        type: 'error',
        text: 'New passwords do not match.',
      })
      return
    }

    if (password.newPassword.length < 8) {
      setPasswordMsg({
        type: 'error',
        text: 'New password must be at least 8 characters.',
      })
      return
    }

    setPasswordLoading(true)
    try {
      await api.put('/users/change-password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      })
      setPasswordMsg({
        type: 'success',
        text: 'Password changed successfully.',
      })
      setPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password.',
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="settings-page" style={styles.page}>
        <style>{`
          @media (max-width: 768px) {
            .settings-page { padding: 16px !important; }
            .settings-row { flex-direction: column !important; }
          }
        `}</style>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Settings</h1>
          <p style={styles.pageSubtitle}>
            Manage your account and business preferences
          </p>
        </div>

        <div style={styles.sections}>

          {/* ── 1. Profile settings ─────────────────────────────── */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}>👤</div>
              <div>
                <h2 style={styles.sectionTitle}>Profile Settings</h2>
                <p style={styles.sectionSubtitle}>
                  Update your personal information
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSave}>
              {profileMsg && (
                <StatusMessage msg={profileMsg} />
              )}

              <div className="settings-row" style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Full name</label>
                  <input
                    value={profile.name}
                    onChange={e => setProfile({
                      ...profile, name: e.target.value
                    })}
                    style={styles.input}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Phone number</label>
                  <input
                    value={profile.phone}
                    onChange={e => setProfile({
                      ...profile, phone: e.target.value
                    })}
                    style={styles.input}
                    placeholder="07XXXXXXXX"
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email address</label>
                <input
                  value={user?.email || ''}
                  style={{ ...styles.input, ...styles.inputDisabled }}
                  disabled
                />
                <p style={styles.fieldHint}>
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div style={styles.formActions}>
                <button
                  type="submit"
                  disabled={profileLoading}
                  style={{
                    ...styles.saveBtn,
                    opacity: profileLoading ? 0.7 : 1,
                  }}
                >
                  {profileLoading ? 'Saving...' : 'Save profile'}
                </button>
              </div>
            </form>
          </section>

          {/* ── 2. Company settings ─────────────────────────────── */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}>🏢</div>
              <div>
                <h2 style={styles.sectionTitle}>Business Settings</h2>
                <p style={styles.sectionSubtitle}>
                  Update your business details
                </p>
              </div>
            </div>

            <form onSubmit={handleCompanySave}>
              {companyMsg && (
                <StatusMessage msg={companyMsg} />
              )}

              <div style={styles.field}>
                <label style={styles.label}>Business name</label>
                <input
                  value={company.name}
                  onChange={e => setCompany({
                    ...company, name: e.target.value
                  })}
                  style={styles.input}
                  placeholder="Your business name"
                  required
                />
              </div>

              <div className="settings-row" style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Business phone</label>
                  <input
                    value={company.phone}
                    onChange={e => setCompany({
                      ...company, phone: e.target.value
                    })}
                    style={styles.input}
                    placeholder="07XXXXXXXX"
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Business email</label>
                  <input
                    value={company.email}
                    style={{ ...styles.input, ...styles.inputDisabled }}
                    disabled
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Type of business</label>
                <select
                  value={company.business_type}
                  onChange={e => setCompany({
                    ...company, business_type: e.target.value
                  })}
                  style={styles.input}
                >
                  <option value="FOOD">Food & Restaurant</option>
                  <option value="RETAIL">Retail & Clothing</option>
                  <option value="PHARMACY">Pharmacy & Healthcare</option>
                  <option value="COURIER">Courier & Logistics</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div style={styles.formActions}>
                <button
                  type="submit"
                  disabled={companyLoading}
                  style={{
                    ...styles.saveBtn,
                    opacity: companyLoading ? 0.7 : 1,
                  }}
                >
                  {companyLoading
                    ? 'Saving...'
                    : 'Save business details'}
                </button>
              </div>
            </form>
          </section>

          {/* ── 3. Change password ───────────────────────────────── */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}>🔒</div>
              <div>
                <h2 style={styles.sectionTitle}>Change Password</h2>
                <p style={styles.sectionSubtitle}>
                  Use a strong password of at least 8 characters
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSave}>
              {passwordMsg && (
                <StatusMessage msg={passwordMsg} />
              )}

              <div style={styles.field}>
                <label style={styles.label}>Current password</label>
                <input
                  type="password"
                  value={password.currentPassword}
                  onChange={e => setPassword({
                    ...password, currentPassword: e.target.value
                  })}
                  style={styles.input}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="settings-row" style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>New password</label>
                  <input
                    type="password"
                    value={password.newPassword}
                    onChange={e => setPassword({
                      ...password, newPassword: e.target.value
                    })}
                    style={styles.input}
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Confirm new password</label>
                  <input
                    type="password"
                    value={password.confirmPassword}
                    onChange={e => setPassword({
                      ...password, confirmPassword: e.target.value
                    })}
                    style={styles.input}
                    placeholder="Repeat new password"
                    required
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    ...styles.saveBtn,
                    opacity: passwordLoading ? 0.7 : 1,
                  }}
                >
                  {passwordLoading
                    ? 'Changing...'
                    : 'Change password'}
                </button>
              </div>
            </form>
          </section>

          {/* ── 4. Subscription ──────────────────────────────────── */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIcon}>💳</div>
              <div>
                <h2 style={styles.sectionTitle}>Subscription</h2>
                <p style={styles.sectionSubtitle}>
                  Your current plan and usage
                </p>
              </div>
            </div>

            {subLoading ? (
              <div style={styles.subLoading}>
                Loading subscription details...
              </div>
            ) : subscription ? (
              <div style={styles.subContent}>

                {/* Current plan */}
                <div style={styles.planCard}>
                  <div style={styles.planInfo}>
                    <div style={styles.planName}>
                      {subscription.subscription.effective_tier} Plan
                    </div>
                    <div style={{
                      ...styles.planStatus,
                      color: subscription.subscription.status === 'TRIAL'
                        ? colors.warning
                        : subscription.subscription.is_active
                        ? colors.success
                        : colors.error,
                    }}>
                      {subscription.subscription.status === 'TRIAL'
                        ? `Trial — ${subscription.subscription.days_remaining} days remaining`
                        : subscription.subscription.is_active
                        ? `Active — renews ${new Date(subscription.subscription.subscription_ends_at).toLocaleDateString('en-KE')}`
                        : 'Expired'}
                    </div>
                  </div>
                  <a
                    href="/pricing"
                    style={styles.upgradeBtn}
                  >
                    {subscription.subscription.status === 'TRIAL'
                      ? 'Choose a plan'
                      : 'Change plan'}
                  </a>
                </div>

                {/* Usage */}
                <div style={styles.usageSection}>
                  <div style={styles.usageHeader}>
                    <span style={styles.usageLabel}>
                      Monthly orders
                    </span>
                    <span style={styles.usageCount}>
                      {subscription.usage.monthly_orders} /{' '}
                      {subscription.usage.monthly_order_limit || '∞'}
                    </span>
                  </div>
                  {subscription.usage.monthly_order_limit && (
                    <div style={styles.usageBarOuter}>
                      <div style={{
                        ...styles.usageBarInner,
                        width: `${Math.min(subscription.usage.usage_percent, 100)}%`,
                        background: subscription.usage.is_at_limit
                          ? colors.error
                          : subscription.usage.is_near_limit
                          ? colors.warning
                          : colors.success,
                      }} />
                    </div>
                  )}
                </div>

                {/* What's included */}
                <div style={styles.limitsGrid}>
                  {[
                    {
                      label: 'Orders/month',
                      value: subscription.limits.monthly_orders === Infinity
                        ? 'Unlimited'
                        : subscription.limits.monthly_orders,
                    },
                    {
                      label: 'Rider accounts',
                      value: subscription.limits.max_riders === Infinity
                        ? 'Unlimited'
                        : subscription.limits.max_riders,
                    },
                    {
                      label: 'Reports',
                      value: subscription.limits.has_reports ? '✓' : '✗',
                    },
                    {
                      label: 'Custom branding',
                      value: subscription.limits.has_custom_branding
                        ? '✓'
                        : '✗',
                    },
                  ].map((item, i) => (
                    <div key={i} style={styles.limitItem}>
                      <div style={styles.limitLabel}>{item.label}</div>
                      <div style={styles.limitValue}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* M-Pesa payment instructions */}
                {subscription.subscription.status !== 'ACTIVE' && (
                  <div style={styles.paymentInstructions}>
                    <h3 style={styles.paymentTitle}>
                      💚 How to upgrade via M-Pesa
                    </h3>
                    <ol style={styles.paymentSteps}>
                      <li>Go to M-Pesa → Lipa na M-Pesa → Pay Bill</li>
                      <li>Business number: <strong>XXXXXXXX</strong></li>
                      <li>
                        Account number:{' '}
                        <strong>{business?.email}</strong>
                      </li>
                      <li>
                        Amount: KES 1,500 (Starter) or KES 4,000 (Growth)
                      </li>
                      <li>
                        WhatsApp your M-Pesa confirmation to{' '}
                        <strong>+254 700 000 000</strong>
                      </li>
                      <li>
                        We activate your plan within 2 hours
                      </li>
                    </ol>
                  </div>
                )}

              </div>
            ) : (
              <p style={{ color: colors.textSecondary }}>
                Failed to load subscription details.
              </p>
            )}
          </section>

        </div>
      </div>
    </DashboardLayout>
  )
}

// ── Status message component ─────────────────────────────────────────────

function StatusMessage({ msg }) {
  const isSuccess = msg.type === 'success'
  return (
    <div style={{
      background: isSuccess ? colors.successLight : colors.errorLight,
      border: `1px solid ${isSuccess ? colors.success : colors.error}40`,
      color: isSuccess ? '#166534' : colors.error,
      padding: '10px 14px',
      borderRadius: radius.md,
      fontSize: typography.sm,
      marginBottom: spacing.md,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      {isSuccess ? '✓' : '⚠'} {msg.text}
    </div>
  )
}

const styles = {
  page: { padding: spacing.xl, maxWidth: 800 },
  pageHeader: { marginBottom: spacing.xl },
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
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
  },
  section: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
  },
  sectionHeader: {
    display: 'flex',
    gap: spacing.md,
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottom: `1px solid ${colors.border}`,
  },
  sectionIcon: {
    fontSize: 28,
    width: 48,
    height: 48,
    background: colors.primaryLight,
    borderRadius: radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    margin: '0 0 2px',
  },
  sectionSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    margin: 0,
  },
  row: { display: 'flex', gap: spacing.md },
  field: { flex: 1, marginBottom: spacing.md },
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
    background: colors.surface,
    fontFamily: 'inherit',
  },
  inputDisabled: {
    background: colors.background,
    color: colors.textMuted,
    cursor: 'not-allowed',
  },
  fieldHint: {
    fontSize: typography.xs,
    color: colors.textMuted,
    margin: '4px 0 0',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: spacing.sm,
  },
  saveBtn: {
    padding: '10px 24px',
    background: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: radius.md,
    fontSize: typography.base,
    fontWeight: typography.semibold,
    cursor: 'pointer',
    boxShadow: shadows.sm,
  },

  // Subscription styles
  subLoading: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    padding: `${spacing.md}px 0`,
  },
  subContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  planCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    background: colors.background,
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`,
  },
  planInfo: {},
  planName: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  planStatus: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
  upgradeBtn: {
    padding: '8px 20px',
    background: colors.primary,
    color: 'white',
    borderRadius: radius.md,
    textDecoration: 'none',
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    boxShadow: shadows.sm,
  },
  usageSection: {
    padding: spacing.md,
    background: colors.background,
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`,
  },
  usageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  usageCount: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
  },
  usageBarOuter: {
    height: 6,
    background: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  usageBarInner: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  limitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: spacing.sm,
  },
  limitItem: {
    padding: spacing.sm,
    background: colors.background,
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`,
    textAlign: 'center',
  },
  limitLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginBottom: 4,
  },
  limitValue: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
  },
  paymentInstructions: {
    padding: spacing.md,
    background: '#F0FDF4',
    borderRadius: radius.md,
    border: '1px solid #86EFAC',
  },
  paymentTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: '#166534',
    margin: '0 0 12px',
  },
  paymentSteps: {
    margin: 0,
    paddingLeft: 20,
    color: '#166534',
    fontSize: typography.sm,
    lineHeight: 2,
  },
}