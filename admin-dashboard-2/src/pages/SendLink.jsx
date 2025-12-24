import { useEffect, useState } from 'react'
import { ShieldCheckIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export default function SendLink() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [optIn, setOptIn] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpInput, setOtpInput] = useState('')

  useEffect(() => {
    try {
      const e = sessionStorage.getItem('fp_email') || ''
      const c = sessionStorage.getItem('fp_otp_code') || ''
      const oi = sessionStorage.getItem('fp_opt_in') === 'true'
      setEmail(e)
      setOtpCode(c)
      setOptIn(oi)
      if (e) setStatus(`Reset OTP sent. Check your inbox. (demo OTP: ${c})`)
    } catch {}
  }, [])

  const submit = () => {
    setError(null)
    setStatus(null)
    if (!email) { setError('Enter your email to reset password'); return }
    const code = String(Math.floor(100000 + Math.random()*900000))
    setOtpCode(code)
    try {
      sessionStorage.setItem('fp_email', email)
      sessionStorage.setItem('fp_otp_code', code)
      sessionStorage.setItem('fp_opt_in', String(optIn))
    } catch {}
    setStatus(`Reset OTP sent. Check your inbox. (demo OTP: ${code})`)
  }

  const verify = () => {
    setError(null)
    if (!otpInput) { setError('Enter the 6-digit OTP'); return }
    if (otpInput === otpCode) {
      setStatus('OTP verified. Reset link sent to your email')
    } else {
      setError('Invalid OTP. Please try again')
    }
  }

  return (
    <div className="min-h-screen bg-white grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-primary-200 bg-white shadow-card p-6">
        <div className="grid place-items-center">
          <div className="h-12 w-12 rounded-full bg-primary-50 grid place-items-center text-primary-600">
            <ShieldCheckIcon className="h-6 w-6" />
          </div>
          <div className="mt-4 text-2xl font-semibold text-gray-900 text-center">Forgot Password</div>
          <div className="mt-1 text-sm text-gray-600 text-center">Enter your email to receive a password reset link</div>
        </div>

        {error && <div className="mt-3 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}
        {status && <div className="mt-3 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg p-3">{status}</div>}

        <label className="block mt-6">
          <div className="text-sm text-gray-900">Email Address</div>
          <div className="mt-1 relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <EnvelopeIcon className="h-5 w-5" />
            </span>
            <input type="email" placeholder="admin@los.com" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full h-11 rounded-xl border border-primary-200 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </div>
        </label>

        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={optIn} onChange={(e)=>setOptIn(e.target.checked)} />
          <span>Opt-in to product updates and emails</span>
        </label>

        <div className="mt-4">
          <label className="block">
            <div className="text-sm text-gray-900">Enter OTP</div>
            <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="Enter the 6-digit code" value={otpInput} onChange={(e)=>setOtpInput(e.target.value.replace(/\D/g,''))} className="mt-1 w-full h-11 rounded-xl border border-primary-200 px-3 focus:outline-none focus:ring-2 focus:ring-primary-300" />
          </label>
          <div className="mt-3">
            <button className="h-11 w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition" onClick={verify}>Verify OTP</button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button className="h-11 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition" onClick={submit}>Send reset link</button>
          <button onClick={()=>window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }))} className="text-primary-600 text-sm">Back to sign in</button>
        </div>
      </div>
    </div>
  )
}
