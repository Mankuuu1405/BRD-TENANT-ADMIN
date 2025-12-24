import { BanknotesIcon, UsersIcon } from '@heroicons/react/24/outline';
import KPICard from '../components/KPICard.jsx';
import MonthlyDisbursementChart from '../components/MonthlyDisbursementChart.jsx';
import LoanStatusPieChart from '../components/LoanStatusPieChart.jsx';
import { useEffect, useState } from 'react';
import { dashboardApi } from "../services/dashboardService";

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [error, setError] = useState(null);

  const statusItems = [
  { label: 'Active', color: '#2563eb' },
  { label: 'Paid Off', color: '#22c55e' },
  { label: 'Default', color: '#f43f5e' },
  { label: 'Pending', color: '#f59e0b' }
];


  const getCount = (label) => {
    const found = charts?.loanStatusDistribution?.find(
      x => (x.status || "").toLowerCase() === label.toLowerCase()
    );
    return found?.count ?? 0;
  };

  const fetchAll = async () => {
    try {
      const res = await dashboardApi.fetchDashboard();
      setKpis(res.data.kpis);
      setCharts(res.data.charts);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      setError("Unable to load dashboard data.");
      setCharts({ monthlyDisbursement: [], loanStatusDistribution: [], recentActivity: [] }); // fallback
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60000); // Auto refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  const hasMonthlyData = charts?.monthlyDisbursement?.length > 0;
  const hasLoanStatusData = charts?.loanStatusDistribution?.length > 0;

  return (
    <div className="p-4 space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={UsersIcon} title="Total Borrowers" value={kpis?.totalTenants ?? "-"} />
        <KPICard icon={UsersIcon} title="Active Users" value={kpis?.activeUsers ?? "-"} />
        <KPICard icon={BanknotesIcon} title="Total Loans" value={kpis?.totalLoans ?? "-"} />
        <KPICard icon={BanknotesIcon} title="Disbursed Amount" value={kpis?.disbursedAmount ?? "-"} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          {hasMonthlyData ? (
            <MonthlyDisbursementChart data={charts.monthlyDisbursement} />
          ) : (
            <div className="text-center text-gray-400 py-20">
              No monthly disbursement data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
          <div className="text-sm font-medium mb-2">Loan Status Distribution</div>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-3">
              {statusItems.map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm"
                      style={{ backgroundColor: s.color }}></span>
                    <span className="text-sm text-gray-700">{s.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{getCount(s.label)}</span>
                </div>
              ))}
            </div>

            {hasLoanStatusData ? (
              <LoanStatusPieChart data={charts.loanStatusDistribution} />
            ) : (
              <div className="text-center text-gray-400">
                No loan status data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
