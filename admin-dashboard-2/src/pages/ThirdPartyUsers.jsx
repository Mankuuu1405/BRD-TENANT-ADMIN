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
  Briefcase: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.053c-.255-.986-1.063-1.76-2.118-2.025-1.996-.5-4.145-.762-6.378-.762-2.233 0-4.382.262-6.378.762-1.055.265-1.863 1.039-2.118 2.025m21 0v-2.796c0-1.093-.787-2.036-1.872-2.18-2.087-.277-4.216-.42-6.378-.42-2.162 0-4.291.143-6.378.42-1.085.144-1.872 1.087-1.872 2.18v2.796M15 12.75a3 3 0 11-6 0 3 3 0 016 0zm-3-3.75V3m0 0L9.75 5.25M12 3l2.25 2.25" /></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>,
  Identification: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>
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
        <span className="text-slate-400 group-focus-within:text-primary-500 transition-colors duration-200">{icon}</span>
      </div>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent block p-3.5 shadow-sm transition-all duration-200 ease-in-out outline-none placeholder:text-slate-300 disabled:bg-slate-100 disabled:text-slate-400 ${icon ? 'pl-11' : ''}`}
      {...props}
    />
  </div>
);

const SelectBox = ({ options, value, onChange, placeholder, icon, ...props }) => (
  <div className="relative flex items-center group">
    {icon && (
      <div className="absolute left-0 pl-4 flex items-center pointer-events-none z-10">
        <span className="text-slate-400 group-focus-within:text-primary-500 transition-colors duration-200">{icon}</span>
      </div>
    )}
    <select
      value={value}
      onChange={onChange}
      className={`w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-transparent block p-3.5 shadow-sm transition-all duration-200 ease-in-out outline-none appearance-none cursor-pointer ${icon ? 'pl-11' : ''}`}
      {...props}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value || opt.id || opt}>
          {opt.label || opt.name || opt}
        </option>
      ))}
    </select>
    <div className="absolute right-4 pointer-events-none text-slate-400 group-focus-within:text-primary-600 transition-colors duration-200"><Icons.ChevronDown /></div>
  </div>
);

const ToggleSwitch = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
    <span className="text-sm font-bold text-slate-700">{label}</span>
    <button
      type="button"
      onClick={onChange}
      className={`${checked ? 'bg-primary-600' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
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
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20",
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
// SECTION 3: MAIN PAGE
// =============================================================================

export default function ThirdPartyUsers() {
  const [items, setItems] = useState([]);
  
  // Data for Selects (Mock)
  const [states, setStates] = useState([
    { label: "Maharashtra", value: "Maharashtra" },
    { label: "Karnataka", value: "Karnataka" },
    { label: "Delhi", value: "Delhi" },
    { label: "Tamil Nadu", value: "Tamil Nadu" },
  ]);
  const [countries, setCountries] = useState([
    { label: "India", value: "India" },
  ]);
  const [cities, setCities] = useState([
    { label: "Mumbai", value: "Mumbai" },
    { label: "Bangalore", value: "Bangalore" },
    { label: "Delhi", value: "Delhi" },
    { label: "Chennai", value: "Chennai" },
  ]);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  
  const [validationError, setValidationError] = useState("");
  const [search, setSearch] = useState("");

  const initialForm = {
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    organizationName: '',
    thirdPartyType: '',
    pan: '',
    address1: '',
    address2: '',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    password: '',
    confirmPassword: '',
    isVerified: false,
    status: 'ACTIVE',
  };

  const [form, setForm] = useState(initialForm);

  // Mock Load Data
  useEffect(() => {
    // Simulate fetching data
    const mockData = [
      {
        id: 1,
        firstName: "Ramesh",
        lastName: "Verma",
        email: "ramesh.v@valuation.com",
        mobileNumber: "9876543210",
        organizationName: "Verma Valuations",
        thirdPartyType: "VALUER",
        status: "ACTIVE",
        isVerified: true,
        city: "Mumbai",
        state: "Maharashtra"
      }
    ];
    setItems(mockData);
  }, []);

  // Validation
  const validate = (data) => {
    if (!data.firstName.trim()) return "First Name is required";
    if (!data.email.trim()) return "Email is required";
    if (!data.organizationName.trim()) return "Organization Name is required";
    if (!data.thirdPartyType) return "User Type is required";
    
    // Password check only for creation
    if (creating) {
      if (!data.password) return "Password is required";
      if (data.password !== data.confirmPassword) return "Passwords do not match";
    }
    return null;
  };

  const handleSave = () => {
    const errorMsg = validate(form);
    if (errorMsg) { setValidationError(errorMsg); return; }
    
    const newUser = { ...form, id: Date.now() };
    setItems([...items, newUser]);
    setCreating(false);
    setForm(initialForm);
    setValidationError("");
  };

  const handleUpdate = () => {
    if (!editing.firstName.trim()) { setValidationError("First Name is required"); return; }
    
    setItems(items.map(u => u.id === editing.id ? editing : u));
    setEditing(null);
    setValidationError("");
  };

  const handleDelete = () => {
    setItems(items.filter(u => u.id !== deleting.id));
    setDeleting(null);
  };

  const filteredItems = useMemo(() => {
    const s = search.toLowerCase();
    return items.filter(u => 
      u.firstName?.toLowerCase().includes(s) || 
      u.lastName?.toLowerCase().includes(s) ||
      u.organizationName?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s)
    );
  }, [items, search]);

  return (
    <div className="p-12 max-w-[1800px] mx-auto min-h-screen bg-slate-50 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Third Party Users</h1>
          <p className="text-slate-500 text-lg font-medium">Manage external partners like Valuers and Advisors.</p>
        </div>
        <Button onClick={() => { setCreating(true); setForm(initialForm); }} icon={<Icons.Plus />}>Add Third Party</Button>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-white">
           <div className="relative flex-1 max-w-lg">
             <span className="absolute left-5 top-4 text-slate-400"><Icons.Search /></span>
             <input 
               className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400" 
               placeholder="Search by Name, Email or Organization..." 
               value={search} onChange={e => setSearch(e.target.value)}
             />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-widest text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-8 py-6">User Identity</th>
                <th className="px-8 py-6">Organization & Role</th>
                <th className="px-8 py-6">Contact Info</th>
                <th className="px-8 py-6">Location</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((u) => (
                <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-800 text-base">{u.firstName} {u.lastName}</div>
                    <div className="text-xs font-bold text-indigo-600 mt-1 flex items-center gap-1">
                        <Icons.User /> User ID: #{u.id}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-700">{u.organizationName}</div>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                      {u.thirdPartyType}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><span className="text-slate-400"><Icons.Mail/></span> {u.email}</div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500"><span className="text-slate-400"><Icons.Phone/></span> {u.mobileNumber}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="text-sm font-bold text-slate-600">{u.city || "-"}</div>
                     <div className="text-xs text-slate-400">{u.state}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {u.status}
                      </span>
                      {u.isVerified && <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600"><Icons.ShieldCheck /> Verified</div>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing(u); setValidationError(""); }} 
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Icons.Edit />
                      </button>
                      <button onClick={() => setDeleting(u)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Icons.Trash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No users found</td></tr>}
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
                 <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center"><Icons.User /></div>
                 <div>
                   <h2 className="text-xl font-extrabold text-slate-900">Add Third Party User</h2>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Create New Partner Account</p>
                 </div>
               </div>
               <button onClick={() => setCreating(false)} className="text-slate-400 hover:text-rose-500 transition"><Icons.Close /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
               {/* 1. Identity */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2"><h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest border-b border-indigo-100 pb-2 mb-2">Identity & Role</h4></div>
                  
                  <FormGroup label="First Name" required>
                    <InputBox value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="First Name" icon={<Icons.User />} />
                  </FormGroup>
                  <FormGroup label="Last Name">
                    <InputBox value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Last Name" icon={<Icons.User />} />
                  </FormGroup>
                  
                  <FormGroup label="Organization Name" required>
                    <InputBox value={form.organizationName} onChange={e => setForm({...form, organizationName: e.target.value})} placeholder="Company Name" icon={<Icons.Building />} />
                  </FormGroup>
                  
                  <FormGroup label="Third Party Type" required>
                    <SelectBox options={[
                        {value: 'VALUER', label: 'Valuer'}, 
                        {value: 'ADVISOR', label: 'Advisor'}, 
                        {value: 'CONSULTANT', label: 'Consultant'}
                    ]} value={form.thirdPartyType} onChange={e => setForm({...form, thirdPartyType: e.target.value})} placeholder="Select Type" icon={<Icons.Briefcase />} />
                  </FormGroup>

                  <FormGroup label="PAN Number">
                    <InputBox value={form.pan} onChange={e => setForm({...form, pan: e.target.value})} placeholder="PAN Card Number" icon={<Icons.Identification />} />
                  </FormGroup>
               </div>

               {/* 2. Contact */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2"><h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest border-b border-indigo-100 pb-2 mb-2">Contact Details</h4></div>
                  <FormGroup label="Mobile No" required>
                    <InputBox value={form.mobileNumber} onChange={e => setForm({...form, mobileNumber: e.target.value})} placeholder="+91 98765 43210" icon={<Icons.Phone />} />
                  </FormGroup>
                  <FormGroup label="Email" required>
                    <InputBox type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="user@example.com" icon={<Icons.Mail />} />
                  </FormGroup>
               </div>

                {/* 3. Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2"><h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest border-b border-indigo-100 pb-2 mb-2">Location</h4></div>
                  <FormGroup label="Address Line 1"><InputBox value={form.address1} onChange={e => setForm({...form, address1: e.target.value})} icon={<Icons.MapPin />} /></FormGroup>
                  <FormGroup label="Address Line 2"><InputBox value={form.address2} onChange={e => setForm({...form, address2: e.target.value})} icon={<Icons.MapPin />} /></FormGroup>
                  
                  <FormGroup label="Country">
                    <SelectBox options={countries} value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
                  </FormGroup>
                   <FormGroup label="State">
                    <SelectBox options={states} value={form.state} onChange={e => setForm({...form, state: e.target.value})} placeholder="Select State" />
                  </FormGroup>
                   <FormGroup label="City">
                    <SelectBox options={cities} value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="Select City" />
                  </FormGroup>
                  <FormGroup label="Pincode"><InputBox value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} placeholder="000000" /></FormGroup>
               </div>

               {/* 4. Security */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2"><h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest border-b border-indigo-100 pb-2 mb-2">Security & Access</h4></div>
                  <FormGroup label="Password" required>
                    <InputBox type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} icon={<Icons.Lock />} />
                  </FormGroup>
                  <FormGroup label="Confirm Password" required>
                    <InputBox type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} icon={<Icons.Lock />} />
                  </FormGroup>

                  <FormGroup label="Status">
                    <SelectBox options={[{value: 'ACTIVE', label: 'Active'}, {value: 'INACTIVE', label: 'Inactive'}]} value={form.status} onChange={e => setForm({...form, status: e.target.value})} />
                  </FormGroup>
                  <div className="col-span-1 md:col-span-2 mt-4">
                    <ToggleSwitch label="Verification Verified" checked={form.isVerified} onChange={() => setForm({...form, isVerified: !form.isVerified})} />
                  </div>
               </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
               <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
               <Button variant="primary" onClick={handleSave}>Create User</Button>
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
                   <h2 className="text-xl font-extrabold text-slate-900">Edit User</h2>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{editing.firstName} {editing.lastName}</p>
                 </div>
               </div>
               <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-rose-500 transition"><Icons.Close /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
               {/* 1. Identity */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="First Name" required>
                    <InputBox value={editing.firstName} onChange={e => setEditing({...editing, firstName: e.target.value})} icon={<Icons.User />} />
                  </FormGroup>
                  <FormGroup label="Last Name">
                    <InputBox value={editing.lastName} onChange={e => setEditing({...editing, lastName: e.target.value})} icon={<Icons.User />} />
                  </FormGroup>
                  
                  <FormGroup label="Organization Name" required>
                    <InputBox value={editing.organizationName} onChange={e => setEditing({...editing, organizationName: e.target.value})} icon={<Icons.Building />} />
                  </FormGroup>
                  
                  <FormGroup label="Third Party Type" required>
                    <SelectBox options={[
                        {value: 'VALUER', label: 'Valuer'}, 
                        {value: 'ADVISOR', label: 'Advisor'}, 
                        {value: 'CONSULTANT', label: 'Consultant'}
                    ]} value={editing.thirdPartyType} onChange={e => setEditing({...editing, thirdPartyType: e.target.value})} icon={<Icons.Briefcase />} />
                  </FormGroup>

                  <FormGroup label="PAN Number">
                    <InputBox value={editing.pan} onChange={e => setEditing({...editing, pan: e.target.value})} icon={<Icons.Identification />} />
                  </FormGroup>
               </div>

               {/* 2. Contact */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Mobile No" required>
                    <InputBox value={editing.mobileNumber} onChange={e => setEditing({...editing, mobileNumber: e.target.value})} icon={<Icons.Phone />} />
                  </FormGroup>
                  <FormGroup label="Email" required>
                    <InputBox type="email" value={editing.email} onChange={e => setEditing({...editing, email: e.target.value})} icon={<Icons.Mail />} />
                  </FormGroup>
               </div>

                {/* 3. Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Address Line 1"><InputBox value={editing.address1} onChange={e => setEditing({...editing, address1: e.target.value})} icon={<Icons.MapPin />} /></FormGroup>
                  <FormGroup label="Address Line 2"><InputBox value={editing.address2} onChange={e => setEditing({...editing, address2: e.target.value})} icon={<Icons.MapPin />} /></FormGroup>
                  
                  <FormGroup label="Country">
                    <SelectBox options={countries} value={editing.country} onChange={e => setEditing({...editing, country: e.target.value})} />
                  </FormGroup>
                   <FormGroup label="State">
                    <SelectBox options={states} value={editing.state} onChange={e => setEditing({...editing, state: e.target.value})} placeholder="Select State" />
                  </FormGroup>
                   <FormGroup label="City">
                    <SelectBox options={cities} value={editing.city} onChange={e => setEditing({...editing, city: e.target.value})} placeholder="Select City" />
                  </FormGroup>
                  <FormGroup label="Pincode"><InputBox value={editing.pincode} onChange={e => setEditing({...editing, pincode: e.target.value})} placeholder="000000" /></FormGroup>
               </div>

               {/* 4. Status */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Status">
                    <SelectBox options={[{value: 'ACTIVE', label: 'Active'}, {value: 'INACTIVE', label: 'Inactive'}]} value={editing.status} onChange={e => setEditing({...editing, status: e.target.value})} />
                  </FormGroup>
                  <div className="col-span-1 md:col-span-2 mt-4">
                    <ToggleSwitch label="Verification Verified" checked={editing.isVerified} onChange={() => setEditing({...editing, isVerified: !editing.isVerified})} />
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
            <p className="text-slate-500 mt-2 mb-6 text-sm">Are you sure you want to delete <span className="font-bold text-slate-800">{deleting.firstName} {deleting.lastName}</span>? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete}>Delete User</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`.animate-fade-in { animation: fadeIn 0.3s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
