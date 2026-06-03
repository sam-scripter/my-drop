// StatusBar.jsx — Order status progress bar
//
// Shows the customer where their order is in the delivery process.
// Step labels are dynamic based on the business type — a pharmacy
// shows "Dispensing" while a restaurant shows "Preparing".
// The parent component passes statusLabels from the API response.

// Maps each status to its position in the stepper
const STATUS_ORDER = [
  'PENDING',
  'ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
]

// Neutral SVG icons for each status — no emojis, works for any business type
const STATUS_ICONS = {
  PENDING: '📋',
  ASSIGNED: '⏳',
  PICKED_UP: '✓',
  IN_TRANSIT: '🚴',
  DELIVERED: '✅',
}

/**
 * @param {string} status - current OrderStatus enum value
 * @param {object} statusLabels - map of status to display label from API
 *   e.g. { PENDING: 'Order Received', ASSIGNED: 'Dispensing', ... }
 */
export default function StatusBar({ status, statusLabels = {} }) {
  const currentIndex = STATUS_ORDER.indexOf(status)

  if (status === 'FAILED') {
    return (
      <div style={styles.failedContainer}>
        <span style={{ fontSize: 24 }}>❌</span>
        <p style={styles.failedText}>
          {statusLabels.FAILED || 'Could not complete delivery'}
        </p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {STATUS_ORDER.map((stepStatus, index) => {
        const isCompleted = index < currentIndex
        const isActive = index === currentIndex
        const isPending = index > currentIndex

        // Get the label from the API or fall back to the status name
        const label = statusLabels[stepStatus] || stepStatus.replace('_', ' ')

        return (
          <div key={stepStatus} style={styles.stepWrapper}>
            {/* Circle with icon */}
            <div style={{
              ...styles.circle,
              background: isCompleted || isActive ? '#F97316' : '#E8EAED',
              transform: isActive ? 'scale(1.2)' : 'scale(1)',
              transition: 'all 0.3s ease',
            }}>
              <span style={{
                fontSize: isActive ? 14 : 12,
                opacity: isPending ? 0.4 : 1,
              }}>
                {STATUS_ICONS[stepStatus]}
              </span>
            </div>

            {/* Step label — dynamic from API */}
            <p style={{
              ...styles.label,
              color: isActive ? '#F97316' : isCompleted ? '#22C55E' : '#9AA0A6',
              fontWeight: isActive ? '600' : '400',
            }}>
              {label}
            </p>

            {/* Connector line */}
            {index < STATUS_ORDER.length - 1 && (
              <div style={{
                ...styles.connector,
                background: index < currentIndex ? '#F97316' : '#E8EAED',
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
    color: '#EF4444',
    marginTop: 8,
    fontWeight: '500',
  },
}