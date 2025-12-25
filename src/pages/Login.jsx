import { useState } from 'react'
import { ShieldCheckIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { authApi } from '../utils/api' // authApi को import किया

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false) // लोडिंग स्टेट जोड़ा

  const doLogin = async () => {
    setError(null)
    if (!email || !password) { setError('Enter email and password to login'); return }
    
    setLoading(true)
    
    // असली API कॉल
    const res = await authApi.login(email, password)
    
    setLoading(false)

    if (res.ok) {
      // टोकन api.js में पहले ही सेव हो चुके हैं
      if (remember) localStorage.setItem('auth_remember', 'true')
      
      // डैशबोर्ड पर भेजें
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))
    } else {
      setError(res.message || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen bg-white grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-primary-200 bg-white shadow-card p-6">
        <div className="grid place-items-center">
          <div className="h-12 w-12 rounded-full bg-primary-50 grid place-items-center text-primary-600">
            <ShieldCheckIcon className="h-6 w-6" />
          </div>
          <div className="mt-4 text-3xl font-semibold text-gray-900 text-center">Tenant Dashboard</div>
          <div className="mt-1 text-sm text-gray-600 text-center">Sign in to access your dashboard</div>
        </div>

        {error && <div className="mt-3 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">{error}</div>}

        <label className="block mt-6">
          <div className="text-sm text-gray-900">Email</div>
          <div className="mt-1 relative">
            <input 
              type="email" 
              placeholder="admin@los.com" 
              value={email} 
              onChange={(e)=>setEmail(e.target.value)} 
              className="w-full h-11 rounded-xl border border-primary-200 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-300" 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500">
              <EnvelopeIcon className="h-5 w-5" />
            </div>
          </div>
        </label>

        <label className="block mt-4">
          <div className="text-sm text-gray-900">Password</div>
          <input 
            type="password" 
            placeholder="Enter your password" 
            value={password} 
            onChange={(e)=>setPassword(e.target.value)} 
            className="mt-1 w-full h-11 rounded-xl border border-primary-200 px-3 focus:outline-none focus:ring-2 focus:ring-primary-300" 
          />
        </label>

        <div className="mt-3 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input 
              type="checkbox" 
              checked={remember} 
              onChange={(e)=>setRemember(e.target.checked)} 
              className="h-4 w-4 rounded border-gray-300" 
            />
            <span>Remember me</span>
          </label>
          <button onClick={()=>window.dispatchEvent(new CustomEvent('navigate', { detail: 'forgot_password' }))} className="text-sm text-primary-600 hover:underline">Forgot password?</button>
        </div>

        <div className="mt-6">
          <button 
            disabled={loading}
            className={`h-11 w-full rounded-xl bg-primary-600 text-white shadow transition ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700'}`} 
            onClick={doLogin}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">Demo: Use valid admin credentials</div>
        <div className="mt-2 text-center text-sm">
          <span className="text-gray-700">Don't have an account? </span>
          <button onClick={()=>window.dispatchEvent(new CustomEvent('navigate', { detail: 'signup' }))} className="text-primary-600 hover:underline">Sign Up</button>
        </div>
      </div>
    </div>
  )
}