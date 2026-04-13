import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useTrackerStore from '../store/useTrackerStore'
import { formatDate, getTodayKey } from '../lib/dates'
import { getCompletion } from '../lib/metrics'
import { copyText } from '../lib/copy'
import { buildWeeklyNarrative } from '../lib/summary'

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
  const entries = useTrackerStore(s => s.entries)
  const getTodayEntry = useTrackerStore(s => s.getTodayEntry)
  const getInsights = useTrackerStore(s => s.getInsights)
  const [copied, setCopied] = useState(false)

  const today = getTodayKey()
  const entry = useMemo(() => getTodayEntry(), [entries, getTodayEntry])
  const insights = useMemo(() => getInsights(), [entries, profile, getInsights])
  const caloriesRemaining = Math.max(0, profile.calorieGoal - Number(entry.calories || 0))
  const proteinRemaining = Math.max(0, profile.proteinGoal - Number(entry.protein || 0))
  const stepsRemaining = Math.max(0, profile.stepGoal - Number(entry.steps || 0))

  const handleCopySummary = async () => {
    await copyText(buildWeeklyNarrative(insights, profile))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Today</h2>
          <p>{formatDate(today)}</p>
        </div>
        <div className="header-actions">
          <button type="button" className="secondary-button" onClick={handleCopySummary}>{copied ? 'Copied' : 'Copy summary'}</button>
          <Link className="primary-button" to="/log">Log today</Link>
        </div>
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

      <div className="two-col-grid">
        <div className="panel">
          <span className="eyebrow">Weekly summary</span>
          <ul className="summary-list">
            <li><span>Avg calories</span><strong>{insights.weeklySummary.avgCalories}</strong></li>
            <li><span>Avg protein</span><strong>{insights.weeklySummary.avgProtein}g</strong></li>
            <li><span>Avg steps</span><strong>{insights.weeklySummary.avgSteps}</strong></li>
            <li><span>Workouts</span><strong>{insights.weeklySummary.workouts}</strong></li>
          </ul>
        </div>

        <div className="panel">
          <span className="eyebrow">Prompt</span>
          <strong>{profile.remindersEnabled ? `Check in by ${profile.reminderTime}` : 'Reminders off'}</strong>
          <p>{insights.plateau.message}</p>
        </div>
      </div>

      <div className="panel">
        <span className="eyebrow">Notes</span>
        <p>{entry.notes || 'No notes for today yet.'}</p>
      </div>
    </section>
  )
}
