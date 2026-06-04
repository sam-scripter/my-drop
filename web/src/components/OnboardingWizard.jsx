// OnboardingWizard.jsx — First-time manager onboarding
//
// Shown after signup on the dashboard for the first session.
// Guides the manager through the three steps needed to complete
// their first delivery.
//
// State is stored in localStorage under 'mydrop_onboarding_done'.
// Once dismissed or completed, never shown again.

import { useState } from 'react'
import { Link } from 'react-router-dom'

const STEPS = [
  {
    number: 1,
    icon: '🏍️',
    title: 'Add your first rider',
    description:
      'Go to Riders and add a rider account. They will receive their login credentials by email.',
    action: 'Add a rider',
    link: '/riders',
    tip: 'Your rider will get an email with their temporary password. They can log in on the mydrop mobile app.',
  },
  {
    number: 2,
    icon: '📋',
    title: 'Create your first order',
    description:
      'Go to New Order and enter your customer\'s name, phone number, and delivery address.',
    action: 'Create an order',
    link: '/orders/new',
    tip: 'Once the order is created, assign it to the rider you just added.',
  },
  {
    number: 3,
    icon: '🔗',
    title: 'Share the tracking link',
    description:
      'After creating the order, copy the tracking link and send it to your customer via WhatsApp or SMS.',
    action: 'Go to orders',
    link: '/orders',
    tip: 'Your customer opens the link in any browser — no app download needed.',
  },
]

export default function OnboardingWizard({ onDismiss }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  function handleDismiss() {
    localStorage.setItem('mydrop_onboarding_done', 'true')
    setDismissed(true)
    if (onDismiss) onDismiss()
  }

  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleDismiss()
    }
  }

  if (dismissed) return null

  const step = STEPS[currentStep]

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.welcomeText}>Welcome to mydrop! 🎉</div>
            <div style={styles.headerSubtitle}>
              Let's get your first delivery out in 3 steps
            </div>
          </div>
          <button onClick={handleDismiss} style={styles.closeButton}>
            ✕
          </button>
        </div>

        {/* Step indicators */}
        <div style={styles.stepIndicators}>
          {STEPS.map((s, i) => (
            <div key={i} style={styles.indicatorWrapper}>
              <div style={{
                ...styles.indicator,
                background: i === currentStep
                  ? '#1A73E8'
                  : i < currentStep
                  ? '#34A853'
                  : '#E8EAED',
                color: i <= currentStep ? 'white' : '#9AA0A6',
              }}>
                {i < currentStep ? '✓' : s.number}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  ...styles.indicatorLine,
                  background: i < currentStep ? '#34A853' : '#E8EAED',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Current step content */}
        <div style={styles.stepContent}>
          <div style={styles.stepIcon}>{step.icon}</div>
          <h2 style={styles.stepTitle}>
            Step {step.number}: {step.title}
          </h2>
          <p style={styles.stepDescription}>{step.description}</p>

          <div style={styles.tipBox}>
            <span style={styles.tipIcon}>💡</span>
            <p style={styles.tipText}>{step.tip}</p>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <Link
            to={step.link}
            style={styles.actionButton}
            onClick={() => {
              // Auto-advance to next step when they click the action
              if (currentStep < STEPS.length - 1) {
                setCurrentStep(currentStep + 1)
              }
            }}
          >
            {step.action} →
          </Link>

          <button onClick={handleNext} style={styles.skipButton}>
            {currentStep === STEPS.length - 1 ? 'Finish' : 'Skip this step'}
          </button>
        </div>

        {/* Progress text */}
        <div style={styles.progressText}>
          Step {currentStep + 1} of {STEPS.length}
        </div>

      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 24,
  },
  card: {
    background: 'white',
    borderRadius: 20,
    padding: 40,
    maxWidth: 520,
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  headerLeft: {},
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#5F6368',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: 18,
    color: '#9AA0A6',
    cursor: 'pointer',
    padding: 4,
    lineHeight: 1,
  },
  stepIndicators: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 32,
  },
  indicatorWrapper: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  indicator: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    flexShrink: 0,
    transition: 'all 0.3s ease',
  },
  indicatorLine: {
    flex: 1,
    height: 2,
    transition: 'background 0.3s ease',
  },
  stepContent: {
    textAlign: 'center',
    marginBottom: 32,
  },
  stepIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#202124',
    margin: '0 0 12px',
  },
  stepDescription: {
    fontSize: 15,
    color: '#5F6368',
    lineHeight: 1.6,
    margin: '0 0 20px',
  },
  tipBox: {
    background: '#F8F9FA',
    borderRadius: 10,
    padding: '12px 16px',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  tipIcon: { fontSize: 16, flexShrink: 0 },
  tipText: {
    fontSize: 13,
    color: '#5F6368',
    margin: 0,
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    display: 'block',
    background: '#1A73E8',
    color: 'white',
    padding: '14px',
    borderRadius: 10,
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  skipButton: {
    background: 'none',
    border: 'none',
    color: '#9AA0A6',
    fontSize: 13,
    cursor: 'pointer',
    padding: '8px',
    textDecoration: 'underline',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9AA0A6',
  },
}