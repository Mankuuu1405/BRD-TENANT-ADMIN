import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#2563eb', '#22c55e', '#f43f5e', '#f59e0b']

export default function LoanStatusPieChart({ data }) {
  return (
    <div className="min-h-[240px]">
      <ResponsiveContainer width="100%" aspect={1}>
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius="80%">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#0f172a' }}
            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
