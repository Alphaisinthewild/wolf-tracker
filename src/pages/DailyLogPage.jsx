import { useEffect, useRef, useState } from 'react'
import useTrackerStore from '../store/useTrackerStore'
import { formatDate, getTodayKey } from '../lib/dates'
import { fileToDataUrl } from '../lib/photos'

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
  measurements: {
    waist: '',
    chest: '',
    arms: '',
    thighs: '',
  },
  photos: [],
}

export default function DailyLogPage() {
  const loadEntry = useTrackerStore(s => s.loadEntry)
  const saveDailyEntry = useTrackerStore(s => s.saveDailyEntry)
  const clearAllData = useTrackerStore(s => s.clearAllData)
  const [selectedDate, setSelectedDate] = useState(baseForm.date)
  const [form, setForm] = useState(baseForm)
  const photoInputRef = useRef(null)

  useEffect(() => {
    loadEntry(selectedDate).then(entry => setForm(entry))
  }, [selectedDate, loadEntry])

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    await saveDailyEntry({ ...form, date: selectedDate })
  }

  const updateMeasurement = (event) => {
    const { name, value } = event.target
    setForm(current => ({
      ...current,
      measurements: {
        ...current.measurements,
        [name]: value,
      },
    }))
  }

  const handlePhotoPick = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const photoPayload = await Promise.all(files.slice(0, 3).map(async (file, index) => ({
      label: ['Front', 'Side', 'Back'][index] || `Photo ${index + 1}`,
      dataUrl: await fileToDataUrl(file),
    })))

    setForm(current => ({
      ...current,
      photos: photoPayload,
    }))

    event.target.value = ''
  }

  const handleResetDemo = async () => {
    await clearAllData()
    const next = await loadEntry(getTodayKey())
    setSelectedDate(getTodayKey())
    setForm(next)
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Daily Log</h2>
          <p>{formatDate(selectedDate)}</p>
        </div>
        <div className="header-actions">
          <button type="button" className="secondary-button" onClick={() => photoInputRef.current?.click()}>Add progress photos</button>
          <button type="button" className="secondary-button" onClick={handleResetDemo}>Reset demo data</button>
        </div>
      </div>

      <form className="panel form-panel" onSubmit={onSubmit}>
        <div className="form-grid">
          <label>
            <span>Date</span>
            <input
              type="date"
              name="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
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
            <input type="text" name="workoutType" value={form.workoutType} onChange={updateField} placeholder="Strength, walk, cardio..." />
          </label>
          <label className="full-width">
            <span>Workout notes</span>
            <textarea name="workoutNotes" rows="3" value={form.workoutNotes} onChange={updateField} />
          </label>
          <label className="full-width">
            <span>Supplements / meds</span>
            <input type="text" name="supplements" value={form.supplements} onChange={updateField} />
          </label>

          <div className="full-width panel inset-panel">
            <span className="eyebrow">Measurements</span>
            <div className="form-grid measurements-grid compact-grid">
              <label><span>Waist</span><input type="number" step="0.1" name="waist" value={form.measurements.waist} onChange={updateMeasurement} /></label>
              <label><span>Chest</span><input type="number" step="0.1" name="chest" value={form.measurements.chest} onChange={updateMeasurement} /></label>
              <label><span>Arms</span><input type="number" step="0.1" name="arms" value={form.measurements.arms} onChange={updateMeasurement} /></label>
              <label><span>Thighs</span><input type="number" step="0.1" name="thighs" value={form.measurements.thighs} onChange={updateMeasurement} /></label>
            </div>
          </div>

          <label className="full-width">
            <span>General notes</span>
            <textarea name="notes" rows="4" value={form.notes} onChange={updateField} />
          </label>
        </div>

        <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden-input" onChange={handlePhotoPick} />

        {form.photos.length > 0 ? (
          <div className="photo-grid form-photo-grid">
            {form.photos.map(photo => (
              <figure key={photo.label} className="photo-card">
                <img src={photo.dataUrl} alt={photo.label} />
                <figcaption>{photo.label}</figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        <div className="button-row">
          <button type="submit" className="primary-button">Save entry</button>
        </div>
      </form>
    </section>
  )
}
