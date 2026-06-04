// PrivacyPage.jsx — Privacy policy
//
// Required for any business collecting user data.
// Keep it plain and honest — no legal jargon.

import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <Link to="/" style={styles.logo}>🚚 mydrop</Link>
      </div>

      <div style={styles.content}>
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.date}>Last updated: June 2026</p>

        <p style={styles.intro}>
          mydrop is a delivery tracking platform for businesses in Kenya.
          This policy explains what data we collect, how we use it, and your rights.
          We keep it plain — no legal jargon.
        </p>

        {[
          {
            title: 'What data we collect',
            content: `We collect:
            • Business information: name, email, phone number, business type
            • Manager accounts: name, email, encrypted password
            • Rider accounts: name, email, phone, GPS location during active deliveries
            • Order data: customer name, phone number, delivery address, order status
            • Customer ratings submitted after delivery
            • Payment references for subscription billing (M-Pesa transaction codes only — we never store card numbers)`,
          },
          {
            title: 'How we use your data',
            content: `We use your data to:
            • Provide the mydrop delivery tracking service
            • Send customers their tracking links
            • Stream rider GPS location to the customer tracking page during active deliveries
            • Send transactional emails (account creation, password resets, trial notifications)
            • Show analytics on your dashboard`,
          },
          {
            title: 'Who we share data with',
            content: `We share data only with:
            • Firebase (Google) — for real-time GPS streaming and push notifications
            • Your customers — they see their order status, rider location, and delivery PIN via their tracking link
            • No data is sold to advertisers or third parties`,
          },
          {
            title: 'GPS and location data',
            content: `Rider GPS location is streamed to Firebase in real time during active deliveries only. Location data is not stored permanently — it is overwritten with each GPS update and deleted when the delivery is completed.`,
          },
          {
            title: 'Data retention',
            content: `Order data and analytics are retained for the lifetime of your business account plus 90 days after account deletion. You can request deletion of your data at any time by emailing us.`,
          },
          {
            title: 'Your rights',
            content: `You have the right to:
            • Access all data we hold about your business
            • Correct inaccurate data
            • Request deletion of your account and all associated data
            • Export your order data as CSV from the Reports page

            To exercise these rights, email us at privacy@mydrop.co.ke`,
          },
          {
            title: 'Contact',
            content: `Questions about this policy? Email privacy@mydrop.co.ke or WhatsApp +254 700 000 000.`,
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