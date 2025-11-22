import { useEffect, useState } from 'react'
import { integrationsApi } from '../utils/api.js'

const badge = (status) => {
  const map = {
    Connected: 'bg-green-50 text-green-700 border-green-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Disconnected: 'bg-red-50 text-red-700 border-red-200',
    Error: 'bg-red-50 text-red-700 border-red-200'
  }
  return `inline-flex items-center px-2 py-1 text-xs rounded-full border ${map[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`
}

export default function Integrations() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setError(null)
    const res = await integrationsApi.list()
    if (res.ok) setItems(res.data)
    else setError('Unable to load integrations')
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Integrations</div>
        </div>
      </div>
      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(it => (
          <div key={it.config_id} className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="font-medium">{it.integration_type}</div>
              <span className={badge(it.status)}>{it.status}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">{it.provider_name}</div>
            <div className="mt-2 text-xs text-gray-500">{it.endpoint_url}</div>
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setEditing(it)} className="h-9 px-3 rounded-lg border border-gray-200">Configure</button>
              <button onClick={async () => {
                const r = await integrationsApi.validate(it.config_id)
                if (r.ok) {
                  setItems(items.map(x => x.config_id===it.config_id ? { ...x, status: r.status, last_validated: r.last_validated } : x))
                }
              }} className="h-9 px-3 rounded-lg bg-primary-600 text-white">Test Connection</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Edit Configuration</div>
            <form className="mt-3 space-y-3" onSubmit={(e) => e.preventDefault()}>
              <label className="block">
                <div className="text-sm text-gray-700">Provider Name</div>
                <input value={editing.provider_name} onChange={(e)=>setEditing({ ...editing, provider_name: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Endpoint URL</div>
                <input value={editing.endpoint_url} onChange={(e)=>setEditing({ ...editing, endpoint_url: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">API Key</div>
                <div className="mt-1 flex gap-2">
                  <input type="password" value={editing.api_key_mask || ''} onChange={(e)=>setEditing({ ...editing, api_key_mask: e.target.value })} className="flex-1 h-9 rounded-lg border border-gray-300 px-3" placeholder="••••••" />
                  <button type="button" onClick={() => setEditing({ ...editing, showKey: !editing.showKey })} className="h-9 px-3 rounded-lg border border-gray-200">{editing.showKey ? 'Hide' : 'Show'}</button>
                </div>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="h-9 px-3 rounded-lg border border-gray-200">Cancel</button>
                <button type="button" disabled={saving} onClick={async () => {
                  setSaving(true)
                  const r = await integrationsApi.update(editing.config_id, {
                    provider_name: editing.provider_name,
                    endpoint_url: editing.endpoint_url,
                    api_key_new: editing.showKey ? editing.api_key_mask : undefined
                  })
                  setSaving(false)
                  if (r.ok) {
                    setItems(items.map(x => x.config_id===editing.config_id ? { ...x, provider_name: editing.provider_name, endpoint_url: editing.endpoint_url, status: r.status ?? x.status } : x))
                    setEditing(null)
                  }
                }} className="h-9 px-3 rounded-lg bg-primary-600 text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}