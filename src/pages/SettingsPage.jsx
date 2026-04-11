import { useEffect, useRef, useState } from 'react'
import useTrackerStore from '../store/useTrackerStore'
import { downloadBackup, readBackupFile } from '../lib/backup'
import { summarizeBackup } from '../lib/importGuard'
import { getNotificationPermission, requestNotificationPermission } from '../lib/notifications'

export default function SettingsPage() {
  const profile = useTrackerStore(s => s.profile)
  const entries = useTrackerStore(s => s.entries)
  const saveProfile = useTrackerStore(s => s.saveProfile)
  const importBackup = useTrackerStore(s => s.importBackup)
  const [form, setForm] = useState(profile)
  const [importPreview, setImportPreview] = useState(null)
  const [importError, setImportError] = useState('')
  const [notificationState, setNotificationState] = useState('checking')
  const fileInputRef = useRef(null)

  useEffect(() => {
    setForm(profile)
  }, [profile])

  useEffect(() => {
    getNotificationPermission().then(setNotificationState)
  }, [])

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : ['reminderTime'].includes(name) ? value : Number(value),
    }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    await saveProfile(form)
  }

  const handleExport = () => {
    downloadBackup({
      exportedAt: new Date().toISOString(),
      profile,
      entries: Object.values(entries),
    })
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setImportError('')
      const payload = await readBackupFile(file)
      setImportPreview(summarizeBackup(payload))
      await importBackup(payload)
    } catch (error) {
      setImportError(error.message || 'Import failed.')
      setImportPreview(null)
    }

    event.target.value = ''
  }

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission()
    setNotificationState(result)
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p>Goals, baseline, and local backups.</p>
        </div>
      </div>

      <div className="two-col-grid">
        <form className="panel form-panel" onSubmit={onSubmit}>
          <div className="form-grid">
            <label><span>Starting weight</span><input type="number" name="startingWeight" value={form.startingWeight} onChange={updateField} /></label>
            <label><span>Target weight</span><input type="number" name="targetWeight" value={form.targetWeight} onChange={updateField} /></label>
            <label><span>Calorie goal</span><input type="number" name="calorieGoal" value={form.calorieGoal} onChange={updateField} /></label>
            <label><span>Protein goal</span><input type="number" name="proteinGoal" value={form.proteinGoal} onChange={updateField} /></label>
            <label><span>Step goal</span><input type="number" name="stepGoal" value={form.stepGoal} onChange={updateField} /></label>
            <label className="checkbox-row full-width">
              <input type="checkbox" name="remindersEnabled" checked={Boolean(form.remindersEnabled)} onChange={updateField} />
              <span>Enable daily reminder</span>
            </label>
            <label><span>Reminder time</span><input type="time" name="reminderTime" value={form.reminderTime || '20:00'} onChange={updateField} /></label>
            <label className="checkbox-row full-width">
              <input
                type="checkbox"
                checked={Boolean(form.setupComplete)}
                onChange={(event) => setForm(current => ({ ...current, setupComplete: event.target.checked }))}
              />
              <span>Setup completed</span>
            </label>
          </div>
          <div className="button-row left-on-mobile">
            <button type="submit" className="primary-button">Save goals</button>
          </div>
        </form>

        <div className="panel">
          <span className="eyebrow">Reminders and backup</span>
          <h3 className="section-title">Protect local data</h3>
          <p className="muted-copy">Export a JSON backup anytime, restore with validation, and enable notifications for check-ins. On iPhone, native local notifications are used through Capacitor.</p>
          <div className="stack-actions">
            <button type="button" className="secondary-button" onClick={handleExport}>Export backup</button>
            <button type="button" className="secondary-button" onClick={handleImportClick}>Import backup</button>
            <button type="button" className="secondary-button" onClick={handleEnableNotifications}>Enable notifications</button>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden-input" onChange={handleImportChange} />
          </div>
          <div className="history-list top-gap">
            <div className="history-card">
              <strong>Notification status</strong>
              <p>{notificationState}</p>
            </div>
            {importPreview ? (
              <div className="history-card">
                <strong>Last import</strong>
                <p>{importPreview.entryCount} entries · exported {importPreview.exportedAt} · photos: {importPreview.hasPhotos ? 'yes' : 'no'}</p>
              </div>
            ) : (
              <div className="history-card">
                <strong>Backup tip</strong>
                <p>Export before big changes or before testing on a new device.</p>
              </div>
            )}
            {importError ? (
              <div className="history-card danger-card">
                <strong>Import error</strong>
                <p>{importError}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
