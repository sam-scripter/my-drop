// RatingPrompt.jsx — Star rating shown after delivery
import { useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function RatingPrompt({ orderId }) {
  const [selected, setSelected] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!selected) return
    setSubmitting(true)
    try {
      await axios.put(`${API_BASE}/orders/${orderId}/rate`, {
        rating: selected,
      })
      setSubmitted(true)
    } catch (e) {
      // Silently fail — rating is not critical
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div style={styles.container}>
        <p style={{ fontSize: 24 }}>🙏</p>
        <p style={styles.thankYou}>Thanks for your feedback!</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <p style={styles.label}>Rate your delivery experience</p>
      <div style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              ...styles.star,
              color: star <= (hovered || selected) ? '#FBBC04' : '#E8EAED',
            }}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(star)}
          >
            ★
          </span>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!selected || submitting}
        style={{
          ...styles.button,
          opacity: !selected || submitting ? 0.5 : 1,
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Rating'}
      </button>
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
  },
  label: {
    color: '#5F6368',
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  stars: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  star: {
    fontSize: 40,
    cursor: 'pointer',
    transition: 'color 0.1s ease',
    userSelect: 'none',
  },
  button: {
    background: '#1A73E8',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '12px 32px',
    fontSize: 14,
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  thankYou: {
    color: '#34A853',
    fontWeight: '600',
    marginTop: 8,
  },
}