import { useState } from "react";
import { 
  BuildingLibraryIcon, CheckBadgeIcon, ArrowPathIcon, 
  QrCodeIcon, CurrencyRupeeIcon 
} from "@heroicons/react/24/outline";

const MOCK_MANDATES = [
  { id: "LN-2024-001", customer: "Amit Sharma", bank: "HDFC Bank", account: "XXXX-1234", ifsc: "HDFC0001234", amount: 50000, penny_drop: "Verified", enach: "Pending" },
  { id: "LN-2024-002", customer: "Priya Singh", bank: "SBI", account: "XXXX-5678", ifsc: "SBIN0004567", amount: 120000, penny_drop: "Pending", enach: "Pending" },
  { id: "LN-2024-003", customer: "Rahul Verma", bank: "ICICI Bank", account: "XXXX-9012", ifsc: "ICIC0003456", amount: 75000, penny_drop: "Verified", enach: "Active" },
];

export default function MandateManagement() {
  const [mandates, setMandates] = useState(MOCK_MANDATES);
  const [processing, setProcessing] = useState(null);

  const handlePennyDrop = (id) => {
    setProcessing(id);
    setTimeout(() => {
      setMandates(mandates.map(m => m.id === id ? { ...m, penny_drop: "Verified" } : m));
      setProcessing(null);
      alert("Penny Drop Successful! Account Name Matched.");
    }, 2000);
  };

  const handleEnach = (id) => {
    setProcessing(id);
    setTimeout(() => {
      setMandates(mandates.map(m => m.id === id ? { ...m, enach: "Active" } : m));
      setProcessing(null);
      alert("eNACH Link Sent to Customer!");
    }, 2000);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50">
      
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
          <BuildingLibraryIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mandate & Banking</h1>
          <p className="text-slate-500 font-medium">Verify accounts and register repayment mandates before disbursement.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            <tr>
              <th className="px-8 py-5">Application ID</th>
              <th className="px-8 py-5">Customer</th>
              <th className="px-8 py-5">Bank Details</th>
              <th className="px-8 py-5">Penny Drop</th>
              <th className="px-8 py-5">eNACH Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {mandates.map((item) => (
              <tr key={item.id} className="group hover:bg-slate-50 transition">
                <td className="px-8 py-6 font-bold text-primary-600">{item.id}</td>
                <td className="px-8 py-6 font-bold text-slate-700">{item.customer}</td>
                <td className="px-8 py-6">
                  <div className="font-bold text-slate-800">{item.bank}</div>
                  <div className="font-mono text-xs text-slate-400 mt-1">{item.ifsc} • {item.account}</div>
                </td>
                <td className="px-8 py-6">
                  {item.penny_drop === 'Verified' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-bold text-xs">
                      <CheckBadgeIcon className="h-4 w-4" /> Verified
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending</span>
                  )}
                </td>
                <td className="px-8 py-6">
                  {item.enach === 'Active' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-bold text-xs">
                      <QrCodeIcon className="h-4 w-4" /> Active
                    </span>
                  ) : (
                    <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">Not Registered</span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    {item.penny_drop !== 'Verified' && (
                      <button 
                        onClick={() => handlePennyDrop(item.id)}
                        disabled={processing === item.id}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-primary-500 hover:text-primary-600 rounded-lg font-bold text-xs transition shadow-sm"
                      >
                        {processing === item.id ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CurrencyRupeeIcon className="h-4 w-4" />}
                        Penny Drop
                      </button>
                    )}
                    {item.penny_drop === 'Verified' && item.enach !== 'Active' && (
                      <button 
                        onClick={() => handleEnach(item.id)}
                        disabled={processing === item.id}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-bold text-xs hover:bg-primary-700 transition shadow-lg shadow-primary-200"
                      >
                        {processing === item.id ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <QrCodeIcon className="h-4 w-4" />}
                        Register eNACH
                      </button>
                    )}
                    {item.enach === 'Active' && (
                      <span className="text-slate-300 text-xs font-bold italic pr-2">Ready for Disbursal</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
