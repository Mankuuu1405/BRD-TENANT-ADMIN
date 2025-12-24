import { useState } from 'react'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const submit = () => {
    setError(null);
    setStatus(null);

    if (!email) {
      setError('Enter your email to reset password');
      return;
    }

    // create OTP code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    try {
      sessionStorage.setItem('fp_email', email);
      sessionStorage.setItem('fp_otp_code', code);
      sessionStorage.setItem('fp_opt_in', 'false');
    } catch {}

    // redirect using react router
    navigate("/sendlink");
  };

  return (
    <div className="min-h-screen bg-white grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-primary-200 bg-white shadow-card p-6">

        {/* Header */}
        <div className="grid place-items-center">
          <div className="h-12 w-12 rounded-full bg-primary-50 grid place-items-center text-primary-600">
            <ShieldCheckIcon className="h-6 w-6" />
          </div>
          <div className="mt-4 text-2xl font-semibold text-gray-900 text-center">
            Forgot Password
          </div>
          <div className="mt-1 text-sm text-gray-600 text-center">
            Enter your email to receive a reset link
          </div>
        </div>

        {error && (
          <div className="mt-3 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        {status && (
          <div className="mt-3 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg p-3">
            {status}
          </div>
        )}

        {/* Email */}
        <label className="block mt-6">
          <div className="text-sm text-gray-900">Email</div>
          <input
            type="email"
            placeholder="admin@los.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full h-11 rounded-xl border border-primary-200 px-3 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </label>

        {/* Button */}
        <div className="mt-6">
          <button
            className="h-11 w-full rounded-xl bg-primary-600 hover:bg-primary-700 transition text-white"
            onClick={submit}
          >
            Send Reset Link
          </button>
        </div>

        {/* Back to Login */}
        <div className="mt-4 text-center text-sm">
          <button
            onClick={() => navigate("/login")}
            className="text-primary-600"
          >
            Back to Login
          </button>
        </div>

      </div>
    </div>
  )
}
