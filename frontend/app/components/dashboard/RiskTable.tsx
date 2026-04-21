import React from "react";

interface Risk {
  id: string;
  type: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Unresolved" | "In Progress" | "Mitigated";
}

interface RiskTableProps {
  risks?: Risk[];
}

const defaultRisks: Risk[] = [
  {
    id: "RISK-001",
    type: "Unencrypted Data Storage",
    severity: "Critical",
    status: "In Progress",
  },
  {
    id: "RISK-002",
    type: "Excessive Access Permissions",
    severity: "High",
    status: "Unresolved",
  },
  {
    id: "RISK-003",
    type: "Unverified Third Party API",
    severity: "High",
    status: "In Progress",
  },
  {
    id: "RISK-004",
    type: "Missing Audit Logs",
    severity: "Medium",
    status: "Mitigated",
  },
  {
    id: "RISK-005",
    type: "Inadequate Data Retention Policy",
    severity: "Medium",
    status: "Unresolved",
  },
];

const getSeverityColor = (severity: Risk["severity"]) => {
  switch (severity) {
    case "Critical":
      return "bg-red-100 text-red-800";
    case "High":
      return "bg-orange-100 text-orange-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const getStatusColor = (status: Risk["status"]) => {
  switch (status) {
    case "Mitigated":
      return "bg-green-50 text-green-700";
    case "In Progress":
      return "bg-blue-50 text-blue-700";
    case "Unresolved":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-50 text-slate-700";
  }
};

export default function RiskTable({ risks = defaultRisks }: RiskTableProps) {
  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-100">
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wide">
                Risk ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wide">
                Risk Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wide">
                Severity
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-800 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {risks.map((risk) => (
              <tr key={risk.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-900">
                  {risk.id}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                  {risk.type}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getSeverityColor(risk.severity)}`}>
                    {risk.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(risk.status)}`}>
                    {risk.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
