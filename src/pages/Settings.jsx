import { useEffect, useState } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { settingsApi } from '../utils/api.js'

const Field = ({ s, onChange }) => {
  const masked = s.is_encrypted && !s.reveal
  const label = s.key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  if (s.data_type === 'BOOLEAN') {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={s.value === 'true'} onChange={(e)=>onChange(s.key, e.target.checked ? 'true' : 'false')} />
        <span>{label}</span>
      </label>
    )
  }
  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-700">{label}</div>
      <div className="flex gap-2">
        <input type="text" value={masked ? '••••••' : s.value} onChange={(e)=>!masked && onChange(s.key, e.target.value)} className="flex-1 h-9 rounded-lg border border-gray-300 px-3" />
        {s.is_encrypted && (
          <button type="button" className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>onChange(s.key, s.value, { reveal: !s.reveal })}>{s.reveal ? 'Hide' : 'Reveal'}</button>
        )}
      </div>
    </div>
  )
}

export default function Settings() {
  const [loan, setLoan] = useState([])
  const [system, setSystem] = useState([])
  const [notify, setNotify] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    setError(null)
    const res = await settingsApi.list()
    if (res.ok) {
      const addReveal = (arr) => arr.map(s => ({ ...s, reveal: false }))
      setLoan(addReveal(res.data.loan))
      setSystem(addReveal(res.data.system))
      setNotify(addReveal(res.data.notify))
    } else setError('Unable to load settings')
  }

  useEffect(() => { load() }, [])

  const mutate = (groupSetter, group) => (key, value, extra = {}) => {
    groupSetter(group.map(s => s.key===key ? { ...s, value, ...extra } : s))
  }

  const save = async () => {
    setSaving(true)
    const map = {}
    ;[...loan, ...system, ...notify].forEach(s => { map[s.key] = s.value })
    const r = await settingsApi.update(map)
    setSaving(false)
    if (r.ok) await load()
  }


  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">System Settings</div>
        </div>
        <div className="flex items-center gap-2">
          <button disabled={saving} className="h-9 px-3 rounded-lg bg-primary-600 text-white disabled:opacity-60" onClick={save}>Save Changes</button>
        </div>
      </div>
      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          <div className="text-sm font-medium mb-2">Loan Configuration</div>
          <div className="space-y-3">
            {loan.map(s => <Field key={s.key} s={s} onChange={mutate(setLoan, loan)} />)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          <div className="text-sm font-medium mb-2">System & Security</div>
          <div className="space-y-3">
            {system.map(s => <Field key={s.key} s={s} onChange={mutate(setSystem, system)} />)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          <div className="text-sm font-medium mb-2">Notifications & Email</div>
          <div className="space-y-3">
            {notify.map(s => <Field key={s.key} s={s} onChange={mutate(setNotify, notify)} />)}
          </div>
        </div>
      </div>
    </div>
  )
}