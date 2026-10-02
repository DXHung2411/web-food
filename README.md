# Cuối Tháng Ăn Gì?

Nhập số tiền còn lại + số ngày phải sống → thực đơn từng bữa vừa túi, kèm câu từ chối khéo khi bạn bè rủ đi ăn. Nếu tiền không đủ cho cả kỳ, chỉ lập thực đơn cho số ngày trả nổi và báo cần thêm bao nhiêu (tổng chi không bao giờ vượt số tiền nhập). Khi đủ tiền, thực đơn được dàn đều để tiêu gần hết, chỉ giữ lại khoảng 10.000đ phòng giá chênh.

Web công khai là web tĩnh thuần (HTML/CSS/JS), **không build, không backend, không tài khoản, không gọi dịch vụ ngoài**. Việc thêm/sửa món dùng một trang admin chạy riêng trên máy bạn (xem mục Trang admin), không nằm trên web. Chia sẻ kế hoạch qua link (dữ liệu nằm trong phần `#` của URL, không gửi lên đâu cả).

## Ba trang

- `index.html`: lập thực đơn theo tiền còn lại. Chọn cách ăn: **tự nấu**, **ăn ngoài** hoặc cả hai (phải chọn ít nhất một), cùng tuỳ chọn ăn chay.
- `sach.html`: sách nấu ăn, 18 công thức đơn giản, giá rẻ. Món tự nấu trong hoá đơn có link "cách nấu" tới đúng công thức.
- `hen-ho.html`: gợi ý kiểu bữa cho buổi hẹn hò (10 gợi ý, từ vài chục nghìn đến vài triệu mỗi người), mỗi gợi ý có khoảng giá, lời khuyên và ví dụ quán trong nguồn tham khảo.

## Chạy thử

```bash
npm start      # http://localhost:8080  (hoặc dùng bất kỳ static server nào)
npm test       # test logic lập thực đơn, kiểm tra dữ liệu và server admin
```

## Trang admin (chạy trên máy bạn)

Thêm/sửa/xoá món ăn ngoài, công thức và gợi ý hẹn hò bằng form thay vì sửa file tay.

```bash
npm run admin     # in ra một đường dẫn dạng http://127.0.0.1:8787/admin/index.html#token=...
```

Mở đúng đường dẫn đó trong trình duyệt. Mỗi lần bấm Lưu, dữ liệu được kiểm tra rồi ghi thẳng vào 3 file trong `js/content/`:

| File | Nội dung |
|---|---|
| `js/content/dishes.js` | Món ăn ngoài + giá |
| `js/content/recipes.js` | Công thức (món có trường `dish` tự xuất hiện trong trang lập thực đơn) |
| `js/content/dates.js` | Gợi ý hẹn hò + "Vài điều nên nhớ" |

Quy trình: thêm món trong admin → `npm test` → `git commit` → deploy. Nếu lỡ tay, khôi phục bằng git.

Bảo mật của admin (vì mọi trang web bạn mở trong trình duyệt đều có thể thử gọi tới localhost):
- Chỉ lắng nghe `127.0.0.1`, token ngẫu nhiên mới mỗi lần chạy, kiểm tra `Host` (chống DNS rebinding) và `Origin`, chỉ nhận JSON.
- Chỉ ghi đúng 3 file cố định, ghi nguyên tử (file tạm rồi đổi tên), kiểm tra dữ liệu bằng `js/schema.js` (cả ở trình duyệt lẫn server).
- Nếu bạn sửa tay file trong lúc admin đang mở, admin sẽ từ chối ghi đè và tải lại dữ liệu.
- Thư mục `admin/` không cần deploy: `.vercelignore` đã loại nó khi deploy lên Vercel. Với nền tảng khác, đừng đưa `admin/` lên.
- Cổng bận thì đổi: `ADMIN_PORT=8788 npm run admin`.

## Chỉnh dữ liệu

- Dùng trang admin ở trên, hoặc sửa tay các file trong `js/content/` (giữ đúng dạng JSON, quy tắc kiểm tra nằm ở `js/schema.js`, chạy `npm test` để chắc dữ liệu hợp lệ). Ghi chú nguồn giá nằm ở đầu mỗi file.
- Giá được cập nhật theo mặt bằng 2026 tìm được trên báo nhưng vẫn là ước lượng (nhiều món không có nguồn riêng). **Hãy sửa cho đúng khu vực của bạn.**
- Giá mỗi suất của công thức = tổng giá nguyên liệu, nên trang sách và trang lập thực đơn luôn khớp nhau.
- Nguồn tham khảo hiển thị cuối trang: `js/sources.js`.
- Câu từ chối khéo: mảng `DECLINE_LINES` trong `js/app.js`.

## Deploy

Đẩy cả thư mục lên Vercel, Cloudflare Pages hay GitHub Pages đều được (miễn phí). `vercel.json` đặt sẵn header bảo mật; nếu dùng nền tảng khác, đặt header tương đương (CSP, nosniff, Referrer-Policy). `index.html` đã có CSP qua thẻ `<meta>` làm lớp dự phòng. Đừng deploy thư mục `admin/` (xem mục Trang admin).

## Bảo mật

Không có server, API key hay database nên không có gì để chiếm. Đầu vào (tiền, số ngày, số bữa, `#hash` của link chia sẻ) đều được kiểm tra chặt rồi mới dùng; mọi nội dung hiển thị dùng `textContent`, không dùng `innerHTML`; CSP chỉ cho phép tài nguyên cùng nguồn và chặn mọi kết nối ra ngoài.

## Về dữ liệu giá 2026

Giá được tổng hợp từ kết quả tìm kiếm web (tháng 10/2026), chưa đối chiếu từng bài gốc. Danh sách nguồn nằm ở `js/sources.js` và hiện ở cuối mỗi trang. Các quán trong trang hẹn hò chỉ là ví dụ lấy từ các bài đó, giá và giờ mở cửa có thể đã đổi.

Hạn chế đã biết: khi ngân sách thấp và chỉ có vài món vừa giá, một món có thể lặp 3–4 lần trong kỳ.
