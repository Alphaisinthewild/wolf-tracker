import { create } from 'zustand'
import { clearEntries, getAllEntries, getEntry, getProfile, saveEntry, saveProfile } from '../lib/db'
import { getTodayKey, getLastNDays } from '../lib/dates'
import { buildSeedEntries } from '../lib/seedData'
import { getRecommendedGoals } from '../lib/onboarding'
import { detectPlateau, getWeeklySummary } from '../lib/analytics'

const defaultProfile = {
  startingWeight: 335,
  targetWeight: 180,
  calorieGoal: 2250,
  proteinGoal: 185,
  stepGoal: 10000,
  unitSystem: 'imperial',
  remindersEnabled: false,
  notificationsConfigured: false,
  reminderTime: '20:00',
  setupComplete: false,
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
  measurements: {
    waist: '',
    chest: '',
    arms: '',
    thighs: '',
  },
  photos: [],
  updatedAt: new Date().toISOString(),
})

const normalizeEntry = (entry) => {
  const date = entry?.date || getTodayKey()

  return {
    ...emptyEntry(date),
    ...(entry || {}),
    measurements: {
      ...emptyEntry(date).measurements,
      ...(entry?.measurements || {}),
    },
    photos: Array.isArray(entry?.photos) ? entry.photos : [],
  }
}

const useTrackerStore = create((set, get) => ({
  profile: defaultProfile,
  entries: {},
  status: 'Ready',
  initialized: false,
  hasCompletedSetup: false,

  initialize: async () => {
    set({ status: 'Loading...' })

    try {
      const [storedProfile, allEntries] = await Promise.all([
        getProfile(),
        getAllEntries(),
      ])

      let entries = Object.fromEntries(allEntries.map(entry => {
        const normalized = normalizeEntry(entry)
        return [normalized.date, normalized]
      }))

      if (allEntries.length === 0) {
        const seedEntries = buildSeedEntries().map(normalizeEntry)
        await Promise.all(seedEntries.map(saveEntry))
        entries = Object.fromEntries(seedEntries.map(entry => [entry.date, entry]))
      }

      if (!storedProfile) {
        await saveProfile(defaultProfile)
      }

      const resolvedProfile = storedProfile || defaultProfile

      set({
        profile: resolvedProfile,
        entries,
        status: 'Saved locally',
        initialized: true,
        hasCompletedSetup: Boolean(resolvedProfile.setupComplete),
      })
    } catch {
      set({
        profile: defaultProfile,
        entries: {},
        status: 'Ready',
        initialized: true,
        hasCompletedSetup: false,
      })
    }
  },

  saveProfile: async (profile) => {
    set({ status: 'Saving...' })
    await saveProfile(profile)
    set({
      profile,
      status: 'Saved locally',
      hasCompletedSetup: Boolean(profile.setupComplete),
    })
  },

  completeSetup: async (profile) => {
    const recommended = getRecommendedGoals(profile.startingWeight, profile.unitSystem)
    const nextProfile = {
      ...recommended,
      ...profile,
      setupComplete: true,
    }
    set({ status: 'Saving...' })
    await saveProfile(nextProfile)
    set({
      profile: nextProfile,
      status: 'Saved locally',
      hasCompletedSetup: true,
    })
  },

  loadEntry: async (date) => {
    const existing = get().entries[date]
    if (existing) return existing

    const stored = await getEntry(date)
    if (stored) {
      const normalized = normalizeEntry(stored)
      set(state => ({
        entries: { ...state.entries, [date]: normalized },
      }))
      return normalized
    }

    return emptyEntry(date)
  },

  saveDailyEntry: async (entry) => {
    const normalized = {
      ...normalizeEntry(entry),
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
    const seedEntries = buildSeedEntries().map(normalizeEntry)
    set({ status: 'Saving...' })
    await clearEntries()
    await Promise.all(seedEntries.map(saveEntry))
    await saveProfile(defaultProfile)
    set({
      profile: defaultProfile,
      entries: Object.fromEntries(seedEntries.map(entry => [entry.date, entry])),
      status: 'Saved locally',
    })
  },

  importBackup: async (payload) => {
    const nextProfile = payload?.profile || defaultProfile
    const nextEntries = Array.isArray(payload?.entries)
      ? payload.entries.map(normalizeEntry)
      : []

    set({ status: 'Saving...' })
    await clearEntries()
    await Promise.all(nextEntries.map(saveEntry))
    await saveProfile(nextProfile)

    set({
      profile: nextProfile,
      entries: Object.fromEntries(nextEntries.map(entry => [entry.date, entry])),
      status: 'Saved locally',
    })
  },

  getLatestMeasurements: () => {
    const entries = Object.values(get().entries)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .reverse()

    const latest = entries.find(entry => Object.values(entry.measurements || {}).some(Boolean))
    return latest?.measurements || emptyEntry(getTodayKey()).measurements
  },

  getLatestPhotos: () => {
    const entries = Object.values(get().entries)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .reverse()

    const latest = entries.find(entry => Array.isArray(entry.photos) && entry.photos.length > 0)
    return latest?.photos || []
  },

  getProgressStats: () => {
    const { profile, entries } = get()
    const chronologicalEntries = Object.values(entries)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))

    const allWeights = chronologicalEntries
      .map(entry => Number(entry.weight))
      .filter(weight => !Number.isNaN(weight) && weight > 0)

    const currentWeight = allWeights.length > 0 ? allWeights[allWeights.length - 1] : profile.startingWeight
    const weightLost = profile.startingWeight - currentWeight
    const totalToLose = profile.startingWeight - profile.targetWeight
    const progressPercent = totalToLose > 0 ? Math.max(0, Math.round((weightLost / totalToLose) * 1000) / 10) : 0

    const adherenceDays = chronologicalEntries.filter(entry => (
      Number(entry.calories) > 0 ||
      Number(entry.protein) > 0 ||
      Number(entry.steps) > 0 ||
      entry.workoutCompleted
    ))

    let currentStreak = 0
    for (let i = chronologicalEntries.length - 1; i >= 0; i -= 1) {
      const entry = chronologicalEntries[i]
      const hasActivity = Number(entry.calories) > 0 || Number(entry.protein) > 0 || Number(entry.steps) > 0 || entry.workoutCompleted
      if (!hasActivity) break
      currentStreak += 1
    }

    const milestones = [10, 25, 50, 75, 100]
      .filter(mark => progressPercent >= mark)
      .map(mark => `${mark}% goal progress`)

    return {
      currentWeight,
      weightLost,
      remaining: currentWeight - profile.targetWeight,
      progressPercent,
      adherenceScore: chronologicalEntries.length > 0 ? Math.round((adherenceDays.length / chronologicalEntries.length) * 100) : 0,
      currentStreak,
      milestones,
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

  getInsights: () => {
    const entries = Object.values(get().entries)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      weeklySummary: getWeeklySummary(entries),
      plateau: detectPlateau(entries),
    }
  },
}))

export default useTrackerStore
