import { useState } from 'react'
import { ShieldCheckIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { signupApi } from '../utils/api.js'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null)

  const doSignup = async () => {
    setError(null)
    setStatus(null)
    if (!email || !password || !confirmPassword) { setError('Fill all fields'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    const business = email.split('@')[0] || 'NewTenant'
    const res = await signupApi.submit({ email, business_name: business, subscription_type: 'Trial', status: 'Active' })
    if (res.ok) {
      setStatus('Account created successfully')
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }))
      }, 800)
    } else {
      setError('Signup failed')
    }
  }

  return (
    <div className="min-h-screen bg-white grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-primary-200 bg-white shadow-card p-6">
        <div className="grid place-items-center">
          <div className="h-12 w-12 rounded-full bg-primary-50 grid place-items-center text-primary-600">
            <ShieldCheckIcon className="h-6 w-6" />
          </div>
          <div className="mt-4 text-3xl font-semibold text-gray-900 text-center">Create your account</div>
          <div className="mt-1 text-sm text-gray-600 text-center">Sign up to access your dashboard</div>
        </div>

        {error && <div className="mt-3 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}
        {status && <div className="mt-3 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg p-3">{status}</div>}

        <label className="block mt-6">
          <div className="text-sm text-gray-900">Email</div>
          <div className="mt-1 relative">
            <input type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full h-11 rounded-xl border border-primary-200 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-300" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500">
              <EnvelopeIcon className="h-5 w-5" />
            </div>
          </div>
        </label>

        <label className="block mt-4">
          <div className="text-sm text-gray-900">Password</div>
          <input type="password" placeholder="Enter your password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-primary-200 px-3 focus:outline-none focus:ring-2 focus:ring-primary-300" />
        </label>

        <label className="block mt-4">
          <div className="text-sm text-gray-900">Confirm Password</div>
          <input type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-primary-200 px-3 focus:outline-none focus:ring-2 focus:ring-primary-300" />
        </label>

        <div className="mt-6">
          <button className="h-11 w-full rounded-xl bg-primary-600 hover:bg-primary-700 transition text-white shadow" onClick={doSignup}>Sign Up</button>
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-700">Already have an account? </span>
          <button onClick={()=>window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }))} className="text-primary-600">Sign In</button>
        </div>
      </div>
    </div>
  )
}