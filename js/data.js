import external from './content/dishes.js'
import { RECIPES, recipeCost } from './recipes.js'

// Món ăn ngoài nằm ở js/content/dishes.js (sửa bằng `npm run admin` hoặc sửa tay), kèm ghi chú nguồn giá ở đầu file đó.
//   meals: bữa có thể ăn món này ('sang' | 'trua' | 'toi')
//   veg:   true = không thịt/cá/trứng (kiểm tra thành phần thực tế khi gọi món)
//   cook:  true = phải tự nấu. Món tự nấu được tạo từ công thức (giá = tổng nguyên liệu).
export const DISHES = [
  ...external,

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
