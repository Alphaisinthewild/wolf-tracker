const STORAGE_KEY = 'wolf-tracker-last-notification-date'
const REMINDER_NOTIFICATION_ID = 1001

async function getNativeNotifications() {
  const [{ Capacitor }, { LocalNotifications }] = await Promise.all([
    import('@capacitor/core'),
    import('@capacitor/local-notifications'),
  ])

  if (!Capacitor.isNativePlatform()) return null
  return LocalNotifications
}

export async function requestNotificationPermission() {
  const nativeNotifications = await getNativeNotifications()
  if (nativeNotifications) {
    const permissions = await nativeNotifications.requestPermissions()
    return permissions.display
  }

  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export async function getNotificationPermission() {
  const nativeNotifications = await getNativeNotifications()
  if (nativeNotifications) {
    const permissions = await nativeNotifications.checkPermissions()
    return permissions.display
  }

  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

async function scheduleNativeReminder(profile) {
  const nativeNotifications = await getNativeNotifications()
  if (!nativeNotifications) return null

  if (!profile?.remindersEnabled) {
    await nativeNotifications.cancel({ notifications: [{ id: REMINDER_NOTIFICATION_ID }] })
    return () => {}
  }

  const [hours, minutes] = String(profile.reminderTime || '20:00').split(':').map(Number)

  await nativeNotifications.cancel({ notifications: [{ id: REMINDER_NOTIFICATION_ID }] })
  await nativeNotifications.schedule({
    notifications: [
      {
        id: REMINDER_NOTIFICATION_ID,
        title: 'Wolf Tracker check-in',
        body: 'Log today’s health data and keep your streak alive.',
        schedule: {
          repeats: true,
          on: {
            hour: hours,
            minute: minutes,
          },
        },
      },
    ],
  })

  return () => {}
}

function scheduleBrowserReminder(profile) {
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
        icon: 'favicon.svg',
      })
      localStorage.setItem(STORAGE_KEY, today)
    }
  }

  check()
  const interval = window.setInterval(check, 60_000)
  return () => window.clearInterval(interval)
}

export function scheduleDailyReminder(profile) {
  let cleanup = null
  let active = true

  ;(async () => {
    const nativeCleanup = await scheduleNativeReminder(profile)
    if (!active) {
      if (typeof nativeCleanup === 'function') nativeCleanup()
      return
    }

    cleanup = nativeCleanup || scheduleBrowserReminder(profile)
  })().catch(() => {
    if (!active) return
    cleanup = scheduleBrowserReminder(profile)
  })

  return () => {
    active = false
    if (typeof cleanup === 'function') cleanup()
  }
}
