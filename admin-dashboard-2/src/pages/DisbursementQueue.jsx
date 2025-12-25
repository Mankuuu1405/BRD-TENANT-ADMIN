import { useState, useEffect } from "react";
import { BanknotesIcon, CheckCircleIcon, ArrowRightIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { disbursementAPI } from "../services/disbursementService";

export default function DisbursementQueue() {
  // Mock Data: Only loans with status 'DOCS_SIGNED' appear here
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const data = await disbursementAPI.getQueue();
        setQueue(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load queue:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const handleDisburse = async (loan) => {
    if (!confirm(`Confirm transfer of ₹${loan.amount.toLocaleString()} to ${loan.name}?`)) return;

    setProcessingId(loan.id); // Show spinner for this specific row
    try {
      await disbursementAPI.disburse(loan.id);
      
      // Success: Remove from UI queue
      setQueue(prev => prev.filter(q => q.id !== loan.id));
      alert(`💰 Funds transferred successfully to ${loan.bank}!`);
    } catch (err) {
      alert("Disbursement failed. Please check balance or connectivity.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-green-100 rounded-xl text-green-700">
          <BanknotesIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disbursement Queue (Finance)</h1>
          <p className="text-sm text-gray-500">Phase 7a: Release funds for sanctioned & signed applications.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Application Details</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Sanctioned Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Bank Details</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {queue.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">No Pending Disbursements.</td></tr>
            ) : queue.map((loan) => (
              <tr key={loan.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{loan.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{loan.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-lg font-bold text-green-700">₹{loan.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Net Disbursal</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{loan.bank}</div>
                  <div className="text-xs text-gray-500 font-mono">{loan.ifsc}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDisburse(loan)} disabled={processingId === loan.id}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm"
                  >
                    {processingId === loan.id ? (
                      <>Processing... <ArrowPathIcon className="h-4 w-4 animate-spin" /></>
                    ) : (
                      <>Disburse Funds <ArrowRightIcon className="h-4 w-4" /></>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}