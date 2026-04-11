export function summarizeBackup(payload) {
  return {
    entryCount: Array.isArray(payload?.entries) ? payload.entries.length : 0,
    exportedAt: payload?.exportedAt || 'Unknown',
    hasPhotos: Array.isArray(payload?.entries) ? payload.entries.some(entry => Array.isArray(entry.photos) && entry.photos.length > 0) : false,
  }
}
