export default function KPICard({ icon, title, value, trend }) {
  const Icon = icon
  return (
    <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-lg bg-primary-50 text-primary-700 grid place-items-center">
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        {trend != null && <div className="text-green-600 text-sm">{trend}</div>}
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
}