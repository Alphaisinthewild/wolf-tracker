import { useMemo } from 'react'
import useTrackerStore from '../store/useTrackerStore'
import { exportEntriesToCsv } from '../lib/exporters'

function MeasurementRow({ label, value, unit }) {
  return (
    <li>
      <span>{label}</span>
      <strong>{value ? `${value} ${unit}` : '—'}</strong>
    </li>
  )
}

export default function ProgressPage() {
  const profile = useTrackerStore(s => s.profile)
  const entries = useTrackerStore(s => s.entries)
  const progress = useTrackerStore(s => s.getProgressStats())
  const latestMeasurements = useTrackerStore(s => s.getLatestMeasurements())
  const latestPhotos = useTrackerStore(s => s.getLatestPhotos())

  const allEntries = useMemo(() => Object.values(entries).sort((a, b) => a.date.localeCompare(b.date)), [entries])

  const measurementUnit = profile.unitSystem === 'metric' ? 'cm' : 'in'
  const weightUnit = profile.unitSystem === 'metric' ? 'kg' : 'lbs'

  const measurementHistory = useMemo(() => Object.values(entries)
    .filter(entry => Object.values(entry.measurements || {}).some(Boolean))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6), [entries])

  const photoHistory = useMemo(() => Object.values(entries)
    .filter(entry => Array.isArray(entry.photos) && entry.photos.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4), [entries])

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Progress</h2>
          <p>{profile.startingWeight} {weightUnit} to {profile.targetWeight} {weightUnit}</p>
        </div>
        <button type="button" className="secondary-button" onClick={() => exportEntriesToCsv(allEntries)}>Export CSV</button>
      </div>

      <div className="card-grid">
        <div className="panel stat-card"><span className="eyebrow">Current</span><strong>{progress.currentWeight} {weightUnit}</strong></div>
        <div className="panel stat-card"><span className="eyebrow">Lost</span><strong>{progress.weightLost.toFixed(1)} {weightUnit}</strong></div>
        <div className="panel stat-card"><span className="eyebrow">Remaining</span><strong>{Math.max(0, progress.remaining).toFixed(1)} {weightUnit}</strong></div>
        <div className="panel stat-card"><span className="eyebrow">Progress</span><strong>{progress.progressPercent}%</strong></div>
        <div className="panel stat-card"><span className="eyebrow">Streak</span><strong>{progress.currentStreak} day{progress.currentStreak === 1 ? '' : 's'}</strong></div>
        <div className="panel stat-card"><span className="eyebrow">Adherence</span><strong>{progress.adherenceScore}%</strong></div>
      </div>

      <div className="two-col-grid">
        <div className="panel">
          <span className="eyebrow">Latest measurements</span>
          <ul className="summary-list">
            <MeasurementRow label="Waist" value={latestMeasurements.waist} unit={measurementUnit} />
            <MeasurementRow label="Chest" value={latestMeasurements.chest} unit={measurementUnit} />
            <MeasurementRow label="Arms" value={latestMeasurements.arms} unit={measurementUnit} />
            <MeasurementRow label="Thighs" value={latestMeasurements.thighs} unit={measurementUnit} />
          </ul>
        </div>

        <div className="panel">
          <span className="eyebrow">Latest photo check-in</span>
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

      <div className="two-col-grid">
        <div className="panel">
          <span className="eyebrow">Milestones</span>
          {progress.milestones.length > 0 ? (
            <div className="history-list">
              {progress.milestones.map(milestone => (
                <div key={milestone} className="history-card">
                  <strong>{milestone}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No milestone reached yet. Keep stacking days.</p>
          )}
        </div>

        <div className="panel">
          <span className="eyebrow">Measurement history</span>
          {measurementHistory.length > 0 ? (
            <div className="history-list">
              {measurementHistory.map(entry => (
                <div key={entry.date} className="history-card">
                  <strong>{entry.date}</strong>
                  <p>Waist {entry.measurements.waist || '—'} · Chest {entry.measurements.chest || '—'} · Arms {entry.measurements.arms || '—'} · Thighs {entry.measurements.thighs || '—'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No measurement history yet.</p>
          )}
        </div>

        <div className="panel">
          <span className="eyebrow">Photo history</span>
          {photoHistory.length > 0 ? (
            <div className="history-list">
              {photoHistory.map(entry => (
                <div key={entry.date} className="history-card">
                  <strong>{entry.date}</strong>
                  <p>{entry.photos.length} saved photo view(s)</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No photo history yet.</p>
          )}
        </div>
      </div>
    </section>
  )
}
