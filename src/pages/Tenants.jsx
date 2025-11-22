import { useEffect, useMemo, useState } from 'react'
import { tenantsApi } from '../utils/api.js'

const statusBadge = (s) => {
  const map = {
    Active: 'bg-[#d1e7dd] text-[#0f5132] border-[#badbcc]',
    Inactive: 'bg-[#f8d7da] text-[#842029] border-[#f5c2c7]',
    Suspended: 'bg-[#fff3cd] text-[#664d03] border-[#ffecb5]',
    Trial: 'bg-primary-50 text-primary-700 border-primary-200'
  }
  return `inline-flex items-center px-2 py-1 rounded-full text-xs border ${map[s] || 'bg-gray-50 text-gray-700 border-gray-200'}`
}

export default function Tenants() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState({ company_name: '', email: '', phone_number: '', status: 'Trial', subscription_plan: 'Standard' })

  const load = async () => {
    setError(null)
    const res = await tenantsApi.list({ search })
    if (res.ok) setItems(res.data)
    else setError('Unable to load tenants')
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const t = setTimeout(() => load(), 300)
    return () => clearTimeout(t)
  }, [search])

  const counts = useMemo(() => {
    const c = { Active: 0, Inactive: 0, Suspended: 0, Trial: 0 }
    items.forEach(i => { if (c[i.status] !== undefined) c[i.status]++ })
    return c
  }, [items])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Tenants</div>
        </div>
        <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={() => { setCreating(true); setForm({ company_name: '', email: '', phone_number: '', status: 'Trial', subscription_plan: 'Standard' }) }}>+ Add Tenant</button>
      </div>

      <div className="flex items-center gap-2">
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search company or email" className="h-9 w-72 rounded-lg border border-gray-300 px-3" />
        <div className="ml-auto flex items-center gap-2 text-sm">
          {Object.keys(counts).map(k => (<span key={k} className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{k}: {counts[k]}</span>))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Users</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(t => (
              <tr key={t.tenant_id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{t.company_name}</td>
                <td className="px-4 py-3">{t.email}</td>
                <td className="px-4 py-3">{t.phone_number || '-'}</td>
                <td className="px-4 py-3">{t.user_count}</td>
                <td className="px-4 py-3"><span className={statusBadge(t.status)}>{t.status}</span></td>
                <td className="px-4 py-3 flex gap-2">
                  <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={()=>setEditing(t)}>Edit</button>
                  <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={()=>alert(`View /tenants/${t.tenant_id}/details`)}>View</button>
                  <button className="h-8 px-3 rounded-lg border border-red-200 text-red-700" onClick={()=>setDeleting(t)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Add Tenant</div>
            <div className="mt-3 space-y-3">
              <label className="block">
                <div className="text-sm text-gray-700">Company Name</div>
                <input value={form.company_name} onChange={(e)=>setForm({ ...form, company_name: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Email</div>
                <input type="email" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Phone Number</div>
                <input value={form.phone_number} onChange={(e)=>setForm({ ...form, phone_number: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" placeholder="+919876543210" />
              </label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setCreating(false)}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={async ()=>{ const r = await tenantsApi.create(form); if (r.ok) { setCreating(false); load() } }}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Edit Tenant</div>
            <div className="mt-3 space-y-3">
              <label className="block">
                <div className="text-sm text-gray-700">Email</div>
                <input type="email" value={editing.email} onChange={(e)=>setEditing({ ...editing, email: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Phone Number</div>
                <input value={editing.phone_number || ''} onChange={(e)=>setEditing({ ...editing, phone_number: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Status</div>
                <select value={editing.status} onChange={(e)=>setEditing({ ...editing, status: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                  {['Active','Inactive','Suspended','Trial'].map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
              </label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setEditing(null)}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={async ()=>{ const r = await tenantsApi.update(editing.tenant_id, { email: editing.email, phone_number: editing.phone_number, status: editing.status }); if (r.ok) { setEditing(null); load() } }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-md rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Delete Tenant</div>
            <div className="mt-2 text-sm text-gray-700">Are you sure you want to delete "{deleting.company_name}"?</div>
            <div className="mt-3 flex justify-end gap-2">
              <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setDeleting(null)}>Cancel</button>
              <button className="h-9 px-3 rounded-lg bg-red-600 text-white" onClick={async ()=>{ const r = await tenantsApi.delete(deleting.tenant_id); if (r.ok) { setDeleting(null); load() } }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}