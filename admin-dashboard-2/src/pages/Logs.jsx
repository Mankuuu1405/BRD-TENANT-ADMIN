import { useEffect, useMemo, useState } from 'react'
// import { logsApi } from '../services/api'

function formatRelative(ts) {
  const d = new Date(ts)
  return d.toLocaleString()
}

export default function Logs() {
  const [items, setItems] = useState([])
  const [allItems, setAllItems] = useState([])
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ summary: '', actor_user_role: '', status: 'Approved' })

  const statusFromEvent = (et) => et === 'LOAN_APPROVED' ? 'Approved' : et === 'LOAN_REJECTED' ? 'Rejected' : 'Other'

  const load = async () => {
    setError(null)
    const res = await logsApi.list({ search })
    if (res.ok) {
      setAllItems(res.data)
      const filtered = res.data.filter(l => statusFilter==='All' ? true : statusFromEvent(l.event_type) === statusFilter)
      setItems(filtered)
    } else setError('Unable to load logs')
  }

  useEffect(() => {
    const filtered = allItems.filter(l => statusFilter==='All' ? true : statusFromEvent(l.event_type) === statusFilter)
    setItems(filtered)
  }, [statusFilter, allItems])

  useEffect(() => { load() }, [])

  const counts = useMemo(() => {
    const c = { All: allItems.length, Approved: 0, Rejected: 0 }
    allItems.forEach(l => { const s = statusFromEvent(l.event_type); if (c[s] != null) c[s]++ })
    return c
  }, [allItems])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Manage Logs</div>
        </div>
        
      </div>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}

      <div className="flex items-center gap-2">
        {['All','Approved','Rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`h-9 px-3 rounded-full border ${statusFilter===s ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700'}`}>{s}{s!=='All' && ` (${counts[s]})`}</button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input value={search} onChange={(e)=>setSearch(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') load() }} placeholder="Search summary or event type" className="h-9 w-72 rounded-lg border border-gray-300 px-3" />
          <button onClick={load} className="h-9 px-3 rounded-lg border border-gray-200">Search</button>
          <button onClick={()=>{ setCreating(true); setForm({ summary: '', actor_user_role: '', status: 'Approved' }) }} className="h-9 px-3 rounded-lg bg-primary-600 text-white">New Log</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Summary</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(l => (
              <tr key={l.log_id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{l.summary}</td>
                <td className="px-4 py-3">{l.actor_user_role || 'Admin'}</td>
                <td className="px-4 py-3">{new Date(l.timestamp).toLocaleDateString()}</td>
                <td className="px-4 py-3">{new Date(l.timestamp).toLocaleTimeString()}</td>
                <td className="px-4 py-3">{statusFromEvent(l.event_type)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Add Log</div>
            <div className="mt-3 space-y-3">
              <label className="block">
                <div className="text-sm text-gray-700">Summary</div>
                <input value={form.summary} onChange={(e)=>setForm({ ...form, summary: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Role</div>
                <input value={form.actor_user_role} onChange={(e)=>setForm({ ...form, actor_user_role: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" placeholder="e.g. Analyst" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Status</div>
                <select value={form.status} onChange={(e)=>setForm({ ...form, status: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setCreating(false)}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={async ()=>{
                  const event_type = form.status === 'Approved' ? 'LOAN_APPROVED' : 'LOAN_REJECTED'
                  const r = await logsApi.create({ summary: form.summary, actor_user_role: form.actor_user_role, event_type })
                  if (r.ok) { setCreating(false); load() }
                }}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
