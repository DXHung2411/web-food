export const mapsLink = (p) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.lat},${p.lng}`)}&query_place_id=${encodeURIComponent(p.id)}`

export const priceLabel = (n) => (n == null ? null : n === 0 ? 'Miễn phí' : '₫'.repeat(n))
