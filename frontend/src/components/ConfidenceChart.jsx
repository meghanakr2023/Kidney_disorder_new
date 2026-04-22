import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function ConfidenceChart({ probabilities, prediction }) {
  const data = Object.entries(probabilities).map(([name, value]) => ({
    name,
    value: parseFloat(value)
  }))

  const getColor = (name) => {
    if (name === prediction) return '#22c55e'
    return '#475569'
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4">

      <h3 className="text-white font-semibold mb-4">Confidence by Class</h3>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>

          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#475569' }}
          />

          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#475569' }}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#f1f5f9'
            }}
            formatter={(value) => [`${value}%`, 'Confidence']}
          />

          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getColor(entry.name)} />
            ))}
          </Bar>

        </BarChart>
      </ResponsiveContainer>

      <p className="text-slate-400 text-xs mt-2 text-center">
        Green bar = predicted class
      </p>

    </div>
  )
}

export default ConfidenceChart