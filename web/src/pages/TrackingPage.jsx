// TrackingPage.jsx — Customer-facing delivery tracking page
//
// Opened when a customer clicks their tracking link.
// Shows real-time order status, live rider location on map,
// delivery PIN, and a rating prompt after delivery.
//
// Updated with orange/navy theme and neutral icons (no food emojis).
// Status labels are dynamic based on business type from the API.

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { colors, radius, typography, spacing } from '../theme'

// smoothlyAnimateMarker — interpolates a marker position between
// two GPS coordinates over a given duration.
// This makes the rider appear to glide on the map instead of
// teleporting between GPS updates (which arrive every 3-5 seconds).
//
// @param {google.maps.Marker} marker - the marker to animate
// @param {object} from - { lat, lng } starting position
// @param {object} to - { lat, lng } ending position
// @param {number} duration - animation duration in ms
function smoothlyAnimateMarker(setPosition, from, to, duration = 1500) {
  const startTime = performance.now()

  function animate(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Ease-out cubic — starts fast, slows at end
    const eased = 1 - Math.pow(1 - progress, 3)

    const lat = from.lat + (to.lat - from.lat) * eased
    const lng = from.lng + (to.lng - from.lng) * eased

    setPosition({ lat, lng })

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

const API_BASE = import.meta.env.VITE_API_BASE_URL
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const LIBRARIES = ['places']
const NAIROBI_CENTER = { lat: -1.2921, lng: 36.8219 }

const MAP_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

// Neutral delivery truck SVG path for the rider marker
const TRUCK_ICON = {
  path: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
  fillColor: colors.primary,
  fillOpacity: 1,
  strokeColor: 'white',
  strokeWeight: 1,
  scale: 1.4,
}

// Status step order for the progress bar
const STATUS_STEPS = [
  'PENDING',
  'ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
]

// Neutral icons for each status — works for any business type
const STATUS_ICONS = {
  PENDING: '📋',
  ASSIGNED: '⏳',
  PICKED_UP: '✓',
  IN_TRANSIT: '🚚',
  DELIVERED: '✅',
  FAILED: '✗',
}

export default function TrackingPage() {
  const { token } = useParams()
  const [orderData, setOrderData] = useState(null)
  const [riderLocation, setRiderLocation] = useState(null)
  const [animatedPosition, setAnimatedPosition] = useState(null)
  const previousPositionRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [errorType, setErrorType] = useState(null) // 'invalid' | 'server'
  const [directions, setDirections] = useState(null)
  const [destLatLng, setDestLatLng] = useState(null)

  const { isLoaded: mapsLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_KEY,
    libraries: LIBRARIES,
  })

  // ── Fetch order data ─────────────────────────────────────────────────
  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await axios.get(`${API_BASE}/track/${token}`)
        setOrderData(res.data)
      } catch (err) {
        setErrorType(
          err.response?.status === 404 ? 'invalid' : 'server'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
    // Refresh every 30 seconds
    const interval = setInterval(fetchOrder, 30000)
    return () => clearInterval(interval)
  }, [token])

  // ── Listen to Firestore for live GPS ─────────────────────────────────
  useEffect(() => {
  if (!orderData?.firestore_path) return

  const unsubscribe = onSnapshot(
    doc(db, orderData.firestore_path),
    snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        const newPosition = { lat: data.lat, lng: data.lng }

        setRiderLocation(newPosition)

        // Animate smoothly from previous position to new position
        if (previousPositionRef.current) {
          smoothlyAnimateMarker(
            setAnimatedPosition,
            previousPositionRef.current,
            newPosition,
            1500 // 1.5 second animation
          )
        } else {
          // First position — no animation needed
          setAnimatedPosition(newPosition)
        }

        previousPositionRef.current = newPosition
      }
    },
    err => console.error('Firestore error:', err)
  )

  return () => unsubscribe()
}, [orderData?.firestore_path])

  // ── Geocode delivery address and get directions ──────────────────────
  useEffect(() => {
    if (!mapsLoaded || !riderLocation || !orderData?.customer_address) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode(
      { address: `${orderData.customer_address}, Nairobi, Kenya` },
      (results, status) => {
        if (status === 'OK' && results[0]) {
          const dest = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          }
          setDestLatLng(dest)

          // Get route from rider to customer
          const service = new window.google.maps.DirectionsService()
          service.route(
            {
              origin: riderLocation,
              destination: dest,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === 'OK') setDirections(result)
            }
          )
        }
      }
    )
  }, [mapsLoaded, riderLocation, orderData?.customer_address])

  // Pan map to follow rider as they move
  useEffect(() => {
    if (mapInstanceRef.current && animatedPosition) {
      mapInstanceRef.current.panTo(animatedPosition)
    }
  }, [animatedPosition])

  // ── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={pageStyles.centered}>
        <div style={pageStyles.spinner} />
        <p style={pageStyles.loadingText}>
          Loading your tracking info...
        </p>
      </div>
    )
  }

  // ── Error states ─────────────────────────────────────────────────────
  if (errorType === 'invalid') {
    return (
      <div style={pageStyles.centered}>
        <div style={{ fontSize: 56, marginBottom: spacing.md }}>🔍</div>
        <h2 style={pageStyles.errorTitle}>Tracking link not found</h2>
        <p style={pageStyles.errorText}>
          This link may be invalid or has expired.
        </p>
      </div>
    )
  }

  if (errorType === 'server') {
    return (
      <div style={pageStyles.centered}>
        <div style={{ fontSize: 56, marginBottom: spacing.md }}>⚠️</div>
        <h2 style={pageStyles.errorTitle}>Something went wrong</h2>
        <p style={pageStyles.errorText}>
          Please try refreshing the page.
        </p>
      </div>
    )
  }

  const {
    business,
    customer_name,
    status,
    status_labels,
    delivery_pin,
    firestore_path,
  } = orderData

  const isDelivered = status === 'DELIVERED'
  const isInTransit = status === 'IN_TRANSIT'
  const showMap = ['PICKED_UP', 'IN_TRANSIT'].includes(status) && animatedPosition
  const showPin = isInTransit && delivery_pin
  const currentStepIndex = STATUS_STEPS.indexOf(status)

  return (
    <div style={pageStyles.page}>

      {/* ── Business header ────────────────────────────────────────── */}
      <div style={pageStyles.header}>
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={business.name}
            style={pageStyles.logo}
          />
        ) : (
          <div style={pageStyles.logoPlaceholder}>
            🚚
          </div>
        )}
        <div>
          <h1 style={pageStyles.businessName}>{business.name}</h1>
          <p style={pageStyles.customerName}>Order for {customer_name}</p>
        </div>
      </div>

      {/* ── Status progress bar ────────────────────────────────────── */}
      {status !== 'FAILED' ? (
        <div style={pageStyles.statusBar}>
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isActive = index === currentStepIndex
            const label = status_labels?.[step] || step.replace('_', ' ')

            return (
              <div key={step} style={pageStyles.stepWrapper}>
                {/* Connector line before */}
                {index > 0 && (
                  <div style={{
                    ...pageStyles.connector,
                    background: index <= currentStepIndex
                      ? colors.primary
                      : colors.border,
                  }} />
                )}

                {/* Circle */}
                <div style={{
                  ...pageStyles.stepCircle,
                  background: isCompleted || isActive
                    ? colors.primary
                    : colors.border,
                  transform: isActive ? 'scale(1.2)' : 'scale(1)',
                }}>
                  <span style={{ fontSize: isActive ? 13 : 11 }}>
                    {isCompleted ? '✓' : STATUS_ICONS[step]}
                  </span>
                </div>

                {/* Label */}
                <p style={{
                  ...pageStyles.stepLabel,
                  color: isActive
                    ? colors.primary
                    : isCompleted
                    ? colors.success
                    : colors.textMuted,
                  fontWeight: isActive
                    ? typography.semibold
                    : typography.normal,
                }}>
                  {label}
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={pageStyles.failedBanner}>
          <span style={{ fontSize: 24 }}>✗</span>
          <p style={pageStyles.failedText}>
            {status_labels?.FAILED || 'Could not complete delivery'}
          </p>
        </div>
      )}

      {/* ── Delivered banner ───────────────────────────────────────── */}
      {isDelivered && (
        <div style={pageStyles.deliveredBanner}>
          <span style={{ fontSize: 32 }}>🎉</span>
          <div>
            <p style={pageStyles.deliveredTitle}>
              Your order has been delivered!
            </p>
            <p style={pageStyles.deliveredSub}>
              Thank you for using {business.name}
            </p>
          </div>
        </div>
      )}

      {/* ── Waiting card for PENDING/ASSIGNED ─────────────────────── */}
      {['PENDING', 'ASSIGNED'].includes(status) && (
        <div style={pageStyles.waitingCard}>
          <div style={{ fontSize: 40, marginBottom: spacing.sm }}>
            {status === 'PENDING' ? '📋' : '⏳'}
          </div>
          <p style={pageStyles.waitingTitle}>
            {status === 'PENDING'
              ? 'Your order has been received'
              : 'Your order is being prepared'}
          </p>
          <p style={pageStyles.waitingSubtitle}>
            This page updates automatically
          </p>
        </div>
      )}

      {/* Live indicator — shown when rider is actively moving */}
      {showMap && <LiveIndicator />}

      {/* ── Live map ───────────────────────────────────────────────── */}
      {showMap && mapsLoaded && (
        <div style={pageStyles.mapContainer}>
          <GoogleMap
            mapContainerStyle={pageStyles.map}
            center={animatedPosition || NAIROBI_CENTER}
            zoom={15}
            onLoad={map => { mapInstanceRef.current = map }}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              styles: MAP_STYLE,
            }}

          >
            {/* Rider marker — uses animated position for smooth movement */}
            {animatedPosition && (
              <Marker
                position={animatedPosition}
                icon={TRUCK_ICON}
                title="Your delivery rider"
              />
            )}


            {/* Destination marker */}
            {destLatLng && (
              <Marker
                position={destLatLng}
                title="Delivery address"
              />
            )}

            {/* Route */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: colors.primary,
                    strokeWeight: 4,
                  },
                }}
              />
            )}
          </GoogleMap>

          {/* ETA */}
          {directions && (
            <div style={pageStyles.eta}>
              <span style={{ fontSize: 18 }}>🕐</span>
              <span style={pageStyles.etaText}>
                Arriving in approximately{' '}
                <strong>
                  {directions.routes[0]?.legs[0]?.duration?.text}
                </strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Delivery PIN ───────────────────────────────────────────── */}
      {showPin && (
        <div style={pageStyles.pinCard}>
          <p style={pageStyles.pinLabel}>
            Show this PIN to your rider
          </p>
          <div style={pageStyles.pinRow}>
            {delivery_pin.split('').map((digit, i) => (
              <div key={i} style={pageStyles.pinDigit}>
                <span style={pageStyles.pinDigitText}>{digit}</span>
              </div>
            ))}
          </div>
          <p style={pageStyles.pinHint}>
            The rider will enter this code to confirm delivery
          </p>
        </div>
      )}

      {/* ── Rating (after delivery) ────────────────────────────────── */}
      {isDelivered && (
        <RatingWidget orderId={orderData.order_id} />
      )}

      <div style={{ height: spacing.xxxl }} />

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div style={pageStyles.footer}>
        <p style={pageStyles.footerText}>
          Powered by{' '}
          <strong style={{ color: colors.primary }}>mydrop</strong>
        </p>
      </div>

    </div>
  )
}

