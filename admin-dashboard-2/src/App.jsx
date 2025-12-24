import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";

// Core Pages
import Dashboard from "./pages/Dashboard.jsx";
import Branches from "./pages/Branches.jsx";
import Loans from "./pages/Loans.jsx"; // Loan Products
import LoanApplications from "./pages/LoanApplications.jsx"; 
import PersonalLoanApplicationWizard from "./pages/PersonalLoanApplicationWizard.jsx";
import AddBusiness from "./pages/AddBusiness.jsx";

// ⭐ PHASE 5: CRM & LEADS
import Leads from "./pages/Leads.jsx";            
import Campaigns from "./pages/Campaigns.jsx";    

// ⭐ PHASE 4: RISK ENGINE
import RiskEngine from "./pages/RiskEngine.jsx"; 

// ⭐ PHASE 7: GOVERNANCE & DISBURSEMENT
import EscalationRules from "./pages/EscalationRules.jsx";
import MandateManagement from "./pages/MandateManagement.jsx";
import DisbursementQueue from "./pages/DisbursementQueue.jsx"; 

// ⭐ PHASE 8: COLLECTIONS
import Collections from "./pages/Collections.jsx"; 

// Admin & Settings Pages
import Logs from "./pages/Logs.jsx";    
import Calendar from "./pages/Calendar.jsx";
import RolesPermissions from "./pages/RolesPermissions.jsx";
import Users from "./pages/Users.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import Notifications from "./pages/Notifications.jsx";
import InternalTeamDashboards from "./pages/InternalTeamDashboards.jsx";
import Rules from "./pages/Rules.jsx";
import Categories from "./pages/Categories.jsx";
import Reports from "./pages/Reports.jsx";
import ChannelPartners from "./pages/ChannelPartners.jsx";
import MySubscription from "./pages/MySubscription.jsx";
import ThirdPartyUsers from "./pages/ThirdPartyUsers.jsx";

// Auth Pages
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import SendLink from "./pages/SendLink.jsx";

// ------------------------------------------------------
// MAIN CONTENT WRAPPER
// ------------------------------------------------------
function AppContent() {
  const location = useLocation();
  // Basic auth check logic
  const isLoggedIn = () => !!localStorage.getItem("access");
  const authRoutes = ["/login", "/signup", "/forgot_password", "/sendlink"];
  const shouldShowLayout = isLoggedIn() && !authRoutes.includes(location.pathname);

  return (
    <div className="h-full bg-gray-50 flex text-gray-900">
      {shouldShowLayout && (
        <>
          <Sidebar />
          <Header />
        </>
      )}

      <main className={shouldShowLayout ? "pl-64 pt-16 w-full" : "w-full"}>
        <Routes>
          {/* ---------------- AUTH ROUTES ---------------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot_password" element={<ForgotPassword />} />
          <Route path="/sendlink" element={<SendLink />} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* ---------------- PROTECTED ROUTES ---------------- */}
          <Route
            path="/dashboard"
            element={isLoggedIn() ? <Dashboard /> : <Navigate to="/login" />}
          />

          {/* ⭐ PHASE 5: CRM (LEADS & CAMPAIGNS) */}
          <Route
            path="/leads"
            element={isLoggedIn() ? <Leads /> : <Navigate to="/login" />}
          />
          <Route
            path="/campaigns"
            element={isLoggedIn() ? <Campaigns /> : <Navigate to="/login" />}
          />

          {/* ⭐ PHASE 4: RISK ENGINE */}
          <Route
            path="/risk-engine"
            element={isLoggedIn() ? <RiskEngine /> : <Navigate to="/login" />}
          />

          {/* ⭐ PHASE 7: GOVERNANCE & MANDATES */}
          <Route 
            path="/escalation-rules" 
            element={isLoggedIn() ? <EscalationRules /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/mandates" 
            element={isLoggedIn() ? <MandateManagement /> : <Navigate to="/login" />} 
          />

          {/* ⭐ EXISTING: LOAN APPLICATIONS (LOS) */}
          <Route
            path="/loan-applications"
            element={isLoggedIn() ? <LoanApplications /> : <Navigate to="/login" />}
          />
          
          <Route
            path="/loan-applications/new-personal-loan"
            element={isLoggedIn() ? <PersonalLoanApplicationWizard /> : <Navigate to="/login" />}
          />

          {/* ⭐ PHASE 7a: DISBURSEMENT QUEUE */}
          <Route
            path="/disbursements"
            element={isLoggedIn() ? <DisbursementQueue /> : <Navigate to="/login" />}
          />

          {/* ⭐ PHASE 8: COLLECTIONS */}
          <Route
            path="/collections"
            element={isLoggedIn() ? <Collections /> : <Navigate to="/login" />}
          />

          {/* --- Other Tenant Modules --- */}
          <Route
            path="/add-business"
            element={isLoggedIn() ? <AddBusiness /> : <Navigate to="/login" />}
          />

          <Route
            path="/my-subscription"
            element={isLoggedIn() ? <MySubscription /> : <Navigate to="/login" />}
          />

          <Route
            path="/channel-partners"
            element={isLoggedIn() ? <ChannelPartners /> : <Navigate to="/login" />}
          />

          <Route
            path="/third-party-users"
            element={isLoggedIn() ? <ThirdPartyUsers /> : <Navigate to="/login" />}
          />

          <Route
            path="/branches"
            element={isLoggedIn() ? <Branches /> : <Navigate to="/login" />}
          />

          <Route
            path="/loans"
            element={isLoggedIn() ? <Loans /> : <Navigate to="/login" />}
          />

          <Route
            path="/logs"
            element={isLoggedIn() ? <Logs /> : <Navigate to="/login" />}
          />

          <Route
            path="/calendar"
            element={isLoggedIn() ? <Calendar /> : <Navigate to="/login" />}
          />

          <Route
            path="/roles_permissions"
            element={isLoggedIn() ? <RolesPermissions /> : <Navigate to="/login" />}
          />

          <Route
            path="/users"
            element={isLoggedIn() ? <Users /> : <Navigate to="/login" />}
          />

          <Route
            path="/settings"
            element={isLoggedIn() ? <Settings /> : <Navigate to="/login" />}
          />

          <Route
            path="/profile"
            element={isLoggedIn() ? <Profile /> : <Navigate to="/login" />}
          />

          <Route
            path="/notifications"
            element={isLoggedIn() ? <Notifications /> : <Navigate to="/login" />}
          />

          <Route
            path="/internal-team-dashboards"
            element={isLoggedIn() ? <InternalTeamDashboards /> : <Navigate to="/login" />}
          />

          <Route
            path="/rules-config"
            element={isLoggedIn() ? <Rules /> : <Navigate to="/login" />}
          />

          <Route
            path="/categories"
            element={isLoggedIn() ? <Categories /> : <Navigate to="/login" />}
          />

          <Route
            path="/reports"
            element={isLoggedIn() ? <Reports /> : <Navigate to="/login" />}
          />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
