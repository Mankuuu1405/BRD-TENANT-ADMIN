export const mockDashboard = {
  kpis: {
    totalTenants: 24,
    tenantsTrend: '+12.5%',
    activeUsers: 3847,
    usersTrend: '+8.2%',
    totalLoans: 45892,
    loansTrend: '+15.3%',
    disbursedAmount: '₹2,847 Cr',
    amountTrend: '+22.1%'
  },
  charts: {
    monthlyDisbursement: [
      { month: 'Jan', amount: 420000 },
      { month: 'Feb', amount: 460000 },
      { month: 'Mar', amount: 520000 },
      { month: 'Apr', amount: 580000 },
      { month: 'May', amount: 600000 },
      { month: 'Jun', amount: 640000 },
      { month: 'Jul', amount: 680000 },
      { month: 'Aug', amount: 720000 },
      { month: 'Sep', amount: 760000 },
      { month: 'Oct', amount: 780000 },
      { month: 'Nov', amount: 800000 },
      { month: 'Dec', amount: 820000 }
    ],
    loanStatusDistribution: [
      { status: 'Active', count: 50 },
      { status: 'Paid Off', count: 25 },
      { status: 'Default', count: 1 },
      { status: 'Pending', count: 5 }
    ],
    recentActivity: [
      { title: 'Loan Application Approved', subtitle: 'HDFC Bank', time: '2024-12-15 14:30:25' },
      { title: 'Failed Login Attempt', subtitle: 'Bajaj Finance', time: '2024-12-15 14:25:10' },
      { title: 'Credit Bureau API Called', subtitle: 'Muthoot Finance', time: '2024-12-15 14:20:45' }
    ]
  }
}

export const mockIntegrations = [
  {
    config_id: 'cfg-1',
    integration_type: 'KYC_API',
    tenant_id: null,
    provider_name: 'MetroKYC',
    api_key_encrypted: '***',
    endpoint_url: 'https://api.test.metokyc.com',
    status: 'Pending',
    last_validated: null
  },
  {
    config_id: 'cfg-2',
    integration_type: 'CREDIT_BUREAU',
    tenant_id: 'tenant-001',
    provider_name: 'Experian',
    api_key_encrypted: '***',
    endpoint_url: 'https://api.credit.test/experian',
    status: 'Disconnected',
    last_validated: null
  },
  {
    config_id: 'cfg-3',
    integration_type: 'PAYMENT_GATEWAY',
    tenant_id: 'tenant-001',
    provider_name: 'Stripe',
    api_key_encrypted: '***',
    endpoint_url: 'https://api.stripe.com',
    status: 'Connected',
    last_validated: new Date().toISOString()
  }
]

export const mockLoans = [
  { loan_id: 'LN001', tenant_id: 'tenant-001', applicant_name: 'Amit Sharma', amount: 500000, term_months: 12, applied_on: new Date(Date.now()-86400000*2).toISOString(), status: 'Pending' },
  { loan_id: 'LN002', tenant_id: 'tenant-001', applicant_name: 'Neha Verma', amount: 750000, term_months: 18, applied_on: new Date(Date.now()-86400000*3).toISOString(), status: 'Approved' },
  { loan_id: 'LN003', tenant_id: 'tenant-002', applicant_name: 'Rahul Mehta', amount: 300000, term_months: 24, applied_on: new Date(Date.now()-86400000*5).toISOString(), status: 'Rejected' },
  { loan_id: 'LN004', tenant_id: 'tenant-001', applicant_name: 'Sara Khan', amount: 900000, term_months: 12, applied_on: new Date(Date.now()-86400000*1).toISOString(), status: 'Pending' },
  { loan_id: 'LN005', tenant_id: 'tenant-003', applicant_name: 'Vikram Singh', amount: 650000, term_months: 36, applied_on: new Date(Date.now()-86400000*7).toISOString(), status: 'Disbursed' },
  { loan_id: 'LN006', tenant_id: 'tenant-001', applicant_name: 'Priya Das', amount: 420000, term_months: 18, applied_on: new Date(Date.now()-86400000*4).toISOString(), status: 'Approved' },
  { loan_id: 'LN007', tenant_id: 'tenant-002', applicant_name: 'Mohit Jain', amount: 1200000, term_months: 24, applied_on: new Date(Date.now()-86400000*9).toISOString(), status: 'Pending' },
  { loan_id: 'LN008', tenant_id: 'tenant-003', applicant_name: 'Kiran Rao', amount: 280000, term_months: 12, applied_on: new Date(Date.now()-86400000*6).toISOString(), status: 'Rejected' },
  { loan_id: 'LN009', tenant_id: 'tenant-001', applicant_name: 'Rohit Gupta', amount: 830000, term_months: 30, applied_on: new Date(Date.now()-86400000*10).toISOString(), status: 'Repaid' }
]

