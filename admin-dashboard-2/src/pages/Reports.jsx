import { useEffect, useState } from 'react'
// import { reportsApi } from '../services/api.js'

export default function Reports() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ report_type: 'LOAN_ACTIVITY', start_date: '', end_date: '', tenant_id: '' })
  const [job, setJob] = useState(null)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let t
    if (job) {
      t = setInterval(async () => {
        const s = await reportsApi.status(job.job_id)
        if (s.ok) {
          setStatus(s.status)
          if (s.status === 'COMPLETED') {
            clearInterval(t)
          }
        }
      }, 1000)
    }
    return () => t && clearInterval(t)
  }, [job])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Reports</div>
        </div>
        <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={() => setOpen(true)}>Download Report (CSV)</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          <div className="font-medium">Loan Activity Report</div>
          <div className="text-sm text-gray-600">All loan records with key fields and activity dates</div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          <div className="font-medium">Tenant Summary Report</div>
          <div className="text-sm text-gray-600">Active and inactive tenants with core metrics</div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          <div className="font-medium">User Activity Report</div>
          <div className="text-sm text-gray-600">User actions and login activity in a period</div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Configure Report</div>
            <div className="mt-3 space-y-3">
              <label className="block">
                <div className="text-sm text-gray-700">Report Type</div>
                <select value={form.report_type} onChange={(e)=>setForm({ ...form, report_type: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                  <option value="LOAN_ACTIVITY">Loan Activity</option>
                  <option value="TENANT_SUMMARY">Tenant Summary</option>
                  <option value="USER_ACTIVITY">User Activity</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="text-sm text-gray-700">Start Date</div>
                  <input type="date" value={form.start_date} onChange={(e)=>setForm({ ...form, start_date: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
                </label>
                <label className="block">
                  <div className="text-sm text-gray-700">End Date</div>
                  <input type="date" value={form.end_date} onChange={(e)=>setForm({ ...form, end_date: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
                </label>
              </div>
              <label className="block">
                <div className="text-sm text-gray-700">Tenant ID (optional)</div>
                <input value={form.tenant_id} onChange={(e)=>setForm({ ...form, tenant_id: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>{ setOpen(false); setStatus(null); setJob(null) }}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={async ()=>{
                  const r = await reportsApi.generate(form)
                  if (r.ok) { setJob(r); setStatus(r.status) }
                }}>Generate</button>
              </div>
              {job && (
                <div className="mt-3 text-sm text-gray-700">Job: {job.job_id} • Status: {status} • ETA: {job.estimated_completion_time}
                  {status==='COMPLETED' && (
                    <button className="ml-2 h-8 px-3 rounded-lg bg-green-600 text-white" onClick={async ()=>{
                      const d = await reportsApi.download(job.job_id)
                      if (d.ok) {
                        const a = document.createElement('a')
                        a.href = d.url
                        a.download = `${form.report_type.toLowerCase()}.csv`
                        document.body.appendChild(a)
                        a.click()
                        a.remove()
                      }
                    }}>Download</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}