import { RECIPES, recipeCost } from './recipes.js'

// Món ăn NGOÀI + giá ƯỚC LƯỢNG (VND/suất, sinh viên, thành phố), cập nhật theo mặt bằng giá 2026 tìm được trên báo:
//   có khoảng giá từ nguồn: phở 40–70k (nhiều quán đã lên 55–65k), bún bò ~45k, bún riêu/hủ tiếu 30–60k, cơm tấm 40–45k,
//   cơm sinh viên 25–30k, bánh mì 12–30k, bánh bao 9–13k, xôi mặn 10–15k, bánh cuốn 15–20k (loại đầy đủ ~35k).
//   không có nguồn riêng (ước lượng theo mặt bằng chung): bún chả, bún đậu, bún thịt nướng, bánh canh, mì Quảng, bánh xèo,
//   bánh ướt, bún cá, xôi gà, cháo, cơm gà, cơm chiên, mì xào, ngô luộc và các món chay.
// Hãy chỉnh cho đúng khu vực của bạn.
//   meals: bữa có thể ăn món này ('sang' | 'trua' | 'toi')
//   veg:   true = không thịt/cá/trứng (kiểm tra thành phần thực tế khi gọi món)
//   cook:  true = phải tự nấu. Món tự nấu được tạo từ js/recipes.js (giá = tổng nguyên liệu).
const A = ['sang']
const L = ['trua', 'toi']
const ALL = ['sang', 'trua', 'toi']

export const DISHES = [
  // Sáng
  { id: 'xoi', name: 'Xôi', price: 15000, meals: A, veg: true },
  { id: 'xoi-ga', name: 'Xôi gà', price: 25000, meals: A },
  { id: 'banh-mi-trung', name: 'Bánh mì trứng', price: 20000, meals: A },
  { id: 'banh-mi-thit', name: 'Bánh mì thịt', price: 25000, meals: A },
  { id: 'banh-mi-chay', name: 'Bánh mì chay', price: 15000, meals: A, veg: true },
  { id: 'banh-bao', name: 'Bánh bao', price: 12000, meals: A },
  { id: 'chao', name: 'Cháo', price: 25000, meals: A },
  { id: 'banh-cuon', name: 'Bánh cuốn', price: 25000, meals: A },
  { id: 'banh-uot', name: 'Bánh ướt thịt nướng', price: 35000, meals: ['sang', 'trua'] },
  { id: 'ngo-luoc', name: 'Ngô luộc', price: 10000, meals: A, veg: true },
  // Sáng, trưa, tối
  { id: 'pho', name: 'Phở', price: 55000, meals: ALL },
  { id: 'hu-tieu', name: 'Hủ tiếu', price: 45000, meals: ALL },
  { id: 'bun-rieu', name: 'Bún riêu', price: 40000, meals: ALL },
  { id: 'bun-bo', name: 'Bún bò', price: 45000, meals: ALL },
  { id: 'bun-ca', name: 'Bún cá', price: 40000, meals: ALL },
  { id: 'banh-canh', name: 'Bánh canh', price: 40000, meals: ALL },
  { id: 'mi-quang', name: 'Mì Quảng', price: 40000, meals: ALL },
  { id: 'mien-ga', name: 'Miến gà', price: 45000, meals: ALL },
  { id: 'bun-chay', name: 'Bún chay', price: 35000, meals: ALL, veg: true },
  // Trưa, tối
  { id: 'com-sinh-vien', name: 'Cơm sinh viên', price: 28000, meals: L },
  { id: 'com-binh-dan', name: 'Cơm bình dân', price: 40000, meals: L },
  { id: 'com-tam', name: 'Cơm tấm sườn', price: 45000, meals: L },
  { id: 'com-ga', name: 'Cơm gà', price: 45000, meals: L },
  { id: 'com-chien', name: 'Cơm chiên', price: 35000, meals: L },
  { id: 'com-chay', name: 'Cơm chay', price: 30000, meals: L, veg: true },
  { id: 'bun-cha', name: 'Bún chả', price: 50000, meals: L },
  { id: 'bun-dau', name: 'Bún đậu', price: 50000, meals: L },
  { id: 'bun-thit-nuong', name: 'Bún thịt nướng', price: 50000, meals: L },
  { id: 'banh-xeo', name: 'Bánh xèo', price: 45000, meals: L },
  { id: 'mi-xao', name: 'Mì xào', price: 35000, meals: L },
  { id: 'mi-xao-rau', name: 'Mì xào rau', price: 30000, meals: L, veg: true },

  // Món tự nấu: lấy từ sách công thức để giá và cách nấu luôn khớp nhau.
  ...RECIPES.filter((r) => r.dish).map((r) => ({
    id: r.id,
    name: `${r.dish.name} (tự nấu)`,
    price: recipeCost(r),
    meals: r.dish.meals,
    veg: r.veg,
    cook: true,
    recipe: r.id,
  })),
]
