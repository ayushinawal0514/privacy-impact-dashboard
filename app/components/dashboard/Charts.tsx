import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface RiskChartProps {
  data?: any[];
  loading?: boolean;
}

export function RiskDistributionChart({ data, loading }: RiskChartProps) {
  const [chartData, setChartData] = useState([
    { severity: "Critical", count: 0 },
    { severity: "High", count: 0 },
    { severity: "Medium", count: 0 },
    { severity: "Low", count: 0 },
  ]);

  useEffect(() => {
    if (data) {
      const distribution = {
        critical: data.filter((r: any) => r.severity === "critical").length,
        high: data.filter((r: any) => r.severity === "high").length,
        medium: data.filter((r: any) => r.severity === "medium").length,
        low: data.filter((r: any) => r.severity === "low").length,
      };

      setChartData([
        { severity: "Critical", count: distribution.critical },
        { severity: "High", count: distribution.high },
        { severity: "Medium", count: distribution.medium },
        { severity: "Low", count: distribution.low },
      ]);
    }
  }, [data]);

  if (loading) {
    return <div className="h-64 bg-slate-100 rounded animate-pulse" />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="severity" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ComplianceScoreChart({ score, trend }: { score: number; trend?: any[] }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444"}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">{score}%</p>
            <p className="text-xs text-slate-600">Score</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">
        {score >= 80 ? "Compliant" : score >= 60 ? "Needs Review" : "Non-Compliant"}
      </p>
    </div>
  );
}

export function AnomalyTimelineChart({ data }: { data: any[] }) {
  const timelineData = data
    .slice(0, 24) // Last 24 entries
    .map((log: any, i: number) => ({
      time: new Date(log.timestamp).getHours() + ":00",
      anomalies: log.anomalyDetected ? 1 : 0,
    }))
    .reduce((acc: any[], item) => {
      const existing = acc.find((a) => a.time === item.time);
      if (existing) {
        existing.anomalies += item.anomalies;
      } else {
        acc.push(item);
      }
      return acc;
    }, []);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={timelineData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="anomalies" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
