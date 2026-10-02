// Offline fake data for local development / UI testing (MOCK_PLACES=1). Never used in production.

const NAMES = ['Quán Cô Ba', 'Nhà Bếp Xanh', 'Hẻm 42', 'Bà Tư', 'Gánh Chiều', 'Tiệm Mộc', 'Lò Than', 'Ngõ Nhỏ', 'Sáu Nghệ', 'Góc Phố']

function seeded(seed) {
  let s = seed
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296)
}

export function mockPlaces(dish, center) {
  const rnd = seeded(Math.round(center.lat * 1000) + dish.id.length * 7919)
  return NAMES.map((name, i) => ({
    id: `mock-${dish.id}-${i}`,
    name: `${name} - ${dish.label}`,
    address: `${10 + i * 7} Đường Mẫu ${i + 1}, Việt Nam`,
    lat: center.lat + (rnd() - 0.5) * 0.04,
    lng: center.lng + (rnd() - 0.5) * 0.04,
    rating: Math.round((3.4 + rnd() * 1.6) * 10) / 10,
    ratingCount: Math.floor(rnd() * 2000) + 10,
    price: 1 + Math.floor(rnd() * 3),
  }))
}
