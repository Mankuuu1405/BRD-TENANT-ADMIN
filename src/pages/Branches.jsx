import { useEffect, useMemo, useState } from 'react'
import { tenantsApi } from '../utils/api.js'

const statusBadge = (s) => {
  const map = {
    Active: 'bg-[#d1e7dd] text-[#0f5132] border-[#badbcc]',
    Inactive: 'bg-[#f8d7da] text-[#842029] border-[#f5c2c7]'
  }
  return `inline-flex items-center px-3 py-1 rounded-full text-sm border ${map[s] || 'bg-gray-50 text-gray-700 border-gray-200'}`
}

export default function Branches() {
  const [tenants, setTenants] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // UI states
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ tenant_id: '', branch_name: '', address: '', contact_person: '', mobile_no: '', email: '', is_active: true })

  const loadData = async () => {
    setLoading(true)
    
    // 1. Tenants Load karein (Dropdown ke liye)
    const resTenants = await tenantsApi.list()
    if (resTenants.ok) setTenants(resTenants.data)

    // 2. Branches Load karein
    const resBranches = await tenantsApi.listBranches()
    if (resBranches.ok) setItems(resBranches.data)
    else setError('Unable to load branches')
    
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const filteredItems = useMemo(() => items.filter(b => {
    const s = search.toLowerCase()
    return (
      (b.branch_name||'').toLowerCase().includes(s) ||
      (b.contact_person||'').toLowerCase().includes(s)
    )
  }), [items, search])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Manage Branches</div>
        </div>
        <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={() => { setCreating(true) }}>+ Add Branch</button>
      </div>

      <div className="flex items-center gap-2">
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search branch" className="h-9 w-72 rounded-lg border border-gray-300 px-3 ml-auto" />
      </div>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Branch Name</th>
              <th className="px-4 py-3">Contact Person</th>
              <th className="px-4 py-3">Contact No</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((b, idx) => (
              <tr key={idx} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{b.branch_name}</td>
                <td className="px-4 py-3">{b.contact_person || '-'}</td>
                <td className="px-4 py-3">{b.mobile_no || '-'}</td>
                <td className="px-4 py-3"><span className={statusBadge(b.is_active ? 'Active' : 'Inactive')}>{b.is_active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
            {!items.length && !loading && (
              <tr><td colSpan="4" className="px-4 py-4 text-center text-gray-600">No branches found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Add Branch</div>
            <div className="mt-3 space-y-3">
              <label className="block">
                <div className="text-sm text-gray-700">Select Tenant</div>
                <select value={form.tenant_id} onChange={(e)=>setForm({...form, tenant_id: e.target.value})} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                    <option value="">Select Tenant</option>
                    {tenants.map(t => <option key={t.tenant_id} value={t.tenant_id}>{t.company_name}</option>)}
                </select>
              </label>
              <label className="block"><div className="text-sm text-gray-700">Branch Name</div><input value={form.branch_name} onChange={(e)=>setForm({...form, branch_name: e.target.value})} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <label className="block"><div className="text-sm text-gray-700">Address</div><input value={form.address} onChange={(e)=>setForm({...form, address: e.target.value})} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setCreating(false)}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={async ()=>{
                    const res = await tenantsApi.createBranch(form)
                    if(res.ok) { setCreating(false); loadData(); }
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}