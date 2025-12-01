import { useEffect, useMemo, useState } from 'react'

const defaultConfig = {
  access: {
    permissions: {
      leads: { view: true, add: true, edit: true, delete: false },
      loan_applications: { view: true, add: true, edit: true, delete: false },
      documents: { view: true, add: true, edit: false, delete: false },
      products: { view: true, add: true, edit: true, delete: true },
      users: { view: true, add: true, edit: true, delete: false }
    },
    module_access: { crm: true, loan: true, collection: false }
  },
  workflow: {
    approval_levels: ['Sales','Verification','Credit','Risk','Approval'],
    approver_roles: ['Credit','Risk','Approval'],
    rejector_roles: ['Risk','Approval'],
    document_verification: { mandatory: ['PAN','Aadhaar','Address Proof'], auto_validation: true, upload_limit_mb: 10 }
  },
  validation: { unique_email: true, pan_format: true, aadhaar_format: true, phone_10_digits: true },
  assignment: {
    lead_by_category: true,
    application_by_product: true,
    auto_assign: { sales: true, verification: true, credit: true }
  },
  security: { password_min_length: 8, password_special_required: true, session_timeout_minutes: 30, device_restrictions: ['Web'] }
}

function normalizeConfig(raw) {
  const c = raw || {}
  const perms = c.access?.permissions || {}
  const moduleAccess = c.access?.module_access || {}
  const workflow = c.workflow || {}
  const docVer = workflow.document_verification || {}
  return {
    access: {
      permissions: {
        leads: { ...defaultConfig.access.permissions.leads, ...(perms.leads || {}) },
        loan_applications: { ...defaultConfig.access.permissions.loan_applications, ...(perms.loan_applications || {}) },
        documents: { ...defaultConfig.access.permissions.documents, ...(perms.documents || {}) },
        products: { ...defaultConfig.access.permissions.products, ...(perms.products || {}) },
        users: { ...defaultConfig.access.permissions.users, ...(perms.users || {}) }
      },
      module_access: { ...defaultConfig.access.module_access, ...moduleAccess }
    },
    workflow: {
      approval_levels: workflow.approval_levels || defaultConfig.workflow.approval_levels,
      approver_roles: workflow.approver_roles || defaultConfig.workflow.approver_roles,
      rejector_roles: workflow.rejector_roles || defaultConfig.workflow.rejector_roles,
      document_verification: {
        mandatory: docVer.mandatory || defaultConfig.workflow.document_verification.mandatory,
        auto_validation: docVer.auto_validation ?? defaultConfig.workflow.document_verification.auto_validation,
        upload_limit_mb: docVer.upload_limit_mb ?? defaultConfig.workflow.document_verification.upload_limit_mb
      }
    },
    validation: { ...defaultConfig.validation, ...(c.validation || {}) },
    assignment: {
      lead_by_category: c.assignment?.lead_by_category ?? defaultConfig.assignment.lead_by_category,
      application_by_product: c.assignment?.application_by_product ?? defaultConfig.assignment.application_by_product,
      auto_assign: { ...defaultConfig.assignment.auto_assign, ...(c.assignment?.auto_assign || {}) }
    },
    security: { ...defaultConfig.security, ...(c.security || {}) }
  }
}

