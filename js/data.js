import { RECIPES, recipeCost } from './recipes.js'

// Danh sách món + giá ƯỚC LƯỢNG (VND/suất, sinh viên, thành phố). Đây là số tham khảo,
// hãy chỉnh cho đúng khu vực của bạn.
//   meals: bữa có thể ăn món này ('sang' | 'trua' | 'toi')
//   veg:   true = không thịt/cá/trứng (kiểm tra thành phần thực tế khi gọi món)
//   cook:  true = phải tự nấu. Món tự nấu được tạo từ js/recipes.js (giá = tổng nguyên liệu).
//   stove: true = cần bếp, false = làm được bằng nồi cơm điện / ấm đun nước
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
  // Món tự nấu: lấy từ sách công thức để giá và cách nấu luôn khớp nhau.
  ...RECIPES.filter((r) => r.dish).map((r) => ({
    id: r.id,
    name: `${r.dish.name} (tự nấu)`,
    price: recipeCost(r),
    meals: r.dish.meals,
    veg: r.veg,
    cook: true,
    stove: r.stove,
    recipe: r.id,
  })),
]
