import useTrackerStore from '../store/useTrackerStore'

function MeasurementRow({ label, value }) {
  return (
    <li>
      <span>{label}</span>
      <strong>{value ? `${value} in` : '—'}</strong>
    </li>
  )
}

export default function ProgressPage() {
  const profile = useTrackerStore(s => s.profile)
  const progress = useTrackerStore(s => s.getProgressStats())
  const latestMeasurements = useTrackerStore(s => s.getLatestMeasurements())
  const latestPhotos = useTrackerStore(s => s.getLatestPhotos())

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

      <div className="two-col-grid">
        <div className="panel">
          <span className="eyebrow">Latest measurements</span>
          <ul className="summary-list">
            <MeasurementRow label="Waist" value={latestMeasurements.waist} />
            <MeasurementRow label="Chest" value={latestMeasurements.chest} />
            <MeasurementRow label="Arms" value={latestMeasurements.arms} />
            <MeasurementRow label="Thighs" value={latestMeasurements.thighs} />
          </ul>
        </div>

        <div className="panel">
          <span className="eyebrow">Photo progress</span>
          {latestPhotos.length > 0 ? (
            <div className="photo-grid">
              {latestPhotos.map(photo => (
                <figure key={photo.label} className="photo-card">
                  <img src={photo.dataUrl} alt={photo.label} />
                  <figcaption>{photo.label}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No progress photos saved yet.</p>
          )}
        </div>
      </div>
    </section>
  )
}
