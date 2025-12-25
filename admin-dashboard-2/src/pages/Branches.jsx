import { useEffect, useState, useMemo, useRef } from "react";
import axiosInstance from "../utils/axiosInstance";

// =============================================================================
// SECTION 1: ICONS
// =============================================================================

const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Building: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18M13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  Phone: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>,
  Mail: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
  Receipt: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>,
};

// =============================================================================
// SECTION 2: UI ATOMS
// =============================================================================

const FormLabel = ({ children, required }) => (
  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-0.5 select-none">
    {children}
    {required && <span className="text-rose-500 ml-1" title="Required">*</span>}
  </label>
);

const InputBox = ({ type = "text", placeholder, value, onChange, icon, className, disabled, ...props }) => (
  <div className={`relative flex items-center group ${className}`}>
    {icon && (
      <div className="absolute left-0 pl-4 flex items-center pointer-events-none z-10">
        <span className="text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200">{icon}</span>
      </div>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent block p-3.5 shadow-sm transition-all duration-200 ease-in-out outline-none placeholder:text-slate-300 disabled:bg-slate-100 disabled:text-slate-400 ${icon ? 'pl-11' : ''}`}
      {...props}
    />
  </div>
);

const TextareaBox = ({ placeholder, value, onChange, icon, rows = 3, ...props }) => (
  <div className="relative flex group">
    {icon && (
      <div className="absolute left-0 top-3.5 pl-4 flex items-start pointer-events-none z-10">
        <span className="text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200">{icon}</span>
      </div>
    )}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent block p-3.5 shadow-sm transition-all duration-200 ease-in-out outline-none placeholder:text-slate-300 resize-none ${icon ? 'pl-11' : ''}`}
      {...props}
    />
  </div>
);

const SelectBox = ({ options, value, onChange, placeholder, icon, ...props }) => (
  <div className="relative flex items-center group">
    {icon && (
      <div className="absolute left-0 pl-4 flex items-center pointer-events-none z-10">
        <span className="text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200">{icon}</span>
      </div>
    )}
    <select
      value={value}
      onChange={onChange}
      className={`w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent block p-3.5 shadow-sm transition-all duration-200 ease-in-out outline-none appearance-none cursor-pointer ${icon ? 'pl-11' : ''}`}
      {...props}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value || opt.id || opt}>
          {opt.label || opt.name || opt}
        </option>
      ))}
    </select>
    <div className="absolute right-4 pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200"><Icons.ChevronDown /></div>
  </div>
);

const ToggleSwitch = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
    <span className="text-sm font-bold text-slate-700">{label}</span>
    <button
      type="button"
      onClick={onChange}
      className={`${checked ? 'bg-blue-600' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
    >
      <span aria-hidden="true" className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
    </button>
  </div>
);

const FormGroup = ({ label, children, required, className }) => (
  <div className={`flex flex-col ${className}`}>
    {label && <FormLabel required={required}>{label}</FormLabel>}
    {children}
  </div>
);

const Button = ({ children, variant = "primary", onClick, disabled, className, icon }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 border border-transparent",
    secondary: "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
    danger: "bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 shadow-sm",
    ghost: "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-widest transition-all duration-200 transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3 text-xs ${variants[variant]} ${className}`}>
      {icon} {children}
    </button>
  );
};

// =============================================================================
// SECTION 3: COMPLEX COMPONENTS
// =============================================================================

