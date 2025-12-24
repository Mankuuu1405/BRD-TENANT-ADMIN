// src/pages/Rules.jsx
import { useEffect, useMemo, useState } from "react";
import rulesService from "../services/rulesService";
import authService from "../services/authService";

/*
  FINAL STABLE RULES ENGINE
  - No modal crash
  - Save + Close working
  - Tenant ID resolved from JWT or localStorage
*/

const defaultConfig = {
  access: {
    permissions: {
      leads: { view: true, add: true, edit: true, delete: false },
      loan_applications: { view: true, add: true, edit: true, delete: false },
      documents: { view: true, add: true, edit: false, delete: false },
      products: { view: true, add: true, edit: true, delete: true },
      users: { view: true, add: true, edit: true, delete: false },
    },
    module_access: { crm: true, loan: true, collection: false },
  },
  workflow: {
    approval_levels: ["Sales", "Verification", "Credit", "Risk", "Approval"],
    approver_roles: ["Credit", "Risk", "Approval"],
    rejector_roles: ["Risk", "Approval"],
    document_verification: {
      mandatory: ["PAN", "Aadhaar", "Address Proof"],
      auto_validation: true,
      upload_limit_mb: 10,
    },
  },
  validation: {
    unique_email: true,
    pan_format: true,
    aadhaar_format: true,
    phone_10_digits: true,
  },
  assignment: {
    lead_by_category: true,
    application_by_product: true,
    auto_assign: { sales: true, verification: true, credit: true },
  },
  security: {
    password_min_length: 8,
    password_special_required: true,
    session_timeout_minutes: 30,
    device_restrictions: ["Web"],
  },
};

function normalizeConfig(raw) {
  const c = raw || {};
  const perms = c.access?.permissions || {};
  const moduleAccess = c.access?.module_access || {};
  const workflow = c.workflow || {};
  const docVer = workflow.document_verification || {};

  return {
    access: {
      permissions: {
        leads: { ...defaultConfig.access.permissions.leads, ...(perms.leads || {}) },
        loan_applications: { ...defaultConfig.access.permissions.loan_applications, ...(perms.loan_applications || {}) },
        documents: { ...defaultConfig.access.permissions.documents, ...(perms.documents || {}) },
        products: { ...defaultConfig.access.permissions.products, ...(perms.products || {}) },
        users: { ...defaultConfig.access.permissions.users, ...(perms.users || {}) },
      },
      module_access: { ...defaultConfig.access.module_access, ...moduleAccess },
    },
    workflow: {
      approval_levels: workflow.approval_levels || defaultConfig.workflow.approval_levels,
      approver_roles: workflow.approver_roles || defaultConfig.workflow.approver_roles,
      rejector_roles: workflow.rejector_roles || defaultConfig.workflow.rejector_roles,
      document_verification: {
        mandatory: docVer.mandatory || defaultConfig.workflow.document_verification.mandatory,
        auto_validation: docVer.auto_validation ?? defaultConfig.workflow.document_verification.auto_validation,
        upload_limit_mb: docVer.upload_limit_mb ?? defaultConfig.workflow.document_verification.upload_limit_mb,
      },
    },
    validation: { ...defaultConfig.validation, ...(c.validation || {}) },
    assignment: {
      lead_by_category: c.assignment?.lead_by_category ?? defaultConfig.assignment.lead_by_category,
      application_by_product: c.assignment?.application_by_product ?? defaultConfig.assignment.application_by_product,
      auto_assign: { ...defaultConfig.assignment.auto_assign, ...(c.assignment?.auto_assign || {}) },
    },
    security: { ...defaultConfig.security, ...(c.security || {}) },
  };
}

