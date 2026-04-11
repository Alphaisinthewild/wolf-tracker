import { getLastNDays } from './dates'

export function buildSeedEntries() {
  const days = getLastNDays(7)

  return days.map((date, index) => ({
    date,
    weight: String(335 - index * 0.6),
    calories: String(2480 - index * 55),
    protein: String(160 + index * 4),
    steps: String(6200 + index * 650),
    workoutCompleted: index % 2 === 0,
    workoutType: index % 2 === 0 ? 'Strength' : 'Walk',
    workoutNotes: index % 2 === 0 ? 'Upper body and core.' : 'Steady outdoor walk.',
    supplements: 'Creatine, multivitamin',
    notes: index === days.length - 1 ? 'Felt strong today.' : '',
    updatedAt: new Date().toISOString(),
  }))
}
