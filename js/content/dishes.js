// Món ăn NGOÀI + giá ƯỚC LƯỢNG (VND/suất, sinh viên, thành phố), theo mặt bằng giá 2026 tìm được trên báo.
//   Có khoảng giá từ nguồn: phở 40–70k, bún bò ~45k, bún riêu/hủ tiếu 30–60k, cơm tấm 40–45k, cơm sinh viên 25–30k,
//   bánh mì 12–30k, bánh bao 9–13k, xôi mặn 10–15k, bánh cuốn 15–20k.
//   Không có nguồn riêng (ước lượng): bún chả, bún đậu, bún thịt nướng, bánh canh, mì Quảng, bánh xèo, bánh ướt, bún cá,
//   xôi gà, cháo, cơm gà, cơm chiên, mì xào, ngô luộc và các món chay.
// Trường: id, name, price (VND), meals (sang|trua|toi), veg (không thịt/cá/trứng).
// File này do trang admin ghi (npm run admin). Có thể sửa tay nhưng nên giữ đúng dạng JSON; mọi chú thích sẽ bị ghi đè khi lưu.

export default [
  {"id":"xoi","name":"Xôi","price":15000,"meals":["sang"],"veg":true},
  {"id":"xoi-ga","name":"Xôi gà","price":25000,"meals":["sang"]},
  {"id":"banh-mi-trung","name":"Bánh mì trứng","price":20000,"meals":["sang"]},
  {"id":"banh-mi-thit","name":"Bánh mì thịt","price":25000,"meals":["sang"]},
  {"id":"banh-mi-chay","name":"Bánh mì chay","price":15000,"meals":["sang"],"veg":true},
  {"id":"banh-bao","name":"Bánh bao","price":12000,"meals":["sang"]},
  {"id":"chao","name":"Cháo","price":25000,"meals":["sang"]},
  {"id":"banh-cuon","name":"Bánh cuốn","price":25000,"meals":["sang"]},
  {"id":"banh-uot","name":"Bánh ướt thịt nướng","price":35000,"meals":["sang","trua"]},
  {"id":"ngo-luoc","name":"Ngô luộc","price":10000,"meals":["sang"],"veg":true},
  {"id":"pho","name":"Phở","price":55000,"meals":["sang","trua","toi"]},
  {"id":"hu-tieu","name":"Hủ tiếu","price":45000,"meals":["sang","trua","toi"]},
  {"id":"bun-rieu","name":"Bún riêu","price":40000,"meals":["sang","trua","toi"]},
  {"id":"bun-bo","name":"Bún bò","price":45000,"meals":["sang","trua","toi"]},
  {"id":"bun-ca","name":"Bún cá","price":40000,"meals":["sang","trua","toi"]},
  {"id":"banh-canh","name":"Bánh canh","price":40000,"meals":["sang","trua","toi"]},
  {"id":"mi-quang","name":"Mì Quảng","price":40000,"meals":["sang","trua","toi"]},
  {"id":"mien-ga","name":"Miến gà","price":45000,"meals":["sang","trua","toi"]},
  {"id":"bun-chay","name":"Bún chay","price":35000,"meals":["sang","trua","toi"],"veg":true},
  {"id":"com-sinh-vien","name":"Cơm sinh viên","price":28000,"meals":["trua","toi"]},
  {"id":"com-binh-dan","name":"Cơm bình dân","price":40000,"meals":["trua","toi"]},
  {"id":"com-tam","name":"Cơm tấm sườn","price":45000,"meals":["trua","toi"]},
  {"id":"com-ga","name":"Cơm gà","price":45000,"meals":["trua","toi"]},
  {"id":"com-chien","name":"Cơm chiên","price":35000,"meals":["trua","toi"]},
  {"id":"com-chay","name":"Cơm chay","price":30000,"meals":["trua","toi"],"veg":true},
  {"id":"bun-cha","name":"Bún chả","price":50000,"meals":["trua","toi"]},
  {"id":"bun-dau","name":"Bún đậu","price":50000,"meals":["trua","toi"]},
  {"id":"bun-thit-nuong","name":"Bún thịt nướng","price":50000,"meals":["trua","toi"]},
  {"id":"banh-xeo","name":"Bánh xèo","price":45000,"meals":["trua","toi"]},
  {"id":"mi-xao","name":"Mì xào","price":35000,"meals":["trua","toi"]},
  {"id":"mi-xao-rau","name":"Mì xào rau","price":30000,"meals":["trua","toi"],"veg":true}
]
