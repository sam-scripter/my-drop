// PricingPage.jsx — Public pricing page
//
// Shows all four subscription tiers with features and pricing.
// Accessible without login — linked from the landing page and
// from the dashboard upgrade prompts.
//
// Annual toggle shows 2-months-free discount.
// M-Pesa payment instructions shown under each paid plan.

import { useState } from 'react'
import { Link } from 'react-router-dom'

const TIERS = [
  {
    id: 'FREE',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect for trying out mydrop',
    color: '#5F6368',
    features: [
      'Up to 30 orders per month',
      '1 rider account',
      'Real-time customer tracking',
      'Basic order management',
      '"Powered by mydrop" branding',
      'Community support',
    ],
    limitations: [
      'No reports or analytics',
      'No custom branding',
      'No API access',
    ],
    cta: 'Get started free',
    ctaLink: '/signup',
    highlighted: false,
  },
  {
    id: 'STARTER',
    name: 'Starter',
    monthlyPrice: 1500,
    annualPrice: 15000,
    description: 'For small businesses doing daily deliveries',
    color: '#1A73E8',
    features: [
      'Up to 200 orders per month',
      'Up to 5 rider accounts',
      'Real-time customer tracking',
      'Full order management',
      'Analytics & reports',
      'Remove mydrop branding',
      'Email support',
    ],
    limitations: [],
    cta: 'Start 14-day free trial',
    ctaLink: '/signup?plan=starter',
    highlighted: true, // most popular
  },
  {
    id: 'GROWTH',
    name: 'Growth',
    monthlyPrice: 4000,
    annualPrice: 40000,
    description: 'For growing businesses with high delivery volume',
    color: '#34A853',
    features: [
      'Up to 1,000 orders per month',
      'Up to 20 rider accounts',
      'Everything in Starter',
      'Custom tracking page branding',
      'Priority email support',
      'Advanced analytics',
    ],
    limitations: [],
    cta: 'Start 14-day free trial',
    ctaLink: '/signup?plan=growth',
    highlighted: false,
  },
  {
    id: 'SCALE',
    name: 'Scale',
    monthlyPrice: 10000,
    annualPrice: 100000,
    description: 'For courier companies and multi-branch businesses',
    color: '#9C27B0',
    features: [
      'Unlimited orders',
      'Unlimited rider accounts',
      'Everything in Growth',
      'API access for integrations',
      'White-label tracking page',
      'Custom domain for tracking',
      'Dedicated support',
    ],
    limitations: [],
    cta: 'Contact us',
    ctaLink: 'mailto:hello@mydrop.co.ke',
    highlighted: false,
  },
]

