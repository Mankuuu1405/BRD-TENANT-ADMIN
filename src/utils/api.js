import axios from './axiosInstance.js' // ✅ Uses Interceptor for JWT
import { mockDashboard, mockIntegrations, mockLoans, mockLogs, mockTenants, mockRoles, mockPermissions, mockRolePermissions, mockUsers, mockSettings, mockCurrentUserId, mockNotifications, mockTenantApplications } from '../utils/mock.js'

// Environment Variable Check
const base = import.meta.env.VITE_API_BASE_URL || ''

// --- Helper: Retry Logic with Backoff ---
const withBackoff = async (fn) => {
  let delay = 500
  for (let i = 0; i < 3; i++) {
    try {
      return await fn()
    } catch (e) {
      // If unauthorized (401), stop retrying and let interceptor handle logout
      if (e.response && e.response.status === 401) throw e
      
      await new Promise(r => setTimeout(r, delay))
      delay *= 2
    }
  }
  return null
}

// ==========================================
// 1. AUTHENTICATION API
// ==========================================
const login = async (email, password) => {
  if (!base) {
    if (email === 'admin@los.com' && password === 'admin') {
      localStorage.setItem('auth', 'true')
      return { ok: true }
    }
    return { ok: false, message: 'Mock Login: Use admin@los.com / admin' }
  }

  try {
    const res = await axios.post(`/api/token/`, { email, password })
    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      localStorage.setItem('auth', 'true')
      return { ok: true }
    }
    return { ok: false, message: 'No token received' }
  } catch (e) {
    console.error("Login Error", e)
    return { ok: false, message: e.response?.data?.detail || 'Invalid email or password' }
  }
}

export const authApi = { login }

