import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Faculty' | 'ClassCoordinator' | 'HOD' | 'HostelWarden' | 'LibraryAdmin' | 'WorkshopAdmin' | 'TPOfficer' | 'GeneralOffice' | 'AccountsOfficer' | 'SuperAdmin';
  department?: string;
  studentProfile?: StudentProfile;
}

export interface StudentProfile {
  enrollmentNumber: string;
  fatherName: string;
  dateOfBirth: string;
  branch: string;
  address: string;
  passOutYear: number;
  phoneNumber?: string;
}

export interface Application {
  _id: string;
  studentId: string;
  status: 'UnderReview' | 'Paused' | 'CertificateIssued';
  currentStage: number;
  hostelInvolved: boolean;
  cautionMoneyRefund: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStage {
  officeName: string;
  role: string;
  status: 'Pending' | 'Approved' | 'Paused';
  approvedBy?: {
    name: string;
    email: string;
  };
  approvedAt?: string;
  remarks?: string;
}

export interface ApplicationStatus {
  application: Application;
  approvalStages: ApprovalStage[];
  documents: {
    feeReceiptsPDF?: string;
    marksheetsPDF?: string;
    bankProofImage?: string;
    idProofImage?: string;
  };
  certificate?: {
    certificateNumber: string;
    issuedAt: string;
    pdfUrl: string;
    emailSent: boolean;
  };
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>>('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse>('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<{
      user: User;
      studentProfile: StudentProfile | null;
    }>>('/auth/me');
    return response.data;
  },
};

// Student API
export const studentAPI = {
  getProfile: async () => {
    const response = await api.get<ApiResponse<{ profile: StudentProfile }>>('/student/profile');
    return response.data;
  },

  updateProfile: async (profileData: Partial<StudentProfile>) => {
    const response = await api.post<ApiResponse<{ profile: StudentProfile }>>('/student/profile', profileData);
    return response.data;
  },

  submitApplication: async (formData: FormData) => {
    const response = await api.post<ApiResponse<{
      applicationId: string;
      status: string;
      currentStage: number;
    }>>('/student/application', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getApplicationStatus: async () => {
    const response = await api.get<ApiResponse<ApplicationStatus>>('/student/application/status');
    return response.data;
  },

  resubmitApplication: async (formData: FormData) => {
    const response = await api.put<ApiResponse<{
      applicationId: string;
      status: string;
    }>>('/student/application/resubmit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCertificate: async () => {
    const response = await api.get<ApiResponse<{
      certificateNumber: string;
      issuedAt: string;
      pdfUrl: string;
      emailSent: boolean;
    }>>('/student/certificate');
    return response.data;
  },
};

// Approval API
export const approvalAPI = {
  getPendingApprovals: async (page = 1, limit = 10) => {
    const response = await api.get<ApiResponse<{
      applications: any[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>>('/approvals/pending', {
      params: { page, limit },
    });
    return response.data;
  },

  getHistory: async (page = 1, limit = 10) => {
    const response = await api.get<ApiResponse<{
      history: any[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>>('/approvals/history', {
      params: { page, limit },
    });
    return response.data;
  },

  approveApplication: async (applicationId: string, data?: any) => {
    const response = await api.post<ApiResponse<{
      applicationId: string;
      status: string;
      currentStage: number;
      isFinalApproval: boolean;
    }>>(`/approvals/${applicationId}/approve`, data);
    return response.data;
  },

  pauseApplication: async (applicationId: string, remarks: string) => {
    const response = await api.post<ApiResponse<{
      applicationId: string;
      status: string;
      pausedAt: string;
      remarks: string;
    }>>(`/approvals/${applicationId}/pause`, { remarks });
    return response.data;
  },

  getApplicationDetails: async (applicationId: string) => {
    const response = await api.get<ApiResponse<{
      application: Application;
      student: User;
      documents: any;
      approvalStages: ApprovalStage[];
    }>>(`/approvals/${applicationId}/details`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    studentProfile?: StudentProfile;
  }) => {
    const response = await api.post<ApiResponse<{
      userId: string;
      name: string;
      email: string;
      role: string;
    }>>('/admin/create-user', userData);
    return response.data;
  },

  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    department?: string;
    search?: string;
  }) => {
    const response = await api.get<ApiResponse<{
      users: User[];
      pagination: any;
    }>>('/admin/users', { params });
    return response.data;
  },

  getAllApplications: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    branch?: string;
    passOutYear?: number;
  }) => {
    const response = await api.get<ApiResponse<{
      applications: any[];
      pagination: any;
    }>>('/admin/applications', { params });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get<ApiResponse<{
      users: any;
      applications: any;
      certificates: any;
      recentActivity: any[];
    }>>('/admin/statistics');
    return response.data;
  },

  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get<ApiResponse<{
      logs: any[];
      pagination: any;
    }>>('/admin/audit-logs', { params });
    return response.data;
  },
};

export default api;