// Features compared across all tiers for the comparison table
const COMPARISON_FEATURES = [
  { label: 'Orders per month', values: ['30', '200', '1,000', 'Unlimited'] },
  { label: 'Rider accounts', values: ['1', '5', '20', 'Unlimited'] },
  { label: 'Real-time tracking', values: [true, true, true, true] },
  { label: 'Analytics & reports', values: [false, true, true, true] },
  { label: 'Remove mydrop branding', values: [false, true, true, true] },
  { label: 'Custom branding', values: [false, false, true, true] },
  { label: 'API access', values: [false, false, false, true] },
  { label: 'Priority support', values: [false, false, true, true] },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  function formatPrice(monthly, annual) {
    if (monthly === 0) return 'Free'
    const price = isAnnual ? Math.round(annual / 12) : monthly
    return `KES ${price.toLocaleString()}`
  }

  return (
    <div style={styles.page}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={styles.header}>
        <Link to="/" style={styles.logo}>🚚 mydrop</Link>
        <div style={styles.headerLinks}>
          <Link to="/login" style={styles.loginLink}>Sign in</Link>
          <Link to="/signup" style={styles.signupLink}>Get started free</Link>
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Simple, transparent pricing
        </h1>
        <p style={styles.heroSubtitle}>
          Start free. Upgrade when you grow.
          No contracts, no hidden fees, cancel anytime.
        </p>

        {/* Annual/Monthly toggle */}
        <div style={styles.toggle}>
          <span style={{
            ...styles.toggleLabel,
            color: !isAnnual ? '#1A73E8' : '#5F6368',
            fontWeight: !isAnnual ? '600' : '400',
          }}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            style={styles.toggleButton}
          >
            <div style={{
              ...styles.toggleThumb,
              transform: isAnnual ? 'translateX(20px)' : 'translateX(0)',
            }} />
          </button>
          <span style={{
            ...styles.toggleLabel,
            color: isAnnual ? '#1A73E8' : '#5F6368',
            fontWeight: isAnnual ? '600' : '400',
          }}>
            Annual
            <span style={styles.savingsBadge}>Save 2 months</span>
          </span>
        </div>
      </div>

      {/* ── Pricing cards ───────────────────────────────────────────── */}
      <div style={styles.cardsContainer}>
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            style={{
              ...styles.card,
              border: tier.highlighted
                ? `2px solid ${tier.color}`
                : '2px solid #E8EAED',
              transform: tier.highlighted ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            {/* Most popular badge */}
            {tier.highlighted && (
              <div style={{ ...styles.popularBadge, background: tier.color }}>
                Most Popular
              </div>
            )}

            <div style={{ ...styles.tierName, color: tier.color }}>
              {tier.name}
            </div>
            <p style={styles.tierDescription}>{tier.description}</p>

            {/* Price */}
            <div style={styles.priceRow}>
              <span style={styles.price}>
                {formatPrice(tier.monthlyPrice, tier.annualPrice)}
              </span>
              {tier.monthlyPrice > 0 && (
                <span style={styles.pricePeriod}>/month</span>
              )}
            </div>

            {isAnnual && tier.monthlyPrice > 0 && (
              <p style={styles.annualNote}>
                Billed KES {tier.annualPrice.toLocaleString()}/year
              </p>
            )}

            {/* CTA button */}
            <Link
              to={tier.ctaLink}
              style={{
                ...styles.ctaButton,
                background: tier.highlighted ? tier.color : 'white',
                color: tier.highlighted ? 'white' : tier.color,
                border: `2px solid ${tier.color}`,
              }}
            >
              {tier.cta}
            </Link>

            {/* M-Pesa instructions for paid plans */}
            {tier.monthlyPrice > 0 && (
              <div style={styles.mpesaNote}>
                <p style={styles.mpesaTitle}>💚 Pay via M-Pesa</p>
                <p style={styles.mpesaText}>
                  Paybill: <strong>XXXXXXXX</strong><br />
                  Account: your business email<br />
                  Amount: KES {isAnnual
                    ? tier.annualPrice.toLocaleString()
                    : tier.monthlyPrice.toLocaleString()}
                </p>
              </div>
            )}

            <div style={styles.divider} />

            {/* Features list */}
            <ul style={styles.featureList}>
              {tier.features.map((feature, i) => (
                <li key={i} style={styles.featureItem}>
                  <span style={{ color: '#34A853', marginRight: 8 }}>✓</span>
                  {feature}
                </li>
              ))}
              {tier.limitations.map((limitation, i) => (
                <li key={i} style={{ ...styles.featureItem, color: '#9AA0A6' }}>
                  <span style={{ color: '#9AA0A6', marginRight: 8 }}>✗</span>
                  {limitation}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Comparison table ────────────────────────────────────────── */}
      <div style={styles.comparisonSection}>
        <h2 style={styles.comparisonTitle}>Compare plans</h2>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Feature</th>
                {TIERS.map(tier => (
                  <th key={tier.id} style={{ ...styles.th, color: tier.color }}>
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FEATURES.map((feature, i) => (
                <tr key={i} style={{
                  background: i % 2 === 0 ? '#F8F9FA' : 'white'
                }}>
                  <td style={styles.td}>{feature.label}</td>
                  {feature.values.map((value, j) => (
                    <td key={j} style={{ ...styles.td, textAlign: 'center' }}>
                      {typeof value === 'boolean'
                        ? value
                          ? <span style={{ color: '#34A853', fontSize: 18 }}>✓</span>
                          : <span style={{ color: '#EA4335', fontSize: 18 }}>✗</span>
                        : value
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <div style={styles.faqSection}>
        <h2 style={styles.comparisonTitle}>Frequently asked questions</h2>
        <div style={styles.faqGrid}>
          {FAQ.map((item, i) => (
            <div key={i} style={styles.faqItem}>
              <h3 style={styles.faqQuestion}>{item.q}</h3>
              <p style={styles.faqAnswer}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ──────────────────────────────────────────────── */}
      <div style={styles.bottomCta}>
        <h2 style={styles.bottomCtaTitle}>
          Ready to start tracking deliveries?
        </h2>
        <p style={styles.bottomCtaSubtitle}>
          14-day free trial. No credit card required.
        </p>
        <Link to="/signup" style={styles.bottomCtaButton}>
          Get started free →
        </Link>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          © 2026 mydrop · Real-time delivery tracking for businesses in Kenya
        </p>
        <div style={styles.footerLinks}>
          <Link to="/login" style={styles.footerLink}>Login</Link>
          <Link to="/signup" style={styles.footerLink}>Sign up</Link>
        </div>
      </div>

    </div>
  )
}

const FAQ = [
  {
    q: 'What happens when my free trial ends?',
    a: "After 14 days, you'll move to the Free plan — up to 30 orders/month and 1 rider. Your data is never deleted. Upgrade anytime to get back to full capacity.",
  },
  {
    q: 'Can I change plans?',
    a: 'Yes. Upgrade anytime by paying via M-Pesa and sending us your transaction code. Downgrades take effect at the end of your current billing period.',
  },
  {
    q: 'How do I pay?',
    a: 'We accept M-Pesa via Paybill. Send the payment, then WhatsApp or email us your M-Pesa transaction code and business email. We activate your plan within 2 hours.',
  },
  {
    q: 'Do you offer refunds?',
    a: "If you're not satisfied within the first 7 days of a paid plan, we'll refund your payment in full. No questions asked.",
  },
  {
    q: 'What counts as an order?',
    a: 'Every delivery you create on mydrop counts as one order. Cancelled orders still count toward your monthly total.',
  },
  {
    q: 'Can multiple managers use the same account?',
    a: 'Currently one manager account per business. Multi-manager support is coming in a future update.',
  },
]

const styles = {
  page: {
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    borderBottom: '1px solid #E8EAED',
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: 100,
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A73E8',
    textDecoration: 'none',
  },
  headerLinks: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
  },
  loginLink: {
    color: '#5F6368',
    textDecoration: 'none',
    fontSize: 14,
  },
  signupLink: {
    background: '#1A73E8',
    color: 'white',
    padding: '8px 20px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: '600',
  },
  hero: {
    textAlign: 'center',
    padding: '64px 24px 32px',
    background: '#F8F9FA',
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#202124',
    margin: '0 0 16px',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#5F6368',
    margin: '0 0 32px',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  toggleButton: {
    width: 44,
    height: 24,
    background: '#1A73E8',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    padding: 0,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    background: 'white',
    borderRadius: '50%',
    position: 'absolute',
    top: 3,
    left: 3,
    transition: 'transform 0.2s ease',
  },
  savingsBadge: {
    background: '#E8F5E9',
    color: '#34A853',
    fontSize: 11,
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: 20,
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 24,
    maxWidth: 1200,
    margin: '0 auto',
    padding: '48px 24px',
  },
  card: {
    borderRadius: 16,
    padding: 28,
    position: 'relative',
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    padding: '4px 16px',
    borderRadius: 20,
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tierName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tierDescription: {
    color: '#5F6368',
    fontSize: 13,
    margin: '0 0 16px',
    lineHeight: 1.4,
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#202124',
  },
  pricePeriod: {
    color: '#5F6368',
    fontSize: 14,
  },
  annualNote: {
    color: '#34A853',
    fontSize: 12,
    margin: '0 0 16px',
  },
  ctaButton: {
    display: 'block',
    textAlign: 'center',
    padding: '12px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 16,
    boxSizing: 'border-box',
  },
  mpesaNote: {
    background: '#F1F8E9',
    borderRadius: 8,
    padding: '10px 12px',
    marginBottom: 16,
  },
  mpesaTitle: {
    margin: '0 0 4px',
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  mpesaText: {
    margin: 0,
    fontSize: 11,
    color: '#388E3C',
    lineHeight: 1.6,
  },
  divider: {
    height: 1,
    background: '#E8EAED',
    marginBottom: 16,
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  featureItem: {
    fontSize: 13,
    color: '#5F6368',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'flex-start',
    lineHeight: 1.4,
  },
  comparisonSection: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px 48px',
  },
  comparisonTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#202124',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '2px solid #E8EAED',
    fontSize: 14,
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #E8EAED',
    color: '#5F6368',
  },
  faqSection: {
    background: '#F8F9FA',
    padding: '48px 24px',
  },
  faqGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 24,
    maxWidth: 900,
    margin: '0 auto',
  },
  faqItem: {
    background: 'white',
    borderRadius: 12,
    padding: 24,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#202124',
    margin: '0 0 8px',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#5F6368',
    margin: 0,
    lineHeight: 1.6,
  },
  bottomCta: {
    textAlign: 'center',
    padding: '64px 24px',
    background: '#1A73E8',
    color: 'white',
  },
  bottomCtaTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    margin: '0 0 12px',
    color: 'white',
  },
  bottomCtaSubtitle: {
    fontSize: 16,
    margin: '0 0 32px',
    color: 'rgba(255,255,255,0.8)',
  },
  bottomCtaButton: {
    display: 'inline-block',
    background: 'white',
    color: '#1A73E8',
    padding: '14px 32px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    padding: '24px 32px',
    borderTop: '1px solid #E8EAED',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: '#9AA0A6',
    fontSize: 13,
    margin: 0,
  },
  footerLinks: {
    display: 'flex',
    gap: 16,
  },
  footerLink: {
    color: '#5F6368',
    textDecoration: 'none',
    fontSize: 13,
  },
}