import { useEffect, useMemo, useState } from 'react'

const statusBadge = (s) => {
  const map = {
    Active: 'bg-[#d1e7dd] text-[#0f5132] border-[#badbcc]',
    Inactive: 'bg-[#f8d7da] text-[#842029] border-[#f5c2c7]'
  }
  return `inline-flex items-center px-3 py-1 rounded-full text-sm border ${map[s] || 'bg-gray-50 text-gray-700 border-gray-200'}`
}
import { tenantsApi } from '../utils/api.js'

const LOAN_TYPES = [
  'Payday Loan (Short-term Loan)',
  'Personal Loan (Unsecured)',
  'Business Loan',
  'Group Loan (JLG/SHG Model)',
  'Unsecured Education Loan',
  'Consumer Durable Loan',
  'Loan Against Property (LAP)',
  'Loan Against Shares/Securities',
  'Gold Loan',
  'Vehicle Loan',
  'Secured Education Loan',
  'Supply Chain Finance',
  'Bill/Invoice Discounting',
  'Virtual Card (Buy Now, Buy Later)',
  'Credit Line - OD Facility'
]

export default function Loans() {
  const [tenants, setTenants] = useState([])
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [modalError, setModalError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [form, setForm] = useState({ tenant_id: '', business_name: '', type_of_loan: '', status: 'Active', subcategory: '' })

  const loadTenants = async () => {
    setError(null)
    const res = await tenantsApi.list()
    if (res.ok) {
      setTenants(res.data || [])
      const t1 = (res.data || []).find(x => x.tenant_id==='tenant-001')
      const t2 = (res.data || []).find(x => x.tenant_id==='tenant-002')
      setItems([
        { tenant_id: t1?.tenant_id || 'tenant-001', business_name: t1?.company_name || 'Metro Credit', type_of_loan: 'Personal Loan (Unsecured)', status: 'Active', subcategory: 'Unsecured' },
        { tenant_id: t1?.tenant_id || 'tenant-001', business_name: t1?.company_name || 'Metro Credit', type_of_loan: 'Loan Against Property (LAP)', status: 'Inactive', subcategory: 'Secured' },
        { tenant_id: t2?.tenant_id || 'tenant-002', business_name: t2?.company_name || 'Sunrise Capital', type_of_loan: 'Business Loan', status: 'Active', subcategory: 'Unsecured' }
      ])
    } else setError('Unable to load tenants')
  }

  useEffect(() => { loadTenants() }, [])

  const counts = useMemo(() => {
    const c = { Active: 0, Inactive: 0 }
    items.forEach(i => { if (c[i.status] !== undefined) c[i.status]++ })
    return c
  }, [items])

  const filteredItems = useMemo(() => items.filter(b => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false
    const s = search.trim().toLowerCase()
    if (!s) return true
    return (
      (b.business_name||'').toLowerCase().includes(s) ||
      (b.type_of_loan||'').toLowerCase().includes(s) ||
      (b.subcategory||'').toLowerCase().includes(s) ||
      (b.status||'').toLowerCase().includes(s)
    )
  }), [items, search, statusFilter])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Manage Loan Types</div>
        </div>
        <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={() => {
          setCreating(true)
          setForm({ tenant_id: '', business_name: '', type_of_loan: LOAN_TYPES[0], status: 'Active', subcategory: '' })
        }}>+ Add Loan Type</button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <button className={`px-3 py-1 rounded-full border ${statusFilter==='All' ? 'border-primary-300 text-primary-700 bg-primary-50' : 'border-gray-200 text-gray-700 bg-white'}`} onClick={()=>setStatusFilter('All')}>All</button>
          <button className={`px-3 py-1 rounded-full border ${statusFilter==='Active' ? 'border-primary-300 text-primary-700 bg-primary-50' : 'border-gray-200 text-gray-700 bg-white'}`} onClick={()=>setStatusFilter('Active')}>Active ({counts.Active})</button>
          <button className={`px-3 py-1 rounded-full border ${statusFilter==='Inactive' ? 'border-primary-300 text-primary-700 bg-primary-50' : 'border-gray-200 text-gray-700 bg-white'}`} onClick={()=>setStatusFilter('Inactive')}>Inactive ({counts.Inactive})</button>
        </div>
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search business or loan type" className="h-9 w-72 rounded-lg border border-gray-300 px-3 ml-auto" />
        <button className="h-9 px-3 rounded-lg border border-gray-200">Search</button>
      </div>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Business Name</th>
              <th className="px-4 py-3">Loan Type</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((b, idx) => (
              <tr key={idx} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{b.business_name}</td>
                <td className="px-4 py-3">{b.type_of_loan}</td>
                <td className="px-4 py-3">{b.subcategory || '-'}</td>
                <td className="px-4 py-3"><span className={statusBadge(b.status)}>{b.status}</span></td>
                <td className="px-4 py-3 flex gap-2">
                  <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={()=>setViewing(b)}>View</button>
                  <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={()=>setEditing({ ...b, _idx: idx })}>Edit</button>
                  <button className="h-8 px-3 rounded-lg border border-red-200 text-red-700" onClick={()=>setDeleting({ ...b, _idx: idx })}>Delete</button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-gray-600">No loan types added</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>{ setCreating(false); setModalError(null) }}>
          <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Add Loan Type</div>
            <div className="mt-3 space-y-3">
              {modalError && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-2 text-sm">{modalError}</div>}
              <div className="grid grid-cols-2 gap-3">
                <label className="block col-span-2">
                  <div className="text-sm text-gray-700">Business Name</div>
                  <select value={form.business_name} onChange={(e)=>{
                    const name = e.target.value
                    const t = tenants.find(x => x.company_name === name)
                    setForm({ ...form, business_name: name, tenant_id: t?.tenant_id || '' })
                  }} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                    <option value="">Select</option>
                    {tenants.map(t => (
                      <option key={t.tenant_id} value={t.company_name}>{t.company_name}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <div className="text-sm text-gray-700">Tenant ID</div>
                  <input value={form.tenant_id} onChange={(e)=>setForm({ ...form, tenant_id: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" placeholder="auto-filled" />
                </label>
                <label className="block">
                  <div className="text-sm text-gray-700">Type of Loan</div>
                  <select value={form.type_of_loan} onChange={(e)=>setForm({ ...form, type_of_loan: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                    {LOAN_TYPES.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm text-gray-700">Status</div>
                  <select value={form.status} onChange={(e)=>setForm({ ...form, status: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </label>
                <label className="block">
                  <div className="text-sm text-gray-700">Category (Optional)</div>
                  <select value={form.subcategory} onChange={(e)=>setForm({ ...form, subcategory: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                    <option value="">Select</option>
                    <option value="Unsecured">Unsecured</option>
                    <option value="Secured">Secured</option>
                  </select>
                </label>
              </div>

              {form.subcategory && (
                <div className="text-xs text-gray-600">
                  {form.subcategory==='Unsecured' ? 'KYC + income check, Bureau scoring, Limit sanction, Usage monitoring, Interest on used amount' : 'KYC + pledge (FD/property), Valuation, LTV calculation, Limit approval, Overdraft via virtual account'}
                </div>
              )}

              <div className="sticky bottom-0 bg-white pt-2 flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>{ setCreating(false); setModalError(null) }}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={() => {
                  const tname = form.business_name || (tenants.find(x => x.tenant_id===form.tenant_id)?.company_name || '')
                  if (!tname || !form.type_of_loan) { setModalError('Business and Loan Type are required'); return }
                  setItems([...items, { ...form, business_name: tname }])
                  setCreating(false)
                  setModalError(null)
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setViewing(null)}>
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Loan Type Detail</div>
            <div className="mt-3 text-sm space-y-1">
              <div className="font-medium">{viewing.business_name}</div>
              <div>Type: {viewing.type_of_loan}</div>
              <div>Category: {viewing.subcategory || '-'}</div>
              <div>Status: {viewing.status}</div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setViewing(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setEditing(null)}>
          <div className="bg-white w-full max-w-2xl rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Edit Loan Type</div>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm text-gray-700">Business Name</div>
                  <input value={editing.business_name} onChange={(e)=>setEditing({ ...editing, business_name: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
                </label>
                <label className="block">
                  <div className="text-sm text-gray-700">Type of Loan</div>
                  <select value={editing.type_of_loan} onChange={(e)=>setEditing({ ...editing, type_of_loan: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                    {LOAN_TYPES.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm text-gray-700">Status</div>
                  <select value={editing.status} onChange={(e)=>setEditing({ ...editing, status: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </label>
                <label className="block">
                  <div className="text-sm text-gray-700">Category (Optional)</div>
                  <select value={editing.subcategory} onChange={(e)=>setEditing({ ...editing, subcategory: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                    <option value="">Select</option>
                    <option value="Unsecured">Unsecured</option>
                    <option value="Secured">Secured</option>
                  </select>
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setEditing(null)}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>{
                  const list = [...items]
                  list[editing._idx] = { ...list[editing._idx], business_name: editing.business_name, type_of_loan: editing.type_of_loan, status: editing.status, subcategory: editing.subcategory }
                  setItems(list)
                  setEditing(null)
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setDeleting(null)}>
          <div className="bg-white w-full max-w-md rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Delete Loan Type</div>
            <div className="mt-2 text-sm text-gray-700">Are you sure you want to delete "{deleting.type_of_loan}"?</div>
            <div className="mt-3 flex justify-end gap-2">
              <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setDeleting(null)}>Cancel</button>
              <button className="h-9 px-3 rounded-lg bg-red-600 text-white" onClick={()=>{ setItems(items.filter((_,i)=>i!==deleting._idx)); setDeleting(null) }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
