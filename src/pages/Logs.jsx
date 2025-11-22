import { useEffect, useState } from 'react'
import { logsApi } from '../utils/api.js'

function formatRelative(ts) {
  const d = new Date(ts)
  return d.toLocaleString()
}

export default function Logs() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setError(null)
    const res = await logsApi.list({ search })
    if (res.ok) setItems(res.data)
    else setError('Unable to load logs')
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Logs</div>
        </div>
        <div className="flex items-center gap-2">
          <input value={search} onChange={(e)=>setSearch(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') load() }} placeholder="Search summary or event type" className="h-9 w-72 rounded-lg border border-gray-300 px-3" />
          <button onClick={load} className="h-9 px-3 rounded-lg border border-gray-200">Search</button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}

      <div className="space-y-3">
        {items.map(l => (
          <div key={l.log_id} className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
            <div className="font-medium">{l.summary}</div>
            <div className="text-sm text-gray-600">{l.actor_user_role || 'Admin'} • {formatRelative(l.timestamp)} • {l.event_type}</div>
          </div>
        ))}
      </div>
    </div>
  )
}