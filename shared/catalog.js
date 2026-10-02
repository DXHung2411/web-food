// Single source of truth for what users may pick. The API only accepts ids from here,
// so nobody can use the backend as a free-form Google Places proxy.

export const DISHES = [
  { id: 'pho', label: 'Phở', emoji: '🍜', query: 'quán phở' },
  { id: 'bun-cha', label: 'Bún chả', emoji: '🥢', query: 'quán bún chả' },
  { id: 'bun-bo', label: 'Bún bò', emoji: '🍲', query: 'quán bún bò' },
  { id: 'banh-mi', label: 'Bánh mì', emoji: '🥖', query: 'tiệm bánh mì' },
  { id: 'com-tam', label: 'Cơm tấm', emoji: '🍚', query: 'quán cơm tấm' },
  { id: 'lau', label: 'Lẩu', emoji: '🫕', query: 'quán lẩu' },
  { id: 'nuong', label: 'Nướng', emoji: '🍖', query: 'quán nướng BBQ' },
  { id: 'hai-san', label: 'Hải sản', emoji: '🦐', query: 'quán hải sản' },
  { id: 'an-vat', label: 'Ăn vặt', emoji: '🍢', query: 'quán ăn vặt' },
  { id: 'tra-sua', label: 'Trà sữa', emoji: '🧋', query: 'quán trà sữa' },
  { id: 'ca-phe', label: 'Cà phê', emoji: '☕', query: 'quán cà phê' },
  { id: 'banh-ngot', label: 'Bánh ngọt', emoji: '🍰', query: 'tiệm bánh ngọt' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣', query: 'nhà hàng sushi' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕', query: 'quán pizza' },
  { id: 'chay', label: 'Đồ chay', emoji: '🥗', query: 'quán chay' },
]

// lat/lng = city centre, used to bias search results and to centre the map.
export const CITIES = [
  { id: 'ha-noi', name: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
  { id: 'ho-chi-minh', name: 'TP. Hồ Chí Minh', lat: 10.7769, lng: 106.7009 },
  { id: 'da-nang', name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022 },
  { id: 'hai-phong', name: 'Hải Phòng', lat: 20.8449, lng: 106.6881 },
  { id: 'can-tho', name: 'Cần Thơ', lat: 10.0452, lng: 105.7469 },
  { id: 'hue', name: 'Huế', lat: 16.4637, lng: 107.5909 },
  { id: 'hoi-an', name: 'Hội An', lat: 15.8801, lng: 108.338 },
  { id: 'nha-trang', name: 'Nha Trang', lat: 12.2388, lng: 109.1967 },
  { id: 'da-lat', name: 'Đà Lạt', lat: 11.9404, lng: 108.4583 },
  { id: 'vung-tau', name: 'Vũng Tàu', lat: 10.346, lng: 107.0843 },
  { id: 'ha-long', name: 'Hạ Long', lat: 20.9101, lng: 107.1839 },
  { id: 'sa-pa', name: 'Sa Pa', lat: 22.3364, lng: 103.8438 },
  { id: 'phu-quoc', name: 'Phú Quốc', lat: 10.2899, lng: 103.984 },
]

// Rough bounding box of Vietnam, used to reject nonsense coordinates.
export const VN_BOUNDS = { minLat: 8.0, maxLat: 23.6, minLng: 102.0, maxLng: 110.0 }

export const NEAR_RADIUS_M = 3000
export const CITY_RADIUS_M = 15000