export const mockLogs = [
  { log_id: 'LG001', tenant_id: 'tenant-001', timestamp: new Date(Date.now()-3600*1000*1).toISOString(), event_type: 'LOAN_APPROVED', actor_user_id: 'u-101', actor_user_role: 'Manager', target_entity: 'Loan', target_entity_id: 'LN002', summary: 'Loan Approved', details: { loan_id: 'LN002' } },
  { log_id: 'LG002', tenant_id: 'tenant-001', timestamp: new Date(Date.now()-3600*1000*2).toISOString(), event_type: 'LOAN_REJECTED', actor_user_id: 'u-102', actor_user_role: 'Analyst', target_entity: 'Loan', target_entity_id: 'LN003', summary: 'Loan Rejected', details: { reason: 'Insufficient docs' } },
  { log_id: 'LG003', tenant_id: null, timestamp: new Date(Date.now()-3600*1000*4).toISOString(), event_type: 'TENANT_CREATED', actor_user_id: 'u-001', actor_user_role: 'Admin', target_entity: 'Tenant', target_entity_id: 'tenant-003', summary: 'Tenant Added', details: { name: 'Metro Credit' } },
  { log_id: 'LG004', tenant_id: 'tenant-001', timestamp: new Date(Date.now()-3600*1000*6).toISOString(), event_type: 'USER_ROLE_UPDATED', actor_user_id: 'u-103', actor_user_role: 'Admin', target_entity: 'User', target_entity_id: 'u-205', summary: 'User Role Updated', details: { old_role: 'Analyst', new_role: 'Manager' } },
  { log_id: 'LG005', tenant_id: 'tenant-001', timestamp: new Date(Date.now()-3600*1000*8).toISOString(), event_type: 'INTEGRATION_VALIDATED', actor_user_id: 'u-104', actor_user_role: 'Admin', target_entity: 'Integration', target_entity_id: 'cfg-3', summary: 'Integration Connected', details: { provider: 'Stripe' } }
]

export const mockTenants = [
  { tenant_id: 'tenant-001', company_name: 'Metro Credit', email: 'contact@metrocredit.com', phone_number: '+911234567890', user_count: 43, status: 'Active', created_at: '2024-01-10', subscription_plan: 'Premium', total_loans: 120, total_active_users: 43 },
  { tenant_id: 'tenant-002', company_name: 'Sunrise Capital', email: 'admin@sunrisecapital.com', phone_number: '+919876543210', user_count: 32, status: 'Active', created_at: '2023-11-02', subscription_plan: 'Standard', total_loans: 95, total_active_users: 32 },
  { tenant_id: 'tenant-003', company_name: 'GreenLoans', email: 'ops@greenloans.com', phone_number: '+441234567890', user_count: 12, status: 'Inactive', created_at: '2022-07-22', subscription_plan: 'Standard', total_loans: 40, total_active_users: 12 }
]

export const mockRoles = [
  { role_id: 'role-super', role_name: 'Super Admin', description: 'Platform owner role', is_system_role: true },
  { role_id: 'role-credit', role_name: 'Credit Manager', description: 'Manages loan approvals', is_system_role: false },
  { role_id: 'role-analyst', role_name: 'Analyst', description: 'Views data and prepares reports', is_system_role: false }
]

