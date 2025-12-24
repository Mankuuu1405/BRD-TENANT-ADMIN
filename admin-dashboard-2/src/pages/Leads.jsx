import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { leadService } from "../services/leadService";
import { 
  FunnelIcon, PhoneIcon, UserPlusIcon, ArrowRightIcon, 
  XMarkIcon, CheckCircleIcon, ArrowPathIcon, CloudArrowUpIcon 
} from "@heroicons/react/24/outline";
import BulkUploadModal from "../components/BulkUploadModal"; // ✅ Imported Phase V Component

export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false); // ✅ New State for Bulk Upload
  
  // New Lead Form State
  const [newLead, setNewLead] = useState({ name: "", mobile: "", source: "Manual" });

  // 1. FETCH DATA
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await leadService.getAll();
      setLeads(response.data);
    } catch (err) {
      console.error("Failed to fetch leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // 2. ACTION: ADD LEAD
  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await leadService.create(newLead);
      setIsModalOpen(false);
      setNewLead({ name: "", mobile: "", source: "Manual" }); // Reset
      fetchLeads(); // Refresh list
      alert("Lead Added Successfully!");
    } catch (err) {
      alert("Failed to add lead: " + (err.response?.data?.message || err.message));
    }
  };

  // 3. ACTION: CONVERT LEAD
  const handleConvert = async (lead) => {
    if (!window.confirm(`Convert ${lead.name} into a Borrower?`)) return;
    
    try {
      // Backend should return the new Application ID or data
      const res = await leadService.convert(lead.id);
      
      // Navigate to the Loan Wizard, passing the lead data to pre-fill the form
      navigate("/loan-applications/new-personal-loan", { 
        state: { 
          prefill: {
            firstName: lead.name.split(" ")[0],
            lastName: lead.name.split(" ")[1] || "",
            mobile: lead.mobile
          }
        }
      });
    } catch (err) {
      alert("Conversion Failed: " + err.message);
    }
  };

  // 4. ACTION: LOG CALL
  const handleCall = async (id) => {
    const note = prompt("Enter Call Outcome (e.g., Interested, Call Back Later):");
    if (!note) return;

    try {
      await leadService.logCall(id, note);
      await leadService.updateStatus(id, "CONTACTED"); // Auto-update status
      fetchLeads();
      alert("Call Logged!");
    } catch (err) {
      alert("Failed to log call");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: "bg-blue-100 text-blue-800",
      CONTACTED: "bg-yellow-100 text-yellow-800",
      INTERESTED: "bg-green-100 text-green-800",
      CONVERTED: "bg-primary-100 text-primary-800",
      REJECTED: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FunnelIcon className="h-8 w-8 text-primary-600" />
            Lead Management (CRM)
          </h1>
          <p className="text-sm text-gray-500 mt-1">Capture, nurture, and qualify potential borrowers.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchLeads} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <ArrowPathIcon className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {/* ✅ Bulk Import Button */}
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 shadow-sm font-bold text-xs uppercase tracking-wide transition"
          >
            <CloudArrowUpIcon className="h-5 w-5" />
            Import CSV
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 shadow-sm font-bold text-xs uppercase tracking-wide transition"
          >
            <UserPlusIcon className="h-5 w-5" />
            Add Lead
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Name & Mobile</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Source</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading Leads...</td></tr>
            ) : leads.length === 0 ? (
               <tr><td colSpan="4" className="p-8 text-center text-gray-500">No leads found. Add one or import CSV to get started.</td></tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{lead.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{lead.mobile}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{lead.source}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <button 
                      onClick={() => handleCall(lead.id)}
                      title="Log Call" 
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                    >
                      <PhoneIcon className="h-5 w-5" />
                    </button>
                    {lead.status !== 'CONVERTED' && (
                      <button 
                        onClick={() => handleConvert(lead)}
                        className="flex items-center gap-1 text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition shadow-sm"
                      >
                        Convert <ArrowRightIcon className="h-3 w-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD LEAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Lead</h3>
              <button onClick={() => setIsModalOpen(false)}><XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  required 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newLead.name}
                  onChange={e => setNewLead({...newLead, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input 
                  required 
                  type="tel" 
                  pattern="[0-9]{10}"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newLead.mobile}
                  onChange={e => setNewLead({...newLead, mobile: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                  value={newLead.source}
                  onChange={e => setNewLead({...newLead, source: e.target.value})}
                >
                  <option value="Manual">Manual Entry</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white font-bold py-2.5 rounded-lg hover:bg-primary-700 transition">
                Save Lead
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ BULK UPLOAD MODAL COMPONENT */}
      <BulkUploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadComplete={() => {
           setIsUploadOpen(false);
           fetchLeads(); // Reload leads after import
           alert("Leads imported successfully!");
        }} 
      />

    </div>
  );
}
