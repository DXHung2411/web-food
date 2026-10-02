# Cuối Tháng Ăn Gì?

Nhập số tiền còn lại + số ngày phải sống → thực đơn từng bữa vừa túi, kèm câu từ chối khéo khi bạn bè rủ đi ăn. Nếu tiền không đủ cho cả kỳ, chỉ lập thực đơn cho số ngày trả nổi và báo cần thêm bao nhiêu (tổng chi không bao giờ vượt số tiền nhập). Khi đủ tiền, thực đơn được dàn đều để tiêu gần hết, chỉ giữ lại khoảng 10.000đ phòng giá chênh.

Web tĩnh thuần (HTML/CSS/JS), **không build, không backend, không tài khoản, không gọi dịch vụ ngoài**. Chia sẻ kế hoạch qua link (dữ liệu nằm trong phần `#` của URL, không gửi lên đâu cả).

## Hai trang

- `index.html`: lập thực đơn theo tiền còn lại. Tuỳ chọn: tự nấu được, không có bếp (chỉ nồi cơm điện / ấm đun nước), ưu tiên món tự nấu (chỉ là điểm cộng, vẫn dùng hết ngân sách), ăn chay.
- `sach.html`: sách nấu ăn, 10 công thức đơn giản, giá rẻ. Món tự nấu trong hoá đơn có link "cách nấu" tới đúng công thức.

## Chạy thử

```bash
npm start      # http://localhost:8080  (hoặc dùng bất kỳ static server nào)
npm test       # test phần logic (js/planner.js)
```

## Chỉnh dữ liệu

- Món ăn ngoài và giá: `js/data.js`. **Giá hiện là ước lượng, hãy sửa cho đúng khu vực của bạn.**
- Công thức: `js/recipes.js`. Giá mỗi suất = tổng giá nguyên liệu, món có trường `dish` tự xuất hiện trong trang lập thực đơn nên hai trang luôn khớp nhau.
- Câu từ chối khéo: mảng `DECLINE_LINES` trong `js/app.js`.

## Deploy

Đẩy cả thư mục lên Vercel, Cloudflare Pages hay GitHub Pages đều được (miễn phí). `vercel.json` đặt sẵn header bảo mật; nếu dùng nền tảng khác, đặt header tương đương (CSP, nosniff, Referrer-Policy). `index.html` đã có CSP qua thẻ `<meta>` làm lớp dự phòng.

## Bảo mật

Không có server, API key hay database nên không có gì để chiếm. Đầu vào (tiền, số ngày, số bữa, `#hash` của link chia sẻ) đều được kiểm tra chặt rồi mới dùng; mọi nội dung hiển thị dùng `textContent`, không dùng `innerHTML`; CSP chỉ cho phép tài nguyên cùng nguồn và chặn mọi kết nối ra ngoài.
