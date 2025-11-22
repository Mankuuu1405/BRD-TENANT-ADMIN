import { useEffect, useState } from 'react'
import { profileApi } from '../utils/api.js'

export default function Profile() {
  const [data, setData] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pwd, setPwd] = useState({ current_password: '', new_password: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const load = async () => {
    setError(null)
    const res = await profileApi.get()
    if (res.ok) {
      setData(res.data)
      setName(res.data.full_name)
      setPhone(res.data.phone_number || '')
    } else setError('Unable to load profile')
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setError(null)
    setSuccess(null)
    if (!name.trim()) { setError('Name is required'); return }
    if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) { setError('Phone must be E.164 format'); return }
    const r = await profileApi.update({ full_name: name, phone_number: phone })
    if (r.ok) { setSuccess('Profile updated'); load() } else setError('Update failed')
  }

  const changePassword = async () => {
    setError(null)
    setSuccess(null)
    if (!pwd.current_password || !pwd.new_password) { setError('Enter current and new password'); return }
    const r = await profileApi.changePassword(pwd)
    if (r.ok) { setSuccess('Password changed'); setPwd({ current_password: '', new_password: '' }) } else setError('Password change failed')
  }

  

  if (!data) return <div className="p-4">Loading...</div>

  return (
    <div className="p-4 space-y-4">
      <div className="text-xl font-semibold">My Profile</div>
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 flex items-center justify-between">
          <span>{error}</span>
          <button className="h-7 px-2 rounded-md border border-red-200 bg-white text-red-700" onClick={()=>setError(null)}>Close</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 flex items-center justify-between">
          <span>{success}</span>
          <button className="h-7 px-2 rounded-md border border-green-200 bg-white text-green-700" onClick={()=>setSuccess(null)}>Close</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          <div className="text-sm font-medium mb-2">Account Details</div>
          <div className="space-y-3">
            <label className="block">
              <div className="text-sm text-gray-700">Full Name</div>
              <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
            </label>
            <label className="block">
              <div className="text-sm text-gray-700">Phone Number</div>
              <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" placeholder="+919876543210" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-700">Email</div>
                <div className="mt-1 h-9 rounded-lg border border-gray-200 px-3 grid items-center bg-gray-50">{data.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-700">Role</div>
                <div className="mt-1 h-9 rounded-lg border border-gray-200 px-3 grid items-center bg-gray-50">{data.role_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-700">Tenant</div>
                <div className="mt-1 h-9 rounded-lg border border-gray-200 px-3 grid items-center bg-gray-50">{data.tenant_id || '-'}</div>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={save}>Save Changes</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          <div className="text-sm font-medium mb-2">Security</div>
          <div className="space-y-3">
            <label className="block">
              <div className="text-sm text-gray-700">Current Password</div>
              <input type="password" value={pwd.current_password} onChange={(e)=>setPwd({ ...pwd, current_password: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
            </label>
            <label className="block">
              <div className="text-sm text-gray-700">New Password</div>
              <input type="password" value={pwd.new_password} onChange={(e)=>setPwd({ ...pwd, new_password: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
            </label>
            <div className="flex justify-end">
              <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={changePassword}>Change Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}