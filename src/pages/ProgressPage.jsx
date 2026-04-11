import useTrackerStore from '../store/useTrackerStore'

export default function ProgressPage() {
  const profile = useTrackerStore(s => s.profile)
  const progress = useTrackerStore(s => s.getProgressStats())

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Progress</h2>
          <p>{profile.startingWeight} lbs to {profile.targetWeight} lbs</p>
        </div>
      </div>

      <div className="card-grid">
        <div className="panel stat-card"><span className="eyebrow">Current</span><strong>{progress.currentWeight} lbs</strong></div>
        <div className="panel stat-card"><span className="eyebrow">Lost</span><strong>{progress.weightLost.toFixed(1)} lbs</strong></div>
        <div className="panel stat-card"><span className="eyebrow">Remaining</span><strong>{Math.max(0, progress.remaining).toFixed(1)} lbs</strong></div>
        <div className="panel stat-card"><span className="eyebrow">Progress</span><strong>{progress.progressPercent}%</strong></div>
      </div>
    </section>
  )
}
