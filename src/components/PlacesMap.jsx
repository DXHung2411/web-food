import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { mapsLink } from '../format.js'

const VN_CENTER = [16.1, 106.0]

function pinIcon(place, active) {
  const rating = place.rating ? place.rating.toFixed(1) : '–'
  return L.divIcon({
    className: active ? 'pin pin--active' : 'pin',
    html: `<span class="pin__bubble"><span class="pin__star">★</span>${rating}</span>`,
    iconSize: [58, 34],
    iconAnchor: [29, 34],
  })
}

function FitToPlaces({ places, center, selected }) {
  const map = useMap()
  useEffect(() => {
    if (places.length) {
      map.fitBounds(L.latLngBounds(places.map((p) => [p.lat, p.lng])), { padding: [48, 48], maxZoom: 16 })
    } else if (center) {
      map.setView([center.lat, center.lng], 13)
    }
  }, [places, center, map])
  useEffect(() => {
    if (selected) map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 16), { duration: 0.6 })
  }, [selected, map])
  return null
}

function Pin({ place, active, onSelect }) {
  const ref = useRef(null)
  const icon = useMemo(() => pinIcon(place, active), [place, active])
  useEffect(() => {
    if (active) ref.current?.openPopup()
  }, [active])
  return (
    <Marker ref={ref} position={[place.lat, place.lng]} icon={icon} zIndexOffset={active ? 1000 : 0} eventHandlers={{ click: () => onSelect(place.id) }}>
      <Popup>
        <strong>{place.name}</strong>
        <br />
        {place.address}
        <br />
        <a href={mapsLink(place)} target="_blank" rel="noopener noreferrer">Chỉ đường ↗</a>
      </Popup>
    </Marker>
  )
}

export default function PlacesMap({ places, center, selectedId, onSelect }) {
  const selected = useMemo(() => places.find((p) => p.id === selectedId), [places, selectedId])
  return (
    <MapContainer center={VN_CENTER} zoom={6} className="map" zoomControl={false} attributionControl>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
      />
      <FitToPlaces places={places} center={center} selected={selected} />
      {places.map((p) => (
        <Pin key={p.id} place={p} active={p.id === selectedId} onSelect={onSelect} />
      ))}
    </MapContainer>
  )
}
