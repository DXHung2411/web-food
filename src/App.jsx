import { useEffect, useMemo, useRef, useState } from 'react'
import { CITIES, DISHES } from '../shared/catalog.js'
import { searchPlaces } from './api.js'
import PlacesMap from './components/PlacesMap.jsx'
import PlaceCard from './components/PlaceCard.jsx'

const SORTS = {
  rating: { label: '⭐ Rating cao', fn: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.ratingCount - a.ratingCount },
  reviews: { label: '🔥 Nhiều review', fn: (a, b) => b.ratingCount - a.ratingCount },
}

export default function App() {
  const [dish, setDish] = useState(null)
  const [city, setCity] = useState('') // city id, or 'near'
  const [coords, setCoords] = useState(null)
  const [geoError, setGeoError] = useState('')
  const [sort, setSort] = useState('rating')
  const [minRating, setMinRating] = useState(0)
  const [state, setState] = useState({ status: 'idle', places: [], center: null, error: '' })
  const [selectedId, setSelectedId] = useState(null)
  const listRef = useRef(null)

  const ready = dish && (city === 'near' ? coords : city)

  useEffect(() => {
    if (!ready) return
    const ctrl = new AbortController()
    setState((s) => ({ ...s, status: 'loading', error: '' }))
    setSelectedId(null)
    searchPlaces({ dish, city: city === 'near' ? null : city, coords }, ctrl.signal)
      .then((d) => setState({ status: 'done', places: d.places, center: d.center, error: '' }))
      .catch((e) => e.name !== 'AbortError' && setState({ status: 'error', places: [], center: null, error: e.message }))
    return () => ctrl.abort()
  }, [ready, dish, city, coords])

  const places = useMemo(
    () => state.places.filter((p) => (p.rating ?? 0) >= minRating).sort(SORTS[sort].fn),
    [state.places, minRating, sort],
  )

  function locate() {
    setGeoError('')
    if (!navigator.geolocation) return setGeoError('Trình duyệt không hỗ trợ định vị')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setCity('near')
      },
      () => setGeoError('Không lấy được vị trí – hãy cho phép định vị hoặc chọn thành phố'),
      { timeout: 10000, maximumAge: 300000 },
    )
  }

  function select(id) {
    setSelectedId(id)
    listRef.current?.querySelector(`[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  return (
    <div className="app">
      <header className="top">
        <h1 className="brand">Ăn Gì Đây<span>?</span> <i aria-hidden="true">🍜</i></h1>
        <p className="tagline">Chọn món, chọn nơi – bản đồ chỉ quán ngon cho bạn.</p>

        <div className="where">
          <label className="select">
            <span className="sr-only">Thành phố</span>
            <select value={city === 'near' ? '' : city} onChange={(e) => setCity(e.target.value)}>
              <option value="" disabled>📍 Chọn thành phố</option>
              {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <button type="button" className={city === 'near' ? 'btn btn--on' : 'btn'} onClick={locate}>🧭 Gần tôi</button>
        </div>
        {geoError && <p className="note note--err" role="alert">{geoError}</p>}

        <div className="chips" role="group" aria-label="Chọn món">
          {DISHES.map((d) => (
            <button key={d.id} type="button" className={dish === d.id ? 'chip chip--on' : 'chip'} aria-pressed={dish === d.id} onClick={() => setDish(d.id)}>
              <span aria-hidden="true">{d.emoji}</span> {d.label}
            </button>
          ))}
        </div>
      </header>

      <main className="main">
        <section className="panel" aria-label="Danh sách quán">
          {state.status === 'done' && (
            <div className="tools">
              {Object.entries(SORTS).map(([k, v]) => (
                <button key={k} type="button" className={sort === k ? 'tool tool--on' : 'tool'} onClick={() => setSort(k)}>{v.label}</button>
              ))}
              <button type="button" className={minRating ? 'tool tool--on' : 'tool'} onClick={() => setMinRating(minRating ? 0 : 4)}>4.0+ ★</button>
            </div>
          )}
          <div aria-live="polite" className="status">
            {!ready && <Empty icon="👆" title="Bắt đầu nào!" text="Chọn một thành phố (hoặc “Gần tôi”) và một món bạn đang thèm." />}
            {state.status === 'loading' && <Skeleton />}
            {state.status === 'error' && <Empty icon="😵" title="Ối, lỗi rồi" text={state.error} />}
            {state.status === 'done' && !places.length && <Empty icon="🫥" title="Chưa tìm thấy quán" text="Thử món khác, bỏ lọc 4.0+ hoặc đổi khu vực nhé." />}
          </div>
          {state.status === 'done' && places.length > 0 && (
            <>
              <p className="count">{places.length} quán gợi ý</p>
              <ol className="list" ref={listRef}>
                {places.map((p, i) => (
                  <PlaceCard key={p.id} place={p} rank={i + 1} active={p.id === selectedId} onSelect={select} />
                ))}
              </ol>
            </>
          )}
        </section>
        <section className="mapwrap" aria-label="Bản đồ">
          <PlacesMap places={state.status === 'done' ? places : []} center={state.center} selectedId={selectedId} onSelect={select} />
        </section>
      </main>
    </div>
  )
}

function Empty({ icon, title, text }) {
  return (
    <div className="empty">
      <div className="empty__icon" aria-hidden="true">{icon}</div>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

function Skeleton() {
  return <div className="skeleton" aria-label="Đang tìm quán…">{[0, 1, 2, 3].map((i) => <div key={i} />)}</div>
}
