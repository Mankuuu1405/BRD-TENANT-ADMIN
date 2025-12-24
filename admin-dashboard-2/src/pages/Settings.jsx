import { useEffect, useState } from "react";
import { settingsService } from "../services/settingService"; // use your existing service

// -----------------------------
// Field Component
// -----------------------------
const Field = ({ s, onChange }) => {
  const masked = s.is_encrypted && !s.reveal;

  const label = s.key
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  if (s.data_type === "BOOLEAN") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={s.value === "true"}
          onChange={(e) => onChange(s.key, e.target.checked ? "true" : "false")}
        />
        <span>{label}</span>
      </label>
    );
  }

  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-700">{label}</div>
      <div className="flex gap-2">
        <input
          type="text"
          value={masked ? "••••" : s.value}
          onChange={(e) => !masked && onChange(s.key, e.target.value)}
          className="flex-1 h-9 rounded-lg border border-gray-300 px-3"
        />
        {s.is_encrypted && (
          <button
            type="button"
            className="h-9 px-3 rounded-lg border border-gray-200"
            onClick={() => onChange(s.key, s.value, { reveal: !s.reveal })}
          >
            {s.reveal ? "Hide" : "Reveal"}
          </button>
        )}
      </div>
    </div>
  );
};

// -----------------------------
// Main Settings Component
// -----------------------------
export default function Settings() {
  // Determine initial tab from URL or localStorage
  const getInitialTab = () => {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const urlTab = urlParams.get("tab");

    // Check localStorage
    const localTab = localStorage.getItem("settings_active_tab");

    // Clean up localStorage
    localStorage.removeItem("settings_active_tab");

    // Return the found tab or default to 'settings'
    if (urlTab && ["settings"].includes(urlTab)) {
      return urlTab;
    }

    if (localTab && ["settings"].includes(localTab)) {
      return localTab;
    }

    return "settings";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Settings state
  const [loan, setLoan] = useState([]);
  const [system, setSystem] = useState([]);
  const [notify, setNotify] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load settings
  const loadSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await settingsService.getSettings();
      const addReveal = (arr) => arr.map((s) => ({ ...s, reveal: false }));

      setLoan(addReveal(res.loan || []));
      setSystem(addReveal(res.system || []));
      setNotify(addReveal(res.notify || []));
    } catch (err) {
      console.error("Error loading settings:", err);
      setError("Unable to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load data on component mount
    loadSettings();
  }, []);

  // Mutate a specific setting in a group
  const mutate =
    (groupSetter, group) =>
    (key, value, extra = {}) => {
      groupSetter(
        group.map((s) => (s.key === key ? { ...s, value, ...extra } : s))
      );
    };

  // Save all settings
  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {};
      [...loan, ...system, ...notify].forEach((s) => {
        payload[s.key] = s.value;
      });

      await settingsService.updateSettings(payload);
      await loadSettings();
      setSuccess("Settings saved successfully");
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl font-semibold">Settings</div>
          <div className="text-sm text-gray-500">System Configuration</div>
        </div>
      </div>

      {/* Settings Tab - Only showing system settings now */}
      <>
        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3">
            {success}
          </div>
        )}

        {/* Header for Settings */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-lg font-medium">System Configuration</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={saving || loading}
              className="h-9 px-3 rounded-lg bg-primary-600 text-white disabled:opacity-60"
              onClick={saveSettings}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && <div className="text-gray-500">Loading settings...</div>}

        {/* Settings Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
            <div className="text-sm font-medium mb-2">Loan Configuration</div>
            <div className="space-y-3">
              {loan.map((s) => (
                <Field key={s.key} s={s} onChange={mutate(setLoan, loan)} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
            <div className="text-sm font-medium mb-2">System & Security</div>
            <div className="space-y-3">
              {system.map((s) => (
                <Field key={s.key} s={s} onChange={mutate(setSystem, system)} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-4 border border-gray-100">
            <div className="text-sm font-medium mb-2">
              Notifications & Email
            </div>
            <div className="space-y-3">
              {notify.map((s) => (
                <Field key={s.key} s={s} onChange={mutate(setNotify, notify)} />
              ))}
            </div>
          </div>
        </div>
      </>
    </div>
  );
}
