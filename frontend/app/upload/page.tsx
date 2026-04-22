"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiMethods, setAuthToken } from "@/lib/api-client";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [fileName, setFileName] = useState("");
  const [dataType, setDataType] = useState("health");
  const [jsonData, setJsonData] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [recordCount, setRecordCount] = useState<number | null>(null);

  const accessToken = (session as any)?.accessToken;

  const parsedPreview = useMemo(() => {
    try {
      if (!jsonData.trim()) return null;
      return JSON.parse(jsonData);
    } catch {
      return null;
    }
  }, [jsonData]);

  const isValidJson = jsonData.trim().length > 0 && parsedPreview !== null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const text = await file.text();
      setJsonData(text);
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

      setAuthToken(accessToken);

      const parsed = JSON.parse(jsonData);
      const records = Array.isArray(parsed) ? parsed : [parsed];

      const res = await apiMethods.uploadData(fileName, dataType, records);

      setRecordCount(records.length);
      setStatus("success");
      setMessage(res.data?.message || "Upload successful.");

      setTimeout(() => {
        router.push(
          session?.user?.role === "admin" ? "/dashboard/admin" : "/dashboard/user"
        );
      }, 1200);
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
            <h1 className="text-2xl font-bold">Upload Dataset</h1>
            <p className="text-sm text-gray-300">
              Add JSON healthcare records for privacy analysis
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
                <label className="block text-sm text-gray-300 mb-2">Paste JSON Data</label>
                <textarea
                  placeholder='Example: [{ "email": "patient@test.com", "encrypted": false }]'
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  className="w-full min-h-[260px] rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 outline-none focus:border-cyan-400 resize-y"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleUpload}
                  disabled={status === "uploading"}
                  className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 transition font-medium"
                >
                  {status === "uploading" ? "Uploading..." : "Upload Dataset"}
                </button>

                <button
                  onClick={() => {
                    setFileName("");
                    setDataType("health");
                    setJsonData("");
                    setStatus("idle");
                    setMessage("");
                    setRecordCount(null);
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
                  <p className="text-gray-400 mb-1">JSON Status</p>
                  <p className={isValidJson ? "text-emerald-300" : "text-yellow-300"}>
                    {jsonData.trim() ? (isValidJson ? "Valid JSON" : "Invalid JSON") : "No data yet"}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-gray-400 mb-1">Records</p>
                  <p className="text-white">
                    {parsedPreview
                      ? Array.isArray(parsedPreview)
                        ? parsedPreview.length
                        : 1
                      : 0}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-gray-400 mb-1">Selected Type</p>
                  <p className="text-white">{dataType}</p>
                </div>
              </div>
            </section>

            <section className="bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Upload Status</h3>

              {status === "success" && (
                <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/30 p-4 text-emerald-200 text-sm">
                  <p className="font-medium mb-1">Upload successful</p>
                  <p>{message}</p>
                  {recordCount !== null && <p className="mt-1">Records uploaded: {recordCount}</p>}
                </div>
              )}

              {status === "error" && (
                <div className="rounded-xl bg-red-500/15 border border-red-400/30 p-4 text-red-200 text-sm">
                  {message}
                </div>
              )}

              {status === "idle" || status === "uploading" ? (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-gray-300">
                  {status === "uploading"
                    ? "Sending data to backend and starting analysis..."
                    : "Ready to upload a JSON dataset."}
                </div>
              ) : null}
            </section>

            <section className="bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">JSON Format</h3>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-6">
{`[
  {
    "userId": "u1",
    "email": "patient@test.com",
    "role": "doctor",
    "encrypted": false,
    "diagnosis": "Diabetes"
  }
]`}
              </pre>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}