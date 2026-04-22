import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

let apiClient: AxiosInstance | null = null;

export const getApiClient = (): AxiosInstance => {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  return apiClient;
};

export const setAuthToken = (token?: string) => {
  const client = getApiClient();

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }
};

// API Endpoints
export const apiEndpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
  },

  risks: {
    list: '/risks',
    get: (id: string) => `/risks/${id}`,
    create: '/risks',
    update: (id: string) => `/risks/${id}`,
    delete: (id: string) => `/risks/${id}`,
  },

  accessLogs: {
    list: '/access-logs',
    get: (id: string) => `/access-logs/${id}`,
    analytics: '/access-logs/analytics',
  },

  upload: {
    uploadData: '/upload',
    getUploads: '/upload/uploads',
    getUploadDetails: (id: string) => `/upload/uploads/${id}`,
    getResults: (analysisId: string) => `/upload/results/${analysisId}`,
  },

  reports: {
    generate: '/report/generate',
    list: '/report',
    get: (id: string) => `/report/${id}`,
    delete: (id: string) => `/report/${id}`,
  },

  compliance: {
    status: '/compliance',
  },

  dashboard: {
    metrics: '/dashboard/metrics',
    summary: '/dashboard/summary',
    activity: '/dashboard/activity',
    timeline: '/dashboard/compliance-timeline',
  },

  health: '/health',
};

// API Methods
export const apiMethods = {
  uploadData: async (
    fileName: string,
    dataType: string,
    records: any[],
    metadata?: any
  ) => {
    const client = getApiClient();
    return client.post(apiEndpoints.upload.uploadData, {
      fileName,
      dataType,
      records,
      metadata,
    });
  },

  getUploads: async (skip = 0, limit = 20) => {
    const client = getApiClient();
    return client.get(apiEndpoints.upload.getUploads, {
      params: { skip, limit },
    });
  },

  getUploadDetails: async (uploadId: string) => {
    const client = getApiClient();
    return client.get(apiEndpoints.upload.getUploadDetails(uploadId));
  },

  getAnalysisResults: async (analysisId: string) => {
    const client = getApiClient();
    return client.get(apiEndpoints.upload.getResults(analysisId));
  },

  generateReport: async (
    reportName: string,
    reportType: string,
    startDate?: string,
    endDate?: string
  ) => {
    const client = getApiClient();
    return client.post(apiEndpoints.reports.generate, {
      reportName,
      reportType,
      startDate,
      endDate,
    });
  },

  getReports: async (skip = 0, limit = 20, type?: string) => {
    const client = getApiClient();
    return client.get(apiEndpoints.reports.list, {
      params: { skip, limit, type },
    });
  },

  getReportDetails: async (reportId: string) => {
    const client = getApiClient();
    return client.get(apiEndpoints.reports.get(reportId));
  },

  getRisks: async () => {
    const client = getApiClient();
    return client.get(apiEndpoints.risks.list);
  },

  getComplianceStatus: async () => {
    const client = getApiClient();
    return client.get(apiEndpoints.compliance.status);
  },

  getDashboardMetrics: async () => {
    const client = getApiClient();
    return client.get(apiEndpoints.dashboard.metrics);
  },

  getDashboardSummary: async () => {
    const client = getApiClient();
    return client.get(apiEndpoints.dashboard.summary);
  },

  getDashboardActivity: async (limit = 10) => {
    const client = getApiClient();
    return client.get(apiEndpoints.dashboard.activity, {
      params: { limit },
    });
  },

  getComplianceTimeline: async (limit = 12) => {
    const client = getApiClient();
    return client.get(apiEndpoints.dashboard.timeline, {
      params: { limit },
    });
  },

  getAccessLogs: async (skip = 0, limit = 100, filters?: any) => {
    const client = getApiClient();
    return client.get(apiEndpoints.accessLogs.list, {
      params: { skip, limit, ...filters },
    });
  },

  getAccessLogAnalytics: async () => {
    const client = getApiClient();
    return client.get(apiEndpoints.accessLogs.analytics);
  },

  getCurrentUser: async () => {
    const client = getApiClient();
    return client.get(apiEndpoints.auth.me);
  },

  healthCheck: async () => {
    const client = getApiClient();
    return client.get(apiEndpoints.health);
  },
};

export default getApiClient;