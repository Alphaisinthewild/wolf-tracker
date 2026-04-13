import { openDB } from 'idb'

const DB_NAME = 'wolf-tracker-db'
const DB_VERSION = 1
const PROFILE_KEY = 'profile'
const PROFILE_STORAGE_KEY = 'wolf-tracker-profile'
const ENTRIES_STORAGE_KEY = 'wolf-tracker-entries'

function getStorage() {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

function getFallbackEntries() {
  const storage = getStorage()
  if (!storage) return []

  try {
    const raw = storage.getItem(ENTRIES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setFallbackEntries(entries) {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries))
}

async function withDb(run, fallback) {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('kv')) {
          db.createObjectStore('kv')
        }

        if (!db.objectStoreNames.contains('entries')) {
          db.createObjectStore('entries', { keyPath: 'date' })
        }
      },
    })

    return await run(db)
  } catch {
    return fallback()
  }
}

export async function getProfile() {
  return withDb(
    db => db.get('kv', PROFILE_KEY),
    () => {
      const storage = getStorage()
      if (!storage) return null
      const raw = storage.getItem(PROFILE_STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    },
  )
}

export async function saveProfile(profile) {
  return withDb(
    db => db.put('kv', profile, PROFILE_KEY),
    () => {
      const storage = getStorage()
      if (!storage) return null
      storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
      return profile
    },
  )
}

export async function getEntry(date) {
  return withDb(
    db => db.get('entries', date),
    () => getFallbackEntries().find(entry => entry.date === date) || null,
  )
}

export async function saveEntry(entry) {
  return withDb(
    db => db.put('entries', entry),
    () => {
      const entries = getFallbackEntries().filter(item => item.date !== entry.date)
      entries.push(entry)
      setFallbackEntries(entries)
      return entry
    },
  )
}

export async function getAllEntries() {
  return withDb(
    db => db.getAll('entries'),
    () => getFallbackEntries(),
  )
}

export async function clearEntries() {
  return withDb(
    db => db.clear('entries'),
    () => {
      setFallbackEntries([])
      return null
    },
  )
}
