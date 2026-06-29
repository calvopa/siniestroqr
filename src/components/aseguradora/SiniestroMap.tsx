'use client'
import { useEffect, useRef } from 'react'

interface SiniestroMapProps {
  lat: number
  lng: number
  accuracy?: number | null
}

export default function SiniestroMap({ lat, lng, accuracy }: SiniestroMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!).setView([lat, lng], 15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)
      L.marker([lat, lng]).addTo(map).bindPopup('Ubicación del siniestro').openPopup()
      if (accuracy) {
        L.circle([lat, lng], { radius: accuracy, color: '#1A6BCC', fillOpacity: 0.1 }).addTo(map)
      }
      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [lat, lng, accuracy])

  return <div ref={mapRef} style={{ height: '300px' }} className="rounded-xl z-0" />
}
