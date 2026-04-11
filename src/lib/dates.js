export function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function getLastNDays(count) {
  const days = []
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function getDayLabel(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
}
