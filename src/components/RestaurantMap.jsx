import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

export default function RestaurantMap({ restaurants }) {
  const containerRef   = useRef(null)
  const mapInstanceRef = useRef(null)

  const pins = restaurants.filter(r => r.lat && r.lon)

  useEffect(() => {
    if (!containerRef.current || pins.length === 0) return
    if (mapInstanceRef.current) return // already mounted

    import('leaflet').then(({ default: L }) => {
      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false })
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      pins.forEach((r, i) => {
        const isTop  = i === 0
        const bg     = isTop ? '#D4820A' : '#3D2B1F'
        const label  = isTop ? '⭐' : String(i + 1)
        const size   = isTop ? 34 : 28

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:${size}px;height:${size}px;
            background:${bg};color:#fff;
            border-radius:50%;border:2.5px solid #fff;
            display:flex;align-items:center;justify-content:center;
            font-weight:700;font-size:${isTop ? '0.8rem' : '0.82rem'};
            box-shadow:0 2px 8px rgba(0,0,0,0.35);
            cursor:pointer;
          ">${label}</div>`,
          iconSize:   [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor:[0, -(size / 2) - 4],
        })

        L.marker([r.lat, r.lon], { icon })
          .addTo(map)
          .bindPopup(`<strong>${r.name}</strong>${r.adresse ? `<br><small>${r.adresse}</small>` : ''}`)
      })

      // Fit map to show all markers
      if (pins.length === 1) {
        map.setView([pins[0].lat, pins[0].lon], 16)
      } else {
        const bounds = L.latLngBounds(pins.map(r => [r.lat, r.lon]))
        map.fitBounds(bounds, { padding: [30, 30] })
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (pins.length === 0) return (
    <div style={{
      border: '1.5px solid var(--ink)',
      background: 'var(--bg)',
      padding: '12px 14px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      color: 'var(--mute)',
    }}>
      📍 Carte indisponible, relance une recherche via le bouton 🔄
    </div>
  )

  return (
    <div style={{ border: '1.5px solid var(--ink)', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ height: 240, width: '100%' }} />
    </div>
  )
}
