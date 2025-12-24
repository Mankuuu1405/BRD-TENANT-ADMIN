import { useEffect, useState, useMemo } from "react";
import { rolesApi } from "../services/api.js";
import { userAPI } from "../services/userService.js";
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  KeyIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from "@heroicons/react/24/outline";

/**
 * ============================================================================
 * CONFIGURATION & CONSTANTS
 * ============================================================================
 */

// Role Types supported by the system
const ROLE_TYPES = [
  { id: "admin", name: "Admin", description: "Full access to specific modules" },
  { id: "manager", name: "Manager", description: "Can approve and oversee operations" },
  { id: "supervisor", name: "Supervisor", description: "Manages team and assigns tasks" },
  { id: "executive", name: "Executive", description: "Operational access for daily tasks" },
  { id: "user", name: "Standard User", description: "Basic read/write access" },
];

// Permission Definitions with detailed descriptions for the UI
const PERMISSION_DEFINITIONS = {
  // Loan Management
  loan_create: { label: "Create Loans", desc: "Initiate new loan applications" },
  loan_approve: { label: "Approve Loans", desc: "Final approval authority for loans" },
  loan_edit: { label: "Edit Applications", desc: "Modify existing loan details" },
  loan_view: { label: "View Loans", desc: "Read-only access to loan files" },
  loan_delete: { label: "Delete Loans", desc: "Remove loan records permanently" },

  // Document Management
  view_docs: { label: "View Documents", desc: "Preview uploaded documents" },
  download_docs: { label: "Download Documents", desc: "Save documents locally" },
  upload_docs: { label: "Upload Documents", desc: "Add new files to records" },
  delete_docs: { label: "Delete Documents", desc: "Remove files from records" },

  // System Administration
  audit_logs: { label: "Audit Logs", desc: "View system activity history" },
  edit_policies: { label: "Edit Policies", desc: "Modify credit and risk policies" },
  manage_users: { label: "Manage Users", desc: "Create and edit user accounts" },
  manage_roles: { label: "Manage Roles", desc: "Create and edit access roles" },
  manage_branches: { label: "Manage Branches", desc: "Configure branch settings" },

  // Reports
  view_reports: { label: "View Reports", desc: "Access analytical dashboards" },
  export_reports: { label: "Export Data", desc: "Download reports as CSV/PDF" },

  // Branch Access
  view_all_branches: { label: "View All Branches", desc: "Access data across all locations" },
  edit_branch_details: { label: "Edit Branch", desc: "Modify branch configurations" },
  assign_users_to_branches: { label: "Assign Users", desc: "Move users between branches" },
};

// Permission Categories for grouping
const PERMISSION_CATEGORIES = [
  {
    id: "loan_management",
    name: "Loan Management",
    icon: <DocumentDuplicateIcon className="w-4 h-4" />,
    permissions: ["loan_create", "loan_approve", "loan_edit", "loan_view", "loan_delete"],
  },
  {
    id: "document_management",
    name: "Document Management",
    icon: <InformationCircleIcon className="w-4 h-4" />,
    permissions: ["view_docs", "download_docs", "upload_docs", "delete_docs"],
  },
  {
    id: "system_administration",
    name: "System Administration",
    icon: <ShieldCheckIcon className="w-4 h-4" />,
    permissions: ["audit_logs", "edit_policies", "manage_users", "manage_roles", "manage_branches"],
  },
  {
    id: "reports",
    name: "Analytics & Reports",
    icon: <ArrowsUpDownIcon className="w-4 h-4" />,
    permissions: ["view_reports", "export_reports"],
  },
  {
    id: "branch_permissions",
    name: "Branch Control",
    icon: <UserGroupIcon className="w-4 h-4" />,
    permissions: ["view_all_branches", "edit_branch_details", "assign_users_to_branches"],
  },
];

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

// Generate a random unique 8-digit ID
const generateRoleId = (existingRoles) => {
  const existingIds = new Set(existingRoles.map(r => r.role_id));
  let newId;
  do {
    newId = Math.floor(10000000 + Math.random() * 90000000).toString();
  } while (existingIds.has(newId));
  return newId;
};

// Default empty role state
const getEmptyRole = () => ({
  role_type: "",
  name: "",
  role_id: "",
  description: "",
  status: "active",
  permissions: Object.keys(PERMISSION_DEFINITIONS).reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {}),
});

/**
 * ============================================================================
 * MAIN COMPONENT
 * ============================================================================
 */
