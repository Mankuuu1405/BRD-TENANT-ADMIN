import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { loanApplicationAPI } from "../services/loanApplicationService";

// COMPONENTS
import LoanUnderwritingConsole from "../components/LoanUnderwritingConsole";
import ProductSelectionModal from "../components/ProductSelectionModal"; // <--- NEW IMPORT

// ICONS
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function LoanApplications() {
  const navigate = useNavigate(); 
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // MODAL STATES
  const [selectedAppId, setSelectedAppId] = useState(null); // Underwriting Console
  const [isProductModalOpen, setIsProductModalOpen] = useState(false); // <--- NEW STATE
  
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ------------------------------------------------------------------
  // 1. DATA FETCHING
  // ------------------------------------------------------------------
  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;

      const response = await loanApplicationAPI.getAll(params);
      setApplications(response.data);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
      setError("Unable to load applications. Please check your connection or try again.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // 2. HANDLERS
  // ------------------------------------------------------------------
  
  // Handle Product Selection from Modal
  const handleProductSelect = (productId) => {
    setIsProductModalOpen(false); // Close Modal
    
    if (productId === 'PERSONAL_LOAN') {
      // Navigate to the Personal Loan Wizard
      navigate("/loan-applications/new-personal-loan");
    } else {
      // Future logic for other products
      alert("This module is under development.");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: "bg-blue-100 text-blue-800",
      KNOCKOUT_PENDING: "bg-orange-100 text-orange-800",
      UNDERWRITING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      SANCTIONED: "bg-primary-100 text-primary-800 border-primary-200",
      PRE_DISBURSEMENT: "bg-primary-100 text-primary-800",
      DISBURSED: "bg-green-100 text-green-800 border-green-200",
      REJECTED: "bg-red-100 text-red-800",
      HOLD: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-50 text-gray-600";
  };

  // ------------------------------------------------------------------
  // 3. RENDER
  // ------------------------------------------------------------------
  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Applications Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage applications, underwriting checks, and disbursements across all products.
          </p>
        </div>
        <div>
           {/* UPDATED: Button now opens the Product Selection Modal */}
           <button 
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition shadow-sm font-medium"
          >
            <PlusIcon className="h-5 w-5" />
            New Application
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-96 group">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search Name, Mobile or ID..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
          />
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
            <FunnelIcon className="h-4 w-4 text-gray-500" />
            <select 
              className="bg-transparent text-sm outline-none text-gray-700 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New Applications</option>
              <option value="UNDERWRITING">Underwriting</option>
              <option value="SANCTIONED">Sanctioned</option>
              <option value="PRE_DISBURSEMENT">Pre-Disbursement</option>
              <option value="DISBURSED">Disbursed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          
          <button 
            onClick={fetchApplications} 
            className="p-2.5 hover:bg-gray-100 rounded-lg text-gray-500 border border-transparent hover:border-gray-200 transition-all"
            title="Refresh Data"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Application Details</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount & Tenure</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-12 text-gray-500">Loading applications...</td></tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-red-600 bg-red-50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ExclamationCircleIcon className="h-6 w-6" />
                    <span className="font-medium">{error}</span>
                    <button onClick={fetchApplications} className="text-sm underline hover:text-red-800">Retry</button>
                  </div>
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-12 text-gray-500">No applications found. Create one to get started.</td></tr>
            ) : (
              applications.map((app) => (
                <tr key={app.application_id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                         {app.first_name?.[0]}{app.last_name?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{app.first_name} {app.last_name}</div>
                        <div className="text-xs text-gray-500 font-mono">{app.application_id.split('-')[0]}...</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{app.product_name || "Personal Loan"}</div>
                    <div className="text-xs text-gray-500">{app.income_type}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">
                      ₹{Number(app.requested_amount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-500">{app.requested_tenure} Months</div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                      {app.status.replace(/_/g, " ")}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1">
                       {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedAppId(app.application_id)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Process &gt;
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- MODALS / OVERLAYS ---------------- */}
      
      {/* 1. Underwriting Console (Credit Manager) */}
      {selectedAppId && (
        <LoanUnderwritingConsole 
          appId={selectedAppId} 
          onClose={() => { setSelectedAppId(null); fetchApplications(); }} 
        />
      )}

      {/* 2. Product Selection Modal (NEW) */}
      {isProductModalOpen && (
        <ProductSelectionModal 
          onClose={() => setIsProductModalOpen(false)}
          onSelect={handleProductSelect}
        />
      )}
      
    </div>
  );
}
