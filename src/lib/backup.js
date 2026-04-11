const REQUIRED_TOP_LEVEL_KEYS = ['profile', 'entries']

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
  const payload = JSON.parse(text)
  validateBackupPayload(payload)
  return payload
}

export function validateBackupPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Backup file is not a valid object.')
  }

  for (const key of REQUIRED_TOP_LEVEL_KEYS) {
    if (!(key in payload)) {
      throw new Error(`Backup file is missing required key: ${key}`)
    }
  }

  if (!Array.isArray(payload.entries)) {
    throw new Error('Backup entries must be an array.')
  }

  return true
}