export default function RolesPermissions() {
  // --- Global State ---
  const [activeTab, setActiveTab] = useState("roles"); // 'roles' | 'users'
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: "", message: "", show: false });

  // --- Roles State ---
  const [roles, setRoles] = useState([]);
  const [roleSearch, setRoleSearch] = useState("");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null); // null = creating, object = editing
  const [roleFormPhase, setRoleFormPhase] = useState(1); // 1 = Info, 2 = Permissions
  const [roleForm, setRoleForm] = useState(getEmptyRole());
  const [permissionsSearch, setPermissionsSearch] = useState("");
  const [matrixModalRole, setMatrixModalRole] = useState(null); // Role selected for standalone matrix view

  // --- Users State ---
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [isUserRoleModalOpen, setIsUserRoleModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [selectedUserNewRoleId, setSelectedUserNewRoleId] = useState("");

  // --- Derived State for Roles ---
  const filteredRoles = useMemo(() => {
    return roles.filter(r => 
      r.name.toLowerCase().includes(roleSearch.toLowerCase()) || 
      r.role_id.toString().includes(roleSearch)
    );
  }, [roles, roleSearch]);

  // --- Derived State for Users ---
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.first_name + " " + u.last_name).toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.role_type || "").toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  // --- Initialization ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadRoles(), loadUsers()]);
    } catch (error) {
      showNotification("error", "Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await rolesApi.list();
      if (res.ok) {
        // Normalize role data
        const processed = (res.data || [])
          .filter(r => r.name !== "Super Admin") // Hide Super Admin
          .map(r => ({
            ...r,
            role_id: r.role_id || r.id, // Ensure consistent ID
            // Ensure permissions object exists
            permissions: typeof r.permissions === 'object' ? r.permissions : {} 
          }));
        setRoles(processed);
      }
    } catch (err) {
      console.error("Error loading roles:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await userAPI.getAll();
      if (res.data) {
        const currentTenant = sessionStorage.getItem("tenant_id");
        // Filter for current tenant and exclude system admins
        const tenantUsers = res.data.filter(u => 
          u.tenant_id === currentTenant && 
          !["MASTER_ADMIN", "SUPER_ADMIN"].includes(u.role_type)
        );
        setUsers(tenantUsers);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message, show: true });
    setTimeout(() => setNotification({ ...notification, show: false }), 4000);
  };

  /**
   * ============================================================================
   * ROLE MANAGEMENT LOGIC
   * ============================================================================
   */

  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleForm({
      ...getEmptyRole(),
      role_id: generateRoleId(roles)
    });
    setRoleFormPhase(1);
    setIsRoleModalOpen(true);
  };

  const handleEditRole = async (role) => {
    setEditingRole(role);
    // Fetch fresh permissions
    try {
      const permRes = await rolesApi.getPermissions(role.role_id);
      let loadedPerms = {};
      
      // Handle different API response structures for permissions
      if (permRes.ok) {
        if (Array.isArray(permRes.data)) {
          // If array of strings ['perm1', 'perm2']
          loadedPerms = Object.keys(PERMISSION_DEFINITIONS).reduce((acc, key) => {
            acc[key] = permRes.data.includes(key);
            return acc;
          }, {});
        } else {
          // If object { perm1: true, perm2: false }
          loadedPerms = permRes.data;
        }
      }

      setRoleForm({
        ...role,
        permissions: { ...getEmptyRole().permissions, ...loadedPerms }
      });
      setRoleFormPhase(1);
      setIsRoleModalOpen(true);
    } catch (e) {
      showNotification("error", "Could not load role permissions");
    }
  };

  const handleCloneRole = (role) => {
    setEditingRole(null); // Treat as new
    setRoleForm({
      ...role,
      name: `${role.name} (Copy)`,
      role_id: generateRoleId(roles),
      permissions: role.permissions || getEmptyRole().permissions
    });
    setRoleFormPhase(1);
    setIsRoleModalOpen(true);
    showNotification("success", "Role cloned! Please review details.");
  };

  const handleDeleteRole = async (roleId) => {
    if(!window.confirm("Are you sure? This will revoke access for all users with this role.")) return;
    
    try {
      const res = await rolesApi.delete(roleId);
      if(res.ok) {
        showNotification("success", "Role deleted successfully");
        loadRoles();
      } else {
        showNotification("error", "Failed to delete role");
      }
    } catch(e) {
      showNotification("error", "An error occurred");
    }
  };

  const handleRoleSubmit = async () => {
    try {
      const payload = { ...roleForm };
      
      let res;
      if (editingRole) {
        // Update existing
        // Note: Check if API supports full update or needs separate perms call
        // Assuming create/update payload structure is similar
        res = await rolesApi.update(editingRole.role_id, payload);
        
        // Also update permissions explicitly if needed by backend API design
        // await rolesApi.updatePermissions(editingRole.role_id, Object.keys(payload.permissions).filter(k => payload.permissions[k]));
      } else {
        // Create new
        res = await rolesApi.create(payload);
      }

      if (res.ok) {
        showNotification("success", editingRole ? "Role updated!" : "Role created!");
        setIsRoleModalOpen(false);
        loadRoles();
      } else {
        showNotification("error", "Operation failed. Please check inputs.");
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Server error occurred");
    }
  };

  const togglePermission = (key) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  const togglePermissionCategory = (categoryPermissions, shouldEnable) => {
    setRoleForm(prev => {
      const newPerms = { ...prev.permissions };
      categoryPermissions.forEach(key => {
        newPerms[key] = shouldEnable;
      });
      return { ...prev, permissions: newPerms };
    });
  };

  /**
   * ============================================================================
   * USER ACCESS LOGIC
   * ============================================================================
   */

  const handleUserRoleEdit = (user) => {
    setSelectedUserForEdit(user);
    // Find matching role in our roles list based on ID or Type
    const matchingRole = roles.find(r => r.role_id === user.role_id) || roles.find(r => r.role_type === user.role_type);
    setSelectedUserNewRoleId(matchingRole ? matchingRole.role_id : "");
    setIsUserRoleModalOpen(true);
  };

  const handleUserRoleSave = async () => {
    if (!selectedUserNewRoleId) {
      showNotification("error", "Please select a role");
      return;
    }

    try {
      // Find the full role object
      const selectedRoleObj = roles.find(r => r.role_id === selectedUserNewRoleId);
      
      // Payload structure depends on backend. Based on Users.jsx provided:
      const payload = {
        id: selectedUserForEdit.id,
        role_id: selectedRoleObj.role_id,
        role_type: selectedRoleObj.role_type, // Sync type with ID
        status: selectedUserForEdit.status,
        first_name: selectedUserForEdit.first_name,
        last_name: selectedUserForEdit.last_name,
        email: selectedUserForEdit.email,
        mobile_no: selectedUserForEdit.mobile_no
      };

      const res = await userAPI.update(selectedUserForEdit.id, payload);
      
      // If the backend doesn't automatically update permissions, we might need to do that here
      // But usually assigning a role ID is enough.

      showNotification("success", "User role updated successfully");
      setIsUserRoleModalOpen(false);
      loadUsers();
    } catch (e) {
      console.error(e);
      showNotification("error", "Failed to update user role");
    }
  };

  /**
   * ============================================================================
   * RENDER HELPERS
   * ============================================================================
   */

  // Render Permission Matrix (Used in Create/Edit Role and Read-Only View)
  const renderPermissionMatrix = (readOnly = false, permissionsObj = roleForm.permissions) => {
    return (
      <div className="space-y-6">
        {/* Search Bar for Permissions */}
        <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-100 mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search permissions..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={permissionsSearch}
              onChange={(e) => setPermissionsSearch(e.target.value)}
            />
          </div>
        </div>

        {PERMISSION_CATEGORIES.map(category => {
          // Filter permissions based on search
          const visiblePerms = category.permissions.filter(p => 
            p.toLowerCase().includes(permissionsSearch.toLowerCase()) ||
            PERMISSION_DEFINITIONS[p]?.label.toLowerCase().includes(permissionsSearch.toLowerCase())
          );

          if (visiblePerms.length === 0) return null;

          const allChecked = visiblePerms.every(p => permissionsObj[p]);
          
          return (
            <div key={category.id} className="bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-100/50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white rounded-md shadow-sm text-indigo-600">
                    {category.icon}
                  </div>
                  <h4 className="font-semibold text-gray-800">{category.name}</h4>
                </div>
                {!readOnly && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => togglePermissionCategory(visiblePerms, true)}
                      className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                    >
                      Select All
                    </button>
                    <button 
                      onClick={() => togglePermissionCategory(visiblePerms, false)}
                      className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visiblePerms.map(key => {
                  const def = PERMISSION_DEFINITIONS[key] || { label: key, desc: "" };
                  const isChecked = permissionsObj[key];

                  return (
                    <div 
                      key={key}
                      onClick={() => !readOnly && togglePermission(key)}
                      className={`
                        relative flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer
                        ${isChecked 
                          ? "bg-indigo-50 border-indigo-200 shadow-sm" 
                          : "bg-white border-gray-200 hover:border-gray-300"}
                        ${readOnly ? "cursor-default" : ""}
                      `}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${isChecked ? "bg-indigo-600 border-indigo-600" : "bg-white border-gray-300"}
                      `}>
                        {isChecked && <CheckCircleIcon className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isChecked ? "text-indigo-900" : "text-gray-700"}`}>
                          {def.label}
                        </p>
                        <p className="text-xs text-gray-500 leading-tight mt-0.5">
                          {def.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * ============================================================================
   * RENDER MAIN UI
   * ============================================================================
   */
  return (
    <div className="min-h-screen bg-gray-50/30 p-6 md:p-8 font-sans">
      
      {/* --- Notification Toast --- */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-down border-l-4 ${
          notification.type === 'error' ? 'bg-white border-red-500 text-red-700' : 'bg-white border-green-500 text-green-700'
        }`}>
          {notification.type === 'error' ? <XCircleIcon className="w-6 h-6"/> : <CheckCircleIcon className="w-6 h-6"/>}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* --- Header --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Access Control Center</h1>
        <p className="text-gray-500 mt-2 text-lg">Manage roles, define permission matrices, and assign access to tenants users.</p>
      </div>

      {/* --- Tab Navigation --- */}
      <div className="flex gap-6 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab("roles")}
          className={`pb-3 px-2 flex items-center gap-2 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "roles" 
            ? "border-indigo-600 text-indigo-600" 
            : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <ShieldCheckIcon className="w-5 h-5" />
          Roles Configuration
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{roles.length}</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-2 flex items-center gap-2 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "users" 
            ? "border-indigo-600 text-indigo-600" 
            : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <UserGroupIcon className="w-5 h-5" />
          User Access
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{users.length}</span>
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[600px] overflow-hidden">
        
        {/* =======================
            TAB 1: ROLES 
           ======================= */}
        {activeTab === "roles" && (
          <div className="p-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full sm:w-96">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter roles by name or ID..."
                  value={roleSearch}
                  onChange={e => setRoleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              <button
                onClick={handleOpenCreateRole}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                <PlusIcon className="w-5 h-5" />
                Create New Role
              </button>
            </div>

            {/* Roles Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">Role Details</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Permissions</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRoles.map(role => (
                    <tr key={role.role_id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                            {role.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{role.name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {role.role_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                          {role.role_type || "Custom"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          role.status === 'active' 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${role.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          {role.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setMatrixModalRole(role)}
                          className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1 group-hover:underline"
                        >
                          View Matrix
                          <ArrowsUpDownIcon className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleCloneRole(role)}
                            title="Clone Role"
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <DocumentDuplicateIcon className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleEditRole(role)}
                            title="Edit Role"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRole(role.role_id)}
                            title="Delete Role"
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRoles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <ShieldCheckIcon className="w-12 h-12 text-gray-200" />
                          <p className="text-lg font-medium">No roles found matching criteria</p>
                          <button onClick={handleOpenCreateRole} className="text-indigo-600 font-semibold hover:underline">
                            Create the first one?
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =======================
            TAB 2: USERS 
           ======================= */}
        {activeTab === "users" && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full sm:w-96">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <InformationCircleIcon className="w-5 h-5" />
                Users shown are filtered by current tenant
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredUsers.map(user => {
                // Find associated role object to get details
                const userRole = roles.find(r => r.role_id === user.role_id) || roles.find(r => r.role_type === user.role_type);
                
                return (
                  <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg border-2 border-white shadow-sm">
                            {user.first_name[0]}{user.last_name[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{user.first_name} {user.last_name}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          user.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {user.status}
                        </span>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Current Role</p>
                          <div className="flex items-center gap-2">
                            <KeyIcon className="w-4 h-4 text-indigo-500" />
                            <span className="font-semibold text-gray-800">
                              {userRole ? userRole.name : (user.role_type || "Unassigned")}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 pl-6">
                            {userRole ? userRole.description : "No description available"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                      <button 
                        onClick={() => handleUserRoleEdit(user)}
                        className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Change Role
                      </button>
                      <button 
                         onClick={() => {
                           if(userRole) setMatrixModalRole(userRole);
                           else showNotification("error", "No valid role assigned to view");
                         }}
                         className="flex-1 py-2 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-sm font-semibold transition-colors"
                      >
                        View Access
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <UserGroupIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  No users found.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* =========================================
          MODAL: CREATE / EDIT ROLE
         ========================================= */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsRoleModalOpen(false)} />

            <div className="relative bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl w-full flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingRole ? "Edit Role Configuration" : "Create New Role"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Step {roleFormPhase} of 2: {roleFormPhase === 1 ? "Role Details" : "Permission Matrix"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${roleFormPhase >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${roleFormPhase >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                  </div>
                  <button onClick={() => setIsRoleModalOpen(false)} className="text-gray-400 hover:text-gray-500 ml-4">
                    <span className="sr-only">Close</span>
                    <XCircleIcon className="w-8 h-8" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                
                {/* PHASE 1: BASIC INFO */}
                {roleFormPhase === 1 && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Role Type</label>
                        <select
                          value={roleForm.role_type}
                          onChange={(e) => setRoleForm({ ...roleForm, role_type: e.target.value })}
                          className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                        >
                          <option value="">Select Role Type...</option>
                          {ROLE_TYPES.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                          ))}
                          <option value="custom">Custom Role</option>
                        </select>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Role Status</label>
                        <select
                          value={roleForm.status}
                          onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value })}
                          className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Role Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={roleForm.name}
                          onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                          placeholder="e.g. Senior Loan Officer"
                          className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                          value={roleForm.description}
                          onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                          rows={3}
                          placeholder="Briefly describe what this role is for..."
                          className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 resize-none"
                        />
                      </div>
                      
                      <div className="col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 flex gap-3">
                        <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
                        <p>Role ID is auto-generated as <strong>{roleForm.role_id}</strong>. This unique identifier is used for system integrations and cannot be changed manually.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PHASE 2: PERMISSIONS */}
                {roleFormPhase === 2 && (
                  <div>
                    {renderPermissionMatrix(false)}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
                {roleFormPhase === 2 ? (
                  <button 
                    onClick={() => setRoleFormPhase(1)}
                    className="text-gray-600 font-semibold hover:text-gray-900"
                  >
                    Back to Details
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsRoleModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-white hover:border-gray-400 transition-all"
                  >
                    Cancel
                  </button>
                  {roleFormPhase === 1 ? (
                    <button
                      disabled={!roleForm.name || !roleForm.role_type}
                      onClick={() => setRoleFormPhase(2)}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                      Configure Permissions &rarr;
                    </button>
                  ) : (
                    <button
                      onClick={handleRoleSubmit}
                      className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      Save Role
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: USER ROLE EDIT
         ========================================= */}
      {isUserRoleModalOpen && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsUserRoleModalOpen(false)} />
            
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-scale-in">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Assign Role to User</h3>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {selectedUserForEdit.first_name[0]}{selectedUserForEdit.last_name[0]}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{selectedUserForEdit.first_name} {selectedUserForEdit.last_name}</div>
                  <div className="text-sm text-gray-500">{selectedUserForEdit.email}</div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Select New Role</label>
                <div className="relative">
                  <select
                    value={selectedUserNewRoleId}
                    onChange={(e) => setSelectedUserNewRoleId(e.target.value)}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 pl-4 appearance-none bg-white"
                  >
                    <option value="">-- Choose a Role --</option>
                    {roles.map(r => (
                      <option key={r.role_id} value={r.role_id}>
                        {r.name} ({r.role_type})
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {selectedUserNewRoleId && (
                  <div className="mt-4 p-4 bg-indigo-50 text-indigo-800 rounded-xl text-sm border border-indigo-100">
                    <strong>Preview:</strong> Assigning this role will grant access to: 
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                      {roles.find(r => r.role_id === selectedUserNewRoleId)?.permissions && 
                       Object.entries(roles.find(r => r.role_id === selectedUserNewRoleId).permissions)
                        .filter(([k, v]) => v)
                        .slice(0, 5)
                        .map(([k, v]) => <li key={k}>{PERMISSION_DEFINITIONS[k]?.label || k}</li>)
                      }
                      <li>...and more.</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsUserRoleModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-600 font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUserRoleSave}
                  className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md"
                >
                  Update Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: READ-ONLY MATRIX VIEW
         ========================================= */}
      {matrixModalRole && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setMatrixModalRole(null)} />
            
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Effective Permissions</h3>
                  <p className="text-sm text-gray-500">Viewing access rights for role: <span className="font-semibold text-indigo-600">{matrixModalRole.name}</span></p>
                </div>
                <button onClick={() => setMatrixModalRole(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircleIcon className="w-8 h-8" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {/* We pass the role's permissions to the render function */}
                {renderPermissionMatrix(true, matrixModalRole.permissions || {})}
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setMatrixModalRole(null)}
                  className="px-6 py-2 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}