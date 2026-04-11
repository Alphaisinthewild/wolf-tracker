import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import useTrackerStore from '../store/useTrackerStore'
import { getRecommendedGoals, unitOptions } from '../lib/onboarding'

export default function SetupPage() {
  const profile = useTrackerStore(s => s.profile)
  const hasCompletedSetup = useTrackerStore(s => s.hasCompletedSetup)
  const completeSetup = useTrackerStore(s => s.completeSetup)
  const [form, setForm] = useState(profile)
  const recommended = useMemo(
    () => getRecommendedGoals(form.startingWeight, form.unitSystem),
    [form.startingWeight, form.unitSystem],
  )

  if (hasCompletedSetup) {
    return <Navigate to="/" replace />
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm(current => ({
      ...current,
      [name]: ['unitSystem'].includes(name) ? value : Number(value),
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
            <label>
              <span>Units</span>
              <select name="unitSystem" value={form.unitSystem} onChange={updateField}>
                {unitOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label><span>Starting weight</span><input type="number" name="startingWeight" value={form.startingWeight} onChange={updateField} /></label>
            <label><span>Target weight</span><input type="number" name="targetWeight" value={form.targetWeight} onChange={updateField} /></label>
            <label><span>Calorie goal</span><input type="number" name="calorieGoal" value={form.calorieGoal} onChange={updateField} placeholder={String(recommended.calorieGoal)} /></label>
            <label><span>Protein goal</span><input type="number" name="proteinGoal" value={form.proteinGoal} onChange={updateField} placeholder={String(recommended.proteinGoal)} /></label>
            <label><span>Step goal</span><input type="number" name="stepGoal" value={form.stepGoal} onChange={updateField} placeholder={String(recommended.stepGoal)} /></label>
          </div>
          <div className="panel inset-panel recommendation-panel">
            <span className="eyebrow">Recommended defaults</span>
            <p className="muted-copy">Calories: {recommended.calorieGoal} · Protein: {recommended.proteinGoal} · Steps: {recommended.stepGoal}</p>
          </div>
          <div className="button-row left-on-mobile">
            <button type="submit" className="primary-button">Start tracking</button>
          </div>
        </form>
      </div>
    </section>
  )
}
