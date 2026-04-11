export function downloadBackup(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  anchor.href = url
  anchor.download = `wolf-tracker-backup-${stamp}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function readBackupFile(file) {
  const text = await file.text()
  return JSON.parse(text)
}
