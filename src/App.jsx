import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Branches from './pages/Branches.jsx'
import Loans from './pages/Loans.jsx'
import Logs from './pages/Logs.jsx'
import Calendar from './pages/Calendar.jsx'
import RolesPermissions from './pages/RolesPermissions.jsx'
import Tenants from './pages/Tenants.jsx'
import Users from './pages/Users.jsx'
import Settings from './pages/Settings.jsx'
import Profile from './pages/Profile.jsx'
import Notifications from './pages/Notifications.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import InternalTeamManagement from './pages/InternalTeamManagement.jsx'
import Rules from './pages/Rules.jsx'
import Categories from './pages/Categories.jsx'
import Reports from './pages/Reports.jsx'
import { dashboardApi } from './utils/api.js'

export default function App() {
  const [page, setPage] = useState(() => ((localStorage.getItem('auth') === 'true' || sessionStorage.getItem('auth') === 'true') ? 'dashboard' : 'login'))
  useEffect(() => {
    const h = (e) => setPage(e.detail)
    window.addEventListener('navigate', h)
    return () => window.removeEventListener('navigate', h)
  }, [])
  return (
    <div className="h-full bg-gray-50 text-gray-900">
      {page !== 'login' && page !== 'signup' && page !== 'forgot_password' && (
        <>
          <Sidebar activeKey={page} onNavigate={(key) => { setPage(key); window.dispatchEvent(new CustomEvent('navigate', { detail: key })) }} />
          <Header onRefresh={() => {
            window.dispatchEvent(new CustomEvent('dashboard-refresh'))
          }} onExportReport={async () => {
              const res = await dashboardApi.exportReport()
              if (res.ok && res.url) {
                const a = document.createElement('a')
                a.href = res.url
                a.download = 'dashboard.csv'
                document.body.appendChild(a)
                a.click()
                a.remove()
              }
            }} />
        </>
      )}
      <main className={page === 'login' || page === 'signup' || page === 'forgot_password' ? '' : 'pl-64 pt-16'}>
        {page === 'branches' ? <Branches /> : page === 'loans' ? <Loans /> : page === 'logs' ? <Logs /> : page === 'calendar' ? <Calendar /> : page === 'roles_permissions' ? <RolesPermissions /> : page === 'tenants' ? <Tenants /> : page === 'users' ? <Users /> : page === 'settings' ? <Settings /> : page === 'profile' ? <Profile /> : page === 'notifications' ? <Notifications /> : page === 'internal_team_management' ? <InternalTeamManagement /> : page === 'rules' ? <Rules /> : page === 'categories' ? <Categories /> : page === 'reports' ? <Reports /> : page === 'forgot_password' ? <ForgotPassword /> : page === 'signup' ? <Signup /> : page === 'login' ? <Login /> : <Dashboard />}
      </main>
    </div>
  )
}
