import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'
import useTrackerStore from '../store/useTrackerStore'
import { getDayLabel } from '../lib/dates'

export default function TrendsPage() {
  const data = useTrackerStore(s => s.getTrendData(7)).map(item => ({
    ...item,
    day: getDayLabel(item.date),
  }))

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Trends</h2>
          <p>Last 7 days</p>
        </div>
      </div>

      <div className="panel chart-panel">
        <span className="eyebrow">Weight trend</span>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2f3640" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="panel chart-panel">
        <span className="eyebrow">Calories</span>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2f3640" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="calories" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
