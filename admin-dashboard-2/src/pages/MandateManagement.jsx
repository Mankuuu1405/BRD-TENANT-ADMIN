import { useState, useEffect } from "react";
import { mandateAPI } from "../services/mandateService";
import {
  BuildingLibraryIcon, CheckBadgeIcon, ArrowPathIcon,
  QrCodeIcon, CurrencyRupeeIcon
} from "@heroicons/react/24/outline";

export default function MandateManagement() {
  const [mandates, setMandates] = useState([]);
  const [processing, setProcessing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMandates = async () => {
      try {
        setLoading(true);
        const data = await mandateAPI.getAll();
        setMandates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load mandates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMandates();
  }, []);

  const handlePennyDrop = async (id) => {
    setProcessing(id);
    try {
      await mandateAPI.verifyPennyDrop(id);
      setMandates(mandates.map(m => m.id === id ? { ...m, penny_drop: "Verified" } : m));
      alert("Penny Drop Successful!");
    } catch (err) {
      alert("Penny Drop Failed. Please check bank details.");
    } finally {
      setProcessing(null);
    }
  };

  const handleEnach = async (id) => {
    setProcessing(id);
    try {
      await mandateAPI.registerEnach(id);
      setMandates(mandates.map(m => m.id === id ? { ...m, enach: "Active" } : m));
      alert("eNACH Link Sent to Customer!");
    } catch (err) {
      alert("eNACH Registration Failed.");
    } finally {
      setProcessing(null);
    }
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
                <td className="px-8 py-6 font-bold text-indigo-600">{item.id}</td>
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
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 rounded-lg font-bold text-xs transition shadow-sm"
                      >
                        {processing === item.id ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CurrencyRupeeIcon className="h-4 w-4" />}
                        Penny Drop
                      </button>
                    )}
                    {item.penny_drop === 'Verified' && item.enach !== 'Active' && (
                      <button
                        onClick={() => handleEnach(item.id)}
                        disabled={processing === item.id}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
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