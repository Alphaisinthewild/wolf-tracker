export function buildWeeklyNarrative(insights, profile) {
  const parts = []

  parts.push(`Average calories: ${insights.weeklySummary.avgCalories}`)
  parts.push(`Average protein: ${insights.weeklySummary.avgProtein}g`)
  parts.push(`Average steps: ${insights.weeklySummary.avgSteps}`)
  parts.push(`Workouts: ${insights.weeklySummary.workouts}`)

  if (insights.plateau?.plateau) {
    parts.push('Weight trend is flat, consider adjusting calories, activity, or consistency.')
  } else {
    parts.push('Weight trend is still moving.')
  }

  if (profile?.remindersEnabled) {
    parts.push(`Reminder set for ${profile.reminderTime}.`)
  }

  return parts.join('\n')
}
