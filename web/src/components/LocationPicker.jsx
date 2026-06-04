// LocationPicker.jsx — Smart address input with map preview
//
// Replaces the plain text address input on the New Order form.
// Uses Google Places Autocomplete to suggest verified addresses
// as the manager types, then shows a map preview to confirm.
//
// Also accepts pasted Google Maps share links — extracts coordinates
// from the URL automatically.
//
// Props:
//   value: string — current address text
//   onChange: (address, latLng) => void — called when address changes
//   placeholder: string
//   required: boolean

import { useRef, useEffect, useState } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
} from '@react-google-maps/api'
import { colors, radius, typography, spacing, shadows } from '../theme'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const LIBRARIES = ['places']

// Default map center — Nairobi CBD
const NAIROBI_CENTER = { lat: -1.2921, lng: 36.8219 }

// Regex patterns for extracting coordinates from Google Maps links
// Handles: maps.google.com, maps.app.goo.gl, goo.gl/maps
const GMAPS_COORD_REGEX = /@(-?\d+\.\d+),(-?\d+\.\d+)/
const GMAPS_QUERY_REGEX = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/

export default function LocationPicker({
  value = '',
  onChange,
  placeholder = 'e.g. Kilimani, Nairobi',
  required = false,
}) {
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const [mapCenter, setMapCenter] = useState(NAIROBI_CENTER)
  const [markerPos, setMarkerPos] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [isPasteMode, setIsPasteMode] = useState(false)
  const [pasteValue, setPasteValue] = useState('')
  const [pasteLoading, setPasteLoading] = useState(false)
  const [pasteError, setPasteError] = useState('')

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_KEY,
    libraries: LIBRARIES,
  })

  // ── Initialize Places Autocomplete ──────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return

    // Bias results toward Kenya
    const bounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(-4.67, 33.91), // SW Kenya
      new window.google.maps.LatLng(4.62, 41.90),  // NE Kenya
    )

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        bounds,
        componentRestrictions: { country: 'ke' }, // Kenya only
        fields: ['formatted_address', 'geometry', 'name'],
        types: ['geocode', 'establishment'],
      }
    )

    // When user selects a suggestion
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace()

      if (!place.geometry) return

      const address = place.formatted_address || place.name
      const latLng = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }

      setMarkerPos(latLng)
      setMapCenter(latLng)
      setShowMap(true)
      onChange(address, latLng)
    })

    return () => {
      // Clean up autocomplete listener
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        )
      }
    }
  }, [isLoaded])

  // ── Handle pasted Google Maps links ─────────────────────────────────
  async function handlePasteLink() {
    setPasteLoading(true)
    setPasteError('')

    try {
      let lat, lng

      // Try to extract coordinates directly from the URL
      const coordMatch = pasteValue.match(GMAPS_COORD_REGEX)
      const queryMatch = pasteValue.match(GMAPS_QUERY_REGEX)

      if (coordMatch) {
        lat = parseFloat(coordMatch[1])
        lng = parseFloat(coordMatch[2])
      } else if (queryMatch) {
        lat = parseFloat(queryMatch[1])
        lng = parseFloat(queryMatch[2])
      } else {
        // For shortened URLs (goo.gl/maps), we can't resolve them
        // client-side without a proxy. Show an error.
        setPasteError(
          'Could not extract location from this link. ' +
          'Try copying the full Google Maps URL instead, or type the address manually.'
        )
        setPasteLoading(false)
        return
      }

      const latLng = { lat, lng }

      // Reverse geocode to get a readable address
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address
          setMarkerPos(latLng)
          setMapCenter(latLng)
          setShowMap(true)
          setIsPasteMode(false)
          setPasteValue('')
          onChange(address, latLng)
        } else {
          // Coordinates found but reverse geocode failed
          // Use coordinates as the address
          const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          setMarkerPos(latLng)
          setMapCenter(latLng)
          setShowMap(true)
          setIsPasteMode(false)
          setPasteValue('')
          onChange(address, latLng)
        }
      })
    } catch (err) {
      setPasteError('Failed to process link. Please type the address manually.')
    } finally {
      setPasteLoading(false)
    }
  }

  // ── Allow clicking the map to set location ───────────────────────────
  function handleMapClick(e) {
    const latLng = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    }

    setMarkerPos(latLng)

    // Reverse geocode the clicked point
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        onChange(results[0].formatted_address, latLng)
      }
    })
  }

  if (!isLoaded) {
    return (
      <div style={styles.loading}>
        Loading location picker...
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>

      {/* ── Input row ─────────────────────────────────────────────── */}
      <div style={styles.inputRow}>
        <input
          ref={inputRef}
          type="text"
          defaultValue={value}
          placeholder={placeholder}
          required={required}
          style={styles.input}
          onChange={e => onChange(e.target.value, null)}
        />
        <button
          type="button"
          onClick={() => {
            setIsPasteMode(!isPasteMode)
            setPasteError('')
          }}
          style={styles.pasteBtn}
          title="Paste a Google Maps link"
        >
          📍 Paste link
        </button>
      </div>

      {/* ── Paste link panel ─────────────────────────────────────── */}
      {isPasteMode && (
        <div style={styles.pastePanel}>
          <p style={styles.pastePanelTitle}>
            Paste a Google Maps share link
          </p>
          <p style={styles.pastePanelHint}>
            Ask your customer to share their location on Google Maps,
            then paste the link here.
          </p>
          <div style={styles.pasteRow}>
            <input
              type="text"
              value={pasteValue}
              onChange={e => setPasteValue(e.target.value)}
              placeholder="https://maps.google.com/..."
              style={styles.pasteInput}
            />
            <button
              type="button"
              onClick={handlePasteLink}
              disabled={!pasteValue || pasteLoading}
              style={{
                ...styles.pasteSubmitBtn,
                opacity: !pasteValue || pasteLoading ? 0.6 : 1,
              }}
            >
              {pasteLoading ? '...' : 'Use'}
            </button>
          </div>
          {pasteError && (
            <p style={styles.pasteError}>{pasteError}</p>
          )}
        </div>
      )}

      {/* ── Map preview ───────────────────────────────────────────── */}
      {showMap && (
        <div style={styles.mapWrapper}>
          <div style={styles.mapHint}>
            📍 Confirm location — click map to adjust
          </div>
          <GoogleMap
            mapContainerStyle={styles.map}
            center={mapCenter}
            zoom={15}
            onClick={handleMapClick}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              clickableIcons: false,
            }}
          >
            {markerPos && (
              <Marker
                position={markerPos}
                draggable
                onDragEnd={e => {
                  const latLng = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                  }
                  setMarkerPos(latLng)

                  // Reverse geocode the dragged position
                  const geocoder = new window.google.maps.Geocoder()
                  geocoder.geocode(
                    { location: latLng },
                    (results, status) => {
                      if (status === 'OK' && results[0]) {
                        onChange(results[0].formatted_address, latLng)
                      }
                    }
                  )
                }}
              />
            )}
          </GoogleMap>
          <p style={styles.mapFooter}>
            Drag the pin to fine-tune the exact location
          </p>
        </div>
      )}

    </div>
  )
}

