// ContactPage.jsx — Contact and support page
//
// Accessible at /contact from the landing page footer.
// Provides a contact form that emails the mydrop team via the backend,
// plus a WhatsApp button as a faster alternative.
//
// Form fields: name, email, business name, subject, message.
// On submit, sends an email to the mydrop support address via the
// email service on the backend.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL

const SUBJECTS = [
  'I want to sign up',
  'Question about pricing',
  'Technical support',
  'Billing question',
  'Partnership inquiry',
  'Other',
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    businessName: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post(`${API_BASE}/contact`, form)
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try WhatsApp instead.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={styles.page}>
        <Header />
        <div style={styles.successContainer}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>Message sent!</h2>
            <p style={styles.successText}>
              Thanks for reaching out. We'll get back to you within 24 hours.
            </p>
            <p style={styles.successText}>
              For faster responses, WhatsApp us at{' '}
              <a
                href="https://wa.me/254700000000"
                style={{ color: '#25D366', fontWeight: '600' }}
              >
                +254 700 000 000
              </a>
            </p>
            <Link to="/" style={styles.backHome}>← Back to home</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <Header />

      <div style={styles.container}>

        {/* Left — contact info */}
        <div style={styles.infoSide}>
          <div style={styles.sectionLabel}>CONTACT US</div>
          <h1 style={styles.title}>We'd love to hear from you</h1>
          <p style={styles.subtitle}>
            Whether you're ready to sign up, have a question about pricing,
            or need technical help — we're here.
          </p>

          <div style={styles.contactMethods}>

            {/* WhatsApp — primary */}
            <a
              href="https://wa.me/254700000000"
              target="_blank"
              rel="noreferrer"
              style={styles.whatsappButton}
            >
              <span style={styles.whatsappIcon}>💬</span>
              <div>
                <div style={styles.methodTitle}>WhatsApp (fastest)</div>
                <div style={styles.methodDetail}>+254 700 000 000</div>
              </div>
            </a>

            {/* Email */}
            <div style={styles.contactMethod}>
              <span style={styles.methodIcon}>✉️</span>
              <div>
                <div style={styles.methodTitle}>Email</div>
                <a
                  href="mailto:hello@mydrop.co.ke"
                  style={styles.methodLink}
                >
                  hello@mydrop.co.ke
                </a>
              </div>
            </div>

            {/* Response time */}
            <div style={styles.contactMethod}>
              <span style={styles.methodIcon}>⏱️</span>
              <div>
                <div style={styles.methodTitle}>Response time</div>
                <div style={styles.methodDetail}>
                  WhatsApp: within 2 hours<br />
                  Email: within 24 hours<br />
                  Mon–Sat, 8am–8pm EAT
                </div>
              </div>
            </div>

          </div>

          {/* FAQ links */}
          <div style={styles.faqLinks}>
            <div style={styles.faqTitle}>Common questions</div>
            {[
              { q: 'How does the 14-day trial work?', link: '/pricing#faq' },
              { q: 'How do I pay via M-Pesa?', link: '/pricing#faq' },
              { q: 'Can I add more than one manager?', link: '/pricing#faq' },
            ].map((item, i) => (
              <Link key={i} to={item.link} style={styles.faqLink}>
                {item.q} →
              </Link>
            ))}
          </div>
        </div>

        {/* Right — contact form */}
        <div style={styles.formSide}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Send us a message</h2>
            <p style={styles.formSubtitle}>
              We read every message and reply personally.
            </p>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>

              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Your name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Email address *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="you@business.com"
                    required
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Business name</label>
                <input
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. Mama Jane Kitchen"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>What can we help with? *</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select a topic</option>
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Message *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  style={{ ...styles.input, height: 120, resize: 'vertical' }}
                  placeholder="Tell us what you need..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Sending...' : 'Send message'}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  )
}

function Header() {
  return (
    <header style={styles.header}>
      <Link to="/" style={styles.logo}>🚚 mydrop</Link>
      <div style={styles.headerLinks}>
        <Link to="/pricing" style={styles.headerLink}>Pricing</Link>
        <Link to="/login" style={styles.headerLink}>Sign in</Link>
        <Link to="/signup" style={styles.headerCta}>Get started free</Link>
      </div>
    </header>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F8F9FA',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    padding: '0 32px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'white',
    borderBottom: '1px solid #E8EAED',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A73E8',
    textDecoration: 'none',
  },
  headerLinks: {
    display: 'flex',
    gap: 20,
    alignItems: 'center',
  },
  headerLink: {
    color: '#5F6368',
    textDecoration: 'none',
    fontSize: 14,
  },
  headerCta: {
    background: '#1A73E8',
    color: 'white',
    padding: '8px 18px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '64px 24px',
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: 64,
    alignItems: 'start',
  },
  infoSide: {},
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: '1px',
    color: '#1A73E8',
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#202124',
    margin: '0 0 16px',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 16,
    color: '#5F6368',
    lineHeight: 1.6,
    margin: '0 0 40px',
  },
  contactMethods: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    marginBottom: 40,
  },
  whatsappButton: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    background: '#25D366',
    borderRadius: 12,
    padding: '16px 20px',
    textDecoration: 'none',
  },
  whatsappIcon: { fontSize: 28 },
  methodTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: 'white',
    marginBottom: 2,
  },
  methodDetail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 1.5,
  },
  contactMethod: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
    padding: '16px 20px',
    background: 'white',
    borderRadius: 12,
    border: '1px solid #E8EAED',
  },
  methodIcon: { fontSize: 24 },
  methodLink: {
    color: '#1A73E8',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: '500',
  },
  faqLinks: {
    background: 'white',
    borderRadius: 12,
    padding: 20,
    border: '1px solid #E8EAED',
  },
  faqTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5F6368',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  faqLink: {
    display: 'block',
    color: '#1A73E8',
    textDecoration: 'none',
    fontSize: 14,
    padding: '6px 0',
    borderBottom: '1px solid #F1F3F4',
  },
  formSide: {},
  formCard: {
    background: 'white',
    borderRadius: 16,
    padding: 36,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#202124',
    margin: '0 0 6px',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#5F6368',
    margin: '0 0 24px',
  },
  error: {
    background: '#FFF5F5',
    border: '1px solid #FECACA',
    color: '#EA4335',
    padding: '12px 16px',
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
  },
  row: {
    display: 'flex',
    gap: 16,
  },
  field: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    background: 'white',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: 8,
  },
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 64px)',
    padding: 24,
  },
  successCard: {
    background: 'white',
    borderRadius: 16,
    padding: 48,
    maxWidth: 480,
    textAlign: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  successIcon: { fontSize: 56, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: 'bold', margin: '0 0 12px' },
  successText: { color: '#5F6368', fontSize: 15, lineHeight: 1.6, margin: '0 0 12px' },
  backHome: {
    display: 'inline-block',
    marginTop: 24,
    color: '#1A73E8',
    textDecoration: 'none',
    fontSize: 14,
  },
}