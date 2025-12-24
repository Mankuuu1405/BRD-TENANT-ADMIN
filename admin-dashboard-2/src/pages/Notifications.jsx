import { useEffect, useState } from 'react'
// import { notificationsApi } from '../services/api'

export default function Notifications() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  const load = async () => {
    setError(null)
    const res = await notificationsApi.list()
    if (res.ok) setItems(res.data)
    else setError('Unable to load notifications')
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Notifications</div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={load}>Refresh</button>
          <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={async ()=>{ const r = await notificationsApi.markAllRead(); if (r.ok) load() }}>Mark All Read</button>
        </div>
      </div>
      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}
      <div className="space-y-3">
        {items.map(n => (
          <div key={n.notification_id} className={`bg-white rounded-xl shadow-card p-4 border ${n.read ? 'border-gray-100' : 'border-primary-200'}`}>
            <div className="flex items-center justify-between">
              <div className="font-medium">{n.title}</div>
              <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
            </div>
            <div className="mt-1 text-sm text-gray-700">{n.message}</div>
            <div className="mt-3 flex justify-end gap-2">
              <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={async ()=>{ const r = await notificationsApi.delete(n.notification_id); if (r.ok) load() }}>Delete</button>
              {n.read ? (
                <button className="h-8 px-3 rounded-lg border border-gray-200" onClick={async ()=>{ const r = await notificationsApi.unread(n.notification_id); if (r.ok) load() }}>Mark Unread</button>
              ) : (
                <button className="h-8 px-3 rounded-lg bg-primary-600 text-white" onClick={async ()=>{ const r = await notificationsApi.read(n.notification_id); if (r.ok) load() }}>Mark Read</button>
              )}
            </div>
          </div>
        ))}
        {!items.length && <div className="text-sm text-gray-600">No notifications</div>}
      </div>
    </div>
  )
}