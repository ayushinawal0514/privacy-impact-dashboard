module.exports = [
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/Project/capstone_project/frontend/lib/api-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiEndpoints",
    ()=>apiEndpoints,
    "apiMethods",
    ()=>apiMethods,
    "default",
    ()=>__TURBOPACK__default__export__,
    "getApiClient",
    ()=>getApiClient,
    "setAuthToken",
    ()=>setAuthToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
;
const API_URL = ("TURBOPACK compile-time value", "http://localhost:3001/api") || 'http://localhost:3001/api';
let apiClient = null;
const getApiClient = (token)=>{
    if (!apiClient) {
        apiClient = __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // Add token if provided
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        // Error handling
        apiClient.interceptors.response.use((response)=>response, (error)=>{
            if (error.response?.status === 401) {
                // Handle unauthorized - redirect to login
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
            }
            return Promise.reject(error);
        });
    }
    return apiClient;
};
const setAuthToken = (token)=>{
    const client = getApiClient();
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};
const apiEndpoints = {
    // Auth
    auth: {
        register: '/auth/register',
        login: '/auth/login'
    },
    // Risks
    risks: {
        list: '/risks',
        get: (id)=>`/risks/${id}`,
        create: '/risks',
        update: (id)=>`/risks/${id}`,
        delete: (id)=>`/risks/${id}`
    },
    // Access Logs
    accessLogs: {
        list: '/access-logs',
        get: (id)=>`/access-logs/${id}`
    },
    // Upload & Analysis
    upload: {
        uploadData: '/upload/upload',
        getUploads: '/upload/uploads',
        getUploadDetails: (id)=>`/upload/uploads/${id}`,
        analyze: (uploadId)=>`/upload/analyze/${uploadId}`,
        getResults: (analysisId)=>`/upload/results/${analysisId}`
    },
    // Reports
    reports: {
        generate: '/report/generate',
        list: '/report',
        get: (id)=>`/report/${id}`,
        delete: (id)=>`/report/${id}`
    },
    // Compliance
    compliance: {
        status: '/compliance'
    },
    // Dashboard
    dashboard: {
        metrics: '/dashboard/metrics',
        summary: '/dashboard/summary'
    },
    // Health
    health: '/health'
};
const apiMethods = {
    // Upload data
    uploadData: async (fileName, dataType, records, metadata)=>{
        const client = getApiClient();
        return client.post(apiEndpoints.upload.uploadData, {
            fileName,
            dataType,
            records,
            metadata
        });
    },
    // Get uploads
    getUploads: async (skip = 0, limit = 20)=>{
        const client = getApiClient();
        return client.get(apiEndpoints.upload.getUploads, {
            params: {
                skip,
                limit
            }
        });
    },
    // Get upload details
    getUploadDetails: async (uploadId)=>{
        const client = getApiClient();
        return client.get(apiEndpoints.upload.getUploadDetails(uploadId));
    },
    // Analyze data
    analyzeData: async (uploadId, rules, options)=>{
        const client = getApiClient();
        return client.post(apiEndpoints.upload.analyze(uploadId), {
            rules,
            options
        });
    },
    // Get analysis results
    getAnalysisResults: async (analysisId)=>{
        const client = getApiClient();
        return client.get(apiEndpoints.upload.getResults(analysisId));
    },
    // Generate report
    generateReport: async (reportName, reportType, startDate, endDate)=>{
        const client = getApiClient();
        return client.post(apiEndpoints.reports.generate, {
            reportName,
            reportType,
            startDate,
            endDate
        });
    },
    // Get reports
    getReports: async (skip = 0, limit = 20, type)=>{
        const client = getApiClient();
        return client.get(apiEndpoints.reports.list, {
            params: {
                skip,
                limit,
                type
            }
        });
    },
    // Get report details
    getReportDetails: async (reportId)=>{
        const client = getApiClient();
        return client.get(apiEndpoints.reports.get(reportId));
    },
    // Get risks
    getRisks: async ()=>{
        const client = getApiClient();
        return client.get(apiEndpoints.risks.list);
    },
    // Get compliance status
    getComplianceStatus: async ()=>{
        const client = getApiClient();
        return client.get(apiEndpoints.compliance.status);
    },
    // Get dashboard metrics
    getDashboardMetrics: async ()=>{
        const client = getApiClient();
        return client.get(apiEndpoints.dashboard.metrics);
    },
    // Get dashboard summary
    getDashboardSummary: async ()=>{
        const client = getApiClient();
        return client.get(apiEndpoints.dashboard.summary);
    },
    // Get access logs
    getAccessLogs: async (skip = 0, limit = 100, filters)=>{
        const client = getApiClient();
        return client.get(apiEndpoints.accessLogs.list, {
            params: {
                skip,
                limit,
                ...filters
            }
        });
    },
    // Health check
    healthCheck: async ()=>{
        const client = getApiClient();
        return client.get(apiEndpoints.health);
    }
};
const __TURBOPACK__default__export__ = getApiClient;
}),
"[project]/Project/capstone_project/frontend/app/dashboard/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next-auth/react/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/lib/api-client.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const API_BASE = ("TURBOPACK compile-time value", "http://localhost:3001/api") || "http://localhost:3001/api";
function DashboardPage() {
    const { data: session, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const accessToken = session?.accessToken || (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [
        status,
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchDashboardData = async ()=>{
            try {
                setLoading(true);
                setError(null);
                if (!accessToken) {
                    setError("No authentication token found. Please sign in again.");
                    setLoading(false);
                    return;
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setAuthToken"])(accessToken);
                const uploadsRes = await fetch(`${API_BASE}/upload/uploads`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                });
                const uploadsJson = await uploadsRes.json();
                if (!uploadsRes.ok || !uploadsJson.success) {
                    throw new Error(uploadsJson.message || "Failed to fetch uploads");
                }
                const uploads = uploadsJson.data || [];
                const latestCompleted = uploads.find((u)=>u.status === "completed" && u.analysisId);
                if (!latestCompleted?.analysisId) {
                    setData({
                        risks: {
                            critical: 0,
                            high: 0,
                            medium: 0,
                            low: 0
                        },
                        complianceScore: 0,
                        hipaaCompliance: 0,
                        dpdpaCompliance: 0,
                        pendingAlerts: 0,
                        recommendations: [],
                        summary: "No completed analysis found yet. Upload and analyze data to see dashboard insights.",
                        latestUpload: null,
                        failedRules: [],
                        anomalies: []
                    });
                    setLoading(false);
                    return;
                }
                const resultRes = await fetch(`${API_BASE}/upload/results/${latestCompleted.analysisId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                });
                const resultJson = await resultRes.json();
                if (!resultRes.ok || !resultJson.success) {
                    throw new Error(resultJson.message || "Failed to fetch analysis result");
                }
                const analysis = resultJson.data;
                const failedRules = (analysis.ruleResults || []).filter((r)=>r.passed === false);
                setData({
                    risks: analysis.riskSummary || {
                        critical: 0,
                        high: 0,
                        medium: 0,
                        low: 0
                    },
                    complianceScore: analysis.complianceScore || 0,
                    hipaaCompliance: analysis.hipaaCompliance || 0,
                    dpdpaCompliance: analysis.dpdpaCompliance || 0,
                    pendingAlerts: (analysis.riskSummary?.critical || 0) + (analysis.riskSummary?.high || 0),
                    recommendations: analysis.recommendations || [],
                    summary: analysis.summary || "No summary available.",
                    latestUpload: latestCompleted,
                    failedRules,
                    anomalies: analysis.anomalies || []
                });
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError(err.message || "Failed to load dashboard data.");
            } finally{
                setLoading(false);
            }
        };
        if (status === "authenticated") {
            fetchDashboardData();
        }
    }, [
        status,
        accessToken
    ]);
    const complianceStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!data) return "Unknown";
        if (data.complianceScore >= 80) return "✓ Strong";
        if (data.complianceScore >= 60) return "⚠ Moderate";
        return "✗ Weak";
    }, [
        data
    ]);
    const riskLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!data) return "Low";
        if (data.risks.critical > 0) return "Critical";
        if (data.risks.high > 0) return "High";
        return "Low";
    }, [
        data
    ]);
    if (status === "loading" || loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                        lineNumber: 196,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-300",
                        children: "Loading dashboard..."
                    }, void 0, false, {
                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                        lineNumber: 197,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                lineNumber: 195,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
            lineNumber: 194,
            columnNumber: 7
        }, this);
    }
    if (!session) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "bg-black/30 backdrop-blur border-b border-white/10 sticky top-0 z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-2xl font-bold text-white",
                                        children: "Healthcare Privacy Dashboard"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 211,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-400",
                                        children: "Real-time compliance & risk monitoring"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 212,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                lineNumber: 210,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-right",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium text-white truncate",
                                                children: session.user?.name
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 216,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-400 truncate",
                                                children: session.user?.email
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 217,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 215,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signOut"])({
                                                redirect: true,
                                                callbackUrl: "/"
                                            }),
                                        className: "px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition",
                                        children: "Sign Out"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 219,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                lineNumber: 214,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                        lineNumber: 209,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                    lineNumber: 208,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                lineNumber: 207,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6",
                children: [
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-red-500/15 border border-red-400/30 rounded-lg p-4 text-red-100",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                        lineNumber: 232,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl font-bold text-white mb-4",
                                children: "Key Metrics"
                            }, void 0, false, {
                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                lineNumber: 238,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-h-[140px] bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 backdrop-blur border border-emerald-500/30 rounded-lg p-6 shadow-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between items-start mb-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-gray-300 font-medium",
                                                        children: "Compliance Score"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 242,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-bold px-2 py-1 bg-emerald-500/30 text-emerald-200 rounded",
                                                        children: complianceStatus
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 243,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 241,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-4xl font-bold text-emerald-400 mb-2",
                                                children: [
                                                    data?.complianceScore || 0,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 247,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-full bg-white/10 rounded-full h-2 overflow-hidden",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-emerald-500 h-full transition-all duration-500",
                                                    style: {
                                                        width: `${data?.complianceScore || 0}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                    lineNumber: 249,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 248,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 240,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-h-[140px] bg-gradient-to-br from-red-500/20 to-red-500/10 backdrop-blur border border-red-500/30 rounded-lg p-6 shadow-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between items-start mb-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-gray-300 font-medium",
                                                        children: "Active Risks"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 258,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `text-xs font-bold px-2 py-1 rounded ${riskLevel === "Critical" ? "bg-red-500/30 text-red-200" : riskLevel === "High" ? "bg-orange-500/30 text-orange-200" : "bg-yellow-500/30 text-yellow-200"}`,
                                                        children: riskLevel
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 259,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 257,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-4xl font-bold text-red-400 mb-2",
                                                children: (data?.risks.critical || 0) + (data?.risks.high || 0) + (data?.risks.medium || 0)
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 271,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-gray-400 space-y-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            "Critical: ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-red-400 font-bold",
                                                                children: data?.risks.critical || 0
                                                            }, void 0, false, {
                                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                                lineNumber: 276,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 275,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            "High: ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-orange-400 font-bold",
                                                                children: data?.risks.high || 0
                                                            }, void 0, false, {
                                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                                lineNumber: 279,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 278,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 274,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 256,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-h-[140px] bg-gradient-to-br from-blue-500/20 to-blue-500/10 backdrop-blur border border-blue-500/30 rounded-lg p-6 shadow-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-gray-300 font-medium mb-4",
                                                children: "HIPAA Compliance"
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 285,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-4xl font-bold text-blue-400 mb-2",
                                                children: [
                                                    data?.hipaaCompliance || 0,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 286,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-full bg-white/10 rounded-full h-2 overflow-hidden",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-blue-500 h-full transition-all duration-500",
                                                    style: {
                                                        width: `${data?.hipaaCompliance || 0}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                    lineNumber: 288,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 287,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 284,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-h-[140px] bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 backdrop-blur border border-indigo-500/30 rounded-lg p-6 shadow-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-gray-300 font-medium mb-4",
                                                children: "DPDP Compliance"
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 296,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-4xl font-bold text-indigo-400 mb-2",
                                                children: [
                                                    data?.dpdpaCompliance || 0,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 297,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-full bg-white/10 rounded-full h-2 overflow-hidden",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "bg-indigo-500 h-full transition-all duration-500",
                                                    style: {
                                                        width: `${data?.dpdpaCompliance || 0}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                    lineNumber: 299,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 298,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 295,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                lineNumber: 239,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                        lineNumber: 237,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "lg:col-span-2 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-bold text-white mb-4",
                                        children: "Quick Actions"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 310,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/compliance",
                                                className: "p-4 bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 border border-cyan-500/30 rounded-lg hover:from-cyan-500/30 hover:to-cyan-500/20 transition text-cyan-200 font-medium flex items-center justify-between group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "View Compliance"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 313,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "group-hover:translate-x-1 transition",
                                                        children: "→"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 314,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 312,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/compliance",
                                                className: "p-4 bg-gradient-to-r from-purple-500/20 to-purple-500/10 border border-purple-500/30 rounded-lg hover:from-purple-500/30 hover:to-purple-500/20 transition text-purple-200 font-medium flex items-center justify-between group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Upload Data"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 317,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "group-hover:translate-x-1 transition",
                                                        children: "→"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 318,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 316,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/compliance",
                                                className: "p-4 bg-gradient-to-r from-pink-500/20 to-pink-500/10 border border-pink-500/30 rounded-lg hover:from-pink-500/30 hover:to-pink-500/20 transition text-pink-200 font-medium flex items-center justify-between group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Generate Report"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 321,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "group-hover:translate-x-1 transition",
                                                        children: "→"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 322,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 320,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/compliance",
                                                className: "p-4 bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/30 rounded-lg hover:from-green-500/30 hover:to-green-500/20 transition text-green-200 font-medium flex items-center justify-between group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "View Risks"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 325,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "group-hover:translate-x-1 transition",
                                                        children: "→"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 326,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 324,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 311,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                lineNumber: 309,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-bold text-white mb-4",
                                        children: "Latest Analysis"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 332,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3 text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-3 bg-white/10 rounded-lg border border-white/20",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-400 mb-1",
                                                        children: "File"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 335,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-white font-medium break-all",
                                                        children: data?.latestUpload?.fileName || "N/A"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 336,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 334,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-3 bg-white/10 rounded-lg border border-white/20",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-400 mb-1",
                                                        children: "Type"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 339,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-white",
                                                        children: data?.latestUpload?.dataType || "N/A"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 340,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 338,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-3 bg-white/10 rounded-lg border border-white/20",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-400 mb-1",
                                                        children: "Status"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 343,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-green-400 font-semibold",
                                                        children: data?.latestUpload?.status || "N/A"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 344,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 342,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-3 bg-white/10 rounded-lg border border-white/20",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-400 mb-1",
                                                        children: "Pending Alerts"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 347,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-orange-300 font-semibold",
                                                        children: data?.pendingAlerts || 0
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 348,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 346,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 333,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                lineNumber: 331,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                        lineNumber: 308,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-bold text-white mb-4",
                                children: "Risk Summary"
                            }, void 0, false, {
                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                lineNumber: 355,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "overflow-x-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "w-full text-sm text-gray-300",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "border-b border-white/20",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left py-3 px-4 font-semibold text-white",
                                                        children: "Severity"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 360,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-center py-3 px-4 font-semibold text-white",
                                                        children: "Count"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 361,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-right py-3 px-4 font-semibold text-white",
                                                        children: "Status"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 362,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 359,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                            lineNumber: 358,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RiskRow, {
                                                    label: "Critical",
                                                    color: "bg-red-500",
                                                    textColor: "text-red-400",
                                                    value: data?.risks.critical || 0,
                                                    badge: "Urgent"
                                                }, void 0, false, {
                                                    fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                    lineNumber: 366,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RiskRow, {
                                                    label: "High",
                                                    color: "bg-orange-500",
                                                    textColor: "text-orange-400",
                                                    value: data?.risks.high || 0,
                                                    badge: "Important"
                                                }, void 0, false, {
                                                    fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                    lineNumber: 367,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RiskRow, {
                                                    label: "Medium",
                                                    color: "bg-yellow-500",
                                                    textColor: "text-yellow-400",
                                                    value: data?.risks.medium || 0,
                                                    badge: "Monitor"
                                                }, void 0, false, {
                                                    fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                    lineNumber: 368,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(RiskRow, {
                                                    label: "Low",
                                                    color: "bg-green-500",
                                                    textColor: "text-green-400",
                                                    value: data?.risks.low || 0,
                                                    badge: "Info"
                                                }, void 0, false, {
                                                    fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                    lineNumber: 369,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                            lineNumber: 365,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                    lineNumber: 357,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                lineNumber: 356,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                        lineNumber: 354,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-bold text-white mb-4",
                                        children: "Recommendations"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 377,
                                        columnNumber: 13
                                    }, this),
                                    data?.recommendations?.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "space-y-3",
                                        children: data.recommendations.map((rec, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "text-gray-200 text-sm leading-relaxed bg-white/5 border border-white/10 rounded-lg p-3",
                                                children: rec
                                            }, index, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 381,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 379,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-300",
                                        children: "No recommendations available."
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 387,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                lineNumber: 376,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gradient-to-br from-white/15 to-white/5 backdrop-blur border border-white/30 rounded-lg p-6 shadow-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-bold text-white mb-4",
                                        children: "Analysis Summary"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 392,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-200 leading-relaxed",
                                        children: data?.summary || "No summary available."
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 393,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "text-lg font-semibold text-white mb-3",
                                                children: "Failed Rules"
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 396,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2 max-h-64 overflow-y-auto pr-1",
                                                children: data?.failedRules?.length ? data.failedRules.map((rule)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-white/5 border border-white/10 rounded-lg p-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex justify-between gap-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-white font-medium text-sm",
                                                                        children: rule.ruleName
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                                        lineNumber: 402,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs px-2 py-1 rounded bg-red-500/20 text-red-200 capitalize whitespace-nowrap",
                                                                        children: rule.severity
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                                        lineNumber: 403,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                                lineNumber: 401,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-gray-300 text-xs mt-2",
                                                                children: rule.details
                                                            }, void 0, false, {
                                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                                lineNumber: 407,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, rule.ruleId, true, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                        lineNumber: 400,
                                                        columnNumber: 21
                                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-300 text-sm",
                                                    children: "No failed rules found."
                                                }, void 0, false, {
                                                    fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                    lineNumber: 411,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                                lineNumber: 397,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                        lineNumber: 395,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                                lineNumber: 391,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                        lineNumber: 375,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                lineNumber: 230,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
        lineNumber: 206,
        columnNumber: 5
    }, this);
}
function RiskRow({ label, color, textColor, value, badge }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        className: "border-b border-white/10 hover:bg-white/5 transition",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4 flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `w-2 h-2 rounded-full ${color}`
                    }, void 0, false, {
                        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                        lineNumber: 438,
                        columnNumber: 9
                    }, this),
                    label
                ]
            }, void 0, true, {
                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                lineNumber: 437,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: `py-3 px-4 text-center font-bold ${textColor}`,
                children: value
            }, void 0, false, {
                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                lineNumber: 441,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "py-3 px-4 text-right",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs px-2 py-1 bg-white/10 text-gray-200 rounded-full",
                    children: badge
                }, void 0, false, {
                    fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                    lineNumber: 443,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
                lineNumber: 442,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Project/capstone_project/frontend/app/dashboard/page.tsx",
        lineNumber: 436,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6eef1637._.js.map