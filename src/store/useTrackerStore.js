import { create } from 'zustand'
import { getAllEntries, getEntry, getProfile, saveEntry, saveProfile } from '../lib/db'
import { getTodayKey, getLastNDays } from '../lib/dates'
import { buildSeedEntries } from '../lib/seedData'

const defaultProfile = {
  startingWeight: 335,
  targetWeight: 180,
  calorieGoal: 2250,
  proteinGoal: 185,
  stepGoal: 10000,
}

const emptyEntry = (date) => ({
  date,
  weight: '',
  calories: '',
  protein: '',
  steps: '',
  workoutCompleted: false,
  workoutType: '',
  workoutNotes: '',
  supplements: '',
  notes: '',
  updatedAt: new Date().toISOString(),
})

const useTrackerStore = create((set, get) => ({
  profile: defaultProfile,
  entries: {},
  status: 'Ready',
  initialized: false,

  initialize: async () => {
    set({ status: 'Loading...' })

    const [storedProfile, allEntries] = await Promise.all([
      getProfile(),
      getAllEntries(),
    ])

    let entries = Object.fromEntries(allEntries.map(entry => [entry.date, entry]))

    if (allEntries.length === 0) {
      const seedEntries = buildSeedEntries()
      await Promise.all(seedEntries.map(saveEntry))
      entries = Object.fromEntries(seedEntries.map(entry => [entry.date, entry]))
    }

    if (!storedProfile) {
      await saveProfile(defaultProfile)
    }

    set({
      profile: storedProfile || defaultProfile,
      entries,
      status: 'Saved locally',
      initialized: true,
    })
  },

  saveProfile: async (profile) => {
    set({ status: 'Saving...' })
    await saveProfile(profile)
    set({ profile, status: 'Saved locally' })
  },

  loadEntry: async (date) => {
    const existing = get().entries[date]
    if (existing) return existing

    const stored = await getEntry(date)
    if (stored) {
      set(state => ({
        entries: { ...state.entries, [date]: stored },
      }))
      return stored
    }

    return emptyEntry(date)
  },

  saveDailyEntry: async (entry) => {
    const normalized = {
      ...entry,
      updatedAt: new Date().toISOString(),
    }

    set({ status: 'Saving...' })
    await saveEntry(normalized)
    set(state => ({
      entries: { ...state.entries, [normalized.date]: normalized },
      status: 'Saved locally',
    }))
  },

  getTodayEntry: () => {
    const today = getTodayKey()
    return get().entries[today] || emptyEntry(today)
  },

  clearAllData: async () => {
    const seedEntries = buildSeedEntries()
    await Promise.all(seedEntries.map(saveEntry))
    set({
      profile: defaultProfile,
      entries: Object.fromEntries(seedEntries.map(entry => [entry.date, entry])),
      status: 'Saved locally',
    })
    await saveProfile(defaultProfile)
  },

  getProgressStats: () => {
    const { profile, entries } = get()
    const allWeights = Object.values(entries)
      .map(entry => Number(entry.weight))
      .filter(weight => !Number.isNaN(weight) && weight > 0)

    const currentWeight = allWeights.length > 0 ? allWeights[allWeights.length - 1] : profile.startingWeight
    const weightLost = profile.startingWeight - currentWeight
    const totalToLose = profile.startingWeight - profile.targetWeight
    const progressPercent = totalToLose > 0 ? Math.max(0, Math.round((weightLost / totalToLose) * 1000) / 10) : 0

    return {
      currentWeight,
      weightLost,
      remaining: currentWeight - profile.targetWeight,
      progressPercent,
    }
  },

  getTrendData: (days = 7) => {
    const { entries } = get()
    return getLastNDays(days).map(date => {
      const entry = entries[date] || emptyEntry(date)
      return {
        date,
        weight: Number(entry.weight) || 0,
        calories: Number(entry.calories) || 0,
        protein: Number(entry.protein) || 0,
        steps: Number(entry.steps) || 0,
        workouts: entry.workoutCompleted ? 1 : 0,
      }
    })
  },
}))

export default useTrackerStore
