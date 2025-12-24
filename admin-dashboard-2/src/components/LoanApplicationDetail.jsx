import { useState } from "react";
import { loanApplicationAPI } from "../services/loanApplicationService";
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ShieldCheckIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";

export default function LoanApplicationDetail({ app, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [remarks, setRemarks] = useState("");

  // Determine Profile Logic
  const isSalaried = app.income_type === "Salaried";

  // ------------------------------------------------------------------
  // ACTION HANDLERS
  // ------------------------------------------------------------------
  const handleStatusChange = async (newStatus) => {
    setProcessing(true);
    try {
      await loanApplicationAPI.updateStatus(app.id || app.application_id, newStatus, remarks);
      alert(`Application Moved to ${newStatus}`);
      onClose();
    } catch (err) {
      alert("Status Update Failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const handleVideoAction = async (decision) => {
    try {
      await loanApplicationAPI.verifyVideo(app.id || app.application_id, decision, "Manual Review");
      alert(`Video ${decision === 'approve' ? 'Verified' : 'Rejected'}`);
    } catch (err) {
      alert("Video Action Failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end transition-opacity backdrop-blur-sm">
      <div className="bg-gray-50 w-full max-w-5xl h-full shadow-2xl flex flex-col animate-slide-in border-l border-gray-200">
        
        {/* ---------------- HEADER ---------------- */}
        <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-start shrink-0 z-10">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {app.first_name} {app.last_name}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                app.status === 'SANCTIONED' ? 'bg-green-100 text-green-700 border-green-200' : 
                app.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                'bg-blue-100 text-blue-700 border-blue-200'
              }`}>
                {app.status?.replace(/_/g, " ")}
              </span>
            </div>
            <div className="mt-1 text-gray-500 text-sm flex items-center gap-3">
              <span className="font-mono">ID: {app.application_id}</span>
              <span>•</span>
              <span>{app.product_name || "Personal Loan"}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition">
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>

        {/* ---------------- BODY (SCROLLABLE) ---------------- */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* SECTION A: ONBOARDING & IDENTITY */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <SectionHeader title="A. Onboarding & Identity" icon={ShieldCheckIcon} />
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              <Field label="First Name" value={app.first_name} />
              <Field label="Last Name" value={app.last_name} />
              <Field label="Mobile Number" value={app.mobile_no} badge="OTP Verified" badgeColor="green" />
              <Field label="Email Address" value={app.email} badge="Link Verified" badgeColor="green" />
              
              <Field label="Date of Birth" value={app.dob} />
              <Field label="Gender" value={app.gender === 'M' ? 'Male' : app.gender === 'F' ? 'Female' : 'Other'} />
              <Field label="PAN Number" value={app.pan_number} badge="API Verified" badgeColor="blue" />
              <Field label="Aadhaar Number" value={app.aadhaar_number || "xxxx-xxxx-xxxx"} badge="API Verified" badgeColor="blue" />
            </div>
          </section>

          {/* SECTION B: PROFILE & ADDRESS */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <SectionHeader title="B. Profile & Address" icon={MapPinIcon} />
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Field label="Income Type" value={app.income_type} highlight />
                 <Field label="Borrower Type" value="Individual" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" /> Residential Address
                  </h4>
                  <div className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {app.res_address_line1}<br/>
                    {app.res_address_line2 && <>{app.res_address_line2}<br/></>}
                    {app.res_city}, {app.res_state} - <strong>{app.res_pincode}</strong><br/>
                    {app.res_country || "India"}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <BuildingOfficeIcon className="h-4 w-4" /> Office/Business Address (Geo-Fence)
                  </h4>
                  <div className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {app.office_address_line1 || "N/A"}<br/>
                    {app.office_city} - <strong>{app.office_pincode}</strong>
                    {app.is_geo_limit_passed ? (
                      <div className="mt-2 text-xs text-green-600 font-bold flex items-center gap-1">
                        <CheckCircleIcon className="h-4 w-4" /> Location OK
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-red-600 font-bold flex items-center gap-1">
                         Negative Area
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION C: FINANCIALS */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <SectionHeader title="C. Financials" icon={BanknotesIcon} />
            <div className="p-6">
              {/* Common Request */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-xs text-blue-600 font-bold uppercase">Loan Amount Requested</div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">₹{Number(app.requested_amount).toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-xs text-blue-600 font-bold uppercase">Tenure Requested</div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">{app.requested_tenure} Months</div>
                </div>
              </div>

              {/* Conditional Logic Fields */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                 <h4 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">
                   {isSalaried ? "Salaried Details" : "Self-Employed Details"}
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <Field label={isSalaried ? "Monthly Salary" : "Monthly Net Income"} value={`₹${Number(app.monthly_income).toLocaleString()}`} />
                   
                   {isSalaried ? (
                     <>
                        <Field label="Employment Type" value={app.employment_type || "Private"} />
                        <Field label="Employer Name" value={app.employer_name || "N/A"} />
                     </>
                   ) : (
                     <>
                        <Field label="Annual Turnover" value={app.annual_turnover ? `₹${app.annual_turnover}` : "N/A"} />
                        <Field label="Business Name" value={app.business_name || "N/A"} />
                     </>
                   )}
                 </div>
              </div>
            </div>
          </section>

          {/* SECTION D: BANK & DISBURSAL */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <SectionHeader title="D. Bank & Disbursal" icon={BuildingOfficeIcon} />
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Bank Account Number" value={app.bank_account_number} />
              <Field label="IFSC Code" value={app.ifsc_code} />
              <Field label="Account Type" value={app.account_type} />
              <Field label="Mandate Type" value={app.mandate_type} />
              <Field 
                label="Disbursement Consent" 
                value={app.disbursement_consent ? "Given" : "Pending"} 
                badge={app.disbursement_consent ? "Signed" : "Waiting"}
                badgeColor={app.disbursement_consent ? "green" : "orange"}
              />
              <Field 
                 label="Penny Drop Check" 
                 value={app.is_penny_drop_verified ? "Success" : "Pending"} 
                 badgeColor={app.is_penny_drop_verified ? "green" : "orange"}
              />
            </div>
          </section>

          {/* SECTION E: DOCUMENT UPLOADS */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <SectionHeader title="E. Document Uploads" icon={DocumentTextIcon} />
            <div className="p-6 space-y-4">
              
              <h4 className="text-xs font-bold text-gray-500 uppercase">Standard Documents</h4>
              <div className="grid grid-cols-1 gap-3">
                 <DocItem name="Identity Proof (PAN / Aadhaar)" status="Verified" type="PDF" />
                 <DocItem name="Address Proof (Utility Bill / Passport)" status="Verified" type="PDF" />
                 <DocItem name="Bank Statement (Last 12 Months)" status="Pending Review" type="PDF" />
                 <DocItem 
                   name={isSalaried ? "Salary Slips (3 Months) + Form 16" : "ITR (3 Years) + GST Returns"} 
                   status="Pending Review" 
                   type="PDF" 
                 />
              </div>

              <div className="mt-6 border-t pt-4">
                 <h4 className="text-xs font-bold text-orange-600 uppercase mb-3 flex items-center gap-2">
                   <VideoCameraIcon className="h-4 w-4" /> Mandatory: Self-Declaration Video
                 </h4>
                 
                 <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-orange-900 mb-1">Video KYC Status: 
                        <span className={`ml-2 font-bold ${app.is_video_kyc_verified ? 'text-green-600' : 'text-red-600'}`}>
                          {app.is_video_kyc_verified ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </div>
                      <p className="text-xs text-orange-700">Required for unsecured personal loans.</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleVideoAction('approve')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition"
                      >
                        Approve Video
                      </button>
                      <button 
                         onClick={() => handleVideoAction('reject')}
                         className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded text-xs font-medium transition"
                      >
                        Reject
                      </button>
                    </div>
                 </div>
              </div>
            </div>
          </section>

        </div>

        {/* ---------------- FOOTER: ACTION PANEL ---------------- */}
        <div className="bg-white border-t border-gray-200 p-6 z-10 shrink-0">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
             <input 
               type="text" 
               placeholder="Enter Credit Manager Remarks..." 
               className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
               value={remarks}
               onChange={(e) => setRemarks(e.target.value)}
             />
             
             <div className="flex gap-3 w-full md:w-auto">
               <button 
                 onClick={() => handleStatusChange("HOLD")}
                 className="flex-1 md:flex-none px-6 py-2.5 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-sm"
               >
                 Hold
               </button>
               <button 
                 onClick={() => handleStatusChange("REJECTED")}
                 className="flex-1 md:flex-none px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition text-sm shadow-sm"
               >
                 Reject
               </button>
               <button 
                 onClick={() => handleStatusChange("SANCTIONED")}
                 disabled={app.status === 'SANCTIONED'}
                 className="flex-1 md:flex-none px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition text-sm shadow-sm flex items-center justify-center gap-2"
               >
                 <CheckCircleIcon className="h-5 w-5" />
                 Sanction Loan
               </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// HELPER COMPONENTS
// ------------------------------------------------------------------

const SectionHeader = ({ title, icon: Icon }) => (
  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center gap-2">
    <Icon className="h-5 w-5 text-gray-400" />
    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
  </div>
);

const Field = ({ label, value, badge, badgeColor, highlight }) => (
  <div className={`flex flex-col ${highlight ? 'bg-yellow-50 p-2 -m-2 rounded' : ''}`}>
    <span className="text-xs text-gray-500 font-medium mb-1">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-900 truncate">
        {value || "-"}
      </span>
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
          badgeColor === 'green' ? 'bg-green-100 text-green-700' : 
          badgeColor === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {badge}
        </span>
      )}
    </div>
  </div>
);

const DocItem = ({ name, status, type }) => (
  <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 bg-red-50 text-red-600 rounded flex items-center justify-center text-xs font-bold border border-red-100">
        {type}
      </div>
      <span className="text-sm font-medium text-gray-700">{name}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
        status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {status}
      </span>
      <button className="text-xs text-primary-600 hover:underline font-medium">View</button>
    </div>
  </div>
);