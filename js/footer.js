import { SOURCES } from './sources.js'

// Vẽ khối "Nguồn tham khảo" vào phần tử có id="sources" (nếu trang có).
export function renderSources() {
  const box = document.getElementById('sources')
  if (!box) return
  const list = document.createElement('ul')
  for (const s of SOURCES) {
    const a = document.createElement('a')
    a.href = s.url
    a.textContent = s.label
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    const li = document.createElement('li')
    li.append(a)
    list.append(li)
  }
  const summary = document.createElement('summary')
  summary.textContent = 'Nguồn tham khảo giá (2026)'
  box.append(summary, list)
}
