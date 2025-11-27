import { useEffect, useMemo, useState } from 'react'

const statusBadge = (s) => {
  const map = {
    Active: 'bg-[#d1e7dd] text-[#0f5132] border-[#badbcc]',
    Inactive: 'bg-[#f8d7da] text-[#842029] border-[#f5c2c7]'
  }
  return `inline-flex items-center px-3 py-1 rounded-full text-sm border ${map[s] || 'bg-gray-50 text-gray-700 border-gray-200'}`
}
import { tenantsApi } from '../utils/api.js'

export default function Branches() {
  const [tenants, setTenants] = useState([])
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [modalError, setModalError] = useState(null)
  const [form, setForm] = useState({
    tenant_id: '',
    business_name: '',
    contact_person: '',
    email: '',
    mobile_no: '',
    branch_name: '',
    address: '',
    gst_in: '',
    loan_product: [],
    password: '',
    isVerified: false,
    status: 'Active'
  })

  const loadTenants = async () => {
    setError(null)
    const res = await tenantsApi.list()
    if (res.ok) {
      setTenants(res.data || [])
      const t1 = (res.data || []).find(x => x.tenant_id==='tenant-001')
      const t2 = (res.data || []).find(x => x.tenant_id==='tenant-002')
      setItems([
        {
          tenant_id: t1?.tenant_id || 'tenant-001',
          business_name: t1?.company_name || 'Metro Credit',
          contact_person: 'Amit Sharma',
          email: 'branch@metrocredit.com',
          mobile_no: '+911234567800',
          branch_name: 'Metro - Main',
          address: '1 MG Road, Mumbai',
          gst_in: '27ABCDE1234F1Z5',
          loan_product: ['Personal Loan','Business Loan'],
          password: '',
          isVerified: true,
          status: 'Active'
        },
        {
          tenant_id: t2?.tenant_id || 'tenant-002',
          business_name: t2?.company_name || 'Sunrise Capital',
          contact_person: 'Neha Verma',
          email: 'ops@sunrisecapital.com',
          mobile_no: '+919876543211',
          branch_name: 'Sunrise - Andheri',
          address: 'Andheri East, Mumbai',
          gst_in: '27SUNRISE234F1Z6',
          loan_product: ['Home Loan'],
          password: '',
          isVerified: false,
          status: 'Inactive'
        },
        {
          tenant_id: t2?.tenant_id || 'tenant-003',
          business_name: t2?.company_name || 'Sunrise Capital',
          contact_person: 'Ayush Verma',
          email: 'ops@sundhfdjapital.com',
          mobile_no: '+91987333211',
          branch_name: 'Sunrise - Andheri',
          address: 'Andheri East, Mumbai',
          gst_in: '27SUNRISE234F1Z6',
          loan_product: ['Home Loan'],
          password: '',
          isVerified: false,
          status: 'Inactive'
        },
        {
          tenant_id: t2?.tenant_id || 'tenant-004',
          business_name: t2?.company_name || 'Sunrise Capital',
          contact_person: 'vibhore kumar',
          email: 'ops@vibhoreapital.com',
          mobile_no: '+91984543211',
          branch_name: 'Sunrise - Andheri',
          address: 'Andheri East, Mumbai',
          gst_in: '27SUNRISE234F1Z6',
          loan_product: ['Home Loan'],
          password: '',
          isVerified: false,
          status: 'Active'
        }
      ])
    }
    else setError('Unable to load tenants')
  }

  useEffect(() => { loadTenants() }, [])
  useEffect(() => {
    const openCreate = () => setCreating(true)
    window.addEventListener('open-branch-create', openCreate)
    try {
      if (sessionStorage.getItem('open_branch_create') === '1') {
        setCreating(true)
        sessionStorage.removeItem('open_branch_create')
      }
    } catch {}
    return () => window.removeEventListener('open-branch-create', openCreate)
  }, [])

  const productOptions = useMemo(() => [
    'Personal Loan',
    'Home Loan',
    'Auto Loan',
    'Business Loan'
  ], [])

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
      (b.branch_name||'').toLowerCase().includes(s) ||
      (b.contact_person||'').toLowerCase().includes(s) ||
      (b.email||'').toLowerCase().includes(s) ||
      (b.mobile_no||'').toLowerCase().includes(s) ||
      (b.gst_in||'').toLowerCase().includes(s) ||
      (b.status||'').toLowerCase().includes(s)
    )
  }), [items, search, statusFilter])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Manage Branches</div>
        </div>
        <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={() => {
          setCreating(true)
          setForm({
            tenant_id: '',
            business_name: '',
            contact_person: '',
            email: '',
            mobile_no: '',
            branch_name: '',
            address: '',
            gst_in: '',
            loan_product: [],
            password: '',
            isVerified: false,
            status: 'Active'
          })
        }}>+ Add Branch</button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <button className={`px-3 py-1 rounded-full border ${statusFilter==='All' ? 'border-primary-300 text-primary-700 bg-primary-50' : 'border-gray-200 text-gray-700 bg-white'}`} onClick={()=>setStatusFilter('All')}>All</button>
          <button className={`px-3 py-1 rounded-full border ${statusFilter==='Active' ? 'border-primary-300 text-primary-700 bg-primary-50' : 'border-gray-200 text-gray-700 bg-white'}`} onClick={()=>setStatusFilter('Active')}>Active ({counts.Active})</button>
          <button className={`px-3 py-1 rounded-full border ${statusFilter==='Inactive' ? 'border-primary-300 text-primary-700 bg-primary-50' : 'border-gray-200 text-gray-700 bg-white'}`} onClick={()=>setStatusFilter('Inactive')}>Inactive ({counts.Inactive})</button>
        </div>
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search business, branch or contact" className="h-9 w-72 rounded-lg border border-gray-300 px-3 ml-auto" />
        <button className="h-9 px-3 rounded-lg border border-gray-200">Search</button>
      </div>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Business Name</th>
              <th className="px-4 py-3">Branch Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Verified</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((b, idx) => (
              <tr key={idx} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{b.business_name}</td>
                <td className="px-4 py-3">{b.branch_name}</td>
                <td className="px-4 py-3">{b.contact_person}</td>
                <td className="px-4 py-3">{b.email}</td>
                <td className="px-4 py-3">{b.mobile_no}</td>
                <td className="px-4 py-3"><span className={statusBadge(b.status)}>{b.status}</span></td>
                <td className="px-4 py-3">{b.isVerified ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={()=>setViewing(b)}>View</button>
                  <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={()=>setEditing({ ...b, _idx: idx })}>Edit</button>
                  <button className="h-8 px-3 rounded-lg border border-red-200 text-red-700" onClick={()=>setDeleting({ ...b, _idx: idx })}>Delete</button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-center text-gray-600">No branches added</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>{ setCreating(false); setModalError(null) }}>
          <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Add Branch</div>
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
                  <div className="text-sm text-gray-700">Branch Name</div>
                  <input value={form.branch_name} onChange={(e)=>setForm({ ...form, branch_name: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
                </label>
              </div>

              <label className="block">
                <div className="text-sm text-gray-700">Contact Person</div>
                <input value={form.contact_person} onChange={(e)=>setForm({ ...form, contact_person: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm text-gray-700">Email</div>
                  <input type="email" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
                </label>
                <label className="block">
                  <div className="text-sm text-gray-700">Mobile No</div>
                  <input type="tel" value={form.mobile_no} onChange={(e)=>setForm({ ...form, mobile_no: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
                </label>
              </div>

              <label className="block">
                <div className="text-sm text-gray-700">Address</div>
                <textarea value={form.address} onChange={(e)=>setForm({ ...form, address: e.target.value })} className="mt-1 w-full min-h-[80px] rounded-lg border border-gray-300 px-3 py-2" />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm text-gray-700">GSTIN</div>
                  <input value={form.gst_in} onChange={(e)=>setForm({ ...form, gst_in: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
                </label>
                <label className="block">
                  <div className="text-sm text-gray-700">Status</div>
                  <select value={form.status} onChange={(e)=>setForm({ ...form, status: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <div className="text-sm text-gray-700">Loan Products</div>
                <select multiple value={form.loan_product} onChange={(e)=>{
                  const opts = Array.from(e.target.selectedOptions).map(o => o.value)
                  setForm({ ...form, loan_product: opts })
                }} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 min-h-[100px]">
                  {productOptions.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.isVerified} onChange={(e)=>setForm({ ...form, isVerified: e.target.checked })} className="h-4 w-4" />
                  <span className="text-sm text-gray-700">Verified</span>
                </label>
                <div className="text-xs text-gray-500">Password is auto-generated by backend</div>
              </div>

              <div className="sticky bottom-0 bg-white pt-2 flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>{ setCreating(false); setModalError(null) }}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={() => {
                  const tname = form.business_name || (tenants.find(x => x.tenant_id===form.tenant_id)?.company_name || '')
                  if (!tname || !form.branch_name || !form.email) { setModalError('Business, Branch Name and Email are required'); return }
                  if (!/.+@.+\..+/.test(form.email)) { setModalError('Email is invalid'); return }
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
            <div className="text-lg font-semibold">Branch Detail</div>
            <div className="mt-3 text-sm space-y-1">
              <div className="font-medium">{viewing.business_name} • {viewing.branch_name}</div>
              <div>Contact: {viewing.contact_person}</div>
              <div>Email: {viewing.email}</div>
              <div>Mobile: {viewing.mobile_no}</div>
              <div>Status: {viewing.status}</div>
              <div>Verified: {viewing.isVerified ? 'Yes' : 'No'}</div>
              <div>GSTIN: {viewing.gst_in || '-'}</div>
              <div>Products: {(viewing.loan_product||[]).join(', ') || '-'}</div>
              <div>Address: {viewing.address || '-'}</div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setViewing(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setEditing(null)}>
          <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Edit Branch</div>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm text-gray-700">Branch Name</div>
                  <input value={editing.branch_name} onChange={(e)=>setEditing({ ...editing, branch_name: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
                </label>
                <label className="block">
                  <div className="text-sm text-gray-700">Contact Person</div>
                  <input value={editing.contact_person} onChange={(e)=>setEditing({ ...editing, contact_person: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-sm text-gray-700">Email</div>
                  <input type="email" value={editing.email} onChange={(e)=>setEditing({ ...editing, email: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
                </label>
                <label className="block">
                  <div className="text-sm text-gray-700">Mobile No</div>
                  <input type="tel" value={editing.mobile_no} onChange={(e)=>setEditing({ ...editing, mobile_no: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
                </label>
              </div>
              <label className="block">
                <div className="text-sm text-gray-700">Status</div>
                <select value={editing.status} onChange={(e)=>setEditing({ ...editing, status: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setEditing(null)}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>{
                  const list = [...items]
                  list[editing._idx] = { ...list[editing._idx], branch_name: editing.branch_name, contact_person: editing.contact_person, email: editing.email, mobile_no: editing.mobile_no, status: editing.status }
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
            <div className="text-lg font-semibold">Delete Branch</div>
            <div className="mt-2 text-sm text-gray-700">Are you sure you want to delete "{deleting.branch_name}"?</div>
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
