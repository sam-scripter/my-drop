// StatusBar.jsx — Order status progress bar
//
// Shows the customer where their order is in the delivery process.
// Each step lights up as the order progresses.

const STEPS = [
  { status: 'PENDING',    label: 'Order Received', icon: '📋' },
  { status: 'ASSIGNED',   label: 'Preparing',      icon: '👨‍🍳' },
  { status: 'PICKED_UP',  label: 'Picked Up',      icon: '🏃' },
  { status: 'IN_TRANSIT', label: 'On the Way',     icon: '🚴' },
  { status: 'DELIVERED',  label: 'Delivered',      icon: '✅' },
]

// Maps each status to its step index
const STATUS_INDEX = {
  PENDING: 0,
  ASSIGNED: 1,
  PICKED_UP: 2,
  IN_TRANSIT: 3,
  DELIVERED: 4,
  FAILED: -1,
}

export default function StatusBar({ status }) {
  const currentIndex = STATUS_INDEX[status] ?? 0

  if (status === 'FAILED') {
    return (
      <div style={styles.failedContainer}>
        <span style={{ fontSize: 24 }}>❌</span>
        <p style={styles.failedText}>Delivery could not be completed</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex
        const isActive = index === currentIndex
        const isPending = index > currentIndex

        return (
          <div key={step.status} style={styles.stepWrapper}>
            {/* Step circle */}
            <div style={{
              ...styles.circle,
              background: isCompleted || isActive ? '#1A73E8' : '#E8EAED',
              transform: isActive ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.3s ease',
            }}>
              <span style={{
                fontSize: isActive ? 16 : 14,
                filter: isPending ? 'grayscale(1) opacity(0.5)' : 'none',
              }}>
                {step.icon}
              </span>
            </div>

            {/* Step label */}
            <p style={{
              ...styles.label,
              color: isActive ? '#1A73E8' : isCompleted ? '#34A853' : '#9AA0A6',
              fontWeight: isActive ? '600' : '400',
            }}>
              {step.label}
            </p>

            {/* Connector line between steps */}
            {index < STEPS.length - 1 && (
              <div style={{
                ...styles.connector,
                background: index < currentIndex ? '#1A73E8' : '#E8EAED',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '16px 8px',
    background: 'white',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    margin: '0 16px',
    position: 'relative',
  },
  stepWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 1.2,
    maxWidth: 56,
  },
  connector: {
    position: 'absolute',
    top: 18,
    left: '60%',
    right: '-40%',
    height: 2,
    zIndex: 0,
  },
  failedContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    background: '#FFF5F5',
    borderRadius: 12,
    margin: '0 16px',
  },
  failedText: {
    color: '#EA4335',
    marginTop: 8,
    fontWeight: '500',
  },
}