export const mockPermissions = [
  { permission_id: 'LOAN_CREATE', module: 'Loans', action: 'Create', name: 'Create New Loan' },
  { permission_id: 'LOAN_VIEW_ALL', module: 'Loans', action: 'View', name: 'View All Loans' },
  { permission_id: 'LOAN_APPROVE', module: 'Loans', action: 'Update', name: 'Approve Loan' },
  { permission_id: 'USER_VIEW', module: 'Users', action: 'View', name: 'View User List' },
  { permission_id: 'USER_EDIT_ROLE', module: 'Users', action: 'Update', name: 'Edit User Role' },
  { permission_id: 'REPORT_DOWNLOAD', module: 'Reports', action: 'Create', name: 'Download Reports' }
]

export const mockRolePermissions = {
  'role-super': mockPermissions.map(p => p.permission_id),
  'role-credit': ['LOAN_VIEW_ALL', 'LOAN_APPROVE', 'REPORT_DOWNLOAD'],
  'role-analyst': ['LOAN_VIEW_ALL', 'REPORT_DOWNLOAD']
}

export const mockUsers = [
  { user_id: 'u-101', tenant_id: 'tenant-001', name: 'Amit Sharma', email: 'amit@metrocredit.com', phone_number: '+911234567890', role_id: 'role-credit', role_name: 'Credit Manager', status: 'Active', last_login: new Date(Date.now()-86400000).toISOString() },
  { user_id: 'u-102', tenant_id: 'tenant-001', name: 'Neha Verma', email: 'neha@metrocredit.com', phone_number: '+919876543210', role_id: 'role-analyst', role_name: 'Analyst', status: 'Pending Activation', last_login: null },
  { user_id: 'u-103', tenant_id: 'tenant-002', name: 'Rahul Mehta', email: 'rahul@sunrisecapital.com', phone_number: '+441234567890', role_id: 'role-analyst', role_name: 'Analyst', status: 'Inactive', last_login: new Date(Date.now()-86400000*3).toISOString() }
]

export const mockCurrentUserId = 'u-101'

export const mockSettings = [
  { key: 'LOAN_DEFAULT_INTEREST_RATE', value: '0.12', data_type: 'DECIMAL', is_encrypted: false, group: 'loan' },
  { key: 'LOAN_MAX_AMOUNT', value: '1000000', data_type: 'DECIMAL', is_encrypted: false, group: 'loan' },
  { key: 'LOAN_MIN_TERM_MONTHS', value: '6', data_type: 'INTEGER', is_encrypted: false, group: 'loan' },
  { key: 'DEFAULT_CURRENCY_SYMBOL', value: '₹', data_type: 'STRING', is_encrypted: false, group: 'loan' },
  { key: 'PASSWORD_MIN_LENGTH', value: '8', data_type: 'INTEGER', is_encrypted: false, group: 'system' },
  { key: 'SESSION_TIMEOUT_MINUTES', value: '30', data_type: 'INTEGER', is_encrypted: false, group: 'system' },
  { key: 'ALLOW_ANONYMOUS_SIGNUP', value: 'false', data_type: 'BOOLEAN', is_encrypted: false, group: 'system' },
  { key: 'NOTIFICATION_SENDER_EMAIL', value: 'no-reply@platform.com', data_type: 'STRING', is_encrypted: false, group: 'notify' },
  { key: 'WEBHOOK_SECRET_KEY', value: 'super-secret', data_type: 'STRING', is_encrypted: true, group: 'notify' }
]

export const mockNotifications = [
  { notification_id: 'n-001', title: 'System Update', message: 'Settings saved successfully.', created_at: new Date().toISOString(), read: false },
  { notification_id: 'n-002', title: 'New Tenant Signup', message: 'Sunrise Capital applied for onboarding.', created_at: new Date(Date.now()-3600_000).toISOString(), read: false },
  { notification_id: 'n-003', title: 'Report Ready', message: 'Loan Activity report is available to download.', created_at: new Date(Date.now()-7200_000).toISOString(), read: true }
]

export const mockTenantApplications = []