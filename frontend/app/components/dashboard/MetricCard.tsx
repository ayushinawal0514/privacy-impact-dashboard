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
    <div className={`rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow ${bgColor}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
          <p className="text-4xl font-bold text-slate-900 mb-3">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-600 font-medium">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-4xl opacity-60 flex-shrink-0 ml-4">
            {icon}
          </div>
        )}
      </div>
      {trend !== "neutral" && (
        <div className={`mt-4 text-xs font-semibold ${trendColor} flex items-center gap-1`}>
          <span>{trendIcon}</span>
          <span>{trend === "up" ? "Increasing" : "Decreasing"}</span>
        </div>
      )}
    </div>
  );
}
