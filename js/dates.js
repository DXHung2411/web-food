// Dữ liệu gợi ý hẹn hò nằm ở js/content/dates.js (sửa bằng `npm run admin` hoặc sửa tay). File này chỉ có phần lọc theo giá.
import content from './content/dates.js'

export const DATE_TIPS = content.tips
export const DATE_IDEAS = content.ideas

export const PRICE_BUCKETS = [
  { id: 'all', label: 'Tất cả', min: 0, max: Infinity },
  { id: 'u200', label: 'Dưới 200k', min: 0, max: 200000 },
  { id: '200-500', label: '200k – 500k', min: 200000, max: 500000 },
  { id: '500-1000', label: '500k – 1 triệu', min: 500000, max: 1000000 },
  { id: 'o1000', label: 'Trên 1 triệu', min: 1000000, max: Infinity },
]

// Một gợi ý thuộc nhóm giá nếu khoảng giá của nó giao với nhóm đó.
export const inBucket = (idea, b) => idea.max > b.min && idea.min < b.max