// ==========================================
// 2. DASHBOARD API
// ==========================================
const fetchDashboard = async () => {
  if (!base) return { ok: true, data: mockDashboard }
  const res = await withBackoff(() => axios.get(`/api/v1/dashboard/full`))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

const exportReport = async () => {
  if (!base) return { ok: true, url: '' }
  const res = await withBackoff(() => axios.post(`/api/v1/reports/dashboard-export`))
  if (!res) return { ok: false }
  return { ok: true, url: res.data.url }
}

export const dashboardApi = { fetchDashboard, exportReport }

// ==========================================
// 3. TENANTS & BRANCHES API
// ==========================================
const listTenants = async ({ search } = {}) => {
  if (!base) return { ok: true, data: mockTenants }
  const params = search ? { search } : {}
  const res = await withBackoff(() => axios.get(`/api/v1/tenants/`, { params }))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

const createTenant = async (body) => {
  if (!base) return { ok: true }
  const res = await withBackoff(() => axios.post(`/api/v1/tenants/`, body))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

// Branches are managed under tenants app
const listBranches = async (tenantId) => {
  if (!base) return { ok: true, data: [] }
  const params = tenantId ? { tenant: tenantId } : {}
  const res = await withBackoff(() => axios.get(`/api/v1/tenants/branches/`, { params }))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

const createBranch = async (body) => {
  if (!base) return { ok: true }
  const res = await withBackoff(() => axios.post(`/api/v1/tenants/branches/`, body))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

export const tenantsApi = { list: listTenants, create: createTenant, listBranches, createBranch }

// ==========================================
// 4. USERS API
// ==========================================
const listUsers = async ({ search, role_id } = {}) => {
  if (!base) return { ok: true, data: mockUsers }
  const params = {}
  if (search) params.search = search
  if (role_id) params.role = role_id
  
  const res = await withBackoff(() => axios.get(`/api/v1/users/`, { params }))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

const createUser = async (body) => {
  if (!base) return { ok: true }
  const res = await withBackoff(() => axios.post(`/api/v1/users/`, body))
  if (!res) return { ok: false }
  return { ok: true }
}

const updateUser = async (id, body) => {
  if (!base) return { ok: true }
  const res = await withBackoff(() => axios.patch(`/api/v1/users/${id}/`, body))
  if (!res) return { ok: false }
  return { ok: true }
}

const deleteUser = async (id) => {
  if (!base) return { ok: true }
  const res = await withBackoff(() => axios.delete(`/api/v1/users/${id}/`))
  if (!res) return { ok: false }
  return { ok: true }
}

export const usersApi = { list: listUsers, create: createUser, update: updateUser, delete: deleteUser }

// ==========================================
// 5. ROLES & PERMISSIONS API
// ==========================================
const listRoles = async () => {
  if (!base) return { ok: true, data: mockRoles }
  // Backend: adminpanel/role-masters/
  const res = await withBackoff(() => axios.get(`/api/v1/adminpanel/role-masters/`))
  if (!res) return { ok: false }
  
  // Transform backend response to match frontend expectation if needed
  // Assuming backend returns list of objects with { id, name, description }
  const data = res.data.map(r => ({
    role_id: r.id,
    role_name: r.name,
    description: r.description,
    is_system_role: false 
  }))
  return { ok: true, data }
}

const createRole = async (body) => {
  if (!base) return { ok: true }
  const res = await withBackoff(() => axios.post(`/api/v1/adminpanel/role-masters/`, body))
  if (!res) return { ok: false }
  return { ok: true }
}

const getRolePermissions = async (roleId) => {
  if (!base) return { ok: true, data: [] }
  // Assuming a custom endpoint or using the mock structure for now as backend permission logic can be complex
  // If backend doesn't have this exact endpoint yet, you might get 404
  try {
    const res = await withBackoff(() => axios.get(`/api/v1/adminpanel/role-masters/${roleId}/permissions/`))
    if (!res) return { ok: false }
    return { ok: true, data: res.data }
  } catch {
    return { ok: true, data: [] } // Fallback to empty if endpoint missing
  }
}

export const rolesApi = { list: listRoles, create: createRole, getPermissions: getRolePermissions }

// ==========================================
// 6. LOAN PRODUCTS (For Loans.jsx Page)
// ==========================================
const listProducts = async () => {
  if (!base) return { ok: true, data: [] }
  // Backend: adminpanel/loan-products/
  const res = await withBackoff(() => axios.get(`/api/v1/adminpanel/loan-products/`))
  if (!res) return { ok: false }
  
  // Transform for frontend table
  const data = res.data.map(p => ({
    id: p.id,
    business_name: 'All', // Products might be global or tenant specific
    type_of_loan: p.name,
    subcategory: p.loan_type,
    status: 'Active' 
  }))
  return { ok: true, data }
}

const createProduct = async (body) => {
  if (!base) return { ok: true }
  const res = await withBackoff(() => axios.post(`/api/v1/adminpanel/loan-products/`, body))
  if (!res) return { ok: false }
  return { ok: true }
}

// Maps to "Loans.jsx" which manages "Loan Types/Products"
export const productsApi = { list: listProducts, create: createProduct }

// ==========================================
// 7. LOAN APPLICATIONS (For Loan Management)
// ==========================================
const listLoans = async (params = {}) => {
  if (!base) return { ok: true, data: mockLoans }
  // Backend: los/applications/
  const res = await withBackoff(() => axios.get(`/api/v1/los/applications/`, { params }))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

const createLoan = async (body) => {
  if (!base) return { ok: true }
  const res = await withBackoff(() => axios.post(`/api/v1/los/applications/`, body))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

// Maps to actual loan applications
export const loansApi = { list: listLoans, create: createLoan }

// ==========================================
// 8. LOGS & AUDIT
// ==========================================
const listLogs = async (params = {}) => {
  if (!base) return { ok: true, data: mockLogs }
  // Assuming 'audit-logs' endpoint exists in users app
  const res = await withBackoff(() => axios.get(`/api/v1/users/audit-logs/`, { params }))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

const createLog = async (body) => {
  if (!base) return { ok: true }
  const res = await withBackoff(() => axios.post(`/api/v1/users/audit-logs/`, body))
  if (!res) return { ok: false }
  return { ok: true }
}

export const logsApi = { list: listLogs, create: createLog }

// ==========================================
// 9. NOTIFICATIONS
// ==========================================
const listNotifications = async () => {
  if (!base) return { ok: true, data: mockNotifications }
  const res = await withBackoff(() => axios.get(`/api/v1/communications/communications/`))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

export const notificationsApi = { list: listNotifications }

// ==========================================
// 10. PROFILE & SIGNUP
// ==========================================
const getProfile = async () => {
  if (!base) return { ok: true, data: { full_name: 'Admin', email: 'admin@los.com' } }
  try {
    // Requires a 'me' action in UserViewSet or similar
    const res = await withBackoff(() => axios.get(`/api/v1/users/me/`))
    if (!res) return { ok: false }
    return { ok: true, data: res.data }
  } catch {
    // Fallback if 'me' endpoint isn't ready
    return { ok: true, data: { full_name: 'Admin User', email: 'admin@platform.com' } }
  }
}

const updateProfile = async (body) => {
  if (!base) return { ok: true }
  const res = await withBackoff(() => axios.patch(`/api/v1/users/me/`, body))
  if (!res) return { ok: false }
  return { ok: true }
}

export const profileApi = { get: getProfile, update: updateProfile }

const submitSignup = async (body) => {
  // Signup usually hits a public endpoint
  if (!base) return { ok: true, application_id: 'mock-id' }
  const res = await withBackoff(() => axios.post(`/api/v1/tenants/onboarding/register/`, body))
  if (!res) return { ok: false }
  return { ok: true, application_id: res.data.id }
}

export const signupApi = { submit: submitSignup }

// ==========================================
// 11. SETTINGS & REPORTS (Placeholders)
// ==========================================
// Settings might likely be fetched from AdminPanel -> ChargeMaster or similar
const listSettings = async () => {
  if (!base) return { ok: true, data: { loan: [], system: [], notify: [] } }
  // Mock return or connect to specific settings endpoint if created
  return { ok: true, data: { loan: [], system: [], notify: [] } }
}
export const settingsApi = { list: listSettings }

// Reports
const generateReport = async (body) => {
  if (!base) return { ok: true, job_id: 'mock-job' }
  const res = await withBackoff(() => axios.post(`/api/v1/reporting/reports/generate/`, body))
  if (!res) return { ok: false }
  return { ok: true, job_id: res.data.job_id }
}
export const reportsApi = { generate: generateReport }

// ==========================================
// 12. INTEGRATIONS
// ==========================================
const listIntegrations = async () => {
  if (!base) return { ok: true, data: mockIntegrations }
  const res = await withBackoff(() => axios.get(`/api/v1/integrations/`))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}
export const integrationsApi = { list: listIntegrations }