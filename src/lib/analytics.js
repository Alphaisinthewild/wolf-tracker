export function getWeeklySummary(entries = []) {
  const recent = entries.slice(-7)
  const totals = recent.reduce((acc, entry) => ({
    calories: acc.calories + (Number(entry.calories) || 0),
    protein: acc.protein + (Number(entry.protein) || 0),
    steps: acc.steps + (Number(entry.steps) || 0),
    workouts: acc.workouts + (entry.workoutCompleted ? 1 : 0),
  }), { calories: 0, protein: 0, steps: 0, workouts: 0 })

  return {
    avgCalories: recent.length ? Math.round(totals.calories / recent.length) : 0,
    avgProtein: recent.length ? Math.round(totals.protein / recent.length) : 0,
    avgSteps: recent.length ? Math.round(totals.steps / recent.length) : 0,
    workouts: totals.workouts,
  }
}

export function detectPlateau(entries = []) {
  const weights = entries
    .map(entry => Number(entry.weight))
    .filter(weight => Number.isFinite(weight) && weight > 0)
    .slice(-4)

  if (weights.length < 4) return { plateau: false, message: 'Not enough weight data yet.' }

  const min = Math.min(...weights)
  const max = Math.max(...weights)
  const plateau = Math.abs(max - min) <= 1

  return {
    plateau,
    message: plateau ? 'Weight trend looks flat over the last 4 check-ins.' : 'Weight is still moving.',
  }
}
