import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const STORAGE_KEY = 'wolf-tracker-last-notification-date'
const REMINDER_NOTIFICATION_ID = 1001

export async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    const permissions = await LocalNotifications.requestPermissions()
    return permissions.display
  }

  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export async function getNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    const permissions = await LocalNotifications.checkPermissions()
    return permissions.display
  }

  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

async function scheduleNativeReminder(profile) {
  if (!profile?.remindersEnabled) {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_NOTIFICATION_ID }] })
    return () => {}
  }

  const [hours, minutes] = String(profile.reminderTime || '20:00').split(':').map(Number)

  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_NOTIFICATION_ID }] })
  await LocalNotifications.schedule({
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
        icon: '/favicon.svg',
      })
      localStorage.setItem(STORAGE_KEY, today)
    }
  }

  check()
  const interval = window.setInterval(check, 60_000)
  return () => window.clearInterval(interval)
}

export function scheduleDailyReminder(profile) {
  if (Capacitor.isNativePlatform()) {
    let active = true
    scheduleNativeReminder(profile)
    return () => {
      if (!active) return
      active = false
    }
  }

  return scheduleBrowserReminder(profile)
}
