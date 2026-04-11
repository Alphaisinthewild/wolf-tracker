import { useState } from 'react'
import useTrackerStore from '../store/useTrackerStore'

export default function SettingsPage() {
  const profile = useTrackerStore(s => s.profile)
  const saveProfile = useTrackerStore(s => s.saveProfile)
  const [form, setForm] = useState(profile)

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

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p>Goals and baseline.</p>
        </div>
      </div>

      <form className="panel form-panel" onSubmit={onSubmit}>
        <div className="form-grid">
          <label><span>Starting weight</span><input type="number" name="startingWeight" value={form.startingWeight} onChange={updateField} /></label>
          <label><span>Target weight</span><input type="number" name="targetWeight" value={form.targetWeight} onChange={updateField} /></label>
          <label><span>Calorie goal</span><input type="number" name="calorieGoal" value={form.calorieGoal} onChange={updateField} /></label>
          <label><span>Protein goal</span><input type="number" name="proteinGoal" value={form.proteinGoal} onChange={updateField} /></label>
          <label><span>Step goal</span><input type="number" name="stepGoal" value={form.stepGoal} onChange={updateField} /></label>
        </div>
        <button type="submit" className="primary-button">Save goals</button>
      </form>
    </section>
  )
}
