import { BanknotesIcon, UsersIcon } from '@heroicons/react/24/outline'
import KPICard from '../components/KPICard.jsx'
import MonthlyDisbursementChart from '../components/MonthlyDisbursementChart.jsx'
import LoanStatusPieChart from '../components/LoanStatusPieChart.jsx'
import { useEffect, useState } from 'react'
import { dashboardApi } from '../utils/api.js'

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [charts, setCharts] = useState(null)
  const [error, setError] = useState(null)
  const [planOpen, setPlanOpen] = useState(false)
  const [plan, setPlan] = useState({ loan_products: [], users_allowed: '', clients_allowed: '', subscription_type: 'Trial', status: 'Active' })

  const fetchAll = async () => {
    setError(null)
    const res = await dashboardApi.fetchDashboard()
    if (res.ok) {
      setKpis(res.data.kpis)
      setCharts(res.data.charts)
    } else {
      setError('Data currently unavailable. Please refresh.')
    }
  }

  useEffect(() => {
    fetchAll()
    const i = setInterval(fetchAll, 60000)
    const h = () => fetchAll()
    window.addEventListener('dashboard-refresh', h)
    const openPlan = () => setPlanOpen(true)
    window.addEventListener('open-subscription-plan', openPlan)
    try {
      const saved = localStorage.getItem('subscription_plan')
      if (saved) setPlan(JSON.parse(saved))
    } catch {}
    try {
      const open = sessionStorage.getItem('open_subscription_plan')
      if (open === '1') {
        setPlanOpen(true)
        sessionStorage.removeItem('open_subscription_plan')
      }
    } catch {}
    return () => {
      clearInterval(i)
      window.removeEventListener('dashboard-refresh', h)
      window.removeEventListener('open-subscription-plan', openPlan)
    }
  }, [])

  return (
    <div className="p-4 space-y-4">
      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={UsersIcon} title="Total Tenants" value={kpis?.totalTenants ?? '-'} trend={kpis?.tenantsTrend ?? null} />
        <KPICard icon={UsersIcon} title="Active Users" value={kpis?.activeUsers ?? '-'} trend={kpis?.usersTrend ?? null} />
        <KPICard icon={BanknotesIcon} title="Total Loans" value={kpis?.totalLoans ?? '-'} trend={kpis?.loansTrend ?? null} />
        <KPICard icon={BanknotesIcon} title="Disbursed Amount" value={kpis?.disbursedAmount ?? '-'} trend={kpis?.amountTrend ?? null} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MonthlyDisbursementChart data={charts?.monthlyDisbursement ?? []} />
        <LoanStatusPieChart data={charts?.loanStatusDistribution ?? []} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          <div className="text-sm font-medium mb-2">Quick Actions</div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'tenants' }))} className="h-20 rounded-lg bg-primary-50 text-primary-700">Add Tenant</button>
            <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'reports' }))} className="h-20 rounded-lg bg-green-50 text-green-700">View Reports</button>
            <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'settings' }))} className="h-20 rounded-lg bg-purple-50 text-purple-700">System Settings</button>
            <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'notifications' }))} className="h-20 rounded-lg bg-amber-50 text-amber-700">Notifications</button>
            <button onClick={() => setPlanOpen(true)} className="h-20 rounded-lg bg-blue-50 text-blue-700">Subscription & Plan Details</button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          <div className="text-sm font-medium mb-2">Recent Activity</div>
          <div className="space-y-3">
            {(charts?.recentActivity ?? []).map((a, i) => (
              <div key={i} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                <div className="flex flex-col">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-sm text-gray-600">{a.subtitle}</div>
                </div>
                <div className="text-sm text-gray-500">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {planOpen && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40">
          <div className="bg-white w-full max-w-2xl rounded-xl border border-gray-200 shadow-card p-4">
            <div className="text-lg font-semibold">Subscription & Plan Details</div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <div className="text-sm text-gray-700">Loan Products</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {['Personal Loan','Home Loan','Auto Loan','Business Loan'].map(p => {
                    const selected = plan.loan_products.includes(p)
                    return (
                      <label key={p} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={selected} onChange={() => {
                          const next = selected ? plan.loan_products.filter(x=>x!==p) : [...plan.loan_products, p]
                          setPlan({ ...plan, loan_products: next })
                        }} />
                        <span>{p}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              <label className="block">
                <div className="text-sm text-gray-700">Number of Users Allowed</div>
                <input type="number" value={plan.users_allowed} onChange={(e)=>setPlan({ ...plan, users_allowed: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" placeholder="e.g. 50" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Number of Clients Allowed</div>
                <input type="number" value={plan.clients_allowed} onChange={(e)=>setPlan({ ...plan, clients_allowed: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" placeholder="e.g. 500" />
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Subscription Type</div>
                <select value={plan.subscription_type} onChange={(e)=>setPlan({ ...plan, subscription_type: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                  <option value="Trial">Trial</option>
                  <option value="Paid">Paid</option>
                </select>
              </label>
              <label className="block">
                <div className="text-sm text-gray-700">Initial Status</div>
                <select value={plan.status} onChange={(e)=>setPlan({ ...plan, status: e.target.value })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setPlanOpen(false)}>Close</button>
              <button className="h-9 px-3 rounded-lg bg-primary-600 text-white" onClick={()=>{ try { localStorage.setItem('subscription_plan', JSON.stringify(plan)) } catch {}; setPlanOpen(false) }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
