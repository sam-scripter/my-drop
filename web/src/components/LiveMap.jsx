// LiveMap.jsx — Google Maps with live rider position
//
// Shows:
// - A static marker for the customer's delivery address
// - A moving marker for the rider's current position (from Firestore)
// - A route line between the rider and the customer

import { useEffect, useRef, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Nairobi CBD as default center while we wait for GPS
const DEFAULT_CENTER = { lat: -1.2921, lng: 36.8219 }

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '280px',
  borderRadius: '12px',
}

// Custom rider marker — blue dot
const RIDER_ICON = {
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
  fillColor: '#1A73E8',
  fillOpacity: 1,
  strokeColor: 'white',
  strokeWeight: 2,
  scale: 1.5,
}

export default function LiveMap({ riderLocation, customerAddress }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
    libraries: ['places'],
  })

  const [directions, setDirections] = useState(null)
  const [customerCoords, setCustomerCoords] = useState(null)
  const mapRef = useRef(null)
  const directionsRef = useRef(null)
  const lastEtaFetch = useRef(0)

  // Geocode the customer address to get coordinates
  useEffect(() => {
    if (!isLoaded || !customerAddress) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode(
      { address: `${customerAddress}, Nairobi, Kenya` },
      (results, status) => {
        if (status === 'OK' && results[0]) {
          setCustomerCoords({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          })
        }
      }
    )
  }, [isLoaded, customerAddress])

  // Fetch directions when rider location updates
  // But only every 30 seconds to avoid excessive API calls
  useEffect(() => {
    if (!isLoaded || !riderLocation || !customerCoords) return

    const now = Date.now()
    if (now - lastEtaFetch.current < 30000) return // 30 second throttle
    lastEtaFetch.current = now

    const directionsService = new window.google.maps.DirectionsService()
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(
          riderLocation.lat,
          riderLocation.lng
        ),
        destination: new window.google.maps.LatLng(
          customerCoords.lat,
          customerCoords.lng
        ),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result)
        }
      }
    )
  }, [isLoaded, riderLocation, customerCoords])

  // Pan map to follow rider
  useEffect(() => {
    if (mapRef.current && riderLocation) {
      mapRef.current.panTo({
        lat: riderLocation.lat,
        lng: riderLocation.lng,
      })
    }
  }, [riderLocation])

  if (!isLoaded) {
    return (
      <div style={styles.loading}>
        <p style={{ color: '#5F6368' }}>Loading map...</p>
      </div>
    )
  }

  const center = riderLocation
    ? { lat: riderLocation.lat, lng: riderLocation.lng }
    : customerCoords || DEFAULT_CENTER

  return (
    <div style={styles.container}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={14}
        onLoad={(map) => { mapRef.current = map }}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            // Subtle map style — cleaner for delivery tracking
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        }}
      >
        {/* Rider's live position */}
        {riderLocation && (
          <Marker
            position={{ lat: riderLocation.lat, lng: riderLocation.lng }}
            icon={RIDER_ICON}
            title="Your rider"
          />
        )}

        {/* Customer's delivery address */}
        {customerCoords && (
          <Marker
            position={customerCoords}
            title="Delivery address"
          />
        )}

        {/* Route from rider to customer */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true, // we draw our own markers above
              polylineOptions: {
                strokeColor: '#1A73E8',
                strokeWeight: 4,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* ETA display */}
      {directions && (
        <div style={styles.eta}>
          <span style={styles.etaIcon}>🕐</span>
          <span style={styles.etaText}>
            Arriving in approximately{' '}
            <strong>
              {directions.routes[0]?.legs[0]?.duration?.text}
            </strong>
          </span>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    margin: '0 16px',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  loading: {
    height: 280,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#E8EAED',
    borderRadius: 12,
    margin: '0 16px',
  },
  eta: {
    background: 'white',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderTop: '1px solid #E8EAED',
  },
  etaIcon: {
    fontSize: 18,
  },
  etaText: {
    color: '#5F6368',
    fontSize: 14,
  },
}