export default function Rules() {
  const [tenantId, setTenantId] = useState(null);
  const [config, setConfig] = useState(defaultConfig);
  const [ruleId, setRuleId] = useState(null);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------
  // Resolve tenant ID from JWT or LocalStorage
  // ---------------------------------------------
  useEffect(() => {
    const t = authService.getTenantIdFromToken();
    const fromLocal = localStorage.getItem("TENANT_ID");

    if (t) {
      setTenantId(t);
    } else if (fromLocal) {
      setTenantId(fromLocal);
    } else {
      console.warn("No tenant found → read-only mode");
      setTenantId(null);
    }
  }, []);

  // ---------------------------------------------
  // Load tenant rules
  // ---------------------------------------------
  useEffect(() => {
    if (!tenantId) return;
    loadRules();
  }, [tenantId]);

  async function loadRules() {
    setLoading(true);
    try {
      const data = await rulesService.getConfig(tenantId);
      if (data) {
        setRuleId(data.id);
        setConfig(normalizeConfig(data.config));
      }
    } catch (e) {
      console.error("Failed load:", e);
    }
    setLoading(false);
  }

  async function saveRules() {
    if (!tenantId) {
      alert("Tenant missing.");
      return;
    }

    setLoading(true);
    try {
      const saved = await rulesService.saveConfig(ruleId, config, tenantId);
      if (saved?.id) setRuleId(saved.id);
      alert("Saved!");
      setOpen(null);
    } catch (e) {
      console.error("Save error", e);
      alert("Save failed");
    }
    setLoading(false);
  }

  const resources = useMemo(
    () => [
      { key: "leads", name: "Leads" },
      { key: "loan_applications", name: "Loan Applications" },
      { key: "documents", name: "Documents" },
      { key: "products", name: "Products" },
      { key: "users", name: "Users" },
    ],
    []
  );

  // --------------------------------------------------------
  // REUSABLE FOOTER BUTTONS (Fix for Close + Save)
  // --------------------------------------------------------
  const FooterButtons = ({ onClose, onSave }) => (
    <div className="mt-4 flex justify-end gap-3">
      <button onClick={onClose} className="px-4 py-2 rounded border bg-gray-100">
        Close
      </button>
      <button
        onClick={onSave}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );

  // --------------------------------------------------------
  // MAIN UI
  // --------------------------------------------------------
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rules Engine</h1>
        <div className="text-sm">Tenant: <strong>{tenantId || "None"}</strong></div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Access Rules" onClick={() => setOpen("access")} />
        <Card title="Workflow Rules" onClick={() => setOpen("workflow")} />
        <Card title="Validation Rules" onClick={() => setOpen("validation")} />
        <Card title="Assignment Rules" onClick={() => setOpen("assignment")} />
        <Card title="Security Rules" onClick={() => setOpen("security")} full />
      </div>

      {/* ------------------ MODALS ------------------ */}

      {/* ACCESS MODAL */}
      {open === "access" ? (
        <ModalWrapper>
          <h2 className="text-lg font-bold mb-3">Access Rules</h2>

          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Resource</th>
                <th className="p-2">View</th>
                <th className="p-2">Add</th>
                <th className="p-2">Edit</th>
                <th className="p-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.key} className="border-t">
                  <td className="p-2">{r.name}</td>
                  {["view", "add", "edit", "delete"].map((perm) => (
                    <td key={perm} className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={config.access.permissions[r.key][perm]}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            access: {
                              ...config.access,
                              permissions: {
                                ...config.access.permissions,
                                [r.key]: {
                                  ...config.access.permissions[r.key],
                                  [perm]: e.target.checked,
                                },
                              },
                            },
                          })
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <FooterButtons onClose={() => setOpen(null)} onSave={saveRules} />
        </ModalWrapper>
      ) : null}

      {/* WORKFLOW */}
      {open === "workflow" ? (
        <ModalWrapper>
          <h2 className="text-lg font-bold mb-3">Workflow Rules</h2>

          <div className="mb-2 font-semibold">Approval Levels</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {config.workflow.approval_levels.map((lvl, i) => (
              <span key={i} className="px-3 py-1 bg-gray-200 rounded-full">
                {lvl}
              </span>
            ))}
          </div>

          <input
            className="border p-2 w-full rounded"
            placeholder="Add Level (Enter to add)"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                setConfig({
                  ...config,
                  workflow: {
                    ...config.workflow,
                    approval_levels: [
                      ...config.workflow.approval_levels,
                      e.target.value.trim(),
                    ],
                  },
                });
                e.target.value = "";
              }
            }}
          />

          <FooterButtons onClose={() => setOpen(null)} onSave={saveRules} />
        </ModalWrapper>
      ) : null}

      {/* VALIDATION */}
      {open === "validation" ? (
        <ModalWrapper>
          <h2 className="text-lg font-bold mb-3">Validation Rules</h2>

          {Object.entries(config.validation).map(([k, v]) => (
            <label key={k} className="flex items-center gap-2 my-2">
              <input
                type="checkbox"
                checked={v}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    validation: { ...config.validation, [k]: e.target.checked },
                  })
                }
              />
              {k.replace("_", " ")}
            </label>
          ))}

          <FooterButtons onClose={() => setOpen(null)} onSave={saveRules} />
        </ModalWrapper>
      ) : null}

      {/* ASSIGNMENT */}
      {open === "assignment" ? (
        <ModalWrapper>
          <h2 className="text-lg font-bold mb-3">Assignment Rules</h2>

          <label className="flex items-center gap-2 my-2">
            <input
              type="checkbox"
              checked={config.assignment.lead_by_category}
              onChange={(e) =>
                setConfig({
                  ...config,
                  assignment: {
                    ...config.assignment,
                    lead_by_category: e.target.checked,
                  },
                })
              }
            />
            Lead by category
          </label>

          <label className="flex items-center gap-2 my-2">
            <input
              type="checkbox"
              checked={config.assignment.application_by_product}
              onChange={(e) =>
                setConfig({
                  ...config,
                  assignment: {
                    ...config.assignment,
                    application_by_product: e.target.checked,
                  },
                })
              }
            />
            Application by product
          </label>

          <FooterButtons onClose={() => setOpen(null)} onSave={saveRules} />
        </ModalWrapper>
      ) : null}

      {/* SECURITY */}
      {open === "security" ? (
        <ModalWrapper>
          <h2 className="text-lg font-bold mb-3">Security Rules</h2>

          <div className="mb-2 font-semibold">Password Min Length</div>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={config.security.password_min_length}
            onChange={(e) =>
              setConfig({
                ...config,
                security: {
                  ...config.security,
                  password_min_length: Number(e.target.value),
                },
              })
            }
          />

          <FooterButtons onClose={() => setOpen(null)} onSave={saveRules} />
        </ModalWrapper>
      ) : null}
    </div>
  );
}

// ----------------------------------------------------------
// CARD COMPONENT
// ----------------------------------------------------------
function Card({ title, onClick, full }) {
  return (
    <div
      className={`bg-white p-4 rounded shadow flex justify-between items-center ${
        full ? "col-span-full" : ""
      }`}
    >
      <div>
        <div className="font-semibold">{title}</div>
      </div>

      <button
        onClick={onClick}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Manage
      </button>
    </div>
  );
}

// ----------------------------------------------------------
// GENERIC MODAL WRAPPER
// ----------------------------------------------------------
function ModalWrapper({ children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded w-full max-w-2xl max-h-[90vh] overflow-auto">
        {children}
      </div>
    </div>
  );
}
