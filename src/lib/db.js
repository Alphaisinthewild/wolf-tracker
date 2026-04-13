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

function getFallbackProfile() {
  const storage = getStorage()
  if (!storage) return null

  try {
    const raw = storage.getItem(PROFILE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setFallbackProfile(profile) {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
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
    async (db) => {
      const profile = await db.get('kv', PROFILE_KEY)
      return profile || getFallbackProfile()
    },
    () => getFallbackProfile(),
  )
}

export async function saveProfile(profile) {
  setFallbackProfile(profile)

  return withDb(
    async (db) => {
      await db.put('kv', profile, PROFILE_KEY)
      return profile
    },
    () => profile,
  )
}

export async function getEntry(date) {
  return withDb(
    async (db) => {
      const entry = await db.get('entries', date)
      return entry || getFallbackEntries().find(item => item.date === date) || null
    },
    () => getFallbackEntries().find(entry => entry.date === date) || null,
  )
}

export async function saveEntry(entry) {
  const entries = getFallbackEntries().filter(item => item.date !== entry.date)
  entries.push(entry)
  setFallbackEntries(entries)

  return withDb(
    async (db) => {
      await db.put('entries', entry)
      return entry
    },
    () => entry,
  )
}

export async function getAllEntries() {
  return withDb(
    async (db) => {
      const entries = await db.getAll('entries')
      return entries.length ? entries : getFallbackEntries()
    },
    () => getFallbackEntries(),
  )
}

export async function clearEntries() {
  setFallbackEntries([])

  return withDb(
    async (db) => {
      await db.clear('entries')
      return null
    },
    () => null,
  )
}
