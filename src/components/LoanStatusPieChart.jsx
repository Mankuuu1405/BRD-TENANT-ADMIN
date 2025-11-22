import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#2563eb', '#22c55e', '#f43f5e', '#f59e0b']

export default function LoanStatusPieChart({ data }) {
  return (
    <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
      <div className="text-sm font-medium mb-2 text-gray-900">Loan Status Distribution</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, color: '#0f172a' }}
              labelStyle={{ color: '#0f172a', fontWeight: 600 }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}