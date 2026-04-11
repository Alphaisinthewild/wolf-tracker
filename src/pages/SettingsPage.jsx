import { useEffect, useRef, useState } from 'react'
import useTrackerStore from '../store/useTrackerStore'
import { downloadBackup, readBackupFile } from '../lib/backup'

export default function SettingsPage() {
  const profile = useTrackerStore(s => s.profile)
  const entries = useTrackerStore(s => s.entries)
  const saveProfile = useTrackerStore(s => s.saveProfile)
  const importBackup = useTrackerStore(s => s.importBackup)
  const [form, setForm] = useState(profile)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setForm(profile)
  }, [profile])

  const updateField = (event) => {
    const { name, value } = event.target
    setForm(current => ({
      ...current,
      [name]: Number(value),
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

    const payload = await readBackupFile(file)
    await importBackup(payload)
    event.target.value = ''
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
          <span className="eyebrow">Backup</span>
          <h3 className="section-title">Protect local data</h3>
          <p className="muted-copy">Export a JSON backup anytime, then import it later on this device or another one.</p>
          <div className="stack-actions">
            <button type="button" className="secondary-button" onClick={handleExport}>Export backup</button>
            <button type="button" className="secondary-button" onClick={handleImportClick}>Import backup</button>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden-input" onChange={handleImportChange} />
          </div>
        </div>
      </div>
    </section>
  )
}
