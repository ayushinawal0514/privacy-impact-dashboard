import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  bgColor?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend = "neutral",
  icon,
  bgColor = "bg-blue-50",
}: MetricCardProps) {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-slate-600";

  const trendIcon =
    trend === "up"
      ? "↑"
      : trend === "down"
        ? "↓"
        : "→";

  return (
    <div className={`rounded-lg border bg-white p-6 shadow-sm ${bgColor}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-2xl opacity-20">
            {icon}
          </div>
        )}
      </div>
      {trend !== "neutral" && (
        <div className={`mt-3 text-xs font-medium ${trendColor}`}>
          {trendIcon} {trend === "up" ? "Increasing" : "Decreasing"}
        </div>
      )}
    </div>
  );
}
