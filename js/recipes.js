// Công thức cho 1 người, nấu đơn giản, giá rẻ. Giá nguyên liệu là ƯỚC LƯỢNG (VND), hãy chỉnh theo nơi bạn mua.
// Giá mỗi suất = tổng giá nguyên liệu bên dưới (tính trong code, không ghi tay) để trang sách và trang lập thực đơn luôn khớp.
//   stove: true = cần bếp (chảo/nồi). false = làm được bằng nồi cơm điện / ấm đun nước.
//   veg:   true = không thịt/cá/trứng.
//   dish:  nếu có, công thức này cũng là một món tự nấu trong trang lập thực đơn (meals: bữa có thể ăn).
//   minutes chưa tính thời gian nấu cơm (có thể nấu cơm bằng nồi cơm điện song song).

const RICE = { name: 'Cơm trắng', qty: '1 chén', cost: 3000 }

export const RECIPES = [
  {
    id: 'com-trung-luoc',
    title: 'Cơm trứng luộc',
    minutes: 15, stove: false, veg: false, gear: 'Nồi cơm điện hoặc nồi nhỏ',
    dish: { name: 'Cơm + trứng luộc', meals: ['trua', 'toi'] },
    ingredients: [RICE, { name: 'Trứng gà', qty: '2 quả', cost: 7000 }, { name: 'Nước tương, tiêu', qty: 'một chút', cost: 500 }],
    steps: [
      'Cho trứng vào nồi, đổ nước lạnh ngập trứng. Nếu dùng nồi cơm điện thì bấm nấu.',
      'Khi nước sôi, đợi thêm khoảng 10 phút cho trứng chín hẳn. Nồi cơm điện tự nhảy sang "giữ ấm" thì bấm nấu lại.',
      'Vớt trứng ngâm nước lạnh 2 phút rồi bóc vỏ.',
      'Ăn với cơm, chấm nước tương và rắc tiêu.',
    ],
    tip: 'Tranh thủ luộc cả 4–6 quả một lần, để ngăn mát ăn trong 2–3 ngày.',
  },
  {
    id: 'chao-trung',
    title: 'Cháo trứng',
    minutes: 25, stove: false, veg: false, gear: 'Nồi (bếp hoặc nồi cơm điện)',
    dish: { name: 'Cháo trứng', meals: ['sang'] },
    ingredients: [{ name: 'Cơm nguội', qty: '1 chén', cost: 3000 }, { name: 'Trứng gà', qty: '1 quả', cost: 3500 }, { name: 'Hành lá, tiêu, nước mắm', qty: 'một chút', cost: 1500 }],
    steps: [
      'Cho cơm nguội và khoảng 3 chén nước vào nồi, nấu sôi rồi hạ lửa nhỏ (hoặc bấm nồi cơm điện).',
      'Nấu khoảng 15 phút, thỉnh thoảng khuấy cho cơm nhuyễn thành cháo.',
      'Nêm nước mắm cho vừa miệng.',
      'Đập trứng vào, khuấy nhanh cho trứng thành sợi, tắt bếp.',
      'Rắc hành lá và tiêu.',
    ],
    tip: 'Thích cháo loãng hay đặc thì thêm bớt nước. Cháo hợp cả những hôm trong người mệt.',
  },
  {
    id: 'mi-goi-trung',
    title: 'Mì gói trứng',
    minutes: 8, stove: false, veg: false, gear: 'Nồi (bếp hoặc nồi cơm điện)',
    dish: { name: 'Mì gói trứng', meals: ['sang', 'trua', 'toi'] },
    ingredients: [{ name: 'Mì gói', qty: '1 gói', cost: 5000 }, { name: 'Trứng gà', qty: '1 quả', cost: 3500 }, { name: 'Hành lá, ớt (tuỳ thích)', qty: 'một chút', cost: 1500 }],
    steps: [
      'Đun khoảng 500 ml nước cho sôi trong nồi (hoặc nồi cơm điện, bấm nấu).',
      'Thả mì vào, nấu theo thời gian ghi trên gói, thường 2–3 phút.',
      'Cho gói gia vị vào. Đập trứng vào nồi, để yên khoảng 1 phút cho trứng gần chín, hoặc khuấy nhẹ nếu thích trứng thành sợi.',
      'Rắc hành lá, ăn ngay khi còn nóng.',
    ],
    tip: 'Dùng nửa gói gia vị thôi cho đỡ mặn, bù lại bằng hành và ớt.',
  },
  {
    id: 'mi-goi-rau',
    title: 'Mì gói thêm rau',
    minutes: 10, stove: false, veg: false, gear: 'Nồi (bếp hoặc nồi cơm điện)',
    dish: { name: 'Mì gói + rau', meals: ['trua', 'toi'] },
    ingredients: [{ name: 'Mì gói', qty: '1 gói', cost: 5000 }, { name: 'Rau cải xanh', qty: '1 nắm', cost: 5000 }, { name: 'Hành lá, tỏi, gia vị', qty: 'một chút', cost: 2000 }],
    steps: [
      'Nhặt rau, rửa sạch, cắt khúc. Tỏi đập dập.',
      'Đun khoảng 500 ml nước sôi cùng tỏi, thả mì vào nấu 2 phút.',
      'Cho rau vào, nấu thêm 1 phút cho rau vừa chín.',
      'Cho gói gia vị, rắc hành lá rồi ăn.',
    ],
    tip: 'Thêm rau là cách rẻ nhất để bữa mì gói đỡ ngán và đỡ thiếu chất.',
  },
  {
    id: 'com-rau-luoc',
    title: 'Cơm rau luộc chấm nước tương',
    minutes: 12, stove: false, veg: true, gear: 'Nồi (bếp hoặc nồi cơm điện)',
    dish: { name: 'Cơm + rau luộc', meals: ['trua', 'toi'] },
    ingredients: [RICE, { name: 'Rau muống hoặc rau cải', qty: '1 bó nhỏ', cost: 5000 }, { name: 'Nước tương, tỏi, ớt, chanh', qty: 'một chút', cost: 2000 }],
    steps: [
      'Nhặt rau, rửa sạch. Đun một nồi nước sôi với chút muối (nồi cơm điện bấm nấu cũng được).',
      'Thả rau vào luộc 2–3 phút cho rau chín tới, vớt ra để ráo.',
      'Pha nước chấm: 2 muỗng canh nước tương, tỏi băm, ớt, vài giọt chanh, chút đường và 1–2 muỗng nước lọc.',
      'Ăn rau với cơm, chấm nước tương.',
    ],
    tip: 'Rau luộc xong có thể trụng nhanh qua nước lạnh để giữ màu xanh.',
  },
  {
    id: 'com-rau-muong-xao-toi',
    title: 'Rau muống xào tỏi',
    minutes: 10, stove: true, veg: true, gear: 'Bếp + chảo',
    dish: { name: 'Cơm + rau muống xào tỏi', meals: ['trua', 'toi'] },
    ingredients: [RICE, { name: 'Rau muống', qty: '1 bó', cost: 5000 }, { name: 'Tỏi, dầu ăn, muối', qty: 'một chút', cost: 2000 }],
    steps: [
      'Nhặt rau, rửa sạch, để ráo thật kỹ (rau còn nước sẽ bị ra nước khi xào). Tỏi băm nhỏ.',
      'Đun nóng chảo với 1 muỗng canh dầu, phi tỏi cho thơm.',
      'Cho rau vào, để lửa lớn, đảo nhanh tay.',
      'Nêm chút muối, xào khoảng 2 phút cho rau vừa chín rồi tắt bếp.',
    ],
    tip: 'Lửa lớn và xào nhanh thì rau giòn, giữ được màu xanh.',
  },
  {
    id: 'com-trung-chien',
    title: 'Cơm trứng chiên hành',
    minutes: 15, stove: true, veg: false, gear: 'Bếp + chảo',
    dish: { name: 'Cơm + trứng chiên', meals: ['trua', 'toi'] },
    ingredients: [RICE, { name: 'Trứng gà', qty: '2 quả', cost: 7000 }, { name: 'Hành lá, nước mắm, dầu ăn', qty: 'một chút', cost: 2000 }],
    steps: [
      'Đập trứng vào bát, thêm nửa muỗng cà phê nước mắm, hành lá thái nhỏ và 1 muỗng canh nước lọc, đánh tan.',
      'Đun nóng chảo với 1 muỗng canh dầu ăn.',
      'Đổ trứng vào, để lửa vừa, chiên khoảng 1–2 phút mỗi mặt đến khi vàng.',
      'Ăn với cơm nóng.',
    ],
    tip: 'Thêm một chút nước vào trứng đánh sẽ giúp miếng trứng xốp hơn.',
  },
  {
    id: 'com-dau-sot-ca',
    title: 'Đậu hũ sốt cà chua',
    minutes: 20, stove: true, veg: true, gear: 'Bếp + chảo',
    dish: { name: 'Cơm + đậu hũ sốt cà', meals: ['trua', 'toi'] },
    ingredients: [RICE, { name: 'Đậu hũ trắng', qty: '2 bìa', cost: 5000 }, { name: 'Cà chua', qty: '2 quả', cost: 4000 }, { name: 'Hành lá, dầu ăn, muối, nước tương', qty: 'một chút', cost: 3000 }],
    steps: [
      'Cắt đậu hũ thành miếng vuông vừa ăn. Cà chua cắt múi cau.',
      'Đun nóng chảo với 1 muỗng canh dầu, chiên đậu hũ đến vàng nhẹ các mặt, gắp ra.',
      'Trong chảo còn dầu, cho cà chua vào xào đến khi mềm, ra nước.',
      'Thêm nửa chén nước, nêm 1 muỗng cà phê nước tương và chút muối. Cho đậu hũ vào, đun lửa nhỏ khoảng 5 phút.',
      'Rắc hành lá, ăn với cơm.',
    ],
    tip: 'Muốn tiết kiệm dầu thì bỏ bước chiên, cho đậu hũ sống vào sốt cùng cà chua, vẫn ăn ngon.',
  },
  {
    id: 'canh-ca-chua-trung',
    title: 'Canh cà chua trứng',
    minutes: 15, stove: true, veg: false, gear: 'Bếp + nồi',
    ingredients: [{ name: 'Cà chua', qty: '2 quả', cost: 4000 }, { name: 'Trứng gà', qty: '1 quả', cost: 3500 }, { name: 'Hành lá, dầu ăn, muối', qty: 'một chút', cost: 1500 }],
    steps: [
      'Cà chua cắt múi cau. Đánh tan trứng trong bát.',
      'Cho 1 muỗng cà phê dầu vào nồi, xào cà chua đến khi mềm.',
      'Đổ khoảng 400 ml nước vào, đun sôi, nêm muối cho vừa.',
      'Hạ lửa nhỏ, rót trứng vào từ từ theo một vòng tròn, đợi trứng đông rồi mới khuấy nhẹ.',
      'Tắt bếp, rắc hành lá.',
    ],
    tip: 'Ăn cùng cơm trắng thì canh này đã đủ cho một bữa đơn giản.',
  },
  {
    id: 'com-thit-kho',
    title: 'Thịt kho trứng',
    minutes: 50, stove: true, veg: false, gear: 'Bếp + nồi có nắp',
    dish: { name: 'Cơm + thịt kho', meals: ['trua', 'toi'] },
    ingredients: [RICE, { name: 'Thịt ba rọi', qty: '100 g', cost: 14000 }, { name: 'Trứng gà', qty: '1 quả', cost: 3500 }, { name: 'Nước mắm, đường, hành, tiêu', qty: 'một chút', cost: 4500 }],
    steps: [
      'Luộc trứng 10 phút, ngâm nước lạnh rồi bóc vỏ.',
      'Thái thịt miếng vuông khoảng 3 cm, ướp với 1 muỗng canh nước mắm, 1 muỗng cà phê đường, hành băm và tiêu trong 15 phút.',
      'Cho 1 muỗng canh đường vào nồi, đun lửa nhỏ đến khi vàng cánh gián, cho thịt vào đảo cho săn lại.',
      'Đổ nước xâm xấp thịt, đun sôi rồi hạ lửa nhỏ, đậy nắp kho khoảng 30 phút.',
      'Cho trứng vào kho thêm 10 phút, nêm lại cho vừa ăn.',
    ],
    tip: 'Món này để ngăn mát được vài ngày, nên kho nhiều một lần rồi hâm lại, đỡ tốn công và tốn gas.',
  },
]

export const recipeCost = (r) => r.ingredients.reduce((sum, i) => sum + i.cost, 0)
export const recipeById = (id) => RECIPES.find((r) => r.id === id)
