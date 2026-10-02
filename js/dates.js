// Gợi ý kiểu bữa cho buổi hẹn hò. Giá là khoảng VND/người tổng hợp từ báo và trang đặt bàn năm 2026 (xem js/sources.js),
// chưa đối chiếu từng quán nên chỉ để tham khảo. "examples" là quán xuất hiện trong nguồn đó, giá và giờ mở cửa có thể đã đổi.
// "advice" là lời khuyên để buổi hẹn suôn sẻ hơn, do người soạn viết.

export const DATE_TIPS = [
  'Chọn nơi yên tĩnh, đèn dịu, nhạc nhẹ để còn nói chuyện được với nhau.',
  'Lần đầu nên tránh món mùi nặng (tỏi, hành, hải sản) hoặc món cầu kỳ, khó ăn.',
  'Hỏi trước người đi cùng về dị ứng, món kiêng và ăn cay được không.',
  'Thống nhất ai mời hoặc chia đôi từ trước, để lúc thanh toán không ai bị ngại.',
]

export const DATE_IDEAS = [
  {
    id: 'ca-phe-rooftop',
    name: 'Cà phê rooftop ngắm hoàng hôn',
    min: 30000, max: 150000,
    examples: [{ name: 'Sam Rooftop Cafe', city: 'Hà Nội' }, { name: 'Trill Rooftop Cafe', city: 'Hà Nội' }],
    advice: 'Hẹn khoảng trước hoàng hôn để có ánh sáng đẹp và bớt nóng, cuối tuần nên đặt chỗ gần lan can từ trước. Đây là kiểu hẹn nhẹ nhàng, hợp lần gặp đầu: hợp thì dễ kéo dài thêm, chưa hợp thì cũng dễ kết thúc êm.',
  },
  {
    id: 'bit-tet-bistro',
    name: 'Bít tết kiểu bistro',
    min: 120000, max: 250000,
    examples: [{ name: 'Bít Tết Ngọc Hiếu', city: 'Hà Nội' }, { name: 'Botanica Giảng Võ', city: 'Hà Nội' }, { name: 'Le Monde Steak', city: 'TP.HCM' }],
    advice: 'Bít tết là món quen, ít gia vị lạ nên khó gây bất ngờ khó chịu ở lần hẹn đầu. Hỏi người đi cùng thích mức chín nào thay vì tự đoán, và ăn chậm từng miếng nhỏ để câu chuyện không bị ngắt quãng.',
  },
  {
    id: 'buffet-nuong-lau',
    name: 'Buffet lẩu nướng quy mô nhỏ',
    min: 150000, max: 420000,
    examples: [{ name: 'Gri & Gri', city: 'Hà Nội' }, { name: 'King BBQ Buffet', city: 'Hà Nội' }, { name: 'Hotpot Story', city: 'Hà Nội' }, { name: 'Gogi House', city: 'Hà Nội' }],
    advice: 'Chọn quán vừa phải và yên tĩnh thay vì quán đông ồn. Đồ nướng bám mùi khói nên mặc đồ dễ giặt, và kiểu bữa này hợp lúc hai bạn đã quen nhau hơn là lần gặp đầu. Cùng nướng, cùng gắp cho nhau cũng là cách phá băng.',
  },
  {
    id: 'lau-thai-hai-san',
    name: 'Lẩu Thái hải sản',
    min: 150000, max: 500000,
    examples: [{ name: 'MK Restaurants', city: 'TP.HCM' }, { name: 'Hotpot Story', city: 'TP.HCM' }, { name: 'Hải Sản Biển Đông', city: 'Hà Nội' }, { name: 'Yiam Yiam Seafood', city: 'Hà Nội' }],
    advice: 'Lẩu là bữa ăn chậm nên nói chuyện được nhiều. Hỏi trước người đi cùng có dị ứng hải sản không và ăn cay đến đâu, nên gọi nước lẩu vừa cay để không phải chọn giữa cay và trò chuyện. Mùi hải sản bám người, nên tránh nếu sau đó còn đi tiếp.',
  },
  {
    id: 'au-y-co-view',
    name: 'Nhà hàng Âu, Ý có view đẹp',
    min: 250000, max: 500000,
    examples: [{ name: 'The Rooftop Hanoi', city: 'Hà Nội' }, { name: 'Panorama Restaurant & Bar', city: 'Hà Nội' }],
    advice: 'Mì Ý, pizza hay pasta sốt kem là món dễ ăn, hương vị nhẹ, ít kén người. Đặt bàn trước và xin bàn gần cửa sổ để tận dụng view. Nếu cả hai còn ngại thì chọn món dùng dao nĩa gọn gàng, tránh món dễ dính sốt.',
  },
  {
    id: 'nha-hang-lang-man',
    name: 'Nhà hàng lãng mạn, đèn dịu nhạc nhẹ',
    min: 400000, max: 700000,
    examples: [{ name: 'Chanh Bistro Rooftop Saigon', city: 'TP.HCM' }],
    advice: 'Đặt bàn trước và hỏi giờ nào quán vắng nhất. Chọn món chính nhanh gọn để dành thời gian cho trò chuyện thay vì ngồi lật menu. Ăn mặc chỉnh tề hơn ngày thường một chút, nhưng đừng đến mức thấy mất tự nhiên.',
  },
  {
    id: 'sky-bar',
    name: 'Sky bar, rooftop bar',
    min: 500000, max: 1000000,
    examples: [{ name: 'Ignite Sky Bar', city: 'Hà Nội' }],
    advice: 'Hẹn sớm để ngắm hoàng hôn rồi tới lúc lên đèn. Kiểm tra trước quán có yêu cầu trang phục hay giờ giấc nào không. Nếu một trong hai bạn không uống được nhiều thì chọn đồ uống ít cồn, đừng để buổi hẹn thành cuộc thi tửu lượng.',
  },
  {
    id: 'steakhouse-sang',
    name: 'Steakhouse sang trọng',
    min: 700000, max: 1500000,
    examples: [{ name: 'GU 19 Steak', city: 'Hà Nội' }],
    advice: 'Dành cho dịp đặc biệt như kỷ niệm. Đặt bàn trước vài ngày và nói rõ đây là dịp gì. Hai bạn nên thống nhất ai mời từ trước, để lúc nhìn giá menu không ai thấy ngại.',
  },
  {
    id: 'omakase-tam-trung',
    name: 'Omakase tầm trung',
    min: 1400000, max: 2500000,
    examples: [{ name: 'Maguro Studio', city: 'TP.HCM' }, { name: 'Nuboko Sushi & Teppanyaki', city: 'Hà Nội' }],
    advice: 'Omakase là bữa để đầu bếp chọn món, hợp dịp kỷ niệm. Báo trước dị ứng và món không ăn được khi đặt bàn vì thực đơn gần như cố định. Nhiều quán xếp khách theo suất nên đến đúng giờ. Ngồi quầy thì hai bạn sát nhau, hợp trò chuyện nhỏ.',
  },
  {
    id: 'omakase-cao-cap',
    name: 'Omakase cao cấp',
    min: 2000000, max: 5000000,
    examples: [{ name: 'Sushi REI', city: 'TP.HCM' }, { name: 'Omakase K Nguyễn Siêu', city: 'TP.HCM' }, { name: 'Kappou Ishida', city: 'Hà Nội' }],
    advice: 'Đây là khoản chi lớn, chỉ nên chọn khi cả hai cùng muốn và đã bàn về ngân sách. Hỏi quán trước xem đồ uống có nằm trong giá không để khỏi bất ngờ lúc thanh toán. Đến đúng giờ và tắt chuông điện thoại cho trọn buổi.',
  },
]

export const PRICE_BUCKETS = [
  { id: 'all', label: 'Tất cả', min: 0, max: Infinity },
  { id: 'u200', label: 'Dưới 200k', min: 0, max: 200000 },
  { id: '200-500', label: '200k – 500k', min: 200000, max: 500000 },
  { id: '500-1000', label: '500k – 1 triệu', min: 500000, max: 1000000 },
  { id: 'o1000', label: 'Trên 1 triệu', min: 1000000, max: Infinity },
]

// Một gợi ý thuộc nhóm giá nếu khoảng giá của nó giao với nhóm đó.
export const inBucket = (idea, b) => idea.max > b.min && idea.min < b.max
