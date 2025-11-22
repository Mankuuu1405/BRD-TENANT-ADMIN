import { HomeIcon, UsersIcon, ChartBarIcon, DocumentTextIcon, CubeIcon, ShieldCheckIcon, ServerStackIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, LinkIcon, BanknotesIcon, UserCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline'

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { key: 'integrations', label: 'Integrations ', icon: ServerStackIcon },
  { key: 'loans', label: 'Loans', icon: ShieldCheckIcon },
  { key: 'logs', label: 'Logs', icon: DocumentTextIcon },
  { key: 'users', label: 'Users', icon: UsersIcon },
  { key: 'reports', label: 'Reports', icon: ChartBarIcon },
  { key: 'tenants', label: 'Tenants', icon: CubeIcon },
  { key: 'roles_permissions', label: 'Roles & Permissions', icon: ShieldCheckIcon },
  { key: 'settings', label: ' System Settings', icon: Cog6ToothIcon }
]

export default function Sidebar({ activeKey, onNavigate }) {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="h-16 flex items-center px-4 gap-3 border-b border-gray-100">
        <div className="h-9 w-9 rounded-xl bg-primary-600 grid place-items-center text-white">
          <ShieldCheckIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="text-base font-semibold">Tenant Admin</div>
          <div className="text-xs text-gray-500">LOS Platform</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {items.map(({ key, label, icon: Icon }) => (
          <button onClick={() => onNavigate && key && onNavigate(key)} key={label} className={`w-full flex items-center gap-3 px-4 py-2 text-base rounded-lg ${key && activeKey===key ? 'text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'}`}>
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}
        <button onClick={() => {
          if (activeKey === 'dashboard') {
            window.dispatchEvent(new CustomEvent('open-subscription-plan'))
          } else {
            sessionStorage.setItem('open_subscription_plan','1')
            onNavigate && onNavigate('dashboard')
          }
        }} className="w-full flex items-center gap-3 px-4 py-2 text-base rounded-lg text-gray-700 hover:bg-gray-50">
          <CreditCardIcon className="h-5 w-5" />
          <span>Subscription & Plan</span>
        </button>
      </nav>
      <div className="p-2 border-t border-gray-100">
        <button onClick={() => { sessionStorage.setItem('auth','false'); window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' })) }} className="w-full flex items-center gap-3 px-4 py-2 text-base text-red-600 hover:bg-red-50 rounded-lg">
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}