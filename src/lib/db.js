import { openDB } from 'idb'

const DB_NAME = 'wolf-tracker-db'
const DB_VERSION = 1
const PROFILE_KEY = 'profile'

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('kv')) {
        db.createObjectStore('kv')
      }

      if (!db.objectStoreNames.contains('entries')) {
        db.createObjectStore('entries', { keyPath: 'date' })
      }
    },
  })
}

export async function getProfile() {
  const db = await getDb()
  return db.get('kv', PROFILE_KEY)
}

export async function saveProfile(profile) {
  const db = await getDb()
  return db.put('kv', profile, PROFILE_KEY)
}

export async function getEntry(date) {
  const db = await getDb()
  return db.get('entries', date)
}

export async function saveEntry(entry) {
  const db = await getDb()
  return db.put('entries', entry)
}

export async function getAllEntries() {
  const db = await getDb()
  return db.getAll('entries')
}
