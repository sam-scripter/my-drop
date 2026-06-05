// LandingPage.jsx — Public marketing homepage
//
// The first thing a potential customer sees when they visit mydrop.
// Goal: explain what mydrop does, who it's for, and get them to sign up.
//
// Sections:
//   1. Header/Nav
//   2. Hero
//   3. Problem statement
//   4. How it works (3 steps)
//   5. Who it's for (business types)
//   6. Live demo embed
//   7. Pricing summary
//   8. Testimonials (placeholder)
//   9. Final CTA
//   10. Footer

import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

// ── Data ────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '📋',
    title: 'Create an order',
    description:
      'Manager enters the customer name, phone number, and delivery address. Takes under a minute.',
  },
  {
    step: '02',
    icon: '🏍️',
    title: 'Assign a rider',
    description:
      'Pick an available rider from your fleet. They get notified instantly and see the delivery details.',
  },
  {
    step: '03',
    icon: '📍',
    title: 'Customer tracks live',
    description:
      'Customer receives a tracking link. They watch the rider move on a map in real time — no app needed.',
  },
]

const BUSINESS_TYPES = [
  {
    icon: '🍽️',
    name: 'Restaurants & Cloud Kitchens',
    pain: 'Customers call every 5 minutes asking where their food is.',
    fix: 'Give them a live tracking link the moment the order leaves your kitchen.',
  },
  {
    icon: '👗',
    name: 'Boutiques & Fashion',
    pain: 'Riders get lost, customers get frustrated, you lose repeat business.',
    fix: 'Every delivery comes with a map, a PIN, and a confirmation.',
  },
  {
    icon: '💊',
    name: 'Pharmacies',
    pain: 'Medication deliveries need to reach the right person with proof.',
    fix: 'PIN confirmation ensures only the right person receives the package.',
  },
  {
    icon: '📦',
    name: 'Courier Businesses',
    pain: 'Managing 20 riders manually over WhatsApp is chaos.',
    fix: 'One dashboard for all riders, all orders, all deliveries — in real time.',
  },
  {
    icon: '🏨',
    name: 'Hotels & Hospitality',
    pain: 'Room service and external deliveries with no visibility.',
    fix: 'Track every delivery from kitchen to room with live status updates.',
  },
  {
    icon: '🛒',
    name: 'Online Shops',
    pain: 'Customers abandon repeat purchases after one bad delivery experience.',
    fix: 'Turn every delivery into a branded, professional customer experience.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Jane Wanjiku',
    role: 'Owner, Mama Jane Kitchen',
    location: 'Westlands, Nairobi',
    quote:
      'Before mydrop, my phone never stopped ringing with "where is my food?" calls. Now customers track their order themselves. My riders love it too.',
    avatar: 'JW',
    color: '#F97316',
  },
  {
    name: 'Brian Ochieng',
    role: 'Manager, Swiftex Couriers',
    location: 'Industrial Area, Nairobi',
    quote:
      'We manage 15 riders across Nairobi. mydrop gave us visibility we never had before. Setup took less than 30 minutes.',
    avatar: 'BO',
    color: '#34A853',
  },
  {
    name: 'Amina Hassan',
    role: 'Founder, Amina\'s Boutique',
    location: 'Kilimani, Nairobi',
    quote:
      'My customers share the tracking link on their WhatsApp groups. It has become a selling point — people order from me because the experience is professional.',
    avatar: 'AH',
    color: '#F97316',
  },
]

const STATS = [
  { value: '500+', label: 'Businesses onboarded' },
  { value: '50,000+', label: 'Deliveries tracked' },
  { value: '4.8★', label: 'Average customer rating' },
  { value: '< 20 min', label: 'Average setup time' },
]

