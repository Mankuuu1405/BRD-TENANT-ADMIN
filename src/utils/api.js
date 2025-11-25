import axios from 'axios'
import { mockDashboard, mockIntegrations, mockLoans, mockLogs, mockTenants, mockRoles, mockPermissions, mockRolePermissions, mockUsers, mockSettings, mockCurrentUserId, mockNotifications, mockTenantApplications } from '../utils/mock.js'

const base = import.meta.env.VITE_API_BASE_URL || ''

const withBackoff = async (fn) => {
  let delay = 500
  for (let i = 0; i < 3; i++) {
    try {
      return await fn()
    } catch (e) {
      await new Promise(r => setTimeout(r, delay))
      delay *= 2
    }
  }
  return null
}

const fetchDashboard = async () => {
  if (!base) {
    return { ok: true, data: mockDashboard }
  }
  const res = await withBackoff(() => axios.get(`${base}/api/v1/dashboard/full`))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

const exportReport = async () => {
  if (!base) {
    const csv = mockDashboardToCsv(mockDashboard)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    return { ok: true, url }
  }
  const res = await withBackoff(() => axios.post(`${base}/api/v1/reports/dashboard-export`))
  if (!res) return { ok: false }
  return { ok: true, url: res.data.url }
}

const mockDashboardToCsv = (data) => {
  const rows = []
  rows.push('metric,value')
  rows.push(`totalTenants,${data.kpis.totalTenants}`)
  rows.push(`activeUsers,${data.kpis.activeUsers}`)
  rows.push(`totalLoans,${data.kpis.totalLoans}`)
  rows.push(`disbursedAmount,${data.kpis.disbursedAmount}`)
  rows.push('month,amount')
  data.charts.monthlyDisbursement.forEach(m => rows.push(`${m.month},${m.amount}`))
  rows.push('status,count')
  data.charts.loanStatusDistribution.forEach(s => rows.push(`${s.status},${s.count}`))
  return rows.join('\n')
}

export const dashboardApi = { fetchDashboard, exportReport }

const listIntegrations = async () => {
  if (!base) return { ok: true, data: mockIntegrations }
  const res = await withBackoff(() => axios.get(`${base}/api/v1/integrations`))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

const updateIntegration = async (config_id, body) => {
  if (!base) {
    const idx = mockIntegrations.findIndex(i => i.config_id===config_id)
    if (idx>=0) {
      mockIntegrations[idx] = { ...mockIntegrations[idx], ...body }
      return { ok: true, status: 'Pending' }
    }
    return { ok: false }
  }
  const res = await withBackoff(() => axios.put(`${base}/api/v1/integrations/${config_id}`, body))
  if (!res) return { ok: false }
  return { ok: true, status: res.data.status }
}

const validateIntegration = async (config_id) => {
  if (!base) {
    const item = mockIntegrations.find(i => i.config_id===config_id)
    if (!item) return { ok: false }
    item.status = 'Connected'
    item.last_validated = new Date().toISOString()
    return { ok: true, status: item.status, last_validated: item.last_validated }
  }
  const res = await withBackoff(() => axios.post(`${base}/api/v1/integrations/${config_id}/validate`))
  if (!res) return { ok: false }
  return { ok: true, status: res.data.status, last_validated: res.data.last_validated }
}

export const integrationsApi = { list: listIntegrations, update: updateIntegration, validate: validateIntegration }

const listLoans = async (params = {}) => {
  if (!base) {
    let data = [...mockLoans]
    if (params.search) {
      const s = params.search.toLowerCase()
      data = data.filter(i => i.loan_id.toLowerCase().includes(s) || i.applicant_name.toLowerCase().includes(s))
    }
    if (params.status_filter) data = data.filter(i => i.status === params.status_filter)
    return { ok: true, data }
  }
  const res = await withBackoff(() => axios.get(`${base}/api/v1/loans`, { params }))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

const createLoan = async (body) => {
  if (!base) {
    const id = `LN${String(mockLoans.length + 1).padStart(3, '0')}`
    const item = { loan_id: id, tenant_id: 'tenant-001', applicant_name: body.applicant_name, amount: Number(body.amount), term_months: body.term_months, applied_on: new Date().toISOString(), status: 'Pending' }
    mockLoans.unshift(item)
    return { ok: true, data: item }
  }
  const res = await withBackoff(() => axios.post(`${base}/api/v1/loans`, body))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

const getLoan = async (loan_id) => {
  if (!base) {
    const item = mockLoans.find(i => i.loan_id === loan_id)
    if (!item) return { ok: false }
    return { ok: true, data: item }
  }
  const res = await withBackoff(() => axios.get(`${base}/api/v1/loans/${loan_id}`))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

const actionLoan = async (loan_id, body) => {
  if (!base) {
    const item = mockLoans.find(i => i.loan_id === loan_id)
    if (!item) return { ok: false }
    if (body.action === 'Approve') item.status = 'Approved'
    else if (body.action === 'Reject') item.status = 'Rejected'
    else if (body.action === 'Disburse') item.status = 'Disbursed'
    return { ok: true, data: item }
  }
  const res = await withBackoff(() => axios.put(`${base}/api/v1/loans/${loan_id}/action`, body))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

export const loansApi = { list: listLoans, create: createLoan, get: getLoan, action: actionLoan }

const listLogs = async (params = {}) => {
  if (!base) {
    let data = [...mockLogs].sort((a,b)=> new Date(b.timestamp) - new Date(a.timestamp))
    if (params.search) {
      const s = params.search.toLowerCase()
      data = data.filter(i => i.summary.toLowerCase().includes(s) || i.event_type.toLowerCase().includes(s))
    }
    return { ok: true, data }
  }
  const res = await withBackoff(() => axios.get(`${base}/api/v1/logs/audit`, { params }))
  if (!res) return { ok: false }
  return { ok: true, data: res.data }
}

const createLog = async (body) => {
  if (!base) {
    const id = `LG${Math.random().toString(36).slice(2,6)}`
    const item = { log_id: id, timestamp: new Date().toISOString(), tenant_id: body.tenant_id || null, event_type: body.event_type, actor_user_id: body.actor_user_id || 'u-101', actor_user_role: body.actor_user_role || 'Admin', target_entity: body.target_entity || 'Loan', target_entity_id: body.target_entity_id || '', summary: body.summary || '', details: body.details || {} }
    mockLogs.unshift(item)
    return { ok: true, data: item }
  }
  const res = await withBackoff(() => axios.post(`${base}/api/v1/logs/audit`, body))
  if (!res) return { ok: false }
  return { ok: true }
}

export const logsApi = { list: listLogs, create: createLog }

const jobs = new Map()

const generateReport = async (body) => {
  const job_id = `JOB-${Math.random().toString(36).slice(2,8)}`
  const eta = '20 seconds'
  jobs.set(job_id, { status: 'PROCESSING', body })
  setTimeout(() => {
    const j = jobs.get(job_id)
    if (!j) return
    j.status = 'COMPLETED'
    j.url = buildCsvUrl(j.body)
    jobs.set(job_id, j)
  }, 2000)
  return { ok: true, job_id, status: 'PROCESSING', estimated_completion_time: eta }
}

const reportStatus = async (job_id) => {
  const j = jobs.get(job_id)
  if (!j) return { ok: false }
  return { ok: true, status: j.status }
}

const reportDownload = async (job_id) => {
  const j = jobs.get(job_id)
  if (!j || j.status !== 'COMPLETED') return { ok: false }
  return { ok: true, url: j.url }
}

const buildCsvUrl = (body) => {
  const csv = buildCsv(body)
  const blob = new Blob([csv], { type: 'text/csv' })
  return URL.createObjectURL(blob)
}

const buildCsv = ({ report_type, start_date, end_date, tenant_id }) => {
  const inRange = (ts) => {
    if (!start_date || !end_date) return true
    const t = new Date(ts)
    return t >= new Date(start_date) && t <= new Date(end_date)
  }
  if (report_type === 'LOAN_ACTIVITY') {
    const rows = ['loan_id,applicant_name,amount,term_months,status,applied_on']
    mockLoans.filter(l => (!tenant_id || l.tenant_id===tenant_id) && inRange(l.applied_on)).forEach(l => {
      rows.push([l.loan_id, l.applicant_name, l.amount, l.term_months, l.status, l.applied_on].join(','))
    })
    return rows.join('\n')
  }
  if (report_type === 'TENANT_SUMMARY') {
    const rows = ['tenant_id,company_name,status,creation_date,total_loans,total_active_users']
    mockTenants.forEach(t => rows.push([t.tenant_id, t.company_name, t.status, t.creation_date, t.total_loans, t.total_active_users].join(',')))
    return rows.join('\n')
  }
  // USER_ACTIVITY
  const rows = ['user_id,name,role,tenant,action_description,timestamp']
  mockLogs.filter(l => (!tenant_id || l.tenant_id===tenant_id) && inRange(l.timestamp)).forEach(l => {
    rows.push([l.actor_user_id, l.actor_user_role || '', l.actor_user_role || '', l.tenant_id || '', l.summary, l.timestamp].join(','))
  })
  return rows.join('\n')
}

export const reportsApi = { generate: generateReport, status: reportStatus, download: reportDownload }

const listRoles = async () => {
  return { ok: true, data: mockRoles }
}

const createRole = async ({ role_name, description }) => {
  const id = `role-${Math.random().toString(36).slice(2,6)}`
  mockRoles.push({ role_id: id, role_name, description, is_system_role: false })
  mockRolePermissions[id] = []
  return { ok: true }
}

const deleteRole = async (role_id) => {
  const idx = mockRoles.findIndex(r => r.role_id===role_id)
  if (idx<0) return { ok: false }
  if (mockRoles[idx].is_system_role) return { ok: false }
  mockRoles.splice(idx,1)
  delete mockRolePermissions[role_id]
  return { ok: true }
}

const getRolePermissions = async (role_id) => {
  const granted = new Set(mockRolePermissions[role_id] || [])
  const groups = {}
  mockPermissions.forEach(p => {
    if (!groups[p.module]) groups[p.module] = []
    groups[p.module].push({ ...p, is_granted: granted.has(p.permission_id) })
  })
  const data = Object.keys(groups).map(m => ({ module: m, permissions: groups[m] }))
  return { ok: true, data }
}

const updateRolePermissions = async (role_id, grantedIds) => {
  mockRolePermissions[role_id] = grantedIds
  return { ok: true }
}

export const rolesApi = { list: listRoles, create: createRole, delete: deleteRole, getPermissions: getRolePermissions, updatePermissions: updateRolePermissions }

const listTenants = async ({ search } = {}) => {
  let data = [...mockTenants]
  if (search) {
    const s = search.toLowerCase()
    data = data.filter(t => t.company_name.toLowerCase().includes(s) || (t.email||'').toLowerCase().includes(s))
  }
  return { ok: true, data }
}

const createTenant = async (body) => {
  const id = `tenant-${Math.random().toString(36).slice(2,6)}`
  mockTenants.unshift({
    tenant_id: id,
    company_name: body.company_name,
    email: body.email,
    phone_number: body.phone_number || '',
    user_count: Math.floor(Math.random()*50)+10,
    status: 'Trial',
    created_at: new Date().toISOString(),
    subscription_plan: body.subscription_plan || 'Standard'
  })
  return { ok: true }
}

const updateTenant = async (tenant_id, body) => {
  const i = mockTenants.findIndex(t => t.tenant_id===tenant_id)
  if (i<0) return { ok: false }
  mockTenants[i] = { ...mockTenants[i], ...body }
  return { ok: true }
}

const deleteTenant = async (tenant_id) => {
  const i = mockTenants.findIndex(t => t.tenant_id===tenant_id)
  if (i<0) return { ok: false }
  mockTenants.splice(i,1)
  return { ok: true }
}

export const tenantsApi = { list: listTenants, create: createTenant, update: updateTenant, delete: deleteTenant }

const listUsers = async ({ search, role_id } = {}) => {
  let data = [...mockUsers]
  if (search) {
    const s = search.toLowerCase()
    data = data.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || (u.phone_number||'').toLowerCase().includes(s))
  }
  if (role_id) data = data.filter(u => u.role_id === role_id)
  return { ok: true, data }
}

const createUser = async (body) => {
  const id = `u-${Math.random().toString(36).slice(2,6)}`
  const role = mockRoles.find(r => r.role_id===body.role_id) || mockRoles[0]
  mockUsers.unshift({ user_id: id, tenant_id: body.tenant_id || 'tenant-001', name: body.name, email: body.email, phone_number: body.phone_number || '', role_id: role.role_id, role_name: role.role_name, status: 'Pending Activation', last_login: null })
  return { ok: true }
}

const updateUser = async (user_id, body) => {
  const i = mockUsers.findIndex(u => u.user_id===user_id)
  if (i<0) return { ok: false }
  if (body.role_id) {
    const role = mockRoles.find(r => r.role_id===body.role_id)
    if (role) {
      mockUsers[i].role_id = role.role_id
      mockUsers[i].role_name = role.role_name
    }
  }
  mockUsers[i] = { ...mockUsers[i], ...body }
  return { ok: true }
}

const deleteUser = async (user_id) => {
  const i = mockUsers.findIndex(u => u.user_id===user_id)
  if (i<0) return { ok: false }
  mockUsers.splice(i,1)
  return { ok: true }
}

export const usersApi = { list: listUsers, create: createUser, update: updateUser, delete: deleteUser }

const listSettings = async () => {
  const byGroup = { loan: [], system: [], notify: [] }
  mockSettings.forEach(s => {
    byGroup[s.group].push({ ...s, value: s.is_encrypted ? s.value : s.value })
  })
  return { ok: true, data: { loan: byGroup.loan, system: byGroup.system, notify: byGroup.notify } }
}

const updateSettings = async (map) => {
  mockSettings.forEach(s => { if (map[s.key] != null) s.value = String(map[s.key]) })
  return { ok: true }
}

export const settingsApi = { list: listSettings, update: updateSettings }

const getProfile = async () => {
  const u = mockUsers.find(x => x.user_id === mockCurrentUserId)
  if (!u) return { ok: false }
  const role = mockRoles.find(r => r.role_id===u.role_id)
  const avatar = (()=>{ try { return localStorage.getItem('profile_avatar') || null } catch { return null } })()
  return { ok: true, data: { user_id: u.user_id, full_name: u.name, email: u.email, phone_number: u.phone_number, role_name: role?.role_name || u.role_name, tenant_id: u.tenant_id, avatar_url: avatar } }
}

const updateProfile = async ({ full_name, phone_number }) => {
  const i = mockUsers.findIndex(x => x.user_id===mockCurrentUserId)
  if (i<0) return { ok: false }
  if (full_name) mockUsers[i].name = full_name
  if (phone_number!=null) mockUsers[i].phone_number = phone_number
  return { ok: true }
}

const changePassword = async ({ current_password, new_password }) => {
  if (!current_password || !new_password) return { ok: false }
  return { ok: true }
}

const uploadAvatar = async (data_url) => {
  try {
    localStorage.setItem('profile_avatar', data_url)
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

export const profileApi = { get: getProfile, update: updateProfile, changePassword, uploadAvatar }

const listNotifications = async () => {
  const data = [...mockNotifications].sort((a,b)=> new Date(b.created_at) - new Date(a.created_at))
  return { ok: true, data }
}

const readNotification = async (id) => {
  const i = mockNotifications.findIndex(n => n.notification_id===id)
  if (i<0) return { ok: false }
  mockNotifications[i].read = true
  return { ok: true }
}

const unreadNotification = async (id) => {
  const i = mockNotifications.findIndex(n => n.notification_id===id)
  if (i<0) return { ok: false }
  mockNotifications[i].read = false
  return { ok: true }
}

const deleteNotification = async (id) => {
  const i = mockNotifications.findIndex(n => n.notification_id===id)
  if (i<0) return { ok: false }
  mockNotifications.splice(i,1)
  return { ok: true }
}

const markAllRead = async () => {
  mockNotifications.forEach(n => n.read = true)
  return { ok: true }
}

export const notificationsApi = { list: listNotifications, read: readNotification, unread: unreadNotification, delete: deleteNotification, markAllRead }

const submitSignup = async (body) => {
  const id = `app-${Math.random().toString(36).slice(2,8)}`
  const now = new Date()
  const from = now.toISOString()
  const toDate = new Date(now)
  if ((body.subscription_type||'Trial') === 'Trial') toDate.setDate(toDate.getDate()+30)
  else toDate.setFullYear(toDate.getFullYear()+1)
  const to = toDate.toISOString()
  const item = { ...body, application_id: id, subscription_from: from, subscription_to: to, isVerified: false, status: body.status || 'Active' }
  mockTenantApplications.push(item)
  mockTenants.unshift({ tenant_id: `tenant-${Math.random().toString(36).slice(2,6)}`, company_name: body.business_name, email: body.email, phone_number: String(body.mobile_no||''), user_count: 0, status: body.subscription_type==='Trial' ? 'Trial' : 'Active', created_at: new Date().toISOString(), subscription_plan: body.subscription_type || 'Trial' })
  return { ok: true, application_id: id }
}

export const signupApi = { submit: submitSignup }
