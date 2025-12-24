import { useEffect, useState } from "react";
import { roleAPI } from "../services/roleService";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [validationError, setValidationError] = useState("");

  // Role types as per the requirements from the screenshot
  const roleTypes = [
    { id: "sole", name: "Sole" },
    { id: "supervisor", name: "Supervisor" },
  ];

  // Status options as per the requirements
  const statusOptions = [
    { id: "active", name: "Active" },
    { id: "inactive", name: "Inactive" },
  ];

  const emptyForm = {
    role_type: "",
    role_name: "",
    status: "active",
  };

  const [form, setForm] = useState(emptyForm);

  // ----------------------------
  // VALIDATION FUNCTION
  // ----------------------------
  const validateForm = () => {
    if (!form.role_name.trim()) {
      setValidationError("Role name is required");
      return false;
    }
    if (!form.role_type) {
      setValidationError("Role type is required");
      return false;
    }
    if (!form.status) {
      setValidationError("Status is required");
      return false;
    }
    return true;
  };

  // ----------------------------
  // LOAD ROLES
  // ----------------------------
  const load = async () => {
    try {
      const res = await roleAPI.list();
      setRoles(res.data || []);
    } catch (err) {
      console.log("Failed to load roles", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ----------------------------
  // CREATE ROLE
  // ----------------------------
  const createRole = async () => {
    if (!validateForm()) return;

    try {
      await roleAPI.create(form);
      setOpen(false);
      setForm(emptyForm);
      setValidationError("");
      load();
    } catch (err) {
      console.log(err);
      setValidationError("Failed to create role");
    }
  };

  // ----------------------------
  // UPDATE ROLE
  // ----------------------------
  const updateRole = async () => {
    if (!validateForm()) return;

    try {
      await roleAPI.update(editing.id, form);
      setEditing(null);
      setForm(emptyForm);
      setValidationError("");
      load();
    } catch (err) {
      console.log(err);
      setValidationError("Failed to update role");
    }
  };

  // ----------------------------
  // DELETE ROLE
  // ----------------------------
  const deleteRole = async () => {
    try {
      await roleAPI.delete(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      console.log(err);
    }
  };

  const getRoleTypeName = (roleId) => {
    const roleType = roleTypes.find((type) => type.id === roleId);
    return roleType ? roleType.name : "-";
  };

  const getStatusName = (statusId) => {
    const status = statusOptions.find((option) => option.id === statusId);
    return status ? status.name : "-";
  };

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-2">2.5 Manage Roles</h1>
        <p className="text-gray-600">
          To manage different user role types and names under each tenant.
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div></div>
        <button
          className="h-9 px-4 rounded-lg bg-primary-600 text-white"
          onClick={() => {
            setForm(emptyForm);
            setOpen(true);
            setValidationError("");
          }}
        >
          Create Role
        </button>
      </div>

      {/* ROLES TABLE */}
      <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="px-4 py-3">Role Type</th>
              <th className="px-4 py-3">Role Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {roles.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{getRoleTypeName(r.role_type)}</td>
                <td className="px-4 py-3 font-medium">{r.role_name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      r.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getStatusName(r.status)}
                  </span>
                </td>

                <td className="px-4 py-3 flex gap-2">
                  <button
                    className="px-3 py-1 rounded border"
                    onClick={() => {
                      setEditing(r);
                      setForm({
                        role_type: r.role_type,
                        role_name: r.role_name,
                        status: r.status,
                      });
                      setValidationError("");
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="px-3 py-1 rounded border border-red-400 text-red-600"
                    onClick={() => setDeleting(r)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!roles.length && (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  No roles available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VALIDATION ERROR */}
      {validationError && (
        <div className="mt-4 text-red-600 font-medium">{validationError}</div>
      )}

      {/* CREATE / EDIT MODAL */}
      {(open || editing) && (
        <Modal
          title={editing ? "Edit Role" : "Create Role"}
          onClose={() => {
            setOpen(false);
            setEditing(null);
            setValidationError("");
          }}
        >
          <div className="space-y-3">
            {/* Role Type Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Role Type
              </label>
              <select
                className="border w-full rounded px-3 py-2"
                value={form.role_type}
                onChange={(e) =>
                  setForm({ ...form, role_type: e.target.value })
                }
              >
                <option value="">Select Role Type</option>
                {roleTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Name Input */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Role Name
              </label>
              <input
                className="border w-full rounded px-3 py-2"
                placeholder="Enter role name"
                value={form.role_name}
                onChange={(e) =>
                  setForm({ ...form, role_name: e.target.value })
                }
              />
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="border w-full rounded px-3 py-2"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {statusOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="px-4 py-2 bg-primary-600 text-white rounded"
              onClick={editing ? updateRole : createRole}
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION */}
      {deleting && (
        <Modal title="Delete Role" onClose={() => setDeleting(null)}>
          <p>
            Are you sure you want to delete <b>{deleting.role_name}</b>?
          </p>

          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 border rounded"
              onClick={() => setDeleting(null)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded"
              onClick={deleteRole}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg relative">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="mt-4">{children}</div>
        <button className="absolute top-4 right-4" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
