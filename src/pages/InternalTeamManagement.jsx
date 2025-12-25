import { useEffect, useState } from 'react'
import { rolesApi } from '../utils/api.js'

export default function InternalTeamManagement() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await rolesApi.list() // Fetches from /api/v1/adminpanel/role-masters/
      if (res.ok) setTeams(res.data)
      setLoading(false)
    }
    load()
  }, [])

  const go = (name) => {
    try { sessionStorage.setItem('selected_dashboard_name', name) } catch {}
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-xl font-semibold">Internal Team Management (Roles)</div>
      
      {loading && <div className="text-gray-500">Loading teams...</div>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {teams.map(t => (
          <button key={t.role_id} className="h-11 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-card px-4 text-left hover:bg-gray-50 flex items-center justify-between" onClick={()=>go(t.role_name)}>
            <span>{t.role_name}</span>
            <span className="text-xs text-gray-400">Manage</span>
          </button>
        ))}
        {!teams.length && !loading && <div>No roles found in backend.</div>}
      </div>
    </div>
  )
}