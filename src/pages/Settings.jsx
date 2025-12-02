import { useEffect, useState } from 'react'
import { settingsApi } from '../utils/api.js'
import axios from '../utils/axiosInstance.js' // Direct call for specific admin panels

export default function Settings() {
  const [charges, setCharges] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load real settings from AdminPanel apps
  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch Charges & Notification Templates as "Settings"
      const [resCharges, resTemplates] = await Promise.all([
        axios.get('/api/v1/adminpanel/charges/'),
        axios.get('/api/v1/adminpanel/notification-templates/')
      ])
      setCharges(resCharges.data)
      setTemplates(resTemplates.data)
    } catch (e) {
      setError('Unable to load settings from backend')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">System Settings</div>
        <button onClick={load} className="h-9 px-3 rounded-lg bg-primary-600 text-white">Refresh</button>
      </div>
      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Charges Section (Real Data) */}
        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          <div className="text-sm font-medium mb-3">Global Charges (Fees & Penalties)</div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {charges.map(c => (
              <div key={c.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                <div>{c.name} ({c.charge_type})</div>
                <div className="font-semibold">{c.value} {c.is_percentage ? '%' : 'INR'}</div>
              </div>
            ))}
            {!charges.length && <div className="text-gray-500 text-sm">No charges configured</div>}
          </div>
        </div>

        {/* Notifications Section (Real Data) */}
        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          <div className="text-sm font-medium mb-3">Notification Templates</div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {templates.map(t => (
              <div key={t.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                <div>{t.name} ({t.template_type})</div>
                <div className={`px-2 py-0.5 rounded text-xs ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                  {t.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
            {!templates.length && <div className="text-gray-500 text-sm">No templates found</div>}
          </div>
        </div>
      </div>
    </div>
  )
}