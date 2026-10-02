export async function searchPlaces({ dish, city, coords }, signal) {
  const sp = new URLSearchParams({ dish })
  if (city) sp.set('city', city)
  else {
    sp.set('lat', coords.lat.toFixed(5))
    sp.set('lng', coords.lng.toFixed(5))
  }
  const res = await fetch(`/api/places?${sp}`, { signal, headers: { Accept: 'application/json' } })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Có lỗi xảy ra, thử lại nhé')
  return data
}