// ── Rating widget ────────────────────────────────────────────────────────

function RatingWidget({ orderId }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!rating) return
    setLoading(true)
    try {
      await axios.put(`${API_BASE}/orders/${orderId}/rate`, { rating })
      setSubmitted(true)
    } catch {
      setSubmitted(true) // still show success to avoid frustrating the user
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={pageStyles.ratingCard}>
        <p style={{ fontSize: 24, marginBottom: 8 }}>🙏</p>
        <p style={pageStyles.ratingThankYou}>
          Thanks for your feedback!
        </p>
      </div>
    )
  }

  return (
    <div style={pageStyles.ratingCard}>
      <p style={pageStyles.ratingLabel}>
        Rate your delivery experience
      </p>
      <div style={pageStyles.stars}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            style={{
              ...pageStyles.star,
              color: star <= (hovered || rating)
                ? '#FBBC04'
                : colors.border,
            }}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
          >
            ★
          </span>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!rating || loading}
        style={{
          ...pageStyles.ratingBtn,
          opacity: !rating || loading ? 0.5 : 1,
        }}
      >
        {loading ? 'Submitting...' : 'Submit Rating'}
      </button>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────

const pageStyles = {
  page: {
    minHeight: '100vh',
    background: colors.background,
    paddingTop: spacing.md,
    fontFamily: 'Arial, sans-serif',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: spacing.lg,
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  spinner: {
    width: 40,
    height: 40,
    border: `3px solid ${colors.border}`,
    borderTop: `3px solid ${colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: 8,
  },
  errorText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `0 ${spacing.md}px ${spacing.md}px`,
    background: colors.surface,
    marginBottom: spacing.md,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    objectFit: 'cover',
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    background: colors.primary,
    borderRadius: radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
  },
  businessName: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.text,
    margin: 0,
  },
  customerName: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    margin: 0,
  },

  // Status bar
  statusBar: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: `${spacing.md}px`,
    background: colors.surface,
    borderRadius: radius.lg,
    margin: `0 ${spacing.md}px ${spacing.md}px`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    position: 'relative',
  },
  stepWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    top: 16,
    right: '50%',
    left: '-50%',
    height: 2,
    zIndex: 0,
    transition: 'background 0.3s ease',
  },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    zIndex: 1,
    transition: 'all 0.3s ease',
    color: 'white',
    fontSize: 12,
  },
  stepLabel: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 1.2,
    maxWidth: 56,
    margin: 0,
    transition: 'color 0.3s ease',
  },

  // Failed
  failedBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    background: colors.errorLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    margin: `0 ${spacing.md}px ${spacing.md}px`,
    border: `1px solid ${colors.error}40`,
  },
  failedText: {
    color: colors.error,
    fontWeight: typography.semibold,
    margin: 0,
  },

  // Delivered
  deliveredBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    background: colors.successLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    margin: `0 ${spacing.md}px ${spacing.md}px`,
    border: `1px solid ${colors.success}40`,
  },
  deliveredTitle: {
    fontWeight: typography.semibold,
    color: '#166534',
    fontSize: typography.md,
    margin: 0,
  },
  deliveredSub: {
    color: '#16a34a',
    fontSize: typography.sm,
    marginTop: 2,
    marginBottom: 0,
  },

  // Waiting
  waitingCard: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    margin: `0 ${spacing.md}px ${spacing.md}px`,
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  waitingTitle: {
    fontWeight: typography.semibold,
    fontSize: typography.lg,
    color: colors.text,
    marginBottom: 4,
    marginTop: 0,
  },
  waitingSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    margin: 0,
  },

  // Map
  mapContainer: {
    margin: `0 ${spacing.md}px ${spacing.md}px`,
    borderRadius: radius.lg,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  map: {
    width: '100%',
    height: 280,
  },
  eta: {
    background: colors.surface,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderTop: `1px solid ${colors.border}`,
  },
  etaText: {
    color: colors.textSecondary,
    fontSize: typography.sm,
  },

  // PIN
  pinCard: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    margin: `0 ${spacing.md}px ${spacing.md}px`,
    textAlign: 'center',
    border: `2px solid ${colors.primary}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  pinLabel: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    marginBottom: spacing.sm,
    fontWeight: typography.medium,
    marginTop: 0,
  },
  pinRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: 8,
  },
  pinDigit: {
    width: 52,
    height: 64,
    background: colors.primaryLight,
    border: `2px solid ${colors.primary}`,
    borderRadius: radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigitText: {
    fontSize: 36,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  pinHint: {
    color: colors.textMuted,
    fontSize: typography.xs,
    margin: 0,
  },

  // Rating
  ratingCard: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    margin: `0 ${spacing.md}px ${spacing.md}px`,
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  ratingLabel: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    fontWeight: typography.medium,
    marginBottom: spacing.sm,
    marginTop: 0,
  },
  stars: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  star: {
    fontSize: 40,
    cursor: 'pointer',
    transition: 'color 0.1s ease',
    userSelect: 'none',
  },
  ratingBtn: {
    background: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: radius.md,
    padding: '12px 32px',
    fontSize: typography.base,
    fontWeight: typography.semibold,
    cursor: 'pointer',
    width: '100%',
  },
  ratingThankYou: {
    color: colors.success,
    fontWeight: typography.semibold,
    marginTop: 8,
    marginBottom: 0,
  },

  // Footer
  footer: {
    textAlign: 'center',
    paddingBottom: spacing.xl,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: typography.xs,
    margin: 0,
  },
}

// LiveIndicator — shows a pulsing orange dot to signal
// that the tracking is live and the rider location is updating.
// Displayed next to the status bar when rider is in transit.

function LiveIndicator() {
  return (
    <div style={liveStyles.wrapper}>
      <div style={liveStyles.pulse} />
      <span style={liveStyles.text}>Live tracking</span>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const liveStyles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    background: `${colors.success}18`,
    borderRadius: colors.full,
    border: `1px solid ${colors.success}40`,
    margin: `0 ${spacing.md}px ${spacing.md}px`,
    width: 'fit-content',
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: colors.success,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  text: {
    fontSize: typography.xs,
    color: colors.success,
    fontWeight: typography.semibold,
  },
}