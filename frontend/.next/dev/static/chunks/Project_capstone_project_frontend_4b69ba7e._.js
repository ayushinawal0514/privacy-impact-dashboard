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
        get: (id)=>`/access-logs/${id}`,
        analytics: '/access-logs/analytics'
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
    getAccessLogAnalytics: async ()=>{
        const client = getApiClient();
        return client.get(apiEndpoints.accessLogs.analytics);
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
"[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EnhancedDashboardLayout",
    ()=>EnhancedDashboardLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next-auth/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/lib/api-client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function EnhancedDashboardLayout({ activeSection, children, userRole }) {
    _s();
    const { data: session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    const [notifications, setNotifications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isSidebarOpen, setIsSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EnhancedDashboardLayout.useEffect": ()=>{
            const token = session?.accessToken;
            if (!token) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setAuthToken"])(token);
            const fetchAlerts = {
                "EnhancedDashboardLayout.useEffect.fetchAlerts": async ()=>{
                    try {
                        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiMethods"].getDashboardSummary();
                        const risks = res.data?.data?.risks || {};
                        const count = (risks.critical || 0) + (risks.high || 0);
                        setNotifications(count);
                    } catch (error) {
                        console.error("Error fetching alert summary:", error);
                    }
                }
            }["EnhancedDashboardLayout.useEffect.fetchAlerts"];
            fetchAlerts();
            const interval = setInterval(fetchAlerts, 30000);
            return ({
                "EnhancedDashboardLayout.useEffect": ()=>clearInterval(interval)
            })["EnhancedDashboardLayout.useEffect"];
        }
    }["EnhancedDashboardLayout.useEffect"], [
        session
    ]);
    const normalizedRole = userRole || session?.user?.role || "user";
    const navigationItems = [
        {
            name: "Overview",
            href: "/dashboard",
            key: "overview",
            icon: "📊",
            roles: [
                "admin",
                "user"
            ]
        },
        {
            name: "Risks",
            href: "/risks",
            key: "risks",
            icon: "⚠️",
            roles: [
                "admin",
                "user"
            ]
        },
        {
            name: "Compliance",
            href: "/compliance",
            key: "compliance",
            icon: "✓",
            roles: [
                "admin",
                "user"
            ]
        },
        {
            name: "Access Logs",
            href: "/access-logs",
            key: "access logs",
            icon: "📋",
            roles: [
                "admin",
                "user"
            ]
        },
        {
            name: "Data Flows",
            href: "/data-flows",
            key: "data flows",
            icon: "🔄",
            roles: [
                "admin"
            ]
        },
        {
            name: "Audit Reports",
            href: "/audit-reports",
            key: "audit reports",
            icon: "📄",
            roles: [
                "admin"
            ]
        },
        {
            name: "Alerts",
            href: "/alerts",
            key: "alerts",
            icon: "🔔",
            roles: [
                "admin"
            ]
        }
    ];
    const visibleItems = navigationItems.filter((item)=>item.roles.includes(normalizedRole));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-screen bg-slate-50 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].aside, {
                initial: false,
                animate: {
                    width: isSidebarOpen ? 240 : 64
                },
                className: "bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg border-r border-slate-700 flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 flex items-center justify-between",
                        children: [
                            isSidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg",
                                        children: "🛡️"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                        lineNumber: 75,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold text-sm",
                                                children: "Privacy Guard"
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                                lineNumber: 79,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-slate-400",
                                                children: "Healthcare"
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                                lineNumber: 80,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                        lineNumber: 78,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setIsSidebarOpen(!isSidebarOpen),
                                className: "p-1.5 hover:bg-slate-700 rounded-lg transition-colors",
                                children: isSidebarOpen ? "◀" : "▶"
                            }, void 0, false, {
                                fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "flex-1 px-2 py-6 space-y-1 overflow-y-auto",
                        children: visibleItems.map((item)=>{
                            const isActive = activeSection.toLowerCase() === item.key || activeSection.toLowerCase() === "overview" && item.key === "overview";
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: item.href,
                                className: `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? "bg-blue-600 text-white shadow-lg scale-105" : "text-slate-300 hover:bg-slate-700 hover:text-white"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xl flex-shrink-0",
                                        children: item.icon
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                        lineNumber: 108,
                                        columnNumber: 17
                                    }, this),
                                    isSidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-semibold truncate",
                                        children: item.name
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                        lineNumber: 110,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, item.href, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                lineNumber: 99,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 border-t border-slate-700",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xl flex-shrink-0",
                                    children: "👤"
                                }, void 0, false, {
                                    fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this),
                                isSidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm min-w-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-semibold truncate text-white",
                                            children: session?.user?.name || "User"
                                        }, void 0, false, {
                                            fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                            lineNumber: 122,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-slate-400 truncate",
                                            children: session?.user?.email
                                        }, void 0, false, {
                                            fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                            lineNumber: 125,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[11px] text-cyan-300 mt-1 capitalize",
                                            children: normalizedRole
                                        }, void 0, false, {
                                            fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                            lineNumber: 128,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                    lineNumber: 121,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-xl sm:text-2xl font-bold text-slate-900 truncate",
                                children: navigationItems.find((i)=>activeSection.toLowerCase() === i.key)?.name || activeSection
                            }, void 0, false, {
                                fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                lineNumber: 139,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/alerts",
                                        className: "relative p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xl",
                                                children: "🔔"
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                                lineNumber: 149,
                                                columnNumber: 15
                                            }, this),
                                            notifications > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-bold shadow-lg",
                                                children: notifications
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                                lineNumber: 151,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                        lineNumber: 145,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors",
                                        title: "Help",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xl",
                                            children: "❓"
                                        }, void 0, false, {
                                            fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                            lineNumber: 161,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                        lineNumber: 157,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                                lineNumber: 144,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 overflow-auto bg-slate-50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto",
                            children: children
                        }, void 0, false, {
                            fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                            lineNumber: 167,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                        lineNumber: 166,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
                lineNumber: 137,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_s(EnhancedDashboardLayout, "MvHPTImyDNu38x+XYnkM3r2xD54=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"]
    ];
});
_c = EnhancedDashboardLayout;
var _c;
__turbopack_context__.k.register(_c, "EnhancedDashboardLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Project/capstone_project/frontend/app/alerts/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AlertsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next-auth/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$app$2f$components$2f$dashboard$2f$EnhancedLayout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/app/components/dashboard/EnhancedLayout.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Project/capstone_project/frontend/lib/api-client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function AlertsPage() {
    _s();
    const { data: session, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [alerts, setAlerts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [severityFilter, setSeverityFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const accessToken = session?.accessToken;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AlertsPage.useEffect": ()=>{
            if (status === "unauthenticated") {
                router.push("/login");
            }
        }
    }["AlertsPage.useEffect"], [
        status,
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AlertsPage.useEffect": ()=>{
            if (!session || !accessToken) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setAuthToken"])(accessToken);
            fetchAlerts();
        }
    }["AlertsPage.useEffect"], [
        session,
        accessToken
    ]);
    async function fetchAlerts() {
        try {
            setLoading(true);
            setError(null);
            const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getApiClient"])();
            const res = await client.get("/alerts");
            setAlerts(res.data?.data || []);
        } catch (err) {
            console.error("Error fetching alerts:", err);
            setError(err?.response?.data?.message || "Failed to load alerts.");
        } finally{
            setLoading(false);
        }
    }
    async function resolveAlert(id) {
        try {
            const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getApiClient"])();
            await client.put(`/alerts/${id}/resolve`, {
                resolutionNotes: "Resolved from dashboard"
            });
            await fetchAlerts();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to resolve alert.");
        }
    }
    const filteredAlerts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AlertsPage.useMemo[filteredAlerts]": ()=>{
            return alerts.filter({
                "AlertsPage.useMemo[filteredAlerts]": (alert)=>{
                    const sev = (alert.severity || "low").toLowerCase();
                    const st = alert.resolved ? "resolved" : "open";
                    const q = search.trim().toLowerCase();
                    const matchesSearch = !q || (alert.title || "").toLowerCase().includes(q) || (alert.message || "").toLowerCase().includes(q) || (alert.type || "").toLowerCase().includes(q);
                    const matchesSeverity = severityFilter === "all" || sev === severityFilter;
                    const matchesStatus = statusFilter === "all" || st === statusFilter;
                    return matchesSearch && matchesSeverity && matchesStatus;
                }
            }["AlertsPage.useMemo[filteredAlerts]"]);
        }
    }["AlertsPage.useMemo[filteredAlerts]"], [
        alerts,
        search,
        severityFilter,
        statusFilter
    ]);
    const summary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AlertsPage.useMemo[summary]": ()=>{
            return alerts.reduce({
                "AlertsPage.useMemo[summary]": (acc, alert)=>{
                    const sev = (alert.severity || "low").toLowerCase();
                    if (acc[sev] !== undefined) acc[sev] += 1;
                    return acc;
                }
            }["AlertsPage.useMemo[summary]"], {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
            });
        }
    }["AlertsPage.useMemo[summary]"], [
        alerts
    ]);
    if (status === "loading" || loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$app$2f$components$2f$dashboard$2f$EnhancedLayout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EnhancedDashboardLayout"], {
            activeSection: "alerts",
            userRole: session?.user?.role,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-4 gap-6",
                        children: [
                            1,
                            2,
                            3,
                            4
                        ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-28 bg-slate-200 rounded-lg animate-pulse"
                            }, i, false, {
                                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                lineNumber: 113,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                        lineNumber: 111,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-96 bg-slate-200 rounded-lg animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                        lineNumber: 116,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                lineNumber: 110,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
            lineNumber: 109,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$app$2f$components$2f$dashboard$2f$EnhancedLayout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EnhancedDashboardLayout"], {
        activeSection: "alerts",
        userRole: session?.user?.role,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-3xl font-bold text-slate-900 mb-2",
                                    children: "Alerts"
                                }, void 0, false, {
                                    fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                    lineNumber: 127,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-slate-600",
                                    children: "Monitor important privacy, compliance, and security events across the system"
                                }, void 0, false, {
                                    fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                    lineNumber: 128,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                            lineNumber: 126,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/dashboard",
                            className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-fit",
                            children: "← Back to Dashboard"
                        }, void 0, false, {
                            fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                            lineNumber: 133,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                    lineNumber: 125,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-red-50 border border-red-200 rounded-lg p-4 text-red-700",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                    lineNumber: 142,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-4 gap-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SummaryCard, {
                            label: "Critical",
                            value: summary.critical,
                            tone: "critical"
                        }, void 0, false, {
                            fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                            lineNumber: 148,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SummaryCard, {
                            label: "High",
                            value: summary.high,
                            tone: "high"
                        }, void 0, false, {
                            fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                            lineNumber: 149,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SummaryCard, {
                            label: "Medium",
                            value: summary.medium,
                            tone: "medium"
                        }, void 0, false, {
                            fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                            lineNumber: 150,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SummaryCard, {
                            label: "Low",
                            value: summary.low,
                            tone: "low"
                        }, void 0, false, {
                            fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                            lineNumber: 151,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                    lineNumber: 147,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-lg border shadow-sm p-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-4 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Search alerts...",
                                value: search,
                                onChange: (e)=>setSearch(e.target.value),
                                className: "border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            }, void 0, false, {
                                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: severityFilter,
                                onChange: (e)=>setSeverityFilter(e.target.value),
                                className: "border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: "All Severities"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                        lineNumber: 169,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "critical",
                                        children: "Critical"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                        lineNumber: 170,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "high",
                                        children: "High"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                        lineNumber: 171,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "medium",
                                        children: "Medium"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                        lineNumber: 172,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "low",
                                        children: "Low"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                        lineNumber: 173,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                lineNumber: 164,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: statusFilter,
                                onChange: (e)=>setStatusFilter(e.target.value),
                                className: "border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: "All Status"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                        lineNumber: 181,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "open",
                                        children: "Open"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                        lineNumber: 182,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "resolved",
                                        children: "Resolved"
                                    }, void 0, false, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                        lineNumber: 183,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: fetchAlerts,
                                className: "px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition",
                                children: "Refresh"
                            }, void 0, false, {
                                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                lineNumber: 186,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                        lineNumber: 155,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                    lineNumber: 154,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-lg border shadow-sm overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-6 py-4 border-b",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "font-semibold text-slate-900",
                                children: [
                                    "Alert Stream (",
                                    filteredAlerts.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                lineNumber: 197,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                            lineNumber: 196,
                            columnNumber: 11
                        }, this),
                        filteredAlerts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-10 text-center text-slate-500",
                            children: "No alerts found."
                        }, void 0, false, {
                            fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                            lineNumber: 203,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "divide-y",
                            children: filteredAlerts.map((alert)=>{
                                const statusLabel = alert.resolved ? "resolved" : "open";
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-6 hover:bg-slate-50",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SeverityBadge, {
                                                                severity: alert.severity || "low"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                                                lineNumber: 216,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBadge, {
                                                                status: statusLabel
                                                            }, void 0, false, {
                                                                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                                                lineNumber: 217,
                                                                columnNumber: 27
                                                            }, this),
                                                            alert.type && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700",
                                                                children: alert.type
                                                            }, void 0, false, {
                                                                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                                                lineNumber: 219,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                                        lineNumber: 215,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-lg font-semibold text-slate-900",
                                                        children: alert.title || "Security / Compliance Alert"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                                        lineNumber: 225,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-slate-600",
                                                        children: alert.message || "No description available."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                                        lineNumber: 229,
                                                        columnNumber: 25
                                                    }, this),
                                                    alert.affectedResources?.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-500",
                                                        children: [
                                                            "Affected resources: ",
                                                            alert.affectedResources.join(", ")
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                                        lineNumber: 234,
                                                        columnNumber: 27
                                                    }, this) : null,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-500",
                                                        children: [
                                                            "Created: ",
                                                            formatDate(alert.createdAt)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                                        lineNumber: 239,
                                                        columnNumber: 25
                                                    }, this),
                                                    alert.resolvedAt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-green-700",
                                                        children: [
                                                            "Resolved: ",
                                                            formatDate(alert.resolvedAt)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                                        lineNumber: 244,
                                                        columnNumber: 27
                                                    }, this) : null,
                                                    alert.resolutionNotes ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-500",
                                                        children: [
                                                            "Notes: ",
                                                            alert.resolutionNotes
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                                        lineNumber: 250,
                                                        columnNumber: 27
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                                lineNumber: 214,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-2",
                                                children: !alert.resolved && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>resolveAlert(alert._id),
                                                    className: "px-3 py-2 bg-green-100 text-green-700 rounded-md text-sm font-semibold hover:bg-green-200",
                                                    children: "Resolve"
                                                }, void 0, false, {
                                                    fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                                    lineNumber: 258,
                                                    columnNumber: 27
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                                lineNumber: 256,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                        lineNumber: 213,
                                        columnNumber: 21
                                    }, this)
                                }, alert._id, false, {
                                    fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                                    lineNumber: 212,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                            lineNumber: 207,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                    lineNumber: 195,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
            lineNumber: 124,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
        lineNumber: 123,
        columnNumber: 5
    }, this);
}
_s(AlertsPage, "8HFUbSbRJTSnR62X8qrBp77K01Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AlertsPage;
function SummaryCard({ label, value, tone }) {
    const toneMap = {
        critical: "border-red-200 bg-red-50 text-red-700",
        high: "border-orange-200 bg-orange-50 text-orange-700",
        medium: "border-yellow-200 bg-yellow-50 text-yellow-700",
        low: "border-green-200 bg-green-50 text-green-700"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-lg border p-5 ${toneMap[tone]}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-medium",
                children: label
            }, void 0, false, {
                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                lineNumber: 296,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-3xl font-bold mt-2",
                children: value
            }, void 0, false, {
                fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
                lineNumber: 297,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
        lineNumber: 295,
        columnNumber: 5
    }, this);
}
_c1 = SummaryCard;
function SeverityBadge({ severity }) {
    const normalized = severity.toLowerCase();
    const styles = {
        critical: "bg-red-100 text-red-700",
        high: "bg-orange-100 text-orange-700",
        medium: "bg-yellow-100 text-yellow-700",
        low: "bg-green-100 text-green-700"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `px-3 py-1 rounded-full text-xs font-semibold ${styles[normalized] || "bg-slate-100 text-slate-700"}`,
        children: normalized.toUpperCase()
    }, void 0, false, {
        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
        lineNumber: 312,
        columnNumber: 5
    }, this);
}
_c2 = SeverityBadge;
function StatusBadge({ status }) {
    const normalized = status.toLowerCase();
    const styles = {
        open: "bg-red-100 text-red-700",
        resolved: "bg-green-100 text-green-700"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Project$2f$capstone_project$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `px-3 py-1 rounded-full text-xs font-semibold ${styles[normalized] || "bg-slate-100 text-slate-700"}`,
        children: normalized.toUpperCase()
    }, void 0, false, {
        fileName: "[project]/Project/capstone_project/frontend/app/alerts/page.tsx",
        lineNumber: 326,
        columnNumber: 5
    }, this);
}
_c3 = StatusBadge;
function formatDate(date) {
    if (!date) return "N/A";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleString();
}
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "AlertsPage");
__turbopack_context__.k.register(_c1, "SummaryCard");
__turbopack_context__.k.register(_c2, "SeverityBadge");
__turbopack_context__.k.register(_c3, "StatusBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Project_capstone_project_frontend_4b69ba7e._.js.map