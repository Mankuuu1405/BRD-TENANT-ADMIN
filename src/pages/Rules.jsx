import { useEffect, useState } from 'react'
import axios from '../utils/axiosInstance.js'

export default function Rules() {
  const [rules, setRules] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch hypothetical rules config
    axios.get('/api/v1/adminpanel/configuration/rules/')
      .then(res => setRules(res.data))
      .catch(() => setError('Rules engine backend not connected.'))
  }, [])

  return (
    <div className="p-4 space-y-4">
      <div className="text-xl font-semibold">Rules Configuration</div>
      {error && <div className="bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200">{error}</div>}
      
      <div className="bg-white p-6 rounded-xl shadow-card text-center text-gray-500">
        {Object.keys(rules).length > 0 ? (
          <pre className="text-left bg-gray-50 p-4 rounded">{JSON.stringify(rules, null, 2)}</pre>
        ) : (
          "No active rules configuration found on server."
        )}
      </div>
    </div>
  )
}