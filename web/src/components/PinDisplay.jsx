// PinDisplay.jsx — Shows the delivery PIN to the customer
//
// When the rider is IN_TRANSIT, the customer sees this PIN.
// They show it to the rider to confirm delivery.

export default function PinDisplay({ pin }) {
  if (!pin) return null

  return (
    <div style={styles.container}>
      <p style={styles.label}>Show this PIN to your rider</p>
      <div style={styles.pinRow}>
        {pin.split('').map((digit, index) => (
          <div key={index} style={styles.digitBox}>
            <span style={styles.digit}>{digit}</span>
          </div>
        ))}
      </div>
      <p style={styles.hint}>
        The rider will enter this code to confirm delivery
      </p>
    </div>
  )
}

const styles = {
  container: {
    background: 'white',
    borderRadius: 12,
    padding: '16px',
    margin: '0 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center',
    border: '2px solid #1A73E8',
  },
  label: {
    color: '#5F6368',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '500',
  },
  pinRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  digitBox: {
    width: 52,
    height: 64,
    background: '#F8F9FA',
    border: '2px solid #1A73E8',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1A73E8',
  },
  hint: {
    color: '#9AA0A6',
    fontSize: 11,
  },
}