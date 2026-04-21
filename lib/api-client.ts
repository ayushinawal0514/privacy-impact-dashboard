import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

let apiClient: AxiosInstance | null = null;

export const getApiClient = (token?: string): AxiosInstance => {
  if (!apiClient) {
    apiClient = axios.create({
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
    apiClient.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  return apiClient;
};

export const setAuthToken = (token: string) => {
  const client = getApiClient();
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// API Endpoints
export const apiEndpoints = {
  // Auth
  auth: {
    register: '/auth/register',
    login: '/auth/login',
  },

  // Risks
  risks: {
    list: '/risks',
    get: (id: string) => `/risks/${id}`,
    create: '/risks',
    update: (id: string) => `/risks/${id}`,
    delete: (id: string) => `/risks/${id}`,
  },

  // Access Logs
  accessLogs: {
    list: '/access-logs',
    get: (id: string) => `/access-logs/${id}`,
  },

  // Upload & Analysis
  upload: {
    uploadData: '/upload/upload',
    getUploads: '/upload/uploads',
    getUploadDetails: (id: string) => `/upload/uploads/${id}`,
    analyze: (uploadId: string) => `/upload/analyze/${uploadId}`,
    getResults: (analysisId: string) => `/upload/results/${analysisId}`,
  },

  // Reports
  reports: {
    generate: '/report/generate',
    list: '/report',
    get: (id: string) => `/report/${id}`,
    delete: (id: string) => `/report/${id}`,
  },

  // Compliance
  compliance: {
    status: '/compliance',
  },

  // Dashboard
  dashboard: {
    metrics: '/dashboard/metrics',
    summary: '/dashboard/summary',
  },

  // Health
  health: '/health',
};

// API Methods
export const apiMethods = {
  // Upload data
  uploadData: async (fileName: string, dataType: string, records: any[], metadata?: any) => {
    const client = getApiClient();
    return client.post(apiEndpoints.upload.uploadData, {
      fileName,
      dataType,
      records,
      metadata,
    });
  },

  // Get uploads
  getUploads: async (skip = 0, limit = 20) => {
    const client = getApiClient();
    return client.get(apiEndpoints.upload.getUploads, {
      params: { skip, limit },
    });
  },

  // Get upload details
  getUploadDetails: async (uploadId: string) => {
    const client = getApiClient();
    return client.get(apiEndpoints.upload.getUploadDetails(uploadId));
  },

  // Analyze data
  analyzeData: async (uploadId: string, rules?: any[], options?: any) => {
    const client = getApiClient();
    return client.post(apiEndpoints.upload.analyze(uploadId), {
      rules,
      options,
    });
  },

  // Get analysis results
  getAnalysisResults: async (analysisId: string) => {
    const client = getApiClient();
    return client.get(apiEndpoints.upload.getResults(analysisId));
  },

  // Generate report
  generateReport: async (reportName: string, reportType: string, startDate?: string, endDate?: string) => {
    const client = getApiClient();
    return client.post(apiEndpoints.reports.generate, {
      reportName,
      reportType,
      startDate,
      endDate,
    });
  },

  // Get reports
  getReports: async (skip = 0, limit = 20, type?: string) => {
    const client = getApiClient();
    return client.get(apiEndpoints.reports.list, {
      params: { skip, limit, type },
    });
  },

  // Get report details
  getReportDetails: async (reportId: string) => {
    const client = getApiClient();
    return client.get(apiEndpoints.reports.get(reportId));
  },

  // Get risks
  getRisks: async () => {
    const client = getApiClient();
    return client.get(apiEndpoints.risks.list);
  },

  // Get compliance status
  getComplianceStatus: async () => {
    const client = getApiClient();
    return client.get(apiEndpoints.compliance.status);
  },

  // Get dashboard metrics
  getDashboardMetrics: async () => {
    const client = getApiClient();
    return client.get(apiEndpoints.dashboard.metrics);
  },

  // Get dashboard summary
  getDashboardSummary: async () => {
    const client = getApiClient();
    return client.get(apiEndpoints.dashboard.summary);
  },

  // Get access logs
  getAccessLogs: async (skip = 0, limit = 100, filters?: any) => {
    const client = getApiClient();
    return client.get(apiEndpoints.accessLogs.list, {
      params: { skip, limit, ...filters },
    });
  },

  // Health check
  healthCheck: async () => {
    const client = getApiClient();
    return client.get(apiEndpoints.health);
  },
};

export default getApiClient;
