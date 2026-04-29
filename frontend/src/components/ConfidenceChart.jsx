import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontFamily: 'DM Sans, sans-serif'
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
        <p style={{ color: 'var(--accent-cyan)', fontSize: '18px', fontWeight: 700, fontFamily: 'DM Mono, monospace' }}>
          {payload[0].value.toFixed(1)}%
        </p>
      </div>
    )
  }
  return null
}

function ConfidenceChart({ probabilities, prediction }) {
  const data = Object.entries(probabilities).map(([name, value]) => ({
    name,
    value: parseFloat(value)
  }))

  const getColor = (name) => {
    if (name === prediction) return '#00d4ff'
    return '#1e2d47'
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="label">Diagnostic Confidence</p>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: 600 }}>
            Class Probabilities
          </h3>
        </div>
        <div style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--accent-cyan)',
          lineHeight: 1
        }}>
          {data.find(d => d.name === prediction)?.value.toFixed(1)}%
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'DM Mono' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,212,255,0.04)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={getColor(entry.name)}
                stroke={entry.name === prediction ? 'rgba(0,212,255,0.4)' : 'transparent'}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '8px', textAlign: 'center' }}>
        Highlighted bar indicates model prediction
      </p>
    </div>
  )
}

export default ConfidenceChart