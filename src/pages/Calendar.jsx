import { useEffect, useMemo, useState } from 'react'

export default function Calendar() {
  const [financialYears, setFinancialYears] = useState(() => {
    try { const s = localStorage.getItem('calendar_fy'); if (s) return JSON.parse(s) } catch {}
    return [
    { id: 'fy24', name: 'FY 2024-25', start: '2024-04-01', end: '2025-03-31', status: 'Active' },
    { id: 'fy23', name: 'FY 2023-24', start: '2023-04-01', end: '2024-03-31', status: 'Inactive' }
  ]
  })
  const [reportingPeriods, setReportingPeriods] = useState(() => {
    try { const s = localStorage.getItem('calendar_rp'); if (s) return JSON.parse(s) } catch {}
    return [
    { id: 'rp-q1', name: 'Q1 2025', start: '2025-04-01', end: '2025-06-30' },
    { id: 'rp-q2', name: 'Q2 2025', start: '2025-07-01', end: '2025-09-30' }
  ]
  })
  const [holidays, setHolidays] = useState(() => {
    try { const s = localStorage.getItem('calendar_holidays'); if (s) return JSON.parse(s) } catch {}
    return [
    { id: 'h-01', date: '2025-01-26', title: 'Republic Day' },
    { id: 'h-02', date: '2025-08-15', title: 'Independence Day' }
  ]
  })
  const [workingDays, setWorkingDays] = useState(() => { try { const s = localStorage.getItem('calendar_workingDays'); if (s) return JSON.parse(s) } catch {}; return { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false } })
  const [workingHours, setWorkingHours] = useState(() => { try { const s = localStorage.getItem('calendar_workingHours'); if (s) return JSON.parse(s) } catch {}; return { start: '09:00', end: '18:00' } })
  const [overtime, setOvertime] = useState(() => { try { const s = localStorage.getItem('calendar_overtime'); if (s) return JSON.parse(s) } catch {}; return { enabled: true, rateMultiplier: 1.5 } })

  const [modals, setModals] = useState({ fy: false, rp: false, h: false })
  const [fyForm, setFyForm] = useState({ name: '', start: '', end: '', status: 'Active' })
  const [rpForm, setRpForm] = useState({ name: '', start: '', end: '' })
  const [hForm, setHForm] = useState({ title: '', date: '' })

  const fyCounts = useMemo(() => ({ Active: financialYears.filter(f=>f.status==='Active').length, Inactive: financialYears.filter(f=>f.status==='Inactive').length }), [financialYears])
  const statusBadge = (s) => {
    const map = {
      Active: 'bg-[#d1e7dd] text-[#0f5132] border-[#badbcc]',
      Inactive: 'bg-[#f8d7da] text-[#842029] border-[#f5c2c7]'
    }
    return `inline-flex items-center px-2 py-1 rounded-full text-xs border ${map[s] || 'bg-gray-50 text-gray-700 border-gray-200'}`
  }

  useEffect(() => { try { localStorage.setItem('calendar_fy', JSON.stringify(financialYears)) } catch {} }, [financialYears])
  useEffect(() => { try { localStorage.setItem('calendar_rp', JSON.stringify(reportingPeriods)) } catch {} }, [reportingPeriods])
  useEffect(() => { try { localStorage.setItem('calendar_holidays', JSON.stringify(holidays)) } catch {} }, [holidays])
  useEffect(() => { try { localStorage.setItem('calendar_workingDays', JSON.stringify(workingDays)) } catch {} }, [workingDays])
  useEffect(() => { try { localStorage.setItem('calendar_workingHours', JSON.stringify(workingHours)) } catch {} }, [workingHours])
  useEffect(() => { try { localStorage.setItem('calendar_overtime', JSON.stringify(overtime)) } catch {} }, [overtime])

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Calendar</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl border border-gray-100 shadow-card p-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Financial Years</div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">Active: {fyCounts.Active} • Inactive: {fyCounts.Inactive}</div>
              <button className="h-8 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>{ setFyForm({ name: '', start: '', end: '', status: 'Active' }); setModals(m => ({ ...m, fy: true })) }}>Add</button>
            </div>
          </div>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">Name</th>
                <th className="py-2">Start</th>
                <th className="py-2">End</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {financialYears.map(f => (
                <tr key={f.id} className="border-t border-gray-100">
                  <td className="py-2 font-medium">{f.name}</td>
                  <td className="py-2">{f.start}</td>
                  <td className="py-2">{f.end}</td>
                  <td className="py-2"><span className={statusBadge(f.status)}>{f.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-card p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Manage Reporting Period</div>
            <button className="h-8 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>{ setRpForm({ name: '', start: '', end: '' }); setModals(m => ({ ...m, rp: true })) }}>Add</button>
          </div>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">Name</th>
                <th className="py-2">Start</th>
                <th className="py-2">End</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {reportingPeriods.map(r => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="py-2 font-medium">{r.name}</td>
                  <td className="py-2">{r.start}</td>
                  <td className="py-2">{r.end}</td>
                  <td className="py-2">
                    <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={()=>setReportingPeriods(reportingPeriods.filter(x => x.id!==r.id))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-card p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Manage Holidays</div>
            <button className="h-8 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>{ setHForm({ title: '', date: '' }); setModals(m => ({ ...m, h: true })) }}>Add</button>
          </div>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">Date</th>
                <th className="py-2">Title</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map(h => (
                <tr key={h.id} className="border-t border-gray-100">
                  <td className="py-2">{h.date}</td>
                  <td className="py-2 font-medium">{h.title}</td>
                  <td className="py-2">
                    <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={()=>setHolidays(holidays.filter(x => x.id!==h.id))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-card p-4">
          <div className="font-semibold">Manage Working Days</div>
          <div className="mt-3 grid grid-cols-7 gap-2">
            {Object.keys(workingDays).map(d => (
              <label key={d} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={workingDays[d]} onChange={(e)=>setWorkingDays({ ...workingDays, [d]: e.target.checked })} />
                <span>{d}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-card p-4">
          <div className="font-semibold">Manage Working Hours</div>
          <div className="mt-3 flex items-center gap-3">
            <label className="block text-sm text-gray-700">Start
              <input type="time" value={workingHours.start} onChange={(e)=>setWorkingHours({ ...workingHours, start: e.target.value })} className="mt-1 h-9 rounded-lg border border-gray-300 px-3" />
            </label>
            <label className="block text-sm text-gray-700">End
              <input type="time" value={workingHours.end} onChange={(e)=>setWorkingHours({ ...workingHours, end: e.target.value })} className="mt-1 h-9 rounded-lg border border-gray-300 px-3" />
            </label>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-card p-4">
          <div className="font-semibold">Manage Overtime</div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={overtime.enabled} onChange={(e)=>setOvertime({ ...overtime, enabled: e.target.checked })} />
            <span>Enable Overtime</span>
          </label>
          <div className="mt-3 text-sm">Rate Multiplier
            <input type="number" min="1" step="0.1" value={overtime.rateMultiplier} onChange={(e)=>setOvertime({ ...overtime, rateMultiplier: Number(e.target.value) })} className="ml-2 h-9 rounded-lg border border-gray-300 px-3 w-24" />
          </div>
        </section>
      </div>

      {modals.fy && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setModals(m => ({ ...m, fy: false }))}>
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Add Financial Year</div>
            <div className="mt-3 space-y-3">
              <label className="block"><div className="text-sm text-gray-700">Name</div><input value={fyForm.name} onChange={(e)=>setFyForm({ ...fyForm, name: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <label className="block"><div className="text-sm text-gray-700">Start</div><input type="date" value={fyForm.start} onChange={(e)=>setFyForm({ ...fyForm, start: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <label className="block"><div className="text-sm text-gray-700">End</div><input type="date" value={fyForm.end} onChange={(e)=>setFyForm({ ...fyForm, end: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <label className="block"><div className="text-sm text-gray-700">Status</div><select value={fyForm.status} onChange={(e)=>setFyForm({ ...fyForm, status: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3"><option>Active</option><option>Inactive</option></select></label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setModals(m => ({ ...m, fy: false }))}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>{ const id = `fy-${Math.random().toString(36).slice(2,6)}`; setFinancialYears([...financialYears, { id, ...fyForm }]); setModals(m => ({ ...m, fy: false })) }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modals.rp && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setModals(m => ({ ...m, rp: false }))}>
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Add Reporting Period</div>
            <div className="mt-3 space-y-3">
              <label className="block"><div className="text-sm text-gray-700">Name</div><input value={rpForm.name} onChange={(e)=>setRpForm({ ...rpForm, name: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <label className="block"><div className="text-sm text-gray-700">Start</div><input type="date" value={rpForm.start} onChange={(e)=>setRpForm({ ...rpForm, start: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <label className="block"><div className="text-sm text-gray-700">End</div><input type="date" value={rpForm.end} onChange={(e)=>setRpForm({ ...rpForm, end: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setModals(m => ({ ...m, rp: false }))}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>{ const id = `rp-${Math.random().toString(36).slice(2,6)}`; setReportingPeriods([...reportingPeriods, { id, ...rpForm }]); setModals(m => ({ ...m, rp: false })) }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modals.h && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setModals(m => ({ ...m, h: false }))}>
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Add Holiday</div>
            <div className="mt-3 space-y-3">
              <label className="block"><div className="text-sm text-gray-700">Title</div><input value={hForm.title} onChange={(e)=>setHForm({ ...hForm, title: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <label className="block"><div className="text-sm text-gray-700">Date</div><input type="date" value={hForm.date} onChange={(e)=>setHForm({ ...hForm, date: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" /></label>
              <div className="flex justify-end gap-2">
                <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setModals(m => ({ ...m, h: false }))}>Cancel</button>
                <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>{ const id = `h-${Math.random().toString(36).slice(2,6)}`; setHolidays([...holidays, { id, ...hForm }]); setModals(m => ({ ...m, h: false })) }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
