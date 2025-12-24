import React, { useState, useEffect } from 'react';
import { 
  ChartPieIcon, DocumentMagnifyingGlassIcon, VideoCameraIcon, 
  CheckBadgeIcon, BanknotesIcon, XCircleIcon, ClockIcon, 
  ArrowPathIcon, CalculatorIcon, IdentificationIcon, 
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';
import { loanApplicationAPI } from '../services/loanApplicationService';

/**
 * --------------------------------------------------------------------------
 * LOAN UNDERWRITING CONSOLE (ADMIN SIDE)
 * --------------------------------------------------------------------------
 * A comprehensive dashboard for Credit Managers to review, verify, and 
 * sanction personal loan applications.
 */

export default function LoanUnderwritingConsole({ appId, onClose }) {
  // ------------------------------------------------------------------------
  // 1. STATE & DATA
  // ------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState('snapshot');
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [remarks, setRemarks] = useState("");

  // Simulated Fetch
  useEffect(() => {
    // In a real app, fetch data from API using appId
    // Mocking Data for "Ankur Sati" based on User Context
    setTimeout(() => {
      setAppData({
        id: 'PL-2025-8839',
        status: 'UNDERWRITING',
        personal: {
          name: 'Ankur Sati', dob: '1995-08-12', mobile: '9876543210', 
          pan: 'ABCDE1234F', score: 768
        },
        financial: {
          requested_amount: 500000, tenure: 24, income: 85000, 
          obligations: 15000, type: 'Salaried'
        },
        kyc: {
          video_verified: false, penny_drop: true, docs_verified: true
        }
      });
      setLoading(false);
    }, 1000);
  }, [appId]);

  // ------------------------------------------------------------------------
  // 2. LOGIC & CALCULATIONS (PHASE 5)
  // ------------------------------------------------------------------------
  const calculateMetrics = () => {
    if (!appData) return {};
    const monthlyIncome = appData.financial.income;
    const existingObligations = appData.financial.obligations;
    
    // Proposed EMI (Mock calc @ 14% ROI)
    const P = appData.financial.requested_amount;
    const r = 14 / 1200;
    const n = appData.financial.tenure;
    const proposedEMI = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const totalObligations = existingObligations + proposedEMI;
    const foir = (totalObligations / monthlyIncome) * 100;
    const netCashFlow = monthlyIncome - totalObligations - 15000; // 15k living exp

    return {
      proposedEMI: Math.round(proposedEMI),
      foir: foir.toFixed(2),
      netCashFlow: Math.round(netCashFlow),
      isRisky: foir > 60
    };
  };

  const metrics = calculateMetrics();

  // ------------------------------------------------------------------------
  // 3. ACTION HANDLERS
  // ------------------------------------------------------------------------
  const handleDecision = async (decision) => {
    if (!remarks) {
      alert("Please enter remarks before taking a decision.");
      return;
    }
    setProcessingAction(true);
    try {
      // Simulate API call to backend
      await new Promise(r => setTimeout(r, 1500));
      
      let newStatus = appData.status;
      if (decision === 'SANCTION') newStatus = 'SANCTIONED';
      if (decision === 'REJECT') newStatus = 'REJECTED';
      if (decision === 'HOLD') newStatus = 'HOLD';

      setAppData(prev => ({ ...prev, status: newStatus }));
      alert(`Application ${decision} successfully.`);
    } catch (e) {
      alert("Action Failed");
    } finally {
      setProcessingAction(false);
    }
  };

  const verifyVideo = (approved) => {
    setAppData(prev => ({ 
      ...prev, 
      kyc: { ...prev.kyc, video_verified: approved } 
    }));
  };

  // ------------------------------------------------------------------------
  // 4. RENDER HELPERS
  // ------------------------------------------------------------------------
  const StatusBadge = ({ status }) => {
    const colors = {
      NEW: 'bg-blue-100 text-blue-700',
      UNDERWRITING: 'bg-yellow-100 text-yellow-700',
      SANCTIONED: 'bg-primary-100 text-primary-700',
      DISBURSED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        activeTab === id 
          ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-200' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );

  // ------------------------------------------------------------------------
  // 5. MAIN RENDER
  // ------------------------------------------------------------------------
  if (loading) return <div className="p-10 text-center text-gray-500">Loading Console...</div>;

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex overflow-hidden font-sans">
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{appData.personal.name}</h2>
          <p className="text-xs text-gray-500 font-mono mt-1">ID: {appData.id}</p>
          <div className="mt-3">
            <StatusBadge status={appData.status} />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <TabButton id="snapshot" icon={ChartPieIcon} label="Risk Snapshot" />
          <TabButton id="details" icon={IdentificationIcon} label="Application Details" />
          <TabButton id="documents" icon={DocumentMagnifyingGlassIcon} label="Document Review" />
          <TabButton id="video" icon={VideoCameraIcon} label="Video KYC" />
          <div className="pt-4 mt-4 border-t border-gray-100">
             <TabButton id="decision" icon={CheckBadgeIcon} label="Final Decision" />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button onClick={onClose} className="w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Exit Console
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto p-8">
        
        {/* VIEW: SNAPSHOT (Calculations) */}
        {activeTab === 'snapshot' && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900">Underwriting Snapshot</h1>
            
            {/* Metric Cards */}
            <div className="grid grid-cols-4 gap-4">
               <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                 <div className="text-xs text-gray-500 uppercase font-bold">CIBIL Score</div>
                 <div className="text-3xl font-extrabold text-green-600 mt-2">{appData.personal.score}</div>
                 <div className="text-xs text-green-700 mt-1">Excellent</div>
               </div>
               <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                 <div className="text-xs text-gray-500 uppercase font-bold">Proposed EMI</div>
                 <div className="text-2xl font-bold text-gray-900 mt-2">₹{metrics.proposedEMI.toLocaleString()}</div>
               </div>
               <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                 <div className="text-xs text-gray-500 uppercase font-bold">Net Cash Flow</div>
                 <div className="text-2xl font-bold text-blue-600 mt-2">₹{metrics.netCashFlow.toLocaleString()}</div>
               </div>
               <div className={`p-5 rounded-xl border shadow-sm ${metrics.isRisky ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                 <div className="text-xs text-gray-500 uppercase font-bold">FOIR %</div>
                 <div className={`text-3xl font-extrabold mt-2 ${metrics.isRisky ? 'text-red-700' : 'text-green-700'}`}>
                   {metrics.foir}%
                 </div>
                 <div className="text-xs mt-1 font-medium">{metrics.isRisky ? 'High Risk' : 'Within Limits'}</div>
               </div>
            </div>

            {/* Automated Checks Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-800">Automated Knock-Out Checks</div>
               <table className="w-full text-sm text-left">
                 <tbody className="divide-y divide-gray-50">
                   {[
                     { check: "Age Check (21-60)", status: "Pass" },
                     { check: "Geo-Fencing (Negative Area)", status: "Pass" },
                     { check: "Internal Dedupe", status: "Pass" },
                     { check: "Penny Drop Verification", status: appData.kyc.penny_drop ? "Pass" : "Fail" }
                   ].map((row, i) => (
                     <tr key={i} className="hover:bg-gray-50">
                       <td className="px-6 py-3">{row.check}</td>
                       <td className="px-6 py-3 text-right">
                         <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{row.status}</span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {/* VIEW: VIDEO KYC (Phase 7) */}
        {activeTab === 'video' && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Video KYC Verification</h1>
            
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative group">
              {/* Mock Player */}
              <div className="absolute inset-0 flex items-center justify-center text-white/50">
                 <VideoCameraIcon className="h-20 w-20" />
                 <span className="sr-only">Video Player Mock</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur p-4 rounded-lg text-white text-xs">
                 <p><strong>Script Check:</strong> "My name is Ankur Sati. I have applied for a loan of 5 Lakhs from Aditsh."</p>
                 <p className="mt-1 opacity-75">Geo-Tag: 28.6139° N, 77.2090° E (New Delhi)</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6">
              <button 
                onClick={() => verifyVideo(true)}
                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${
                  appData.kyc.video_verified 
                  ? 'bg-green-50 border-green-500 text-green-700' 
                  : 'border-gray-200 hover:border-green-400 text-gray-600'
                }`}
              >
                <CheckBadgeIcon className="h-6 w-6" /> Accept Video
              </button>
              <button 
                onClick={() => verifyVideo(false)}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 text-gray-600 hover:text-red-700 flex items-center justify-center gap-2 font-bold transition-all"
              >
                <XCircleIcon className="h-6 w-6" /> Reject Video
              </button>
            </div>
          </div>
        )}

        {/* VIEW: DECISION (Phase 5/6) */}
        {activeTab === 'decision' && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Final Credit Decision</h1>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
               <h3 className="font-bold text-gray-800 mb-4">Summary of Verifications</h3>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>Credit Score & Financials</span>
                    <span className={metrics.isRisky ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                      {metrics.isRisky ? "High Risk" : "Safe"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Document Verification</span>
                    <span className="text-green-600 font-bold">Verified</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Video KYC</span>
                    <span className={appData.kyc.video_verified ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                      {appData.kyc.video_verified ? "Verified" : "Pending"}
                    </span>
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <label className="block text-sm font-bold text-gray-700 mb-2">Credit Manager Remarks</label>
               <textarea 
                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none h-32"
                 placeholder="Enter detailed justification for approval or rejection..."
                 value={remarks}
                 onChange={(e) => setRemarks(e.target.value)}
               ></textarea>

               <div className="grid grid-cols-3 gap-4 mt-6">
                 <button 
                   onClick={() => handleDecision('HOLD')}
                   disabled={processingAction}
                   className="py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                 >
                   Hold Case
                 </button>
                 <button 
                   onClick={() => handleDecision('REJECT')}
                   disabled={processingAction}
                   className="py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
                 >
                   Reject
                 </button>
                 <button 
                   onClick={() => handleDecision('SANCTION')}
                   disabled={processingAction || !appData.kyc.video_verified}
                   className="py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                   title={!appData.kyc.video_verified ? "Video KYC Pending" : ""}
                 >
                   Sanction Loan
                 </button>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
