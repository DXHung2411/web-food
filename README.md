# Ăn Gì Đây? 🍜

Chọn **món** + **thành phố** (hoặc “Gần tôi”) → bản đồ hiện quán ăn kèm **rating**, địa chỉ, nút chỉ đường.

## Kiến trúc: FE + backend mỏng (serverless), không DB

| Lựa chọn | Kết luận |
|---|---|
| Chỉ FE | ❌ API key Google Places nằm trong bundle → ai cũng lấy được và đốt quota/tiền của bạn. Referrer restriction chỉ chặn tạm, giả header rất dễ. |
| FE + BE đầy đủ (server + DB) | ❌ Thừa: không có tài khoản, không lưu dữ liệu người dùng. |
| **FE (React/Vite) + 1 serverless function `/api/places`** | ✅ Giấu key, validate input, rate-limit, cache. Không có server để bảo trì. |

```
Browser ──GET /api/places?dish=pho&city=ha-noi──▶ Vercel Function ──▶ Google Places API (New)
  React + Leaflet (CARTO/OSM tiles)               (key trong env, whitelist, limit, cache)
```

## Chạy local

```bash
npm install
cp .env.example .env     # MOCK_PLACES=1 để chạy không cần key, hoặc điền GOOGLE_MAPS_API_KEY
npm run dev
npm test                 # test backend
```

## Deploy (Vercel)

1. Import repo vào Vercel (framework: Vite, tự nhận).
2. Project → Settings → Environment Variables: `GOOGLE_MAPS_API_KEY` (KHÔNG đặt tên bắt đầu bằng `VITE_`).
3. Google Cloud Console (bắt buộc, đây là chốt chặn thật sự cho chi phí):
   - Bật **Places API (New)**; giới hạn key chỉ dùng cho API này (API restriction).
   - Đặt **quota/ngày** cho Places API và **Budget alert**.
4. Vercel → Firewall → thêm **Rate Limiting** rule cho `/api/*` (vd 30 req/phút/IP); bật Attack Challenge Mode khi bị tấn công.

## Bảo mật đã làm

- **Key chỉ ở server**; response chỉ chứa các field đã whitelist, lỗi từ Google không bao giờ trả về client.
- **Không có tham số tự do**: `dish` và `city` phải nằm trong `shared/catalog.js`; toạ độ phải đúng định dạng số và nằm trong Việt Nam → không dùng backend làm proxy Google tuỳ ý, không SSRF/injection.
- Chỉ `GET`, giới hạn độ dài URL, từ chối `Sec-Fetch-Site: cross-site`, không bật CORS.
- Rate-limit theo IP trong function (mềm – mỗi instance giữ bộ nhớ riêng) + cache 6h trong bộ nhớ + CDN (`s-maxage`): lặp lại cùng truy vấn không tốn quota.
- FE không dùng `innerHTML`/`dangerouslySetInnerHTML` với dữ liệu ngoài (React escape); link ngoài có `rel="noopener noreferrer"`.
- Header (xem `vercel.json`): CSP chặt (`script-src 'self'`), HSTS, `frame-ancestors 'none'`, nosniff, Referrer-Policy, Permissions-Policy.
- Vị trí “Gần tôi” chỉ gửi khi người dùng bấm, làm tròn ~110 m, không lưu.

Giới hạn cần biết: rate-limit trong code không chia sẻ giữa các instance – lớp bảo vệ chính là Vercel Firewall + quota Google ở bước 3–4.

## Mở rộng danh sách

Thêm món/thành phố ở `shared/catalog.js` (FE và API dùng chung). Tile bản đồ dùng CARTO Voyager (miễn phí cho dự án phi thương mại, cần giữ attribution); nếu thương mại/lưu lượng lớn hãy đổi nhà cung cấp tile và cập nhật `img-src` trong CSP.
