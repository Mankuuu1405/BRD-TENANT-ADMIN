import { useEffect, useState } from 'react'
import axios from '../utils/axiosInstance.js'

export default function Calendar() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Try to fetch from a hypothetical endpoint
  const load = async () => {
    setLoading(true)
    try {
      // Note: You need to create this endpoint in Django later!
      const res = await axios.get('/api/v1/adminpanel/holidays/')
      setHolidays(res.data)
    } catch (e) {
      console.warn("Calendar API not found, using empty state.")
      setError('Calendar backend not configured yet.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4 space-y-6">
      <div className="text-xl font-semibold">Calendar & Holidays</div>
      
      {error && <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg border border-yellow-200">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4">
        <div className="font-semibold mb-4">Holidays List</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Occasion</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((h, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-2">{h.date}</td>
                <td className="py-2">{h.name}</td>
              </tr>
            ))}
            {!holidays.length && (
              <tr><td colSpan="2" className="py-4 text-center text-gray-500">No holidays fetched from backend</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}