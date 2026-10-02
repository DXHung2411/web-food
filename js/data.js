// Danh sách món + giá ƯỚC LƯỢNG (VND/suất, sinh viên, thành phố). Đây là số tham khảo,
// hãy chỉnh cho đúng khu vực của bạn. Chỉ cần sửa file này, không cần đụng code khác.
//   meals: bữa có thể ăn món này ('sang' | 'trua' | 'toi')
//   veg:   true = không thịt/cá/trứng (kiểm tra thành phần thực tế khi gọi món)
//   cook:  true = phải tự nấu (cần nồi cơm điện/bếp)
const A = ['sang']
const L = ['trua', 'toi']
const ALL = ['sang', 'trua', 'toi']

export const DISHES = [
  { id: 'xoi', name: 'Xôi', emoji: '🍙', price: 15000, meals: A, veg: true },
  { id: 'banh-mi-trung', name: 'Bánh mì trứng', emoji: '🥖', price: 20000, meals: A },
  { id: 'banh-mi-thit', name: 'Bánh mì thịt', emoji: '🥖', price: 25000, meals: A },
  { id: 'banh-mi-chay', name: 'Bánh mì chay', emoji: '🥖', price: 15000, meals: A, veg: true },
  { id: 'banh-bao', name: 'Bánh bao', emoji: '🥟', price: 12000, meals: A },
  { id: 'chao', name: 'Cháo', emoji: '🥣', price: 20000, meals: A },
  { id: 'banh-cuon', name: 'Bánh cuốn', emoji: '🥢', price: 30000, meals: A },
  { id: 'ngo-luoc', name: 'Ngô luộc', emoji: '🌽', price: 10000, meals: A, veg: true },
  { id: 'mi-goi-trung', name: 'Mì gói trứng', emoji: '🍜', price: 10000, meals: ALL, cook: true },
  { id: 'pho', name: 'Phở', emoji: '🍜', price: 40000, meals: ALL },
  { id: 'hu-tieu', name: 'Hủ tiếu', emoji: '🍜', price: 40000, meals: ALL },
  { id: 'bun-rieu', name: 'Bún riêu', emoji: '🍲', price: 35000, meals: ALL },
  { id: 'bun-bo', name: 'Bún bò', emoji: '🍲', price: 45000, meals: ALL },
  { id: 'mien-ga', name: 'Miến gà', emoji: '🍲', price: 40000, meals: ALL },
  { id: 'bun-chay', name: 'Bún chay', emoji: '🍲', price: 30000, meals: ALL, veg: true },
  { id: 'com-binh-dan', name: 'Cơm bình dân', emoji: '🍚', price: 35000, meals: L },
  { id: 'com-tam', name: 'Cơm tấm sườn', emoji: '🍚', price: 40000, meals: L },
  { id: 'com-ga', name: 'Cơm gà', emoji: '🍗', price: 40000, meals: L },
  { id: 'com-chien', name: 'Cơm chiên', emoji: '🍛', price: 30000, meals: L },
  { id: 'com-chay', name: 'Cơm chay', emoji: '🥗', price: 25000, meals: L, veg: true },
  { id: 'bun-cha', name: 'Bún chả', emoji: '🥢', price: 45000, meals: L },
  { id: 'bun-dau', name: 'Bún đậu', emoji: '🥢', price: 45000, meals: L },
  { id: 'mi-xao', name: 'Mì xào', emoji: '🍝', price: 30000, meals: L },
  { id: 'mi-xao-rau', name: 'Mì xào rau', emoji: '🍝', price: 25000, meals: L, veg: true },
  { id: 'com-trung-chien', name: 'Cơm + trứng chiên (tự nấu)', emoji: '🍳', price: 12000, meals: L, cook: true },
  { id: 'com-dau-sot-ca', name: 'Cơm + đậu hũ sốt cà (tự nấu)', emoji: '🍅', price: 15000, meals: L, veg: true, cook: true },
  { id: 'com-rau-luoc', name: 'Cơm + rau luộc (tự nấu)', emoji: '🥬', price: 10000, meals: L, veg: true, cook: true },
  { id: 'com-thit-kho', name: 'Cơm + thịt kho (tự nấu)', emoji: '🍖', price: 25000, meals: L, cook: true },
  { id: 'mi-goi-rau', name: 'Mì gói + rau (tự nấu)', emoji: '🍜', price: 12000, meals: L, cook: true },
]
