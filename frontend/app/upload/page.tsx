"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiMethods, setAuthToken } from "@/lib/api-client";

type UploadStatus = "idle" | "uploading" | "success" | "error";
type InputMode = "json" | "form";

type PatientForm = {
  patient_id: string;
  name: string;
  age: string;
  diagnosis: string;
  encrypted: "true" | "false";
  consent_obtained: "true" | "false";
  access_role: "doctor" | "nurse" | "admin" | "researcher" | "receptionist";
  retention_policy_days: string;
  audit_log_enabled: "true" | "false";
};

const emptyPatient: PatientForm = {
  patient_id: "",
  name: "",
  age: "",
  diagnosis: "",
  encrypted: "true",
  consent_obtained: "true",
  access_role: "doctor",
  retention_policy_days: "30",
  audit_log_enabled: "true",
};

function extractRecords(parsed: any): any[] {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.records)) return parsed.records;
  if (Array.isArray(parsed?.patients)) return parsed.patients;
  if (Array.isArray(parsed?.users)) return parsed.users;
  return [parsed];
}

function convertPatientFormToRecord(patient: PatientForm) {
  return {
    patient_id: patient.patient_id.trim(),
    name: patient.name.trim(),
    age: Number(patient.age),
    diagnosis: patient.diagnosis.trim(),
    encrypted: patient.encrypted === "true",
    consent_obtained: patient.consent_obtained === "true",
    access_role: patient.access_role,
    retention_policy_days: Number(patient.retention_policy_days),
    audit_log_enabled: patient.audit_log_enabled === "true",
  };
}

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [inputMode, setInputMode] = useState<InputMode>("json");
  const [fileName, setFileName] = useState("");
  const [dataType, setDataType] = useState("health");
  const [jsonData, setJsonData] = useState("");
  const [patients, setPatients] = useState<PatientForm[]>([{ ...emptyPatient }]);

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
    if (inputMode === "form") {
      return patients.map(convertPatientFormToRecord);
    }

    if (!parsedPreview) return [];
    return extractRecords(parsedPreview);
  }, [inputMode, patients, parsedPreview]);

  const isValidJson = jsonData.trim().length > 0 && parsedPreview !== null;

  const formPreviewJson = useMemo(() => {
    return JSON.stringify(
      {
        patients: patients.map(convertPatientFormToRecord),
      },
      null,
      2
    );
  }, [patients]);

  const handlePatientChange = (
    index: number,
    field: keyof PatientForm,
    value: string
  ) => {
    setPatients((prev) =>
      prev.map((patient, i) =>
        i === index ? { ...patient, [field]: value } : patient
      )
    );
  };

  const addPatient = () => {
    setPatients((prev) => [
      ...prev,
      {
        ...emptyPatient,
        patient_id: `P${String(prev.length + 1).padStart(3, "0")}`,
      },
    ]);
  };

  const removePatient = (index: number) => {
    setPatients((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetPage = () => {
    setFileName("");
    setDataType("health");
    setJsonData("");
    setPatients([{ ...emptyPatient }]);
    setStatus("idle");
    setMessage("");
    setRecordCount(null);
    setAnalysisSummary(null);
    setComplianceSummary(null);
  };

  const validateFormPatients = () => {
    for (let i = 0; i < patients.length; i++) {
      const p = patients[i];

      if (!p.patient_id.trim()) {
        return `Patient ${i + 1}: Patient ID is required.`;
      }

      if (!p.name.trim()) {
        return `Patient ${i + 1}: Patient name is required.`;
      }

      if (!p.age || Number.isNaN(Number(p.age)) || Number(p.age) <= 0) {
        return `Patient ${i + 1}: Valid age is required.`;
      }

      if (!p.diagnosis.trim()) {
        return `Patient ${i + 1}: Diagnosis is required.`;
      }

      if (
        !p.retention_policy_days ||
        Number.isNaN(Number(p.retention_policy_days)) ||
        Number(p.retention_policy_days) < 0
      ) {
        return `Patient ${i + 1}: Valid retention days value is required.`;
      }
    }

    return null;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInputMode("json");
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

  const downloadSampleJson = () => {
    const sample = {
      patients: [
        {
          patient_id: "P001",
          name: "John Doe",
          age: 35,
          diagnosis: "Hypertension",
          encrypted: true,
          consent_obtained: true,
          access_role: "doctor",
          last_accessed: "2026-04-20T10:30:00Z",
          retention_policy_days: 30,
          audit_log_enabled: true,
        },
        {
          patient_id: "P002",
          name: "Jane Smith",
          age: 28,
          diagnosis: "Diabetes",
          encrypted: false,
          consent_obtained: false,
          access_role: "receptionist",
          last_accessed: "2026-04-20T11:00:00Z",
          retention_policy_days: 365,
          audit_log_enabled: false,
        },
      ],
    };

    const blob = new Blob([JSON.stringify(sample, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-healthcare-dataset.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!accessToken) {
      setStatus("error");
      setMessage("Please sign in again.");
      return;
    }

    if (!fileName.trim()) {
      setStatus("error");
      setMessage("Please enter a dataset/file name.");
      return;
    }

    let records: any[] = [];

    if (inputMode === "json") {
      if (!isValidJson) {
        setStatus("error");
        setMessage("Please provide valid JSON.");
        return;
      }

      const parsed = JSON.parse(jsonData);
      records = extractRecords(parsed);
    } else {
      const validationError = validateFormPatients();

      if (validationError) {
        setStatus("error");
        setMessage(validationError);
        return;
      }

      records = patients.map(convertPatientFormToRecord);
    }

    if (!records.length) {
      setStatus("error");
      setMessage("No valid records found.");
      return;
    }

    try {
      setStatus("uploading");
      setMessage("");
      setAnalysisSummary(null);
      setComplianceSummary(null);

      setAuthToken(accessToken);

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Privacy Data Ingestion & Analysis
            </h1>
            <p className="text-sm text-gray-300">
              Upload healthcare data or enter patient records manually to detect privacy risks
            </p>
          </div>

          <Link
            href={session?.user?.role === "admin" ? "/dashboard/admin" : "/dashboard/user"}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm whitespace-nowrap"
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
                <label className="block text-sm text-gray-300 mb-2">
                  Dataset / File Name
                </label>
                <input
                  type="text"
                  placeholder="example: patient_records"
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

              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-sm text-gray-300 mb-3">Choose Input Method</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setInputMode("json")}
                    className={`px-4 py-2 rounded-lg transition ${
                      inputMode === "json"
                        ? "bg-cyan-600 text-white"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    JSON Upload / Paste
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputMode("form")}
                    className={`px-4 py-2 rounded-lg transition ${
                      inputMode === "form"
                        ? "bg-cyan-600 text-white"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    Manual Patient Entry
                  </button>

                  <button
                    type="button"
                    onClick={downloadSampleJson}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition text-white"
                  >
                    Download Sample JSON
                  </button>
                </div>
              </div>

              {inputMode === "json" ? (
                <>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Upload JSON File
                    </label>
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
                </>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">Manual Patient Records</h3>
                      <p className="text-sm text-gray-300">
                        Add one or more patients without writing JSON manually.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addPatient}
                      className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition text-sm font-medium"
                    >
                      + Add Patient
                    </button>
                  </div>

                  {patients.map((patient, index) => (
                    <div
                      key={index}
                      className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-semibold">Patient #{index + 1}</h4>

                        <button
                          type="button"
                          onClick={() => removePatient(index)}
                          disabled={patients.length === 1}
                          className="px-3 py-1 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          label="Patient ID"
                          placeholder="P001"
                          value={patient.patient_id}
                          onChange={(value) =>
                            handlePatientChange(index, "patient_id", value)
                          }
                        />

                        <FormInput
                          label="Patient Name"
                          placeholder="John Doe"
                          value={patient.name}
                          onChange={(value) =>
                            handlePatientChange(index, "name", value)
                          }
                        />

                        <FormInput
                          label="Age"
                          type="number"
                          placeholder="35"
                          value={patient.age}
                          onChange={(value) =>
                            handlePatientChange(index, "age", value)
                          }
                        />

                        <FormInput
                          label="Diagnosis"
                          placeholder="Hypertension"
                          value={patient.diagnosis}
                          onChange={(value) =>
                            handlePatientChange(index, "diagnosis", value)
                          }
                        />

                        <FormSelect
                          label="Encrypted"
                          value={patient.encrypted}
                          onChange={(value) =>
                            handlePatientChange(index, "encrypted", value)
                          }
                          options={[
                            { label: "Yes - Encrypted", value: "true" },
                            { label: "No - Not Encrypted", value: "false" },
                          ]}
                        />

                        <FormSelect
                          label="Consent Obtained"
                          value={patient.consent_obtained}
                          onChange={(value) =>
                            handlePatientChange(index, "consent_obtained", value)
                          }
                          options={[
                            { label: "Yes - Consent Given", value: "true" },
                            { label: "No - Consent Missing", value: "false" },
                          ]}
                        />

                        <FormSelect
                          label="Access Role"
                          value={patient.access_role}
                          onChange={(value) =>
                            handlePatientChange(index, "access_role", value)
                          }
                          options={[
                            { label: "Doctor", value: "doctor" },
                            { label: "Nurse", value: "nurse" },
                            { label: "Admin", value: "admin" },
                            { label: "Researcher", value: "researcher" },
                            { label: "Receptionist", value: "receptionist" },
                          ]}
                        />

                        <FormInput
                          label="Retention Policy Days"
                          type="number"
                          placeholder="30"
                          value={patient.retention_policy_days}
                          onChange={(value) =>
                            handlePatientChange(
                              index,
                              "retention_policy_days",
                              value
                            )
                          }
                        />

                        <FormSelect
                          label="Audit Log Enabled"
                          value={patient.audit_log_enabled}
                          onChange={(value) =>
                            handlePatientChange(index, "audit_log_enabled", value)
                          }
                          options={[
                            { label: "Yes - Enabled", value: "true" },
                            { label: "No - Disabled", value: "false" },
                          ]}
                        />
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Generated JSON Preview
                    </label>
                    <textarea
                      value={formPreviewJson}
                      readOnly
                      className="w-full min-h-[180px] rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-gray-300 outline-none resize-y text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-gray-300">
                <p className="font-medium text-white mb-2">System will analyze data for:</p>
                <ul className="space-y-1">
                  <li>• Encryption and sensitive healthcare data protection</li>
                  <li>• Patient consent availability</li>
                  <li>• Valid access roles</li>
                  <li>• Audit logging status</li>
                  <li>• Retention policy compliance</li>
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
                  onClick={resetPage}
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
                  <p className="text-gray-400 mb-1">Input Method</p>
                  <p className="text-white">
                    {inputMode === "json" ? "JSON Upload / Paste" : "Manual Form Entry"}
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <p className="text-gray-400 mb-1">Data Validation</p>
                  <p
                    className={
                      inputMode === "form"
                        ? "text-emerald-300"
                        : isValidJson
                        ? "text-emerald-300"
                        : "text-yellow-300"
                    }
                  >
                    {inputMode === "form"
                      ? "Form data will be converted to JSON"
                      : jsonData.trim()
                      ? isValidJson
                        ? "Valid JSON"
                        : "Invalid JSON"
                      : "No data yet"}
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
                    : "Ready to analyze healthcare records."}
                </div>
              )}
            </section>

            <section className="bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Accepted Format</h3>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-6">
{`{
  "patients": [
    {
      "patient_id": "P001",
      "name": "John Doe",
      "age": 35,
      "diagnosis": "Hypertension",
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

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 outline-none focus:border-cyan-400"
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: any) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/20 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}