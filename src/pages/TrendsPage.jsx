import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts'
import useTrackerStore from '../store/useTrackerStore'
import { formatDate, getDayLabel } from '../lib/dates'

const ranges = [7, 30]

function TrendCard({ title, children }) {
  return (
    <div className="panel chart-panel">
      <span className="eyebrow">{title}</span>
      {children}
    </div>
  )
}

export default function TrendsPage() {
  const [range, setRange] = useState(7)
  const trendRows = useTrackerStore(s => s.getTrendData(range))

  const data = useMemo(() => trendRows.map(item => ({
    ...item,
    day: range === 7 ? getDayLabel(item.date) : formatDate(item.date),
  })), [range, trendRows])

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Trends</h2>
          <p>Momentum over time</p>
        </div>
        <div className="segmented-control" role="tablist" aria-label="Trend range">
          {ranges.map(option => (
            <button
              key={option}
              type="button"
              className={`segment ${range === option ? 'active' : ''}`}
              onClick={() => setRange(option)}
            >
              {option} days
            </button>
          ))}
        </div>
      </div>

      <div className="card-grid compact-stats">
        <div className="panel compact-stat"><span className="eyebrow">Avg calories</span><strong>{Math.round(data.reduce((sum, item) => sum + item.calories, 0) / data.length || 0)}</strong></div>
        <div className="panel compact-stat"><span className="eyebrow">Avg protein</span><strong>{Math.round(data.reduce((sum, item) => sum + item.protein, 0) / data.length || 0)}g</strong></div>
        <div className="panel compact-stat"><span className="eyebrow">Avg steps</span><strong>{Math.round(data.reduce((sum, item) => sum + item.steps, 0) / data.length || 0)}</strong></div>
        <div className="panel compact-stat"><span className="eyebrow">Workouts</span><strong>{data.reduce((sum, item) => sum + item.workouts, 0)}</strong></div>
      </div>

      <TrendCard title="Weight trend">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2f3640" />
            <XAxis dataKey="day" stroke="#94a3b8" minTickGap={range === 30 ? 24 : 8} />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={3} dot={range === 7} />
          </LineChart>
        </ResponsiveContainer>
      </TrendCard>

      <div className="two-col-grid">
        <TrendCard title="Calories">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2f3640" />
              <XAxis dataKey="day" stroke="#94a3b8" minTickGap={range === 30 ? 24 : 8} />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="calories" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </TrendCard>

        <TrendCard title="Protein and steps">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2f3640" />
              <XAxis dataKey="day" stroke="#94a3b8" minTickGap={range === 30 ? 24 : 8} />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="protein" stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="steps" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </TrendCard>
      </div>
    </section>
  )
}
