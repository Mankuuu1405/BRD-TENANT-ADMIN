import { useEffect, useMemo, useState } from 'react'
import { usersApi, rolesApi } from '../utils/api.js'

const statusBadge = (s) => {
  const map = {
    true: 'bg-[#d1e7dd] text-[#0f5132] border-[#badbcc]', // Active
    false: 'bg-[#f8d7da] text-[#842029] border-[#f5c2c7]' // Inactive
  }
  return `inline-flex items-center px-2 py-1 rounded-full text-xs border ${map[s] || map[true]}`
}

export default function Users() {
  const [items, setItems] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone_number: '', role_id: '', password: '' })

  const load = async () => {
    setLoading(true)
    const [resUsers, resRoles] = await Promise.all([usersApi.list(), rolesApi.list()])
    if (resUsers.ok) setItems(resUsers.data)
    if (resRoles.ok) setRoles(resRoles.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filteredItems = useMemo(() => items.filter(u => {
    const s = search.toLowerCase()
    return (u.email || '').toLowerCase().includes(s) || (u.name || '').toLowerCase().includes(s)
  }), [items, search])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Users</div>
        <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>setCreating(true)}>+ Add User</button>
      </div>

      <div className="flex items-center gap-2">
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search email or name" className="h-9 w-72 rounded-lg border border-gray-300 px-3" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(u => (
              <tr key={u.user_id || u.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{u.email}</td>
                <td className="px-4 py-3">{u.name || '-'}</td>
                <td className="px-4 py-3">{u.role_name || u.role || '-'}</td>
                <td className="px-4 py-3"><span className={statusBadge(u.is_active)}> {u.is_active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
            {!items.length && !loading && <tr><td colSpan="4" className="text-center py-4">No users found</td></tr>}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Add User</div>
            <div className="mt-3 space-y-3">
              <label className="block"><div className="text-sm text-gray-700">Email</div><input value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <label className="block"><div className="text-sm text-gray-700">Name</div><input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <label className="block"><div className="text-sm text-gray-700">Password</div><input type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <label className="block">
                <div className="text-sm text-gray-700">Role</div>
                <select value={form.role_id} onChange={(e)=>setForm({...form, role_id: e.target.value})} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                    <option value="">Select Role</option>
                    {roles.map(r => <option key={r.role_id || r.id} value={r.role_id || r.id}>{r.role_name || r.name}</option>)}
                </select>
              </label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setCreating(false)}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={async ()=>{
                    const res = await usersApi.create(form)
                    if(res.ok) { setCreating(false); load(); }
                }}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}