import { useMemo } from 'react'

export default function InternalTeamManagement() {
  const items = useMemo(() => [
    'Legal & Verification',
    'Fraud Team',
    'Valuation',
    'CRM & Sales',
    'Finance'
  ], [])

  const go = (name) => {
    try { sessionStorage.setItem('selected_dashboard_name', name) } catch {}
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))
    window.dispatchEvent(new CustomEvent('dashboard-refresh'))
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Internal Team Management</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(n => (
          <button key={n} className="h-11 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-card px-4 text-left hover:bg-gray-50" onClick={()=>go(n)}>{n}</button>
        ))}
      </div>
    </div>
  )
}