export default function Rules() {
  const [config, setConfig] = useState(() => {
    try { const s = localStorage.getItem('rules_config'); if (s) return normalizeConfig(JSON.parse(s)) } catch {}
    return defaultConfig
  })
  const [open, setOpen] = useState(null)
  useEffect(() => { try { localStorage.setItem('rules_config', JSON.stringify(config)) } catch {} }, [config])

  const Card = ({ title, subtitle, onOpen }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex items-center justify-between">
      <div className="flex flex-col">
        <div className="text-base font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-gray-600 mt-1">{subtitle}</div>}
      </div>
      <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={onOpen}>Manage</button>
    </div>
  )

  const SectionHeader = ({ title, desc }) => (
    <div className="mb-2">
      <div className="text-sm font-medium">{title}</div>
      {desc && <div className="text-xs text-gray-600">{desc}</div>}
    </div>
  )

  const resources = useMemo(() => ([
    { key: 'leads', name: 'Leads' },
    { key: 'loan_applications', name: 'Loan Applications' },
    { key: 'documents', name: 'Documents' },
    { key: 'products', name: 'Products' },
    { key: 'users', name: 'Users' }
  ]), [])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Rules</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Access Rules" subtitle="Create/Edit/Delete permissions & module access" onOpen={()=>setOpen('access')} />
        <Card title="Workflow Rules" subtitle="Loan approval levels, verification steps" onOpen={()=>setOpen('workflow')} />
        <Card title="Validation Rules" subtitle="Phone number/email/PAN/Aadhaar validation" onOpen={()=>setOpen('validation')} />
        <Card title="Assignment Rules" subtitle="Auto-assign lead/application" onOpen={()=>setOpen('assignment')} />
        <Card title="Security Rules" subtitle="Password and session rules" onOpen={()=>setOpen('security')} />
      </div>

      {open==='access' && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setOpen(null)}>
          <div className="bg-white w-full max-w-2xl rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Access Rules</div>
            <SectionHeader title="Permissions" desc="View/Add/Edit/Delete per resource" />
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="px-2 py-2">Resource</th>
                    <th className="px-2 py-2">View</th>
                    <th className="px-2 py-2">Add</th>
                    <th className="px-2 py-2">Edit</th>
                    <th className="px-2 py-2">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map(r => (
                    <tr key={r.key} className="border-t border-gray-100">
                      <td className="px-2 py-2 font-medium">{r.name}</td>
                      {['view','add','edit','delete'].map(a => (
                        <td key={a} className="px-2 py-2">
                          <input
                            type="checkbox"
                            checked={Boolean(config.access?.permissions?.[r.key]?.[a])}
                            onChange={(e)=>{
                              const current = config.access.permissions[r.key] || { view: false, add: false, edit: false, delete: false }
                              setConfig({ ...config, access: { ...config.access, permissions: { ...config.access.permissions, [r.key]: { ...current, [a]: e.target.checked } } } })
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SectionHeader title="Module Access" desc="Toggle access to CRM, Loan, Collection" />
            <div className="grid grid-cols-3 gap-3 text-sm mt-2">
              {Object.entries(config.access.module_access).map(([k,v]) => (
                <label key={k} className="flex items-center gap-2">
                  <input type="checkbox" checked={v} onChange={(e)=>setConfig({ ...config, access: { ...config.access, module_access: { ...config.access.module_access, [k]: e.target.checked } } })} />
                  <span className="capitalize">{k}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {open==='workflow' && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setOpen(null)}>
          <div className="bg-white w-full max-w-2xl rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Workflow Rules</div>
            <SectionHeader title="Loan Approval Levels" />
            <div className="mt-2 flex flex-wrap gap-2">
              {config.workflow.approval_levels.map((lvl, i) => (
                <span key={i} className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">{lvl}</span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <div className="text-gray-700">Add Level</div>
                <input placeholder="e.g. Disbursement" className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" onKeyDown={(e)=>{ if (e.key==='Enter' && e.currentTarget.value.trim()) { setConfig({ ...config, workflow: { ...config.workflow, approval_levels: [...config.workflow.approval_levels, e.currentTarget.value.trim()] } }); e.currentTarget.value=''; } }} />
              </label>
              <label className="block text-sm">
                <div className="text-gray-700">Upload Limit (MB)</div>
                <input type="number" value={config.workflow.document_verification.upload_limit_mb} onChange={(e)=>setConfig({ ...config, workflow: { ...config.workflow, document_verification: { ...config.workflow.document_verification, upload_limit_mb: Number(e.target.value) } } })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
            </div>
            <SectionHeader title="Approver Roles" />
            <div className="mt-2 flex flex-wrap gap-2">
              {config.workflow.approver_roles.map((r,i)=> (<span key={i} className="px-2 py-1 rounded-full bg-primary-50 text-primary-700 text-sm">{r}</span>))}
            </div>
            <SectionHeader title="Rejector Roles" />
            <div className="mt-2 flex flex-wrap gap-2">
              {config.workflow.rejector_roles.map((r,i)=> (<span key={i} className="px-2 py-1 rounded-full bg-red-50 text-red-700 text-sm">{r}</span>))}
            </div>
            <SectionHeader title="Document Verification" />
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={config.workflow.document_verification.auto_validation} onChange={(e)=>setConfig({ ...config, workflow: { ...config.workflow, document_verification: { ...config.workflow.document_verification, auto_validation: e.target.checked } } })} />
              <span>Auto-validation</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {config.workflow.document_verification.mandatory.map((d,i)=> (
                <span key={i} className="px-2 py-1 rounded-lg border border-gray-200 text-sm">{d}</span>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {open==='validation' && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setOpen(null)}>
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Validation Rules</div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={config.validation.unique_email} onChange={(e)=>setConfig({ ...config, validation: { ...config.validation, unique_email: e.target.checked } })} /><span>Email must be unique</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={config.validation.pan_format} onChange={(e)=>setConfig({ ...config, validation: { ...config.validation, pan_format: e.target.checked } })} /><span>PAN must be valid format</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={config.validation.aadhaar_format} onChange={(e)=>setConfig({ ...config, validation: { ...config.validation, aadhaar_format: e.target.checked } })} /><span>Aadhaar must be valid format</span></label>
              <label className="flex items_center gap-2"><input type="checkbox" checked={config.validation.phone_10_digits} onChange={(e)=>setConfig({ ...config, validation: { ...config.validation, phone_10_digits: e.target.checked } })} /><span>Phone number must be 10 digits</span></label>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {open==='assignment' && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setOpen(null)}>
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Assignment Rules</div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={config.assignment.lead_by_category} onChange={(e)=>setConfig({ ...config, assignment: { ...config.assignment, lead_by_category: e.target.checked } })} /><span>Assign leads based on category</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={config.assignment.application_by_product} onChange={(e)=>setConfig({ ...config, assignment: { ...config.assignment, application_by_product: e.target.checked } })} /><span>Assign applications based on product type</span></label>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
              {Object.entries(config.assignment.auto_assign).map(([k,v]) => (
                <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={v} onChange={(e)=>setConfig({ ...config, assignment: { ...config.assignment, auto_assign: { ...config.assignment.auto_assign, [k]: e.target.checked } } })} /><span className="capitalize">{k}</span></label>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {open==='security' && (
        <div className="fixed inset-0 bg-black/25 grid place-items-center z-40" onClick={()=>setOpen(null)}>
          <div className="bg-white w-full max-w-lg rounded-xl border border-gray-200 shadow-card p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold">Security Rules</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <div className="text-gray-700">Password Min Length</div>
                <input type="number" min="6" value={config.security.password_min_length} onChange={(e)=>setConfig({ ...config, security: { ...config.security, password_min_length: Number(e.target.value) } })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block text-sm">
                <div className="text-gray-700">Special Character Required</div>
                <select value={String(config.security.password_special_required)} onChange={(e)=>setConfig({ ...config, security: { ...config.security, password_special_required: e.target.value==='true' } })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3"><option value="true">Yes</option><option value="false">No</option></select>
              </label>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <div className="text-gray-700">Session Timeout (minutes)</div>
                <input type="number" min="5" value={config.security.session_timeout_minutes} onChange={(e)=>setConfig({ ...config, security: { ...config.security, session_timeout_minutes: Number(e.target.value) } })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
              <label className="block text-sm">
                <div className="text-gray-700">Allowed Devices</div>
                <input value={config.security.device_restrictions.join(', ')} onChange={(e)=>setConfig({ ...config, security: { ...config.security, device_restrictions: e.target.value.split(',').map(x=>x.trim()).filter(Boolean) } })} className="mt-1 w-full h-9 rounded-lg border border-gray-300 px-3" />
              </label>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="h-9 px-3 rounded-lg border border-gray-200" onClick={()=>setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
