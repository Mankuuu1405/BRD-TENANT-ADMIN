import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ServerStackIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  BanknotesIcon,
  UserCircleIcon,
  CreditCardIcon,
  KeyIcon,
  ArrowsRightLeftIcon,
  DocumentMagnifyingGlassIcon,
  ClipboardDocumentCheckIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  CurrencyRupeeIcon,
  Squares2X2Icon,
  FunnelIcon,
  ShieldCheckIcon,
  BellAlertIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

const items = [
  // Dashboard & Core
  { path: "/dashboard", label: "Dashboard", icon: HomeIcon },
  
  // CRM
  { path: "/leads", label: "Leads (CRM)", icon: FunnelIcon },
  { path: "/add-business", label: "Add Business", icon: BuildingOfficeIcon },
  { path: "/branches", label: "Branches", icon: ServerStackIcon },

  // Configuration & Rules
  { path: "/risk-engine", label: "Risk Engine", icon: ShieldCheckIcon },
  { path: "/escalation-rules", label: "Escalation Matrix", icon: BellAlertIcon },
  { path: "/loans", label: "Loan Products", icon: BanknotesIcon },
  { path: "/rules-config", label: "Rules", icon: DocumentTextIcon },

  // Operational: LOS
  { path: "/loan-applications", label: "Loan Applications", icon: ClipboardDocumentCheckIcon },
  { path: "/mandates", label: "Mandate Management", icon: BuildingLibraryIcon },
  { path: "/disbursements", label: "Disbursement Queue", icon: CurrencyRupeeIcon },
  { path: "/collections", label: "Collections", icon: ExclamationTriangleIcon },

  // Admin & Settings
  { path: "/my-subscription", label: "My Subscription", icon: CreditCardIcon },
  { path: "/users", label: "Users", icon: UserCircleIcon },
  { path: "/channel-partners", label: "Channel Partners", icon: ArrowsRightLeftIcon },
  { path: "/third-party-users", label: "Third Party Users", icon: DocumentMagnifyingGlassIcon },
  { path: "/roles_permissions", label: "Roles & Permissions", icon: KeyIcon },
  { path: "/internal-team-dashboards", label: "Internal Dashboards", icon: Squares2X2Icon },
  { path: "/calendar", label: "Calendar", icon: CalendarDaysIcon },
  { path: "/settings", label: "System Settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  // Helper to determine active state
  const isActive = (path) => path === "/" ? activePath === "/" : activePath.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 h-screen flex flex-col z-50">
      
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-4 gap-3 border-b border-gray-100">
        <div className="h-9 w-9 rounded-xl bg-primary-600 grid place-items-center text-white">
          <BuildingOfficeIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="text-base font-semibold text-slate-800">Tenant Admin</div>
          <div className="text-xs text-gray-500">LOS Platform</div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              isActive(path)
                ? "text-primary-700 bg-primary-50 shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive(path) ? "text-primary-600" : "text-slate-400"}`} />
            <span className="whitespace-nowrap">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
