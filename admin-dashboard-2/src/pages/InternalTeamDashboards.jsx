import { useState } from "react";
import {
  ClipboardDocumentCheckIcon,
  ShieldExclamationIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

const teamsData = [
  {
    id: "legal_verification",
    title: "Legal & Verification",
    description: "Handles compliance, KYC, and document verification",
    icon: ClipboardDocumentCheckIcon,
    permissions: [
      "KYC Verification",
      "Document Review",
      "Compliance Checks",
      "Risk Flags",
      "Audit Trail",
    ],
  },
  {
    id: "fraud_team",
    title: "Fraud Team",
    description: "Monitors and investigates suspicious activities",
    icon: ShieldExclamationIcon,
    permissions: [
      "Fraud Alerts",
      "Case Management",
      "Blacklist Management",
      "Pattern Analysis",
      "Incident Reporting",
    ],
  },
  {
    id: "valuation",
    title: "Valuation",
    description: "Manages asset and collateral valuation",
    icon: PresentationChartLineIcon,
    permissions: [
      "Schedule Valuation",
      "Assign Valuators",
      "Upload Reports",
      "Approval Workflow",
      "Price Index Access",
    ],
  },
  {
    id: "crm_sales",
    title: "CRM & Sales",
    description: "Leads, opportunities, and sales pipelines",
    icon: UserGroupIcon,
    permissions: [
      "Lead Management",
      "Pipeline Tracking",
      "Contact Management",
      "Campaigns",
      "Reporting",
    ],
  },
  {
    id: "finance",
    title: "Finance",
    description: "Payments, invoicing, and financial reconciliation",
    icon: BanknotesIcon,
    permissions: [
      "Invoice Management",
      "Disbursement",
      "Refunds",
      "Reconciliation",
      "Financial Reports",
    ],
  },
];

const TeamDetailView = ({ team, onBack }) => {
  const [activePanel, setActivePanel] = useState(null);

  const handleTogglePanel = (panelType) => {
    setActivePanel((currentActivePanel) =>
      currentActivePanel === panelType ? null : panelType
    );
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:underline flex items-center"
      >
        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
        Back to Dashboard Hub
      </button>

      <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-4 text-left font-semibold text-gray-700">
              DASHBOARD
            </th>
            <th className="p-4 text-left font-semibold text-gray-700">
              PRIMARY FUNCTION
            </th>
            <th className="p-4 text-left font-semibold text-gray-700">
              KEY MODULES & ACTIONS
            </th>
            <th className="p-4 text-left font-semibold text-gray-700">
              MANAGEMENT ACTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-4 border-b">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{team.icon}</span>
                <span className="font-bold">{team.title}</span>
              </div>
            </td>
            <td className="p-4 border-b text-gray-600">{team.description}</td>
            <td className="p-4 border-b">
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {team.permissions.map((perm, index) => (
                  <li key={index}>{perm}</li>
                ))}
              </ul>
            </td>
            <td className="p-4 border-b space-y-2">
              <div
                className={`cursor-pointer p-2 rounded text-center font-mono text-xs transition-colors ${
                  activePanel === "users"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleTogglePanel("users")}
              >
                Manage {team.title} Users
              </div>
              <div
                className={`cursor-pointer p-2 rounded text-center font-mono text-xs transition-colors ${
                  activePanel === "permissions"
                    ? "bg-yellow-500 text-gray-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleTogglePanel("permissions")}
              >
                Configure Role Permissions
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {activePanel === "users" && (
        <div className="p-6 bg-white rounded-lg shadow-sm border-t-4 border-blue-500 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Manage {team.title} Users</h4>
          </div>
          <input
            className="border px-3 py-2 rounded-lg w-72"
            placeholder="Search user by name/email/role"
          />
          <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Mobile No</th>
                  <th className="px-4 py-3">Role Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Supervisor</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-600">
                    No users found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activePanel === "permissions" && (
        <div className="p-6 bg-white rounded-lg shadow-sm border-t-4 border-yellow-500 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">
              Configure Role Permissions
            </h4>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Changes to role permissions will
              affect all users with that role.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function InternalTeamDashboards() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  if (selectedTeam) {
    return (
      <TeamDetailView
        team={selectedTeam}
        onBack={() => setSelectedTeam(null)}
      />
    );
  }
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-2xl font-bold text-gray-800">
            Dashboard & Role Management Hub
          </div>
          <div className="text-sm text-gray-500">
            Configure and manage all internal team dashboards and their
            permissions.
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="text-lg font-semibold text-gray-700 border-b pb-2">
          Internal Team Dashboards
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamsData.map((team) => (
            <button
              key={team.id}
              className="p-4 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-card hover:shadow-md hover:bg-gray-50 text-left transition-all"
              onClick={() => setSelectedTeam(team)}
            >
              <div className="flex items-center space-x-3 mb-2">
                {(() => {
                  const Icon = team.icon;
                  return <Icon className="h-5 w-5 text-slate-500" />;
                })()}
                <span className="font-bold">{team.title}</span>
              </div>
              <p className="text-xs text-gray-600">{team.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}