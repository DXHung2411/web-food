# Cuối Tháng Ăn Gì?

Nhập số tiền còn lại + số ngày phải sống → thực đơn từng bữa vừa túi, kèm câu từ chối khéo khi bạn bè rủ đi ăn. Nếu tiền không đủ cho cả kỳ, chỉ lập thực đơn cho số ngày trả nổi và báo cần thêm bao nhiêu (tổng chi không bao giờ vượt số tiền nhập). Khi đủ tiền, thực đơn được dàn đều để tiêu gần hết, chỉ giữ lại khoảng 10.000đ phòng giá chênh.

Web tĩnh thuần (HTML/CSS/JS), **không build, không backend, không tài khoản, không gọi dịch vụ ngoài**. Chia sẻ kế hoạch qua link (dữ liệu nằm trong phần `#` của URL, không gửi lên đâu cả).

## Ba trang

- `index.html`: lập thực đơn theo tiền còn lại. Chọn cách ăn: **tự nấu**, **ăn ngoài** hoặc cả hai (phải chọn ít nhất một), cùng tuỳ chọn ăn chay.
- `sach.html`: sách nấu ăn, 18 công thức đơn giản, giá rẻ. Món tự nấu trong hoá đơn có link "cách nấu" tới đúng công thức.
- `hen-ho.html`: gợi ý kiểu bữa cho buổi hẹn hò (10 gợi ý, từ vài chục nghìn đến vài triệu mỗi người), mỗi gợi ý có khoảng giá, lời khuyên và ví dụ quán trong nguồn tham khảo.

## Chạy thử

```bash
npm start      # http://localhost:8080  (hoặc dùng bất kỳ static server nào)
npm test       # test phần logic (js/planner.js)
```

## Chỉnh dữ liệu

- Món ăn ngoài và giá: `js/data.js`. **Giá được cập nhật theo mặt bằng 2026 tìm được trên báo, nhưng vẫn là ước lượng (nhiều món không có nguồn riêng, đã ghi chú đầu file). Hãy sửa cho đúng khu vực của bạn.**
- Gợi ý hẹn hò: `js/dates.js` (giá, lời khuyên, ví dụ quán). Nguồn tham khảo hiển thị cuối trang: `js/sources.js`.
- Công thức: `js/recipes.js`. Giá mỗi suất = tổng giá nguyên liệu, món có trường `dish` tự xuất hiện trong trang lập thực đơn nên hai trang luôn khớp nhau.
- Câu từ chối khéo: mảng `DECLINE_LINES` trong `js/app.js`.

## Deploy

Đẩy cả thư mục lên Vercel, Cloudflare Pages hay GitHub Pages đều được (miễn phí). `vercel.json` đặt sẵn header bảo mật; nếu dùng nền tảng khác, đặt header tương đương (CSP, nosniff, Referrer-Policy). `index.html` đã có CSP qua thẻ `<meta>` làm lớp dự phòng.

## Bảo mật

Không có server, API key hay database nên không có gì để chiếm. Đầu vào (tiền, số ngày, số bữa, `#hash` của link chia sẻ) đều được kiểm tra chặt rồi mới dùng; mọi nội dung hiển thị dùng `textContent`, không dùng `innerHTML`; CSP chỉ cho phép tài nguyên cùng nguồn và chặn mọi kết nối ra ngoài.

## Về dữ liệu giá 2026

Giá được tổng hợp từ kết quả tìm kiếm web (tháng 10/2026), chưa đối chiếu từng bài gốc. Danh sách nguồn nằm ở `js/sources.js` và hiện ở cuối mỗi trang. Các quán trong trang hẹn hò chỉ là ví dụ lấy từ các bài đó, giá và giờ mở cửa có thể đã đổi.

Hạn chế đã biết: khi ngân sách thấp và chỉ có vài món vừa giá, một món có thể lặp 3–4 lần trong kỳ.
