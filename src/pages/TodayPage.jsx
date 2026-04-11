import { Link } from 'react-router-dom'
import useTrackerStore from '../store/useTrackerStore'
import { formatDate, getTodayKey } from '../lib/dates'
import { getCompletion } from '../lib/metrics'

function GoalCard({ label, value, suffix = '', goal, tone = 'green' }) {
  const completion = getCompletion(value, goal)

  return (
    <div className={`panel stat-card ${tone}`}>
      <span className="eyebrow">{label}</span>
      <strong>{value || 0}{suffix}</strong>
      {goal ? <p>{completion}% of goal</p> : null}
      {goal ? (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${completion}%` }} />
        </div>
      ) : null}
    </div>
  )
}

export default function TodayPage() {
  const profile = useTrackerStore(s => s.profile)
  const getTodayEntry = useTrackerStore(s => s.getTodayEntry)

  const today = getTodayKey()
  const entry = getTodayEntry()
  const caloriesRemaining = Math.max(0, profile.calorieGoal - Number(entry.calories || 0))
  const proteinRemaining = Math.max(0, profile.proteinGoal - Number(entry.protein || 0))
  const stepsRemaining = Math.max(0, profile.stepGoal - Number(entry.steps || 0))

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Today</h2>
          <p>{formatDate(today)}</p>
        </div>
        <Link className="primary-button" to="/log">Log today</Link>
      </div>

      <div className="card-grid">
        <GoalCard label="Weight" value={entry.weight || '—'} suffix={entry.weight ? ' lbs' : ''} tone="neutral" />
        <GoalCard label="Calories" value={entry.calories || 0} goal={profile.calorieGoal} />
        <GoalCard label="Protein" value={entry.protein || 0} suffix="g" goal={profile.proteinGoal} />
        <GoalCard label="Steps" value={entry.steps || 0} goal={profile.stepGoal} />
      </div>

      <div className="two-col-grid">
        <div className="panel">
          <span className="eyebrow">Today at a glance</span>
          <ul className="summary-list">
            <li><span>Calories left</span><strong>{caloriesRemaining}</strong></li>
            <li><span>Protein left</span><strong>{proteinRemaining}g</strong></li>
            <li><span>Steps left</span><strong>{stepsRemaining}</strong></li>
            <li><span>Workout</span><strong>{entry.workoutCompleted ? 'Done' : 'Pending'}</strong></li>
          </ul>
        </div>

        <div className="panel">
          <span className="eyebrow">Workout status</span>
          <strong>{entry.workoutCompleted ? entry.workoutType || 'Completed' : 'Not logged yet'}</strong>
          <p>{entry.workoutNotes || 'No workout notes entered yet.'}</p>
        </div>
      </div>

      <div className="panel">
        <span className="eyebrow">Notes</span>
        <p>{entry.notes || 'No notes for today yet.'}</p>
      </div>
    </section>
  )
}
