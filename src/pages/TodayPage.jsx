import { Link } from 'react-router-dom'
import useTrackerStore from '../store/useTrackerStore'
import { getTodayKey } from '../lib/dates'

export default function TodayPage() {
  const profile = useTrackerStore(s => s.profile)
  const getTodayEntry = useTrackerStore(s => s.getTodayEntry)

  const today = getTodayKey()
  const entry = getTodayEntry()

  const cards = [
    { label: 'Weight', value: entry.weight || '—', suffix: entry.weight ? ' lbs' : '' },
    { label: 'Calories', value: entry.calories || 0, suffix: ` / ${profile.calorieGoal}` },
    { label: 'Protein', value: entry.protein || 0, suffix: `g / ${profile.proteinGoal}g` },
    { label: 'Steps', value: entry.steps || 0, suffix: ` / ${profile.stepGoal}` },
  ]

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Today</h2>
          <p>{today}</p>
        </div>
        <Link className="primary-button" to="/log">Log today</Link>
      </div>

      <div className="card-grid">
        {cards.map(card => (
          <div key={card.label} className="panel stat-card">
            <span className="eyebrow">{card.label}</span>
            <strong>{card.value}{card.suffix}</strong>
          </div>
        ))}
      </div>

      <div className="panel">
        <span className="eyebrow">Workout status</span>
        <strong>{entry.workoutCompleted ? 'Completed' : 'Not logged yet'}</strong>
        <p>{entry.workoutType || 'No workout type entered yet.'}</p>
      </div>

      <div className="panel">
        <span className="eyebrow">Notes</span>
        <p>{entry.notes || 'No notes for today yet.'}</p>
      </div>
    </section>
  )
}
