function escapeCsv(value) {
  const stringValue = String(value ?? '')
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }
  return stringValue
}

function downloadTextFile(content, filename, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportEntriesToCsv(entries) {
  const rows = [
    ['date', 'weight', 'calories', 'protein', 'steps', 'workoutCompleted', 'workoutType', 'waist', 'chest', 'arms', 'thighs'],
    ...entries.map(entry => [
      entry.date,
      entry.weight,
      entry.calories,
      entry.protein,
      entry.steps,
      entry.workoutCompleted,
      entry.workoutType,
      entry.measurements?.waist,
      entry.measurements?.chest,
      entry.measurements?.arms,
      entry.measurements?.thighs,
    ]),
  ]

  const csv = rows.map(row => row.map(escapeCsv).join(',')).join('\n')
  downloadTextFile(csv, `wolf-tracker-history-${new Date().toISOString().slice(0, 10)}.csv`)
}
