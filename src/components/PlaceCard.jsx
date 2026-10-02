import { mapsLink, priceLabel } from '../format.js'

export default function PlaceCard({ place, rank, active, onSelect }) {
  const price = priceLabel(place.price)
  return (
    <li data-id={place.id}>
      <article className={active ? 'card card--active' : 'card'}>
        <button type="button" className="card__main" onClick={() => onSelect(place.id)} aria-pressed={active}>
          <span className="card__rank">{rank}</span>
          <span className="card__body">
            <span className="card__name">{place.name}</span>
            <span className="card__addr">{place.address}</span>
            <span className="card__meta">
              {place.rating ? (
                <span className="badge badge--rate">★ {place.rating.toFixed(1)} <small>({place.ratingCount.toLocaleString('vi-VN')})</small></span>
              ) : (
                <span className="badge">Chưa có đánh giá</span>
              )}
              {price && <span className="badge">{price}</span>}
            </span>
          </span>
        </button>
        <a className="card__go" href={mapsLink(place)} target="_blank" rel="noopener noreferrer" aria-label={`Chỉ đường tới ${place.name}`}>
          Chỉ đường ↗
        </a>
      </article>
    </li>
  )
}
