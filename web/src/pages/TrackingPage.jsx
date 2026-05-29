// TrackingPage.jsx — Main customer tracking page
//
// This is what the customer sees when they open their tracking link.
// It:
// 1. Calls the API to get order details
// 2. Opens a Firestore real-time listener for live rider location
// 3. Shows status bar, map, PIN, and rating prompt based on order state

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import axios from 'axios'
import { db } from '../firebase'
import StatusBar from '../components/StatusBar'
import LiveMap from '../components/LiveMap'
import PinDisplay from '../components/PinDisplay'
import RatingPrompt from '../components/RatingPrompt'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function TrackingPage() {
  const { token } = useParams()

  // ── State ──────────────────────────────────────────────────────
  const [orderData, setOrderData] = useState(null)
  const [riderLocation, setRiderLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Fetch order data from API ──────────────────────────────────
  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await axios.get(`${API_BASE}/track/${token}`)
        setOrderData(response.data)
      } catch (err) {
        if (err.response?.status === 404) {
          setError('invalid')
        } else {
          setError('server')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()

    // Poll for status updates every 30 seconds
    // The map updates via Firestore in real time, but order status
    // (PENDING → ASSIGNED etc) comes from the API
    const interval = setInterval(fetchOrder, 30000)
    return () => clearInterval(interval)
  }, [token])

  // ── Firestore real-time listener for rider location ────────────
  useEffect(() => {
    if (!orderData?.firestore_path) return

    // Listen to: deliveries/{orderId}/location/current
    const locationRef = doc(db, orderData.firestore_path)

    const unsubscribe = onSnapshot(
      locationRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setRiderLocation({
            lat: data.lat,
            lng: data.lng,
            heading: data.heading,
            updatedAt: data.updated_at,
          })
        }
      },
      (err) => {
        console.error('Firestore listener error:', err)
      }
    )

    // Cleanup listener when component unmounts
    return () => unsubscribe()
  }, [orderData?.firestore_path])

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={{ color: '#5F6368', marginTop: 16 }}>
          Loading your tracking info...
        </p>
      </div>
    )
  }

  // ── Error states ───────────────────────────────────────────────
  if (error === 'invalid') {
    return (
      <div style={styles.centered}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
        <h2 style={{ marginBottom: 8 }}>Tracking link not found</h2>
        <p style={{ color: '#5F6368', textAlign: 'center' }}>
          This link may be invalid or has expired.
        </p>
      </div>
    )
  }

  if (error === 'server') {
    return (
      <div style={styles.centered}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ color: '#5F6368', textAlign: 'center' }}>
          Please try refreshing the page.
        </p>
      </div>
    )
  }

  const { business, customer_name, status, delivery_pin, firestore_path } = orderData
  const isDelivered = status === 'DELIVERED'
  const isInTransit = status === 'IN_TRANSIT'
  const showMap = ['PICKED_UP', 'IN_TRANSIT'].includes(status) && riderLocation

  return (
    <div style={styles.page}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={styles.header}>
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={business.name}
            style={styles.logo}
          />
        ) : (
          <div style={styles.logoPlaceholder}>
            🚚
          </div>
        )}
        <div>
          <h1 style={styles.businessName}>{business.name}</h1>
          <p style={styles.customerName}>Order for {customer_name}</p>
        </div>
      </div>

      {/* ── Status bar ─────────────────────────────────────────── */}
      <StatusBar status={status} />

      <div style={{ height: 16 }} />

      {/* ── Delivered screen ───────────────────────────────────── */}
      {isDelivered && (
        <div style={styles.deliveredBanner}>
          <span style={{ fontSize: 32 }}>🎉</span>
          <div>
            <p style={styles.deliveredTitle}>Your order has been delivered!</p>
            <p style={styles.deliveredSub}>Thank you for using {business.name}</p>
          </div>
        </div>
      )}

      {/* ── Live map ───────────────────────────────────────────── */}
      {showMap && (
        <>
          <LiveMap
            riderLocation={riderLocation}
            customerAddress={orderData.customer_address}
          />
          <div style={{ height: 16 }} />
        </>
      )}

      {/* ── Waiting states ─────────────────────────────────────── */}
      {['PENDING', 'ASSIGNED'].includes(status) && (
        <div style={styles.waitingCard}>
          <div style={styles.waitingIcon}>
            {status === 'PENDING' ? '⏳' : '👨‍🍳'}
          </div>
          <p style={styles.waitingTitle}>
            {status === 'PENDING'
              ? 'Your order has been received'
              : 'Your order is being prepared'}
          </p>
          <p style={styles.waitingSubtitle}>
            This page will update automatically
          </p>
        </div>
      )}

      {/* ── PIN display ────────────────────────────────────────── */}
      {isInTransit && delivery_pin && (
        <>
          <PinDisplay pin={delivery_pin} />
          <div style={{ height: 16 }} />
        </>
      )}

      {/* ── Rating prompt ──────────────────────────────────────── */}
      {isDelivered && (
        <>
          <div style={{ height: 16 }} />
          <RatingPrompt orderId={orderData.order_id} />
        </>
      )}

      <div style={{ height: 32 }} />

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div style={styles.footer}>
        <p>Powered by <strong style={{ color: '#1A73E8' }}>mydrop</strong></p>
      </div>

    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F8F9FA',
    paddingTop: 16,
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: 24,
    textAlign: 'center',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid #E8EAED',
    borderTop: '3px solid #1A73E8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 16px 16px',
    background: 'white',
    marginBottom: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    objectFit: 'cover',
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    background: '#1A73E8',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
  },
  customerName: {
    fontSize: 13,
    color: '#5F6368',
  },
  deliveredBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#E8F5E9',
    borderRadius: 12,
    padding: '16px',
    margin: '0 16px 16px',
    border: '1px solid #34A853',
  },
  deliveredTitle: {
    fontWeight: '600',
    color: '#1B5E20',
    fontSize: 15,
  },
  deliveredSub: {
    color: '#388E3C',
    fontSize: 13,
    marginTop: 2,
  },
  waitingCard: {
    background: 'white',
    borderRadius: 12,
    padding: '24px 16px',
    margin: '0 16px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  waitingIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  waitingTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  waitingSubtitle: {
    color: '#5F6368',
    fontSize: 13,
  },
  footer: {
    textAlign: 'center',
    color: '#9AA0A6',
    fontSize: 12,
    paddingBottom: 24,
  },
}