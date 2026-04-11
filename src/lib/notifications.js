const STORAGE_KEY = 'wolf-tracker-last-notification-date'

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function scheduleDailyReminder(profile) {
  if (!profile?.remindersEnabled) return null
  if (!('Notification' in window) || Notification.permission !== 'granted') return null

  const check = () => {
    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    const [hours, minutes] = String(profile.reminderTime || '20:00').split(':').map(Number)
    const alreadySent = localStorage.getItem(STORAGE_KEY) === today

    if (!alreadySent && now.getHours() === hours && now.getMinutes() === minutes) {
      new Notification('Wolf Tracker check-in', {
        body: 'Log today’s health data and keep your streak alive.',
        icon: '/favicon.svg',
      })
      localStorage.setItem(STORAGE_KEY, today)
    }
  }

  check()
  const interval = window.setInterval(check, 60_000)
  return () => window.clearInterval(interval)
}
