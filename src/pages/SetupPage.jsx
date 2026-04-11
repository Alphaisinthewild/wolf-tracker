import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import useTrackerStore from '../store/useTrackerStore'

export default function SetupPage() {
  const profile = useTrackerStore(s => s.profile)
  const hasCompletedSetup = useTrackerStore(s => s.hasCompletedSetup)
  const completeSetup = useTrackerStore(s => s.completeSetup)
  const [form, setForm] = useState(profile)

  if (hasCompletedSetup) {
    return <Navigate to="/" replace />
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm(current => ({
      ...current,
      [name]: Number(value),
    }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    await completeSetup(form)
  }

  return (
    <section className="setup-shell">
      <div className="setup-card panel">
        <span className="eyebrow">Welcome</span>
        <h2>Set up Wolf Tracker</h2>
        <p className="muted-copy">Start with your baseline and goals. You can change any of this later.</p>

        <form onSubmit={onSubmit} className="form-panel">
          <div className="form-grid">
            <label><span>Starting weight</span><input type="number" name="startingWeight" value={form.startingWeight} onChange={updateField} /></label>
            <label><span>Target weight</span><input type="number" name="targetWeight" value={form.targetWeight} onChange={updateField} /></label>
            <label><span>Calorie goal</span><input type="number" name="calorieGoal" value={form.calorieGoal} onChange={updateField} /></label>
            <label><span>Protein goal</span><input type="number" name="proteinGoal" value={form.proteinGoal} onChange={updateField} /></label>
            <label><span>Step goal</span><input type="number" name="stepGoal" value={form.stepGoal} onChange={updateField} /></label>
          </div>
          <div className="button-row left-on-mobile">
            <button type="submit" className="primary-button">Start tracking</button>
          </div>
        </form>
      </div>
    </section>
  )
}
