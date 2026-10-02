// Danh sách món + giá ƯỚC LƯỢNG (VND/suất, sinh viên, thành phố). Đây là số tham khảo,
// hãy chỉnh cho đúng khu vực của bạn. Chỉ cần sửa file này, không cần đụng code khác.
//   meals: bữa có thể ăn món này ('sang' | 'trua' | 'toi')
//   veg:   true = không thịt/cá/trứng (kiểm tra thành phần thực tế khi gọi món)
//   cook:  true = phải tự nấu (cần nồi cơm điện/bếp)
const A = ['sang']
const L = ['trua', 'toi']
const ALL = ['sang', 'trua', 'toi']

export const DISHES = [
  { id: 'xoi', name: 'Xôi', price: 15000, meals: A, veg: true },
  { id: 'banh-mi-trung', name: 'Bánh mì trứng', price: 20000, meals: A },
  { id: 'banh-mi-thit', name: 'Bánh mì thịt', price: 25000, meals: A },
  { id: 'banh-mi-chay', name: 'Bánh mì chay', price: 15000, meals: A, veg: true },
  { id: 'banh-bao', name: 'Bánh bao', price: 12000, meals: A },
  { id: 'chao', name: 'Cháo', price: 20000, meals: A },
  { id: 'banh-cuon', name: 'Bánh cuốn', price: 30000, meals: A },
  { id: 'ngo-luoc', name: 'Ngô luộc', price: 10000, meals: A, veg: true },
  { id: 'mi-goi-trung', name: 'Mì gói trứng', price: 10000, meals: ALL, cook: true },
  { id: 'pho', name: 'Phở', price: 40000, meals: ALL },
  { id: 'hu-tieu', name: 'Hủ tiếu', price: 40000, meals: ALL },
  { id: 'bun-rieu', name: 'Bún riêu', price: 35000, meals: ALL },
  { id: 'bun-bo', name: 'Bún bò', price: 45000, meals: ALL },
  { id: 'mien-ga', name: 'Miến gà', price: 40000, meals: ALL },
  { id: 'bun-chay', name: 'Bún chay', price: 30000, meals: ALL, veg: true },
  { id: 'com-binh-dan', name: 'Cơm bình dân', price: 35000, meals: L },
  { id: 'com-tam', name: 'Cơm tấm sườn', price: 40000, meals: L },
  { id: 'com-ga', name: 'Cơm gà', price: 40000, meals: L },
  { id: 'com-chien', name: 'Cơm chiên', price: 30000, meals: L },
  { id: 'com-chay', name: 'Cơm chay', price: 25000, meals: L, veg: true },
  { id: 'bun-cha', name: 'Bún chả', price: 45000, meals: L },
  { id: 'bun-dau', name: 'Bún đậu', price: 45000, meals: L },
  { id: 'mi-xao', name: 'Mì xào', price: 30000, meals: L },
  { id: 'mi-xao-rau', name: 'Mì xào rau', price: 25000, meals: L, veg: true },
  { id: 'com-trung-chien', name: 'Cơm + trứng chiên (tự nấu)', price: 12000, meals: L, cook: true },
  { id: 'com-dau-sot-ca', name: 'Cơm + đậu hũ sốt cà (tự nấu)', price: 15000, meals: L, veg: true, cook: true },
  { id: 'com-rau-luoc', name: 'Cơm + rau luộc (tự nấu)', price: 10000, meals: L, veg: true, cook: true },
  { id: 'com-thit-kho', name: 'Cơm + thịt kho (tự nấu)', price: 25000, meals: L, cook: true },
  { id: 'mi-goi-rau', name: 'Mì gói + rau (tự nấu)', price: 12000, meals: L, cook: true },
]
