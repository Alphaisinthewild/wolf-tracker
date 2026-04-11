import { useEffect, useState } from 'react'
import useTrackerStore from '../store/useTrackerStore'
import { getTodayKey } from '../lib/dates'

const baseForm = {
  date: getTodayKey(),
  weight: '',
  calories: '',
  protein: '',
  steps: '',
  workoutCompleted: false,
  workoutType: '',
  workoutNotes: '',
  supplements: '',
  notes: '',
}

export default function DailyLogPage() {
  const loadEntry = useTrackerStore(s => s.loadEntry)
  const saveDailyEntry = useTrackerStore(s => s.saveDailyEntry)
  const [form, setForm] = useState(baseForm)

  useEffect(() => {
    loadEntry(form.date).then(entry => setForm(entry))
  }, [form.date, loadEntry])

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    await saveDailyEntry(form)
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Daily Log</h2>
          <p>One clean entry per day.</p>
        </div>
      </div>

      <form className="panel form-panel" onSubmit={onSubmit}>
        <div className="form-grid">
          <label>
            <span>Date</span>
            <input type="date" name="date" value={form.date} onChange={updateField} />
          </label>
          <label>
            <span>Weight</span>
            <input type="number" step="0.1" name="weight" value={form.weight} onChange={updateField} />
          </label>
          <label>
            <span>Calories</span>
            <input type="number" name="calories" value={form.calories} onChange={updateField} />
          </label>
          <label>
            <span>Protein</span>
            <input type="number" name="protein" value={form.protein} onChange={updateField} />
          </label>
          <label>
            <span>Steps</span>
            <input type="number" name="steps" value={form.steps} onChange={updateField} />
          </label>
          <label className="checkbox-row">
            <input type="checkbox" name="workoutCompleted" checked={form.workoutCompleted} onChange={updateField} />
            <span>Workout completed</span>
          </label>
          <label>
            <span>Workout type</span>
            <input type="text" name="workoutType" value={form.workoutType} onChange={updateField} />
          </label>
          <label className="full-width">
            <span>Workout notes</span>
            <textarea name="workoutNotes" rows="3" value={form.workoutNotes} onChange={updateField} />
          </label>
          <label className="full-width">
            <span>Supplements / meds</span>
            <input type="text" name="supplements" value={form.supplements} onChange={updateField} />
          </label>
          <label className="full-width">
            <span>General notes</span>
            <textarea name="notes" rows="4" value={form.notes} onChange={updateField} />
          </label>
        </div>
        <button type="submit" className="primary-button">Save entry</button>
      </form>
    </section>
  )
}
