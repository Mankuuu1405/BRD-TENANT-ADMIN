import { useEffect, useState } from 'react'
import { rolesApi } from '../utils/api.js'

export default function RolesPermissions() {
  const [roles, setRoles] = useState([])
  const [creating, setCreating] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', description: '' }) // Changed from role_name to name to match backend

  const load = async () => {
    const res = await rolesApi.list()
    if (res.ok) setRoles(res.data)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Roles & Permissions</div>
        <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>setCreating(true)}>Create Role</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Role Name</th>
              <th className="px-4 py-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(r => (
              <tr key={r.role_id || r.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{r.role_name || r.name}</td>
                <td className="px-4 py-3">{r.description}</td>
              </tr>
            ))}
            {!roles.length && <tr><td colSpan="2" className="text-center py-4">No roles found</td></tr>}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Create Role</div>
            <div className="mt-3 space-y-3">
              <label className="block">
                <div className="text-sm text-gray-700">Role Name</div>
                <input value={newRole.name} onChange={(e)=>setNewRole({ ...newRole, name: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Description</div>
                <input value={newRole.description} onChange={(e)=>setNewRole({ ...newRole, description: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setCreating(false)}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={async ()=>{
                  const res = await rolesApi.create(newRole)
                  if (res.ok) { setCreating(false); setNewRole({ name: '', description: '' }); load() }
                }}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}