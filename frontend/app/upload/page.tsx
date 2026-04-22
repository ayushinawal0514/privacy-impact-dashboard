"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiMethods, setAuthToken } from "@/lib/api-client";

type UploadStatus = "idle" | "uploading" | "success" | "error";

function extractRecords(parsed: any): any[] {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.records)) return parsed.records;
  if (Array.isArray(parsed?.patients)) return parsed.patients;
  if (Array.isArray(parsed?.users)) return parsed.users;
  return [parsed];
}

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [fileName, setFileName] = useState("");
  const [dataType, setDataType] = useState("health");
  const [jsonData, setJsonData] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [recordCount, setRecordCount] = useState<number | null>(null);

  const [analysisSummary, setAnalysisSummary] = useState<{
    totalRecords: number;
    totalRisks: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  } | null>(null);

  const [complianceSummary, setComplianceSummary] = useState<{
    hipaaScore: number;
    dpdpaScore: number;
    overallScore: number;
  } | null>(null);

  const accessToken = (session as any)?.accessToken;

  const parsedPreview = useMemo(() => {
    try {
      if (!jsonData.trim()) return null;
      return JSON.parse(jsonData);
    } catch {
      return null;
    }
  }, [jsonData]);

  const extractedPreviewRecords = useMemo(() => {
    if (!parsedPreview) return [];
    return extractRecords(parsedPreview);
  }, [parsedPreview]);

  const isValidJson = jsonData.trim().length > 0 && parsedPreview !== null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const text = await file.text();
      setJsonData(text);
      setStatus("idle");
      setMessage("");
      setAnalysisSummary(null);
      setComplianceSummary(null);
    } catch {
      setStatus("error");
      setMessage("Failed to read file.");
    }
  };

  const handleUpload = async () => {
    if (!accessToken) {
      setStatus("error");
      setMessage("Please sign in again.");
      return;
    }

    if (!fileName.trim()) {
      setStatus("error");
      setMessage("Please enter a file name.");
      return;
    }

    if (!isValidJson) {
      setStatus("error");
      setMessage("Please provide valid JSON.");
      return;
    }

    try {
      setStatus("uploading");
      setMessage("");
      setAnalysisSummary(null);
      setComplianceSummary(null);

      setAuthToken(accessToken);

      const parsed = JSON.parse(jsonData);
      const records = extractRecords(parsed);

      const res = await apiMethods.uploadData(fileName, dataType, records);

      setRecordCount(records.length);
      setStatus("success");
      setMessage(res.data?.message || "Dataset analyzed successfully.");

      setAnalysisSummary(res.data?.summary || null);
      setComplianceSummary(
        res.data?.compliance
          ? {
              hipaaScore: res.data.compliance.hipaaScore ?? 0,
              dpdpaScore: res.data.compliance.dpdpaScore ?? 0,
              overallScore: res.data.compliance.overallScore ?? 0,
            }
          : null
      );

      setTimeout(() => {
        router.push(
          session?.user?.role === "admin" ? "/dashboard/admin" : "/dashboard/user"
        );
      }, 1800);
    } catch (err: any) {
      setStatus("error");
      setMessage(
        err?.response?.data?.message || err?.message || "Upload failed."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 text-white">
      <header className="bg-black/30 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Privacy Data Ingestion & Analysis</h1>
            <p className="text-sm text-gray-300">
              Upload healthcare data to automatically detect privacy risks and evaluate compliance
            </p>
          </div>

          <Link
            href={session?.user?.role === "admin" ? "/dashboard/admin" : "/dashboard/user"}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-5">Dataset Details</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-300 mb-2">File Name</label>
                <input
                  type="text"
                  placeholder="example: patient_records.json"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Data Type</label>
                <select
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option value="health">health</option>
                  <option value="healthcare_access_logs">healthcare_access_logs</option>
                  <option value="patient_records">patient_records</option>
                  <option value="billing">billing</option>
                  <option value="prescriptions">prescriptions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Upload JSON File</label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-white hover:file:bg-cyan-700"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Healthcare Dataset (JSON Input)
                </label>
                <textarea
                  placeholder='Example: { "patients": [{ "patient_id": "P001", "encrypted": false }] }'
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  className="w-full min-h-[260px] rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 outline-none focus:border-cyan-400 resize-y"
                />
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-gray-300">
                <p className="font-medium text-white mb-2">System will analyze data for:</p>
                <ul className="space-y-1">
                  <li>• Privacy risks</li>
                  <li>• Compliance violations</li>
                  <li>• Audit and access issues</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleUpload}
                  disabled={status === "uploading"}
                  className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 transition font-medium"
                >
                  {status === "uploading" ? "Analyzing..." : "Analyze Dataset"}
                </button>

                <button
                  onClick={() => {
                    setFileName("");
                    setDataType("health");
                    setJsonData("");
                    setStatus("idle");
                    setMessage("");
                    setRecordCount(null);
                    setAnalysisSummary(null);
                    setComplianceSummary(null);
                  }}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>

              <div className="space-y-3 text-sm">
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-gray-400 mb-1">Data Validation</p>
                  <p className={isValidJson ? "text-emerald-300" : "text-yellow-300"}>
                    {jsonData.trim() ? (isValidJson ? "Valid JSON" : "Invalid JSON") : "No data yet"}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-gray-400 mb-1">Total Records</p>
                  <p className="text-white">{extractedPreviewRecords.length}</p>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-gray-400 mb-1">Dataset Category</p>
                  <p className="text-white">{dataType}</p>
                </div>
              </div>
            </section>

            <section className="bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Upload Status</h3>

              {status === "success" && (
                <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/30 p-4 text-emerald-200 text-sm space-y-2">
                  <p className="font-medium">Analysis Completed</p>
                  <p>{message}</p>
                  {recordCount !== null && <p>Records uploaded: {recordCount}</p>}

                  {analysisSummary && (
                    <div className="pt-2 border-t border-emerald-400/20">
                      <p>Total Risks: {analysisSummary.totalRisks}</p>
                      <p>Critical: {analysisSummary.critical}</p>
                      <p>High: {analysisSummary.high}</p>
                    </div>
                  )}

                  {complianceSummary && (
                    <div className="pt-2 border-t border-emerald-400/20">
                      <p>HIPAA Score: {complianceSummary.hipaaScore}%</p>
                      <p>DPDPA Score: {complianceSummary.dpdpaScore}%</p>
                      <p>Overall Score: {complianceSummary.overallScore}%</p>
                    </div>
                  )}
                </div>
              )}

              {status === "error" && (
                <div className="rounded-xl bg-red-500/15 border border-red-400/30 p-4 text-red-200 text-sm">
                  {message}
                </div>
              )}

              {(status === "idle" || status === "uploading") && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-gray-300">
                  {status === "uploading"
                    ? "Sending data to backend and running privacy analysis..."
                    : "Ready to analyze a healthcare JSON dataset."}
                </div>
              )}
            </section>

            <section className="bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">JSON Format</h3>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-6">
{`{
  "patients": [
    {
      "patient_id": "P001",
      "name": "John Doe",
      "encrypted": true,
      "consent_obtained": true,
      "access_role": "doctor",
      "retention_policy_days": 30,
      "audit_log_enabled": true
    }
  ]
}`}
              </pre>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}