const styles = {
  wrapper: { width: '100%' },
  loading: {
    padding: '10px 14px',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize: typography.sm,
    color: colors.textMuted,
    background: colors.background,
  },
  inputRow: {
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize: typography.base,
    outline: 'none',
    boxSizing: 'border-box',
    color: colors.text,
    background: colors.surface,
  },
  pasteBtn: {
    padding: '10px 14px',
    background: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    cursor: 'pointer',
    fontSize: typography.sm,
    color: colors.textSecondary,
    whiteSpace: 'nowrap',
    fontWeight: '500',
  },
  pastePanel: {
    marginTop: 8,
    padding: spacing.md,
    background: colors.primaryLight,
    borderRadius: radius.md,
    border: `1px solid ${colors.primary}40`,
  },
  pastePanelTitle: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.primary,
    margin: '0 0 4px',
  },
  pastePanelHint: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    margin: '0 0 10px',
    lineHeight: 1.5,
  },
  pasteRow: {
    display: 'flex',
    gap: 8,
  },
  pasteInput: {
    flex: 1,
    padding: '8px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    fontSize: typography.sm,
    outline: 'none',
    boxSizing: 'border-box',
  },
  pasteSubmitBtn: {
    padding: '8px 16px',
    background: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: radius.md,
    cursor: 'pointer',
    fontSize: typography.sm,
    fontWeight: '600',
  },
  pasteError: {
    fontSize: typography.xs,
    color: colors.error,
    margin: '8px 0 0',
    lineHeight: 1.5,
  },
  mapWrapper: {
    marginTop: 8,
    borderRadius: radius.md,
    overflow: 'hidden',
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.sm,
  },
  mapHint: {
    padding: '8px 12px',
    background: colors.navy,
    color: 'white',
    fontSize: typography.xs,
    fontWeight: '500',
  },
  map: {
    width: '100%',
    height: 200,
  },
  mapFooter: {
    padding: '6px 12px',
    background: colors.background,
    fontSize: typography.xs,
    color: colors.textMuted,
    margin: 0,
    borderTop: `1px solid ${colors.border}`,
  },
}