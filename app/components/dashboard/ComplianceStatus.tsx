import React from "react";

interface ComplianceItem {
  name: string;
  status: "compliant" | "non-compliant" | "pending";
  percentage?: number;
}

interface ComplianceStatusProps {
  items?: ComplianceItem[];
}

const defaultItems: ComplianceItem[] = [
  {
    name: "HIPAA Compliance",
    status: "compliant",
    percentage: 95,
  },
  {
    name: "DPDP Compliance",
    status: "compliant",
    percentage: 88,
  },
  {
    name: "Data Encryption Status",
    status: "compliant",
    percentage: 100,
  },
  {
    name: "Access Control Audit",
    status: "pending",
    percentage: 65,
  },
  {
    name: "Third-Party Verification",
    status: "non-compliant",
    percentage: 45,
  },
];

const getStatusColor = (status: ComplianceItem["status"]) => {
  switch (status) {
    case "compliant":
      return "bg-green-100 border-green-300";
    case "non-compliant":
      return "bg-red-100 border-red-300";
    case "pending":
      return "bg-yellow-100 border-yellow-300";
    default:
      return "bg-slate-100 border-slate-300";
  }
};

const getStatusBadgeColor = (status: ComplianceItem["status"]) => {
  switch (status) {
    case "compliant":
      return "bg-green-500 text-white";
    case "non-compliant":
      return "bg-red-500 text-white";
    case "pending":
      return "bg-yellow-500 text-white";
    default:
      return "bg-slate-500 text-white";
  }
};

const getStatusText = (status: ComplianceItem["status"]) => {
  switch (status) {
    case "compliant":
      return "✓ Compliant";
    case "non-compliant":
      return "✗ Non-Compliant";
    case "pending":
      return "⏳ Pending";
    default:
      return "Unknown";
  }
};

export default function ComplianceStatus({
  items = defaultItems,
}: ComplianceStatusProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.name}
          className={`rounded-lg border-2 p-4 ${getStatusColor(item.status)}`}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">
                {item.name}
              </h4>
            </div>
            <span
              className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadgeColor(item.status)}`}
            >
              {getStatusText(item.status)}
            </span>
          </div>

          {item.percentage !== undefined && (
            <div className="w-full bg-slate-300 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  item.status === "compliant"
                    ? "bg-green-500"
                    : item.status === "non-compliant"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          )}
          {item.percentage !== undefined && (
            <p className="text-xs text-slate-700 mt-2">
              {item.percentage}% Complete
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