// ── Component ────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  // Add shadow to header on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 768px) {
          .hero-title { font-size: 32px !important; }
          .hero-actions { flex-direction: column !important; }
          .stats-bar { gap: 24px !important; }
          .problem-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .business-grid { grid-template-columns: 1fr 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .pricing-summary { flex-direction: column !important; align-items: center !important; }
          .demo-content { flex-direction: column !important; align-items: center !important; }
          .footer-inner { flex-direction: column !important; }
          .footer-links { flex-direction: column !important; gap: 16px !important; }
        }
        @media (max-width: 480px) {
          .business-grid { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 28px !important; }
        }
      `}</style>

      {/* ── 1. Header ─────────────────────────────────────────────── */}
      <header style={{
        ...styles.header,
        boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
      }}>
        <div style={styles.headerInner}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoIcon}>🚚</span>
            <span style={styles.logoText}>mydrop</span>
          </Link>

          <nav style={styles.nav}>
            <Link to="/pricing" style={styles.navLink}>Pricing</Link>
            <Link to="/login" style={styles.navLink}>Sign in</Link>
            <Link to="/signup" style={styles.navCta}>
              Get started free
            </Link>
          </nav>
        </div>
      </header>

      {/* ── 2. Hero ───────────────────────────────────────────────── */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroBadge}>
            🇰🇪 Built for Kenyan businesses
          </div>

          <h1 className="hero-title" style={styles.heroTitle}>
            Your customers always know<br />
            <span style={styles.heroTitleAccent}>where their order is.</span>
          </h1>

          <p style={styles.heroSubtitle}>
            mydrop gives every delivery a live tracking link your customer
            can follow on their phone — no app download, no phone calls,
            no confusion. Set up in under 20 minutes.
          </p>

          <div className="hero-actions" style={styles.heroActions}>
            <Link to="/signup" style={styles.heroPrimary}>
              Start free — no credit card needed
            </Link>
            <a
              href="https://mydrop.duckdns.org/track/demo"
              target="_blank"
              rel="noreferrer"
              style={styles.heroSecondary}
            >
              See a live tracking demo →
            </a>
          </div>

          <p style={styles.heroNote}>
            14-day free trial · Up to 200 orders/month · Cancel anytime
          </p>

          {/* Dashboard mockup */}
          <div style={styles.heroMockup}>
            <div style={styles.mockupBar}>
              <span style={styles.mockupDot} />
              <span style={styles.mockupDot} />
              <span style={styles.mockupDot} />
              <span style={styles.mockupUrl}>mydrop.duckdns.org/dashboard</span>
            </div>
            <div style={styles.mockupScreen}>
              <div style={styles.mockupSidebar}>
                <div style={styles.mockupLogo}>🚚 mydrop</div>
                {['Dashboard', 'Orders', 'New Order', 'Riders'].map(item => (
                  <div key={item} style={{
                    ...styles.mockupNavItem,
                    background: item === 'Dashboard'
                      ? 'rgba(255,255,255,0.2)'
                      : 'transparent',
                  }}>
                    {item}
                  </div>
                ))}
              </div>
              <div style={styles.mockupContent}>
                <div style={styles.mockupHeader}>
                  Good morning, Samuel 👋
                </div>
                <div style={styles.mockupCards}>
                  {[
                    { label: 'Orders Today', value: '24', color: '#F97316' },
                    { label: 'Delivered', value: '18', color: '#34A853' },
                    { label: 'In Transit', value: '6', color: '#F97316' },
                    { label: 'Avg Time', value: '28m', color: '#FBBC04' },
                  ].map(card => (
                    <div key={card.label} style={styles.mockupCard}>
                      <div style={{ ...styles.mockupCardValue, color: card.color }}>
                        {card.value}
                      </div>
                      <div style={styles.mockupCardLabel}>{card.label}</div>
                    </div>
                  ))}
                </div>
                <div style={styles.mockupTableHeader}>Recent Orders</div>
                {[
                  { name: 'Alice Kamau', status: 'In Transit', color: '#F97316' },
                  { name: 'Brian Otieno', status: 'Delivered', color: '#34A853' },
                  { name: 'Carol Mwangi', status: 'Pending', color: '#9AA0A6' },
                ].map(row => (
                  <div key={row.name} style={styles.mockupRow}>
                    <span style={styles.mockupRowName}>{row.name}</span>
                    <span style={{ ...styles.mockupRowStatus, color: row.color }}>
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Stats bar ─────────────────────────────────────────────── */}
      <section className="stats-bar" style={styles.statsBar}>
        {STATS.map((stat, i) => (
          <div key={i} style={styles.statItem}>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* ── 4. Problem statement ─────────────────────────────────────── */}
      <section style={styles.problem}>
        <div style={styles.sectionInner}>
          <h2 style={styles.problemTitle}>
            "Where is my order?" is costing you time, money, and customers.
          </h2>
          <div className="problem-grid" style={styles.problemGrid}>
            <div style={styles.problemItem}>
              <span style={styles.problemIcon}>📞</span>
              <p style={styles.problemText}>
                Your riders spend half their time answering calls from impatient customers
                instead of making deliveries.
              </p>
            </div>
            <div style={styles.problemItem}>
              <span style={styles.problemIcon}>😤</span>
              <p style={styles.problemText}>
                Customers who don't know where their order is leave bad reviews
                and don't order again.
              </p>
            </div>
            <div style={styles.problemItem}>
              <span style={styles.problemIcon}>📱</span>
              <p style={styles.problemText}>
                Managing riders over WhatsApp means missed assignments,
                confusion, and no accountability.
              </p>
            </div>
          </div>
          <div style={styles.problemSolution}>
            <p style={styles.problemSolutionText}>
              mydrop fixes all of this with one tracking link.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. How it works ──────────────────────────────────────────── */}
      <section style={styles.howItWorks}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionLabel}>HOW IT WORKS</div>
          <h2 style={styles.sectionTitle}>
            From order to delivered in three steps
          </h2>
          <p style={styles.sectionSubtitle}>
            No complicated setup. No training required. Works on any phone.
          </p>

          <div className="steps-grid" style={styles.stepsGrid}>
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} style={styles.stepCard}>
                <div style={styles.stepNumber}>{item.step}</div>
                <div style={styles.stepIcon}>{item.icon}</div>
                <h3 style={styles.stepTitle}>{item.title}</h3>
                <p style={styles.stepDescription}>{item.description}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={styles.stepArrow}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Who it's for ──────────────────────────────────────────── */}
      <section style={styles.whoItsFor}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionLabel}>WHO IT'S FOR</div>
          <h2 style={styles.sectionTitle}>
            Built for every business that delivers
          </h2>
          <p style={styles.sectionSubtitle}>
            Whether you do 5 deliveries a day or 500, mydrop scales with you.
          </p>

          <div className="business-grid" style={styles.businessGrid}>
            {BUSINESS_TYPES.map((biz, i) => (
              <div key={i} style={styles.businessCard}>
                <div style={styles.businessIcon}>{biz.icon}</div>
                <h3 style={styles.businessName}>{biz.name}</h3>
                <p style={styles.businessPain}>❌ {biz.pain}</p>
                <p style={styles.businessFix}>✅ {biz.fix}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Tracking demo ─────────────────────────────────────────── */}
      <section style={styles.demo}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionLabel}>THE CUSTOMER EXPERIENCE</div>
          <h2 style={styles.sectionTitle}>
            What your customer sees
          </h2>
          <p style={styles.sectionSubtitle}>
            A clean, mobile-friendly tracking page. No app download.
            Just a link — works on any phone, any browser.
          </p>

          <div className="demo-content" style={styles.demoContent}>
            <div style={styles.demoPhone}>
              <div style={styles.phoneFrame}>
                <div style={styles.phoneScreen}>
                  {/* Mocked tracking page */}
                  <div style={styles.trackingHeader}>
                    <div style={styles.trackingBusiness}>🚚 Test Kitchen</div>
                    <div style={styles.trackingCustomer}>Order for Samuel</div>
                  </div>
                  <div style={styles.trackingStatus}>
                    {['Received', 'Packing', 'Picked Up', 'On the Way', 'Delivered'].map(
                      (step, i) => (
                        <div key={i} style={styles.trackingStep}>
                          <div style={{
                            ...styles.trackingDot,
                            background: i <= 3 ? '#F97316' : '#E8EAED',
                          }} />
                          <span style={{
                            ...styles.trackingStepLabel,
                            color: i === 3 ? '#F97316' : i < 3 ? '#34A853' : '#9AA0A6',
                            fontWeight: i === 3 ? '600' : '400',
                          }}>
                            {step}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  <div style={styles.trackingMap}>
                    🗺️ Live map
                  </div>
                  <div style={styles.trackingPin}>
                    <div style={styles.pinLabel}>Show this PIN to your rider</div>
                    <div style={styles.pinDigits}>
                      {'7 4 2 1'.split(' ').map((d, i) => (
                        <div key={i} style={styles.pinDigit}>{d}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.demoFeatures}>
              {[
                {
                  icon: '📍',
                  title: 'Live rider location',
                  desc: 'Customer sees the rider moving on a map in real time.',
                },
                {
                  icon: '🔢',
                  title: 'PIN confirmation',
                  desc: 'Rider enters a PIN on delivery — proof the right person received the package.',
                },
                {
                  icon: '⭐',
                  title: 'Rating prompt',
                  desc: 'After delivery, customer rates their experience. You see it in your dashboard.',
                },
                {
                  icon: '📱',
                  title: 'No app needed',
                  desc: 'Customer opens a link in their browser. Nothing to download, nothing to install.',
                },
              ].map((feat, i) => (
                <div key={i} style={styles.demoFeature}>
                  <span style={styles.demoFeatureIcon}>{feat.icon}</span>
                  <div>
                    <div style={styles.demoFeatureTitle}>{feat.title}</div>
                    <div style={styles.demoFeatureDesc}>{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Pricing summary ───────────────────────────────────────── */}
      <section style={styles.pricingSummary}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionLabel}>PRICING</div>
          <h2 style={styles.sectionTitle}>
            Start free. Upgrade when you're ready.
          </h2>
          <p style={styles.sectionSubtitle}>
            No credit card required. No contracts. Cancel anytime.
          </p>

          <div className="pricing-summary" style={styles.pricingCards}>
            {[
              {
                name: 'Free',
                price: 'KES 0',
                desc: '30 orders/month · 1 rider',
                cta: 'Get started',
                link: '/signup',
                highlight: false,
              },
              {
                name: 'Starter',
                price: 'KES 1,500',
                desc: '200 orders/month · 5 riders',
                cta: 'Start free trial',
                link: '/signup?plan=starter',
                highlight: true,
              },
              {
                name: 'Growth',
                price: 'KES 4,000',
                desc: '1,000 orders/month · 20 riders',
                cta: 'Start free trial',
                link: '/signup?plan=growth',
                highlight: false,
              },
            ].map((plan, i) => (
              <div key={i} style={{
                ...styles.pricingCard,
                border: plan.highlight
                  ? '2px solid #1A73E8'
                  : '2px solid #E8EAED',
              }}>
                <div style={styles.pricingCardName}>{plan.name}</div>
                <div style={styles.pricingCardPrice}>
                  {plan.price}
                  {plan.price !== 'KES 0' && (
                    <span style={styles.pricingCardPeriod}>/mo</span>
                  )}
                </div>
                <div style={styles.pricingCardDesc}>{plan.desc}</div>
                <Link
                  to={plan.link}
                  style={{
                    ...styles.pricingCardCta,
                    background: plan.highlight ? '#F97316' : 'white',
                    color: plan.highlight ? 'white' : '#F97316',
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to="/pricing" style={styles.seePricing}>
              See full pricing details →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 9. Testimonials ──────────────────────────────────────────── */}
      <section style={styles.testimonials}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionLabel}>WHAT BUSINESSES SAY</div>
          <h2 style={styles.sectionTitle}>
            Trusted by businesses across Nairobi
          </h2>

          <div className="testimonials-grid" style={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={styles.testimonialCard}>
                <p style={styles.testimonialQuote}>"{t.quote}"</p>
                <div style={styles.testimonialAuthor}>
                  <div style={{
                    ...styles.testimonialAvatar,
                    background: t.color,
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={styles.testimonialName}>{t.name}</div>
                    <div style={styles.testimonialRole}>{t.role}</div>
                    <div style={styles.testimonialLocation}>
                      📍 {t.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Final CTA ────────────────────────────────────────────── */}
      <section style={styles.finalCta}>
        <div style={styles.sectionInner}>
          <h2 style={styles.finalCtaTitle}>
            Ready to give your customers the tracking experience they deserve?
          </h2>
          <p style={styles.finalCtaSubtitle}>
            Join hundreds of Kenyan businesses already using mydrop.
            14-day free trial. No credit card required.
          </p>
          <Link to="/signup" style={styles.finalCtaButton}>
            Get started free →
          </Link>
          <p style={styles.finalCtaNote}>
            Questions? WhatsApp us at{' '}
            <a
              href="https://wa.me/254700000000"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              +254 700 000 000
            </a>
          </p>
        </div>
      </section>

      {/* ── 11. Footer ───────────────────────────────────────────────── */}
      <footer style={styles.footer}>
        <div className="footer-inner" style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <div style={styles.footerLogo}>🚚 mydrop</div>
            <p style={styles.footerTagline}>
              Your customers always know where their order is.
            </p>
          </div>

          <div className="footer-links" style={styles.footerLinks}>
            <div style={styles.footerLinkGroup}>
              <div style={styles.footerLinkTitle}>Product</div>
              <Link to="/pricing" style={styles.footerLink}>Pricing</Link>
              <Link to="/signup" style={styles.footerLink}>Sign up</Link>
              <Link to="/login" style={styles.footerLink}>Login</Link>
            </div>
            <div style={styles.footerLinkGroup}>
              <div style={styles.footerLinkTitle}>Company</div>
              <Link to="/about" style={styles.footerLink}>About</Link>
              <Link to="/contact" style={styles.footerLink}>Contact</Link>
            </div>
            <div style={styles.footerLinkGroup}>
              <div style={styles.footerLinkTitle}>Legal</div>
              <Link to="/privacy" style={styles.footerLink}>Privacy Policy</Link>
              <Link to="/terms" style={styles.footerLink}>Terms of Service</Link>
            </div>
          </div>
        </div>

        <div style={styles.footerBottom}>
          <p style={styles.footerCopy}>
            © 2026 mydrop · Real-time delivery tracking for businesses in Kenya
          </p>
        </div>
      </footer>

    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────

const styles = {
  page: {
    fontFamily: 'Arial, sans-serif',
    color: '#202124',
    background: '#FFFFFF',
  },

  // Header
  header: {
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: 100,
    transition: 'box-shadow 0.2s ease',
    borderBottom: '1px solid #F1F3F4',
  },
  headerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 32px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  },
  logoIcon: { fontSize: 28 },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F97316',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },
  navLink: {
    color: '#5F6368',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: '500',
  },
  navCta: {
    background: '#F97316',
    color: 'white',
    padding: '10px 20px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: '600',
  },

  // Hero
  hero: {
    background: 'linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)',
    padding: '80px 24px 48px',
    textAlign: 'center',
  },
  heroInner: {
    maxWidth: 900,
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-block',
    background: '#FFF7ED',
    color: '#F97316',
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: 'bold',
    lineHeight: 1.15,
    margin: '0 0 24px',
    color: '#202124',
  },
  heroTitleAccent: {
    color: '#F97316',
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#5F6368',
    lineHeight: 1.6,
    maxWidth: 640,
    margin: '0 auto 32px',
  },
  heroActions: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  heroPrimary: {
    background: '#F97316',
    color: 'white',
    padding: '16px 32px',
    borderRadius: 10,
    textDecoration: 'none',
    fontSize: 16,
    fontWeight: '700',
  },
  heroSecondary: {
    color: '#F97316',
    textDecoration: 'none',
    fontSize: 15,
    fontWeight: '500',
  },
  heroNote: {
    color: '#9AA0A6',
    fontSize: 13,
    margin: '0 0 48px',
  },

  // Dashboard mockup
  heroMockup: {
    background: 'white',
    borderRadius: 16,
    boxShadow: '0 8px 48px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    border: '1px solid #E8EAED',
    maxWidth: 800,
    margin: '0 auto',
  },
  mockupBar: {
    background: '#F1F3F4',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  mockupDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#D1D5DB',
    display: 'inline-block',
  },
  mockupUrl: {
    fontSize: 12,
    color: '#9AA0A6',
    marginLeft: 8,
  },
  mockupScreen: {
    display: 'flex',
    height: 300,
  },
  mockupSidebar: {
    width: 160,
    background: '#1E293B',
    padding: '16px 0',
    flexShrink: 0,
  },
  mockupLogo: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    padding: '0 16px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  mockupNavItem: {
    color: 'white',
    fontSize: 12,
    padding: '8px 16px',
    cursor: 'pointer',
  },
  mockupContent: {
    flex: 1,
    padding: 16,
    background: '#F8F9FA',
    overflow: 'hidden',
  },
  mockupHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#202124',
  },
  mockupCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8,
    marginBottom: 16,
  },
  mockupCard: {
    background: 'white',
    borderRadius: 8,
    padding: '10px 8px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  mockupCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 1,
    marginBottom: 2,
  },
  mockupCardLabel: {
    fontSize: 9,
    color: '#9AA0A6',
  },
  mockupTableHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F6368',
    marginBottom: 8,
  },
  mockupRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #F1F3F4',
    fontSize: 12,
  },
  mockupRowName: { color: '#202124' },
  mockupRowStatus: { fontWeight: '500', fontSize: 11 },

  // Stats
  statsBar: {
    background: '#1E293B',
    padding: '32px 24px',
    display: 'flex',
    justifyContent: 'center',
    gap: 64,
    flexWrap: 'wrap',
  },
  statItem: { textAlign: 'center' },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },

  // Problem
  problem: {
    padding: '80px 24px',
    background: '#FFFFFF',
  },
  sectionInner: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  problemTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '0 0 48px',
    color: '#202124',
    maxWidth: 700,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  problemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32,
    marginBottom: 40,
  },
  problemItem: {
    textAlign: 'center',
    padding: 24,
  },
  problemIcon: { fontSize: 40, display: 'block', marginBottom: 16 },
  problemText: {
    color: '#5F6368',
    lineHeight: 1.6,
    fontSize: 15,
    margin: 0,
  },
  problemSolution: {
    textAlign: 'center',
    padding: '24px',
    background: '#FFF7ED',
    borderRadius: 12,
  },
  problemSolutionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F97316',
    margin: 0,
  },

  // Section common
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: '1px',
    color: '#F97316',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '0 0 16px',
    color: '#202124',
  },
  sectionSubtitle: {
    fontSize: 17,
    color: '#5F6368',
    textAlign: 'center',
    margin: '0 0 48px',
    lineHeight: 1.6,
  },

  // How it works
  howItWorks: {
    padding: '80px 24px',
    background: '#F8F9FA',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32,
    position: 'relative',
  },
  stepCard: {
    background: 'white',
    borderRadius: 16,
    padding: 32,
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    position: 'relative',
  },
  stepNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF7ED',
    lineHeight: 1,
    marginBottom: 8,
  },
  stepIcon: { fontSize: 40, marginBottom: 16 },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    margin: '0 0 12px',
    color: '#202124',
  },
  stepDescription: {
    color: '#5F6368',
    lineHeight: 1.6,
    margin: 0,
    fontSize: 14,
  },
  stepArrow: {
    position: 'absolute',
    right: -24,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: 24,
    color: '#F97316',
    fontWeight: 'bold',
  },

  // Who it's for
  whoItsFor: {
    padding: '80px 24px',
    background: '#FFFFFF',
  },
  businessGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
  },
  businessCard: {
    border: '1px solid #E8EAED',
    borderRadius: 12,
    padding: 24,
  },
  businessIcon: { fontSize: 32, marginBottom: 12 },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    margin: '0 0 12px',
    color: '#202124',
  },
  businessPain: {
    fontSize: 13,
    color: '#EA4335',
    margin: '0 0 8px',
    lineHeight: 1.5,
  },
  businessFix: {
    fontSize: 13,
    color: '#34A853',
    margin: 0,
    lineHeight: 1.5,
  },

  // Demo
  demo: {
    padding: '80px 24px',
    background: '#F8F9FA',
  },
  demoContent: {
    display: 'flex',
    gap: 64,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  demoPhone: { flexShrink: 0 },
  phoneFrame: {
    width: 240,
    background: '#1A1A1A',
    borderRadius: 32,
    padding: '16px 8px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
  },
  phoneScreen: {
    background: '#F8F9FA',
    borderRadius: 24,
    overflow: 'hidden',
  },
  trackingHeader: {
    background: 'white',
    padding: '12px 16px',
    borderBottom: '1px solid #E8EAED',
  },
  trackingBusiness: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#202124',
  },
  trackingCustomer: {
    fontSize: 11,
    color: '#5F6368',
  },
  trackingStatus: {
    padding: '12px 16px',
    background: 'white',
    margin: '8px 8px 0',
    borderRadius: 8,
  },
  trackingStep: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '3px 0',
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  trackingStepLabel: { fontSize: 11 },
  trackingMap: {
    background: '#E8EAED',
    margin: '8px 8px',
    borderRadius: 8,
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    color: '#5F6368',
  },
  trackingPin: {
    background: 'white',
    margin: '0 8px 8px',
    borderRadius: 8,
    padding: '8px 12px',
    textAlign: 'center',
    border: '2px solid #1A73E8',
  },
  pinLabel: { fontSize: 9, color: '#5F6368', marginBottom: 6 },
  pinDigits: {
    display: 'flex',
    justifyContent: 'center',
    gap: 4,
  },
  pinDigit: {
    width: 28,
    height: 32,
    background: '#FFF7ED',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F97316',
  },
  demoFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    maxWidth: 400,
  },
  demoFeature: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
  },
  demoFeatureIcon: { fontSize: 28, flexShrink: 0 },
  demoFeatureTitle: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 4,
    color: '#202124',
  },
  demoFeatureDesc: {
    fontSize: 13,
    color: '#5F6368',
    lineHeight: 1.5,
  },

  // Pricing summary
  pricingSummary: {
    padding: '80px 24px',
    background: '#FFFFFF',
  },
  pricingCards: {
    display: 'flex',
    gap: 24,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pricingCard: {
    background: 'white',
    borderRadius: 12,
    padding: 24,
    width: 220,
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  pricingCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#202124',
  },
  pricingCardPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: 4,
  },
  pricingCardPeriod: {
    fontSize: 14,
    color: '#5F6368',
    fontWeight: '400',
  },
  pricingCardDesc: {
    fontSize: 12,
    color: '#5F6368',
    marginBottom: 16,
  },
  pricingCardCta: {
    display: 'block',
    padding: '10px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: 13,
    border: '2px solid #1A73E8',
  },
  seePricing: {
    color: '#F97316',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: '500',
  },

  // Testimonials
  testimonials: {
    padding: '80px 24px',
    background: '#F8F9FA',
  },
  testimonialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 24,
  },
  testimonialCard: {
    background: 'white',
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  testimonialQuote: {
    fontSize: 15,
    color: '#202124',
    lineHeight: 1.7,
    margin: '0 0 20px',
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  testimonialAvatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    flexShrink: 0,
  },
  testimonialName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#202124',
  },
  testimonialRole: {
    fontSize: 12,
    color: '#5F6368',
  },
  testimonialLocation: {
    fontSize: 11,
    color: '#9AA0A6',
    marginTop: 2,
  },

  // Final CTA
  finalCta: {
    background: '#1E293B',
    padding: '80px 24px',
    textAlign: 'center',
  },
  finalCtaTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 16px',
    maxWidth: 700,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  finalCtaSubtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
    margin: '0 0 32px',
  },
  finalCtaButton: {
    display: 'inline-block',
    background: 'white',
    color: '#F97316',
    padding: '16px 40px',
    borderRadius: 10,
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: 17,
    marginBottom: 24,
  },
  finalCtaNote: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    margin: 0,
  },

  // Footer
  footer: {
    background: '#1E293B',
    padding: '48px 32px 0',
    color: 'white',
  },
  footerInner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 48,
    flexWrap: 'wrap',
    paddingBottom: 48,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  footerBrand: { maxWidth: 280 },
  footerLogo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  footerTagline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    lineHeight: 1.6,
    margin: 0,
  },
  footerLinks: {
    display: 'flex',
    gap: 48,
  },
  footerLinkGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  footerLinkTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 4,
  },
  footerLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: 14,
  },
  footerBottom: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '20px 0',
    textAlign: 'center',
  },
  footerCopy: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    margin: 0,
  },
}