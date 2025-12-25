import { useEffect, useState } from 'react'
import axios from '../utils/axiosInstance.js'

export default function Categories() {
  const [loanTypes, setLoanTypes] = useState([])
  const [docTypes, setDocTypes] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch dynamic categories from backend
  const load = async () => {
    setLoading(true)
    try {
      const [resLoans, resDocs] = await Promise.all([
        axios.get('/api/v1/adminpanel/loan-products/'),
        axios.get('/api/v1/adminpanel/document-types/')
      ])
      setLoanTypes(resLoans.data)
      setDocTypes(resDocs.data)
    } catch (e) {
      console.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const Card = ({ title, items, subtitle }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span key={item.id || idx} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm border border-gray-200">
            {item.name}
          </span>
        ))}
        {!items.length && <span className="text-sm text-gray-400">No items found</span>}
      </div>
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Type of Category (Master Data)</div>
        <button onClick={load} className="text-sm text-primary-600 hover:underline">Refresh Data</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Loan Products" subtitle="Fetched from Loan Product Master" items={loanTypes} />
        <Card title="Document Types" subtitle="Fetched from Document Type Master" items={docTypes} />
        
        {/* Placeholder for others currently not in backend */}
        <Card title="Lead Sources" subtitle="Static (Backend update required)" items={[{name:'Website'}, {name:'Referral'}]} />
        <Card title="Customer Categories" subtitle="Static (Backend update required)" items={[{name:'New'}, {name:'Existing'}]} />
      </div>
    </div>
  )
}