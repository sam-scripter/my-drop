// TermsPage.jsx — Terms of Service
//
// Plain-language terms covering acceptable use, subscriptions, and refunds.

import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <Link to="/" style={styles.logo}>🚚 mydrop</Link>
      </div>

      <div style={styles.content}>
        <h1 style={styles.title}>Terms of Service</h1>
        <p style={styles.date}>Last updated: June 2026</p>

        <p style={styles.intro}>
          By using mydrop, you agree to these terms. We've written them in plain
          language — if anything is unclear, email us.
        </p>

        {[
          {
            title: 'What mydrop provides',
            content: `mydrop provides a delivery tracking platform that lets businesses create delivery orders, assign riders, and give customers a live tracking link. We provide the software — you are responsible for the actual deliveries made by your riders.`,
          },
          {
            title: 'Acceptable use',
            content: `You may use mydrop only for legitimate business delivery operations. You may not:
            • Use mydrop to track people without their knowledge
            • Share tracking links for orders that don't exist
            • Attempt to access other businesses' data
            • Resell access to mydrop to others without our written permission`,
          },
          {
            title: 'Subscriptions and billing',
            content: `Paid plans are billed monthly or annually in advance. Payment is accepted via M-Pesa. Your subscription activates within 2 hours of payment confirmation.

            If you do not renew, your account moves to the Free plan automatically — your data is never deleted for non-payment.`,
          },
          {
            title: 'Refund policy',
            content: `If you are not satisfied within the first 7 days of a paid plan, we will refund your payment in full. After 7 days, no refunds are issued for the current billing period. Refunds are processed via M-Pesa within 3 business days.`,
          },
          {
            title: 'Data and privacy',
            content: `Your data belongs to you. We do not sell it. See our Privacy Policy for details on how we handle data.`,
          },
          {
            title: 'Service availability',
            content: `We aim for 99.9% uptime but do not guarantee it. Scheduled maintenance will be announced 24 hours in advance via email. We are not liable for losses caused by service interruptions.`,
          },
          {
            title: 'Account termination',
            content: `You can delete your account at any time from Settings. We may suspend accounts that violate these terms. If we suspend your account, we will email you the reason and give you 7 days to appeal.`,
          },
          {
            title: 'Changes to these terms',
            content: `We will email you 14 days before making material changes to these terms. Continued use after the effective date means you accept the updated terms.`,
          },
          {
            title: 'Contact',
            content: `Questions? Email hello@mydrop.co.ke or WhatsApp +254 700 000 000.`,
          },
        ].map((section, i) => (
          <div key={i} style={styles.section}>
            <h2 style={styles.sectionTitle}>{section.title}</h2>
            <p style={styles.sectionContent}>{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Arial, sans-serif' },
  header: {
    padding: '16px 32px',
    background: 'white',
    borderBottom: '1px solid #E8EAED',
  },
  logo: { fontSize: 20, fontWeight: 'bold', color: '#1A73E8', textDecoration: 'none' },
  content: { maxWidth: 720, margin: '0 auto', padding: '48px 24px' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#202124', margin: '0 0 8px' },
  date: { color: '#9AA0A6', fontSize: 13, margin: '0 0 32px' },
  intro: { fontSize: 16, color: '#5F6368', lineHeight: 1.7, margin: '0 0 32px' },
  section: {
    background: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#202124', margin: '0 0 12px' },
  sectionContent: {
    fontSize: 14,
    color: '#5F6368',
    lineHeight: 1.8,
    margin: 0,
    whiteSpace: 'pre-line',
  },
}