import { useEffect, useMemo, useState } from 'react'
import { usersApi, rolesApi } from '../utils/api.js'

const statusBadge = (s) => {
  const map = {
    Active: 'bg-[#d1e7dd] text-[#0f5132] border-[#badbcc]',
    Inactive: 'bg-[#f8d7da] text-[#842029] border-[#f5c2c7]',
    'Pending Activation': 'bg-[#fff3cd] text-[#664d03] border-[#ffecb5]'
  }
  return `inline-flex items-center px-2 py-1 rounded-full text-xs border ${map[s] || 'bg-gray-50 text-gray-700 border-gray-200'}`
}

export default function Users() {
  const [items, setItems] = useState([])
  const [roles, setRoles] = useState([])
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone_number: '', role_id: '' })
  const [editingId, setEditingId] = useState(null)
  const [editingRole, setEditingRole] = useState('')

  const load = async () => {
    setError(null)
    const res = await usersApi.list({ search })
    const rr = await rolesApi.list()
    if (rr.ok) setRoles(rr.data)
    if (res.ok) setItems(res.data)
    else setError('Unable to load users')
  }

  useEffect(() => { load() }, [])
  useEffect(() => { const t = setTimeout(()=>load(), 300); return ()=>clearTimeout(t) }, [search])

  const counts = useMemo(() => {
    const c = { Active: 0, Inactive: 0, 'Pending Activation': 0 }
    items.forEach(i => { if (c[i.status] !== undefined) c[i.status]++ })
    return c
  }, [items])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Users</div>
        </div>
        <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>{ setCreating(true); setForm({ name: '', email: '', phone_number: '', role_id: roles[0]?.role_id || '' }) }}>+ Add User</button>
      </div>

      <div className="flex items-center gap-2">
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search name, email, phone" className="h-9 w-72 rounded-lg border border-gray-300 px-3" />
        <div className="ml-auto flex items-center gap-2 text-sm">
          {Object.keys(counts).map(k => (<span key={k} className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{k}: {counts[k]}</span>))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(u => (
              <tr key={u.user_id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.phone_number || '-'}</td>
                <td className="px-4 py-3">
                  {editingId===u.user_id ? (
                    <select value={editingRole} onChange={(e)=>setEditingRole(e.target.value)} className="h-9 rounded-lg border border-gray-300 px-3">
                      {roles.map(r => (<option key={r.role_id} value={r.role_id}>{r.role_name}</option>))}
                    </select>
                  ) : (
                    <span>{u.role_name}</span>
                  )}
                </td>
                <td className="px-4 py-3"><span className={statusBadge(u.status)}>{u.status}</span></td>
                <td className="px-4 py-3 flex gap-2">
                  {editingId===u.user_id ? (
                    <>
                      <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={()=>{ setEditingId(null); setEditingRole('') }}>Cancel</button>
                      <button className="h-8 px-3 rounded-lg bg-primary-600 text-white" onClick={async ()=>{ const r = await usersApi.update(u.user_id, { role_id: editingRole }); if (r.ok) { setEditingId(null); setEditingRole(''); load() } }}>Save</button>
                    </>
                  ) : (
                    <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={()=>{ setEditingId(u.user_id); setEditingRole(roles.find(r=>r.role_name===u.role_name)?.role_id || roles[0]?.role_id || '') }}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Add User</div>
            <div className="mt-3 space-y-3">
              <label className="block">
                <div className="text-sm text-gray-700">Name</div>
                <input value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Email</div>
                <input type="email" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Phone</div>
                <input value={form.phone_number} onChange={(e)=>setForm({ ...form, phone_number: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Role</div>
                <select value={form.role_id} onChange={(e)=>setForm({ ...form, role_id: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                  {roles.map(r => (<option key={r.role_id} value={r.role_id}>{r.role_name}</option>))}
                </select>
              </label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setCreating(false)}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={async ()=>{ const r = await usersApi.create(form); if (r.ok) { setCreating(false); load() } }}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}