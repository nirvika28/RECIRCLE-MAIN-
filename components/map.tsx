"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import type { RefObject } from "react"

// Dynamically import Leaflet on client only
const importLeaflet = () => import("leaflet")

export type Cluster = {
  id: string
  name: string
  lat: number
  lng: number
  members: number
  memberNames?: string[]
}

interface CommunityMapProps {
  className?: string
  height?: number
  onClusterClick?: (cluster: Cluster) => void
}

export default function CommunityMap({ className, height = 360, onClusterClick }: CommunityMapProps) {
  const [leafletReady, setLeafletReady] = useState(false)
  const [center, setCenter] = useState<[number, number]>([20, 0])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)

  // Load Leaflet CSS once on client
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link")
      link.id = "leaflet-css"
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      link.crossOrigin = ""
      link.onload = () => setLeafletReady(true)
      document.head.appendChild(link)
    } else {
      setLeafletReady(true)
    }
  }, [])

  // Initialize map once Leaflet is ready
  useEffect(() => {
    if (!leafletReady || !containerRef.current || mapRef.current) return
    let L: any
    let mapInstance: any
    let userMarker: any
    let clusterMarkers: any[] = []
    let tileLayer: any
    let cancelled = false

    importLeaflet().then((leaflet) => {
      if (cancelled) return
      L = leaflet
      // Fix default icon paths for Leaflet when using bundlers
      // @ts-ignore
      delete (L.Icon.Default as any).prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      mapInstance = L.map(containerRef.current!).setView(center, 12)
      tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance)
      mapRef.current = mapInstance

      // Geolocate
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude
            const lng = pos.coords.longitude
            setCenter([lat, lng])
            mapInstance.setView([lat, lng], 13)
            userMarker = L.marker([lat, lng]).addTo(mapInstance)
            // Fetch clusters
            fetch(`/api/community/map/clusters?lat=${lat}&lng=${lng}&radiusKm=10`)
              .then(r => r.json())
              .then((data) => {
                const list: Cluster[] = (data?.clusters as Cluster[]) || []
                setClusters(list)
                clusterMarkers = list.map((c) => {
                  const marker = L.marker([c.lat, c.lng]).addTo(mapInstance)
                  
                  // Create popup content with member names
                  const memberNamesHtml = c.memberNames && c.memberNames.length > 0 
                    ? `<div style="margin-top: 8px;"><div style="font-size: 12px; color: #666; margin-bottom: 4px;">Members:</div><div style="font-size: 12px;">${c.memberNames.join(', ')}${c.members > c.memberNames.length ? ` +${c.members - c.memberNames.length} more` : ''}</div></div>`
                    : ''
                  
                  const popupContent = `
                    <div style="font-weight:600; margin-bottom: 4px;">${c.name}</div>
                    <div style="font-size: 12px; color: #666;">${c.members} members</div>
                    ${memberNamesHtml}
                  `
                  
                  marker.bindPopup(popupContent)
                  marker.on('click', () => {
                    if (onClusterClick) onClusterClick(c)
                  })
                  return marker
                })
              })
              .catch(() => {})
          },
          () => {
            // keep default center
          }
        )
      }
    })

    return () => {
      cancelled = true
      try {
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }
      } catch {}
    }
  }, [leafletReady])

  const containerStyle = useMemo(() => ({ height: `${height}px`, width: "100%" }), [height])

  return (
    <div className={className} style={containerStyle} ref={containerRef} />
  )
}


