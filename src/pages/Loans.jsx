import { useEffect, useMemo, useState } from 'react'
import { loansApi } from '../utils/api.js'

const statusBadge = (s) => {
  const map = {
    Pending: 'bg-[#fff3cd] text-[#664d03] border-[#ffecb5]',
    Approved: 'bg-[#d1e7dd] text-[#0f5132] border-[#badbcc]',
    Rejected: 'bg-[#f8d7da] text-[#842029] border-[#f5c2c7]',
    Disbursed: 'bg-primary-50 text-primary-700 border-primary-200',
    Repaid: 'bg-gray-50 text-gray-700 border-gray-200'
  }
  return `inline-flex items-center px-2 py-1 rounded-full text-xs border ${map[s] || 'bg-gray-50 text-gray-700 border-gray-200'}`
}

export default function Loans() {
  const demoLoans = [
    { loan_id: 'DL001', tenant_id: 'tenant-001', applicant_name: 'Amit Sharma', amount: 500000, term_months: 12, applied_on: new Date().toISOString(), status: 'Pending' },
    { loan_id: 'DL002', tenant_id: 'tenant-001', applicant_name: 'Neha Verma', amount: 750000, term_months: 18, applied_on: new Date().toISOString(), status: 'Approved' },
    { loan_id: 'DL003', tenant_id: 'tenant-002', applicant_name: 'Rahul Mehta', amount: 300000, term_months: 24, applied_on: new Date().toISOString(), status: 'Rejected' },
    { loan_id: 'DL004', tenant_id: 'tenant-003', applicant_name: 'Vikram Singh', amount: 650000, term_months: 36, applied_on: new Date().toISOString(), status: 'Disbursed' }
  ]
  const [items, setItems] = useState(demoLoans)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createData, setCreateData] = useState({ applicant_name: '', amount: '', term_months: 12 })
  const [detail, setDetail] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const counts = useMemo(() => {
    const c = { All: items.length, Pending: 0, Approved: 0, Rejected: 0 }
    items.forEach(i => { if (c[i.status] !== undefined) c[i.status]++ })
    return c
  }, [items])

  const load = async () => {
    setLoading(true)
    setError(null)
    const res = await loansApi.list({ status_filter: statusFilter !== 'All' ? statusFilter : undefined, search })
    setLoading(false)
    if (res.ok) setItems(res.data && res.data.length ? res.data : demoLoans)
    else {
      setItems(demoLoans)
      setError('Unable to load loans')
    }
  }

  useEffect(() => { load() }, [statusFilter])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Loans</div>
        </div>
        <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={() => setCreateOpen(true)}>New Loan</button>
      </div>
      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}

      <div className="flex items-center gap-2">
        {['All','Pending','Approved','Rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`h-9 px-3 rounded-full border ${statusFilter===s ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700'}`}>{s}{s!=='All' && ` (${counts[s]})`}</button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input value={search} onChange={(e)=>setSearch(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') load() }} placeholder="Search Loan ID or Applicant" className="h-9 w-64 rounded-lg border border-gray-300 px-3" />
          <button onClick={load} className="h-9 px-3 rounded-lg border border-gray-200">Search</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Loan ID</th>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Term</th>
              <th className="px-4 py-3">Applied On</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.loan_id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{i.loan_id}</td>
                <td className="px-4 py-3">{i.applicant_name}</td>
                <td className="px-4 py-3">{new Intl.NumberFormat('en-IN').format(i.amount)}</td>
                <td className="px-4 py-3">{i.term_months} mo</td>
                <td className="px-4 py-3">{new Date(i.applied_on).toLocaleString()}</td>
                <td className="px-4 py-3"><span className={statusBadge(i.status)}>{i.status}</span></td>
                <td className="px-4 py-3"><button className="text-primary-700" onClick={async ()=>{ const r = await loansApi.get(i.loan_id); if (r.ok) setDetail(r.data) }}>View</button></td>
              </tr>
            ))}
            {loading && (
              <tr><td className="px-4 py-3" colSpan={7}>Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {createOpen && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">New Loan</div>
            <div className="mt-3 space-y-3">
              <label className="block">
                <div className="text-sm text-gray-700">Applicant Name</div>
                <input value={createData.applicant_name} onChange={(e)=>setCreateData({ ...createData, applicant_name: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Amount</div>
                <input type="number" value={createData.amount} onChange={(e)=>setCreateData({ ...createData, amount: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Term (months)</div>
                <input type="number" value={createData.term_months} onChange={(e)=>setCreateData({ ...createData, term_months: parseInt(e.target.value||'0') })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setCreateOpen(false)}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={async ()=>{
                  const r = await loansApi.create(createData)
                  if (r.ok) { setCreateOpen(false); load() }
                }}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-2xl rounded-xl border border-gray-200 shadow-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Loan {detail.loan_id}</div>
              <span className={statusBadge(detail.status)}>{detail.status}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-600">Applicant</div>
                <div className="font-medium">{detail.applicant_name}</div>
              </div>
              <div>
                <div className="text-gray-600">Amount</div>
                <div className="font-medium">{new Intl.NumberFormat('en-IN').format(detail.amount)}</div>
              </div>
              <div>
                <div className="text-gray-600">Term</div>
                <div className="font-medium">{detail.term_months} mo</div>
              </div>
              <div>
                <div className="text-gray-600">Applied On</div>
                <div className="font-medium">{new Date(detail.applied_on).toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-sm text-gray-700">Reject Reason</div>
              <input value={rejectReason} onChange={(e)=>setRejectReason(e.target.value)} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" placeholder="Provide reason when rejecting" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setDetail(null)}>Close</button>
              <button className="h-9 px-3 rounded-lg bg-green-600 text-white" onClick={async ()=>{ const r = await loansApi.action(detail.loan_id, { action: 'Approve' }); if (r.ok) { setDetail({ ...detail, status: 'Approved' }); load() } }}>Approve</button>
              <button className="h-9 px-3 rounded-lg bg-red-600 text-white disabled:opacity-60" disabled={!rejectReason} onClick={async ()=>{ const r = await loansApi.action(detail.loan_id, { action: 'Reject', reason: rejectReason }); if (r.ok) { setDetail({ ...detail, status: 'Rejected' }); setRejectReason(''); load() } }}>Reject</button>
              <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={async ()=>{ const r = await loansApi.action(detail.loan_id, { action: 'Disburse' }); if (r.ok) { setDetail({ ...detail, status: 'Disbursed' }); load() } }}>Disburse</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}