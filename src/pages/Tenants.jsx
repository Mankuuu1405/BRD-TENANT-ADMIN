import { useEffect, useMemo, useState } from 'react'

const statusBadge = (s) => {
  const map = {
    Active: 'bg-[#d1e7dd] text-[#0f5132] border-[#badbcc]',
    Inactive: 'bg-[#f8d7da] text-[#842029] border-[#f5c2c7]'
  }
  return `inline-flex items-center px-2 py-1 rounded-full text-xs border ${map[s] || 'bg-gray-50 text-gray-700 border-gray-200'}`
}

export default function Tenants() {
  const [products, setProducts] = useState(() => {
    try { const s = localStorage.getItem('product_loans'); if (s) return JSON.parse(s) } catch {}
    return [
      { id: 'pl-001', name: 'Personal Loan', interest_rate: 12.5, tenure_months: 36, max_amount: 500000, processing_fee_pct: 1.5, status: 'Active', description: 'Unsecured personal loan for salaried individuals' },
      { id: 'pl-002', name: 'Home Loan', interest_rate: 9.2, tenure_months: 240, max_amount: 10000000, processing_fee_pct: 0.5, status: 'Active', description: 'Mortgage loan for residential property purchase' },
      { id: 'pl-003', name: 'Business Loan', interest_rate: 14.0, tenure_months: 60, max_amount: 2000000, processing_fee_pct: 2.0, status: 'Inactive', description: 'SME business loan for working capital' }
    ]
  })
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState({ name: '', interest_rate: 0, tenure_months: 0, max_amount: 0, processing_fee_pct: 0, status: 'Active', description: '' })

  useEffect(() => { try { localStorage.setItem('product_loans', JSON.stringify(products)) } catch {} }, [products])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(p => p.name.toLowerCase().includes(q))
  }, [search, products])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Products (Loans)</div>
        </div>
        <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={() => { setCreating(true); setForm({ name: '', interest_rate: 0, tenure_months: 0, max_amount: 0, processing_fee_pct: 0, status: 'Active', description: '' }) }}>+ Add Product</button>
      </div>

      <div className="flex items-center gap-2">
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search product" className="h-9 w-72 rounded-lg border border-gray-300 px-3" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Interest Rate (%)</th>
              <th className="px-4 py-3">Tenure (months)</th>
              <th className="px-4 py-3">Max Amount</th>
              <th className="px-4 py-3">Processing Fee (%)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.interest_rate}</td>
                <td className="px-4 py-3">{p.tenure_months}</td>
                <td className="px-4 py-3">{p.max_amount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">{p.processing_fee_pct}</td>
                <td className="px-4 py-3"><span className={statusBadge(p.status)}>{p.status}</span></td>
                <td className="px-4 py-3 flex gap-2">
                  <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={()=>setViewing(p)}>View</button>
                  <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={()=>setEditing(p)}>Edit</button>
                  <button className="h-8 px-3 rounded-lg border border-red-200 text-red-700" onClick={()=>setDeleting(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Add Product</div>
            <div className="mt-3 space-y-3">
              <label className="block"><div className="text-sm text-gray-700">Name</div><input value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><div className="text-sm text-gray-700">Interest Rate (%)</div><input type="number" step="0.1" value={form.interest_rate} onChange={(e)=>setForm({ ...form, interest_rate: Number(e.target.value) })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
                <label className="block"><div className="text-sm text-gray-700">Tenure (months)</div><input type="number" value={form.tenure_months} onChange={(e)=>setForm({ ...form, tenure_months: Number(e.target.value) })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><div className="text-sm text-gray-700">Max Amount</div><input type="number" value={form.max_amount} onChange={(e)=>setForm({ ...form, max_amount: Number(e.target.value) })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
                <label className="block"><div className="text-sm text-gray-700">Processing Fee (%)</div><input type="number" step="0.1" value={form.processing_fee_pct} onChange={(e)=>setForm({ ...form, processing_fee_pct: Number(e.target.value) })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              </div>
              <label className="block"><div className="text-sm text-gray-700">Status</div><select value={form.status} onChange={(e)=>setForm({ ...form, status: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3"><option>Active</option><option>Inactive</option></select></label>
              <label className="block"><div className="text-sm text-gray-700">Description</div><textarea value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} className="mt-1 w-full min-h-[80px] rounded-lg border border-gray-300 px-3 py-2" /></label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setCreating(false)}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>{
                  if (!form.name) return
                  const id = `pl-${Math.random().toString(36).slice(2,6)}`
                  setProducts([...products, { id, ...form }])
                  setCreating(false)
                }}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setViewing(null)}>
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Product Detail</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="font-medium">{viewing.name}</div>
              <div className="text-gray-700">{viewing.description || '-'}</div>
              <div>Interest Rate: {viewing.interest_rate}%</div>
              <div>Tenure: {viewing.tenure_months} months</div>
              <div>Max Amount: {viewing.max_amount.toLocaleString('en-IN')}</div>
              <div>Processing Fee: {viewing.processing_fee_pct}%</div>
              <div>Status: <span className={statusBadge(viewing.status)}>{viewing.status}</span></div>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setViewing(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Edit Product</div>
            <div className="mt-3 space-y-3">
              <label className="block"><div className="text-sm text-gray-700">Name</div><input value={editing.name} onChange={(e)=>setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><div className="text-sm text-gray-700">Interest Rate (%)</div><input type="number" step="0.1" value={editing.interest_rate} onChange={(e)=>setEditing({ ...editing, interest_rate: Number(e.target.value) })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
                <label className="block"><div className="text-sm text-gray-700">Tenure (months)</div><input type="number" value={editing.tenure_months} onChange={(e)=>setEditing({ ...editing, tenure_months: Number(e.target.value) })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><div className="text-sm text-gray-700">Max Amount</div><input type="number" value={editing.max_amount} onChange={(e)=>setEditing({ ...editing, max_amount: Number(e.target.value) })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
                <label className="block"><div className="text-sm text-gray-700">Processing Fee (%)</div><input type="number" step="0.1" value={editing.processing_fee_pct} onChange={(e)=>setEditing({ ...editing, processing_fee_pct: Number(e.target.value) })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              </div>
              <label className="block"><div className="text-sm text-gray-700">Status</div><select value={editing.status} onChange={(e)=>setEditing({ ...editing, status: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3"><option>Active</option><option>Inactive</option></select></label>
              <label className="block"><div className="text-sm text-gray-700">Description</div><textarea value={editing.description} onChange={(e)=>setEditing({ ...editing, description: e.target.value })} className="mt-1 w-full min-h-[80px] rounded-lg border border-gray-300 px-3 py-2" /></label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setEditing(null)}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>{
                  setProducts(products.map(p => p.id===editing.id ? editing : p))
                  setEditing(null)
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-md rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Delete Product</div>
            <div className="mt-2 text-sm text-gray-700">Are you sure you want to delete "{deleting.name}"?</div>
            <div className="mt-3 flex justify-end gap-2">
              <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setDeleting(null)}>Cancel</button>
              <button className="h-9 px-3 rounded-lg bg-red-600 text-white" onClick={()=>{ setProducts(products.filter(p => p.id!==deleting.id)); setDeleting(null) }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
