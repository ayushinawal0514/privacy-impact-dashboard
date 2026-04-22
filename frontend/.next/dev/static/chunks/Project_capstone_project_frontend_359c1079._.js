(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Project/capstone_project/frontend/lib/api-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const API_URL = ("TURBOPACK compile-time value", "http://localhost:3001/api") || 'http://localhost:3001/api';
let apiClient = null;
const getApiClient = ()=>{
    if (!apiClient) {
        apiClient = __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        apiClient.interceptors.response.use({
            "getApiClient.use": (response)=>response
        }["getApiClient.use"], {
            "getApiClient.use": (error)=>{
                if (error.response?.status === 401 && ("TURBOPACK compile-time value", "object") !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        }["getApiClient.use"]);
    }
    return apiClient;
};
const setAuthToken = (token)=>{
    const client = getApiClient();
    if (token) {
        client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete client.defaults.headers.common['Authorization'];
    }
};
const apiEndpoints = {
    auth: {
        register: '/auth/register',
        login: '/auth/login',
        me: '/auth/me'
    },
    risks: {
        list: '/risks',
        get: (id)=>`/risks/${id}`,
        create: '/risks',
        update: (id)=>`/risks/${id}`,
        delete: (id)=>`/risks/${id}`
    },
    accessLogs: {
        list: '/access-logs',
        get: (id)=>`/access-logs/${id}`
    },
    upload: {
        uploadData: '/upload',
        getUploads: '/upload/uploads',
        getUploadDetails: (id)=>`/upload/uploads/${id}`,
        getResults: (analysisId)=>`/upload/results/${analysisId}`
    },
    reports: {
        generate: '/report/generate',
        list: '/report',
        get: (id)=>`/report/${id}`,
        delete: (id)=>`/report/${id}`
    },
    compliance: {
        status: '/compliance'
    },
    dashboard: {
        metrics: '/dashboard/metrics',
        summary: '/dashboard/summary',
        activity: '/dashboard/activity',
        timeline: '/dashboard/compliance-timeline'
    },
    health: '/health'
};
const apiMethods = {
    uploadData: async (fileName, dataType, records, metadata)=>{
        const client = getApiClient();
        return client.post(apiEndpoints.upload.uploadData, {
            fileName,
            dataType,
            records,
            metadata
        });
    },
    getUploads: async (skip = 0, limit = 20)=>{
        const client = getApiClient();
        return client.get(apiEndpoints.upload.getUploads, {
            params: {
                skip,
                limit
            }
        });
    },
    getUploadDetails: async (uploadId)=>{
        const client = getApiClient();
        return client.get(apiEndpoints.upload.getUploadDetails(uploadId));
    },
    getAnalysisResults: async (analysisId)=>{
        const client = getApiClient();
        return client.get(apiEndpoints.upload.getResults(analysisId));
    },
    generateReport: async (reportName, reportType, startDate, endDate)=>{
        const client = getApiClient();
        return client.post(apiEndpoints.reports.generate, {
            reportName,
            reportType,
            startDate,
            endDate
        });
    },
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
    getReportDetails: async (reportId)=>{
        const client = getApiClient();
        return client.get(apiEndpoints.reports.get(reportId));
    },
    getRisks: async ()=>{
        const client = getApiClient();
        return client.get(apiEndpoints.risks.list);
    },
    getComplianceStatus: async ()=>{
        const client = getApiClient();
        return client.get(apiEndpoints.compliance.status);
    },
    getDashboardMetrics: async ()=>{
        const client = getApiClient();
        return client.get(apiEndpoints.dashboard.metrics);
    },
    getDashboardSummary: async ()=>{
        const client = getApiClient();
        return client.get(apiEndpoints.dashboard.summary);
    },
    getDashboardActivity: async (limit = 10)=>{
        const client = getApiClient();
        return client.get(apiEndpoints.dashboard.activity, {
            params: {
                limit
            }
        });
    },
    getComplianceTimeline: async (limit = 12)=>{
        const client = getApiClient();
        return client.get(apiEndpoints.dashboard.timeline, {
            params: {
                limit
            }
        });
    },
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
    getCurrentUser: async ()=>{
        const client = getApiClient();
        return client.get(apiEndpoints.auth.me);
    },
    healthCheck: async ()=>{
        const client = getApiClient();
        return client.get(apiEndpoints.health);
    }
};
const __TURBOPACK__default__export__ = getApiClient;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Project/capstone_project/frontend/app/compliance/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CompliancePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/lib/api-client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function CompliancePage() {
    _s();
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CompliancePage.useEffect": ()=>{
            const fetchData = {
                "CompliancePage.useEffect.fetchData": async ()=>{
                    try {
                        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiMethods"].getComplianceStatus();
                        setData(res.data.data);
                    } catch (err) {
                        console.error("Error fetching compliance:", err);
                    }
                }
            }["CompliancePage.useEffect.fetchData"];
            fetchData();
        }
    }["CompliancePage.useEffect"], []);
    if (!data) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-white p-10",
            children: "Loading..."
        }, void 0, false, {
            fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
            lineNumber: 23,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6 text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-3xl font-bold mb-6",
                children: "Compliance Dashboard"
            }, void 0, false, {
                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-800 p-6 rounded-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg",
                                children: "HIPAA Compliance"
                            }, void 0, false, {
                                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                                lineNumber: 35,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-3xl font-bold text-green-400",
                                children: [
                                    data.hipaaCompliance,
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                                lineNumber: 36,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-800 p-6 rounded-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg",
                                children: "DPDP Compliance"
                            }, void 0, false, {
                                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-3xl font-bold text-blue-400",
                                children: [
                                    data.dpdpaCompliance,
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                                lineNumber: 43,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-gray-800 p-6 rounded-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg",
                                children: "Overall Score"
                            }, void 0, false, {
                                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-3xl font-bold text-purple-400",
                                children: [
                                    data.complianceScore,
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-8 bg-gray-800 p-6 rounded-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl mb-4",
                        children: "Risk Summary"
                    }, void 0, false, {
                        fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                        lineNumber: 59,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "🔴 Critical: ",
                                    data.risks?.critical
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                                lineNumber: 62,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "🟠 High: ",
                                    data.risks?.high
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                                lineNumber: 63,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "🟡 Medium: ",
                                    data.risks?.medium
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "🟢 Low: ",
                                    data.risks?.low
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-8 bg-gray-800 p-6 rounded-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl mb-4",
                        children: "Recommendations"
                    }, void 0, false, {
                        fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "list-disc pl-5 space-y-2",
                        children: data.recommendations?.map((rec, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: rec
                            }, i, false, {
                                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                                lineNumber: 75,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Project/capstone_project/frontend/app/compliance/page.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_s(CompliancePage, "fQZRxy/+nAZ7NLS1X4dVhrlp8Go=");
_c = CompliancePage;
var _c;
__turbopack_context__.k.register(_c, "CompliancePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Project_capstone_project_frontend_359c1079._.js.map