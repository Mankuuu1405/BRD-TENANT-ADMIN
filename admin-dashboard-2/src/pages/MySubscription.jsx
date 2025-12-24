import { useEffect, useState } from "react";
import { subscriptionAPI } from "../services/subscriptionService";
import { 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  Users, 
  Briefcase, 
  Calendar,
  ArrowUpCircle,
  PauseCircle,
  XCircle,
  PlayCircle
} from "lucide-react";

export default function MySubscription() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Mock usage data (Replace this with actual data from your backend if available)
  const [usageData, setUsageData] = useState({
    current_borrowers: 0,
    current_users: 1
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await subscriptionAPI.getMySubscription();
      setSub(res.data);
      // If your API returns current usage stats, set them here:
      // setUsageData({ current_borrowers: res.data.current_borrowers, ... })
    } catch (e) {
      setError(e.response?.data?.detail || "Unable to load subscription");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const doAction = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action} this subscription?`)) return;

    setActionLoading(true);
    setMessage(null);
    try {
      const res = await subscriptionAPI.takeAction(action);
      setMessage({ type: 'success', text: res.data.message });
      await load();
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.detail || "Something went wrong" });
    }
    setActionLoading(false);
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} />;
  if (!sub) return <EmptyState />;

  // Calculate Progress Percentages
  const borrowerPercent = Math.min((usageData.current_borrowers / sub.no_of_borrowers) * 100, 100);
  const userPercent = Math.min((usageData.current_users / sub.no_of_users) * 100, 100);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Subscription</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your plan, limits, and billing details.</p>
        </div>
        <StatusBadge status={sub.status} />
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Main Plan Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Plan Info */}
          <div className="space-y-4 md:border-r md:border-slate-100 pr-4">
            <div>
              <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Current Plan</div>
              <div className="text-3xl font-bold text-slate-900">{sub.subscription_name}</div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">₹{Number(sub.subscription_amount).toLocaleString()}</span>
                <span className="text-slate-500">/ {sub.type_of}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Excludes taxes</div>
            </div>
            <div className="pt-2">
               {/* Upgrade / Renew Buttons */}
               <div className="flex gap-2">
                 <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors">
                    <ArrowUpCircle size={16} /> Upgrade Plan
                 </button>
                 <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                    Renew
                 </button>
               </div>
            </div>
          </div>

          {/* Column 2: Usage Meters */}
          <div className="space-y-6 md:border-r md:border-slate-100 pr-4">
            <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Usage Limits</div>
            
            {/* Borrower Meter */}
            <UsageMeter 
              icon={<Briefcase size={16} />}
              label="Active Borrowers"
              current={usageData.current_borrowers}
              limit={sub.no_of_borrowers}
              percent={borrowerPercent}
              color="emerald"
            />

            {/* User Meter */}
            <UsageMeter 
              icon={<Users size={16} />}
              label="System Users"
              current={usageData.current_users}
              limit={sub.no_of_users}
              percent={userPercent}
              color="blue"
            />
          </div>

          {/* Column 3: Dates & Actions */}
          <div className="space-y-6 flex flex-col justify-between">
             <div>
                <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Validity</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Calendar size={18} /></div>
                    <div>
                      <div className="text-xs text-slate-500">Started On</div>
                      <div className="font-medium text-slate-900">{new Date(sub.subscription_from).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><CreditCard size={18} /></div>
                    <div>
                      <div className="text-xs text-slate-500">Renews On</div>
                      <div className="font-medium text-slate-900">{new Date(sub.subscription_to).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
             </div>

             {/* Functional Actions (Pause/Cancel) */}
             <div className="pt-4 border-t border-slate-100">
               <p className="text-xs text-slate-400 mb-2">Manage Status</p>
               <div className="flex flex-wrap gap-2">
                  {sub.status === "Active" && (
                    <>
                      <SmallActionBtn 
                        label="Pause" 
                        icon={<PauseCircle size={14} />} 
                        onClick={() => doAction('pause')} 
                        loading={actionLoading}
                      />
                      <SmallActionBtn 
                        label="Cancel" 
                        icon={<XCircle size={14} />} 
                        onClick={() => doAction('cancel')} 
                        loading={actionLoading} 
                        danger 
                      />
                    </>
                  )}
                  {sub.status === "Pause" && (
                     <SmallActionBtn 
                        label="Resume" 
                        icon={<PlayCircle size={14} />} 
                        onClick={() => doAction('resume')} 
                        loading={actionLoading}
                      />
                  )}
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ---------------------------
// SUB-COMPONENTS
// ---------------------------

const StatusBadge = ({ status }) => {
  const styles = {
    Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Trial: "bg-purple-100 text-purple-700 border-purple-200",
    Pause: "bg-amber-100 text-amber-700 border-amber-200",
    Cancel: "bg-rose-100 text-rose-700 border-rose-200",
  };
  
  return (
    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status === 'Active' && '● '}
      {status}
    </span>
  );
};

const UsageMeter = ({ icon, label, current, limit, percent, color }) => {
  const colorClasses = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
          {icon} {label}
        </div>
        <div className="text-xs font-bold text-slate-900">
          {current} <span className="text-slate-400 font-normal">/ {limit}</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${colorClasses[color]}`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

const SmallActionBtn = ({ label, icon, onClick, loading, danger }) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors
      ${danger 
        ? "border-rose-200 text-rose-600 hover:bg-rose-50" 
        : "border-slate-200 text-slate-600 hover:bg-slate-50"
      } disabled:opacity-50`}
  >
    {icon} {loading ? "..." : label}
  </button>
);

const LoadingSkeleton = () => (
  <div className="p-6 max-w-5xl mx-auto space-y-6 animate-pulse">
    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
    <div className="h-64 bg-slate-100 rounded-2xl"></div>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="p-6 max-w-5xl mx-auto text-center">
    <div className="inline-flex p-4 rounded-full bg-red-100 text-red-600 mb-4"><AlertCircle size={32} /></div>
    <h3 className="text-lg font-bold text-slate-900">Unable to load Subscription</h3>
    <p className="text-slate-500">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="p-6 max-w-5xl mx-auto text-center py-20">
    <CreditCard size={48} className="mx-auto text-slate-300 mb-4" />
    <h3 className="text-lg font-bold text-slate-900">No Active Subscription</h3>
    <p className="text-slate-500">Please choose a plan to get started.</p>
    <button className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium">View Plans</button>
  </div>
);