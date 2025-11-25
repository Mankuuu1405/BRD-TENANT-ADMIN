import { useEffect, useState } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'

export default function Header({ onRefresh, onExportReport }) {
  const [avatar, setAvatar] = useState(null)
  useEffect(() => {
    const load = () => {
      try { setAvatar(localStorage.getItem('profile_avatar') || null) } catch {}
    }
    load()
    const h = () => load()
    window.addEventListener('profile-avatar-updated', h)
    window.addEventListener('storage', h)
    return () => {
      window.removeEventListener('profile-avatar-updated', h)
      window.removeEventListener('storage', h)
    }
  }, [])
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30">
      <div className="flex flex-col">
        <div className="font-semibold">Tenant Admin Dashboard</div>
        <div className="text-sm text-gray-600">Multi-Tenant LOS Platform Overview</div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onExportReport} className="h-9 px-4 rounded-full border border-gray-200 bg-white text-gray-700">Export Report</button>
        <button onClick={onRefresh} className="h-9 px-4 rounded-full bg-primary-600 text-white">Refresh</button>
        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'notifications' }))} className="h-9 w-9 rounded-full grid place-items-center border border-gray-200 bg-white"><BellIcon className="h-5 w-5 text-gray-500" /></button>
        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'profile' }))} className="h-9 w-9 rounded-full bg-primary-600 text-white grid place-items-center overflow-hidden">
          {avatar ? (<img src={avatar} alt="avatar" className="h-full w-full object-cover" />) : 'TA'}
        </button>
      </div>
    </header>
  )
}