const MultiSelectDropdown = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value) => {
    const newSelected = selected.includes(value) 
      ? selected.filter((item) => item !== value) 
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <div className="relative group" ref={wrapperRef}>
      <div 
        className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white min-h-[48px] p-2 flex flex-wrap gap-2 items-center cursor-pointer transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? (
          <span className="text-slate-400 pl-2 select-none">{placeholder}</span>
        ) : (
          selected.map((item) => (
            <span key={item} className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-200 flex items-center gap-1">
              {item}
              <span className="cursor-pointer hover:text-blue-900" onClick={(e) => {e.stopPropagation(); toggleOption(item);}}>×</span>
            </span>
          ))
        )}
        <div className="ml-auto pr-2 text-slate-400"><Icons.ChevronDown /></div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fade-in">
          {options.map((option) => (
            <div
              key={option.id || option.name}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
              onClick={() => toggleOption(option.name)}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected.includes(option.name) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                {selected.includes(option.name) && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-sm font-bold text-slate-700">{option.name}</span>
            </div>
          ))}
          {options.length === 0 && <div className="p-4 text-xs font-bold text-slate-400 text-center uppercase">No options found</div>}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// SECTION 4: MAIN PAGE
// =============================================================================

export default function Branches() {
  const [items, setItems] = useState([]);
  
  // Dropdown Data
  const [businessOptions, setBusinessOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  
  const [validationError, setValidationError] = useState("");
  const [search, setSearch] = useState("");

  // Helper to generate password
  const generatePassword = () => Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + "!";

  // Initial Form State matching the Table
  const initialForm = {
    tenant_id: "TENANT-123", // Hidden / From Context
    business_name: "",       // Dropdown
    contact_person: "",      // Input
    email: "",               // Input
    mobile_no: "",           // Input
    branch_name: "",         // Input
    address: "",             // Textarea
    gst_in: "",              // Input
    loan_product: [],        // Multi-select
    password: "",            // Manual Entry by default
    isVerified: false,       // Toggle
    status: "Active",        // Dropdown
  };

  const [form, setForm] = useState(initialForm);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // --- 1. LOCAL API WRAPPER DEFINITION (FIXED) ---
        // Ensure this points to the correct endpoint. Assuming '/branches/' exists in your backend.
        const res = await axiosInstance.get('tenants/branches/'); // Adjust endpoint as needed
        setItems(Array.isArray(res.data) ? res.data : []);
        
        // --- Mocking Backend Data for Dropdowns ---
        setBusinessOptions([
          { id: 1, name: "Alpha Corp Global" },
          { id: 2, name: "Beta Financials" },
          { id: 3, name: "Gamma Retail Services" },
        ]);
        
        setProductOptions([
          { id: 1, name: "Home Loan" },
          { id: 2, name: "Personal Loan" },
          { id: 3, name: "Car Loan" },
          { id: 4, name: "Gold Loan" },
          { id: 5, name: "Education Loan" },
        ]);
      } catch (err) { console.error("Error loading data", err); }
    };
    fetchData();
  }, []);

  const validateBranch = (data) => {
    if (!data.branch_name.trim()) return "Branch Name is required";
    if (!data.business_name) return "Please select a Business Name";
    if (data.mobile_no && !/^[0-9]{7,15}$/.test(data.mobile_no)) return "Invalid Mobile Number";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Invalid Email Address";
    // if (!data.password.trim()) return "Password is required"; // Optional check
    return null;
  };

  // --- 2. FIXED HANDLE SAVE ---
  const handleSave = async () => {
    const errorMsg = validateBranch(form);
    if (errorMsg) { setValidationError(errorMsg); return; }
    
    try {
      console.log("Submitting Branch Payload:", form); // DEBUGGING

      // Call Local API wrapper using axiosInstance directly
      const res = await axiosInstance.post('tenants/branches/', form);
      
      setItems([...items, res.data]);
      setCreating(false); 
      setForm(initialForm); 
      setValidationError("");
    } catch (e) { 
      console.error("Create Failed:", e);
      setValidationError("Failed to create branch. Check console for details."); 
    }
  };

  const handleUpdate = async () => {
    if (!editing.branch_name.trim()) { setValidationError("Branch Name is required"); return; }
    
    try {
      const res = await axiosInstance.put(`tenants/branches/${editing.id}/`, editing);
      setItems(items.map(b => b.id === editing.id ? res.data : b));
      setEditing(null); setValidationError("");
    } catch (e) { setValidationError("Failed to update branch"); }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`tenants/branches/${deleting.id}/`);
      setItems(items.filter(b => b.id !== deleting.id));
      setDeleting(null);
    } catch (e) { alert("Delete failed"); }
  };

  const filteredItems = useMemo(() => items.filter(b => 
    b.branch_name?.toLowerCase().includes(search.toLowerCase()) || 
    b.business_name?.toLowerCase().includes(search.toLowerCase())
  ), [items, search]);

  return (
    <div className="p-12 max-w-[1800px] mx-auto min-h-screen bg-slate-50 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Branch Management</h1>
          <p className="text-slate-500 text-lg font-medium">Manage branch details, products, and verification.</p>
        </div>
        <Button onClick={() => { setCreating(true); setForm(initialForm); }} icon={<Icons.Plus />}>Add Branch</Button>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-white">
           <div className="relative flex-1 max-w-lg">
             <span className="absolute left-5 top-4 text-slate-400"><Icons.Search /></span>
             <input 
               className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" 
               placeholder="Search by Branch Name..." 
               value={search} onChange={e => setSearch(e.target.value)}
             />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-widest text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-8 py-6">Branch Info</th>
                <th className="px-8 py-6">Contact Details</th>
                <th className="px-8 py-6">Assigned Products</th>
                <th className="px-8 py-6">Status & Verification</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((b) => (
                <tr key={b.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-800 text-base">{b.branch_name}</div>
                    <div className="text-xs font-bold text-blue-600 mt-1">{b.business_name}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><span className="text-slate-400"><Icons.User/></span> {b.contact_person || "-"}</div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500"><span className="text-slate-400"><Icons.Phone/></span> {b.mobile_no || "-"}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {Array.isArray(b.loan_product) && b.loan_product.slice(0, 2).map((prod, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{prod}</span>
                      ))}
                      {Array.isArray(b.loan_product) && b.loan_product.length > 2 && <span className="text-[10px] text-slate-400">+{b.loan_product.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${b.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {b.status}
                      </span>
                      {b.isVerified && <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600"><Icons.ShieldCheck /> Verified</div>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { 
                          // Ensure array format for multiselect
                          const formattedProducts = Array.isArray(b.loan_product) ? b.loan_product : (b.loan_product ? b.loan_product.split(',') : []);
                          setEditing({ ...b, loan_product: formattedProducts }); 
                          setValidationError(""); 
                        }} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Icons.Edit />
                      </button>
                      <button onClick={() => setDeleting(b)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Icons.Trash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No branches found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Icons.Building /></div>
                 <div>
                   <h2 className="text-xl font-extrabold text-slate-900">Add New Branch</h2>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Tenant ID: {form.tenant_id}</p>
                 </div>
               </div>
               <button onClick={() => setCreating(false)} className="text-slate-400 hover:text-rose-500 transition"><Icons.Close /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
               {/* 1. Branch Identity */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2"><h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest border-b border-blue-100 pb-2 mb-2">Identity & Business</h4></div>
                  <FormGroup label="Branch Name" required>
                    <InputBox value={form.branch_name} onChange={e => setForm({...form, branch_name: e.target.value})} placeholder="e.g. Mumbai Main" icon={<Icons.Building />} />
                  </FormGroup>
                  <FormGroup label="Business Name" required>
                    <SelectBox options={businessOptions} value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})} placeholder="Select Business Entity" icon={<Icons.Building />} />
                  </FormGroup>
                  <FormGroup label="Allowed Products">
                    <MultiSelectDropdown options={productOptions} selected={form.loan_product} onChange={val => setForm({...form, loan_product: val})} placeholder="Select Products" />
                  </FormGroup>
                  <FormGroup label="GSTIN">
                    <InputBox value={form.gst_in} onChange={e => setForm({...form, gst_in: e.target.value})} placeholder="GST Number" icon={<Icons.Receipt />} />
                  </FormGroup>
               </div>

               {/* 2. Contact */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2"><h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest border-b border-blue-100 pb-2 mb-2">Contact & Address</h4></div>
                  <FormGroup label="Contact Person">
                    <InputBox value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} placeholder="Manager Name" icon={<Icons.User />} />
                  </FormGroup>
                  <FormGroup label="Mobile No">
                    <InputBox type="tel" value={form.mobile_no} onChange={e => setForm({...form, mobile_no: e.target.value})} placeholder="+91 98765 43210" icon={<Icons.Phone />} />
                  </FormGroup>
                  <FormGroup label="Email">
                    <InputBox type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="branch@email.com" icon={<Icons.Mail />} />
                  </FormGroup>
                  <FormGroup label="Branch Address" className="col-span-2">
                    <TextareaBox value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full branch address details..." icon={<Icons.MapPin />} />
                  </FormGroup>
               </div>

               {/* 3. Status & Security */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2"><h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest border-b border-blue-100 pb-2 mb-2">Status & Security</h4></div>
                  
                  {/* UPDATED PASSWORD FIELD - EDITABLE BY DEFAULT */}
                  <FormGroup label="Branch Password" required>
                    <div className="flex gap-2 relative">
                        <InputBox 
                            type="text" 
                            value={form.password} 
                            onChange={e => setForm({...form, password: e.target.value})} 
                            placeholder="Enter password"
                            icon={<Icons.Lock />} 
                        />
                        <button 
                            type="button"
                            onClick={() => setForm({...form, password: generatePassword()})} 
                            className="absolute right-2 top-2 p-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                            title="Auto-Generate"
                        >
                            Generate
                        </button>
                    </div>
                  </FormGroup>

                  <FormGroup label="Current Status">
                    <SelectBox options={[{value: 'Active', label: 'Active'}, {value: 'Inactive', label: 'Inactive'}]} value={form.status} onChange={e => setForm({...form, status: e.target.value})} />
                  </FormGroup>
                  <div className="col-span-2">
                    <ToggleSwitch label="Branch Verification Status" checked={form.isVerified} onChange={() => setForm({...form, isVerified: !form.isVerified})} />
                  </div>
               </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
               <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
               <Button variant="primary" onClick={handleSave} disabled={!form.branch_name || !form.business_name}>Create Branch</Button>
            </div>
            {validationError && <div className="absolute bottom-20 right-8 bg-rose-50 text-rose-600 px-4 py-2 rounded-lg text-xs font-bold border border-rose-200 shadow-lg">{validationError}</div>}
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><Icons.Edit /></div>
                 <div>
                   <h2 className="text-xl font-extrabold text-slate-900">Edit Branch</h2>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{editing.branch_name}</p>
                 </div>
               </div>
               <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-rose-500 transition"><Icons.Close /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
               {/* 1. Identity */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Branch Name" required>
                    <InputBox value={editing.branch_name} onChange={e => setEditing({...editing, branch_name: e.target.value})} icon={<Icons.Building />} />
                  </FormGroup>
                  <FormGroup label="Business Name" required>
                    <SelectBox options={businessOptions} value={editing.business_name} onChange={e => setEditing({...editing, business_name: e.target.value})} icon={<Icons.Building />} />
                  </FormGroup>
                  <FormGroup label="Allowed Products">
                    <MultiSelectDropdown options={productOptions} selected={editing.loan_product || []} onChange={val => setEditing({...editing, loan_product: val})} placeholder="Select Products" />
                  </FormGroup>
                  <FormGroup label="GSTIN">
                    <InputBox value={editing.gst_in} onChange={e => setEditing({...editing, gst_in: e.target.value})} icon={<Icons.Receipt />} />
                  </FormGroup>
               </div>

               {/* 2. Contact */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Contact Person"><InputBox value={editing.contact_person} onChange={e => setEditing({...editing, contact_person: e.target.value})} icon={<Icons.User />} /></FormGroup>
                  <FormGroup label="Mobile No"><InputBox value={editing.mobile_no} onChange={e => setEditing({...editing, mobile_no: e.target.value})} icon={<Icons.Phone />} /></FormGroup>
                  <FormGroup label="Email"><InputBox type="email" value={editing.email} onChange={e => setEditing({...editing, email: e.target.value})} icon={<Icons.Mail />} /></FormGroup>
                  <FormGroup label="Address" className="col-span-2"><TextareaBox value={editing.address} onChange={e => setEditing({...editing, address: e.target.value})} icon={<Icons.MapPin />} /></FormGroup>
               </div>

               {/* 3. Status */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Current Status">
                    <SelectBox options={[{value: 'Active', label: 'Active'}, {value: 'Inactive', label: 'Inactive'}]} value={editing.status} onChange={e => setEditing({...editing, status: e.target.value})} />
                  </FormGroup>
                  <div className="col-span-2">
                    <ToggleSwitch label="Branch Verification Status" checked={editing.isVerified} onChange={() => setEditing({...editing, isVerified: !editing.isVerified})} />
                  </div>
               </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
               <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
               <Button variant="primary" onClick={handleUpdate}>Save Changes</Button>
            </div>
            {validationError && <div className="absolute bottom-20 right-8 bg-rose-50 text-rose-600 px-4 py-2 rounded-lg text-xs font-bold border border-rose-200 shadow-lg">{validationError}</div>}
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-slate-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
            <h3 className="text-xl font-extrabold text-slate-800">Confirm Deletion</h3>
            <p className="text-slate-500 mt-2 mb-6 text-sm">Are you sure you want to delete <span className="font-bold text-slate-800">{deleting.branch_name}</span>? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete}>Delete Branch</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`.animate-fade-in { animation: fadeIn 0.3s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
