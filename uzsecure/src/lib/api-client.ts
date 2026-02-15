import axios, { AxiosError } from 'axios';
import { Program } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
    withCredentials: true, // Send cookies with requests
});

// Request interceptor - Logging only (no token attachment)
apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Only redirect if we are NOT already on the login page to avoid loops
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                // Check if this 401 corresponds to a failed session check
                const isSessionCheck = error.config?.url?.includes('/users/profile');

                // If it's the session check that failed, we just clear the session state but stay on the page
                // This allows public pages to load without forcing login
                if (isSessionCheck) {
                    // Optionally clear cookies but DO NOT redirect
                    // The auth store will handle the "not authenticated" state
                    console.warn('[ApiClient] Session check failed (401). Use is likely a guest.');
                }
                // For other 401s (e.g. accessing a protected resource), let the component handle it
            }
        }
        return Promise.reject(error);
    }
);

// API methods
export const api = {
    // Authentication
    auth: {
        register: async (data: {
            email: string;
            username: string;
            password: string;
            firstName: string;
            lastName: string;
            role?: 'RESEARCHER' | 'COMPANY';
            companyName?: string;
        }) => {
            const response = await apiClient.post('/auth/register', data);
            return response.data;
        },
        login: async (data: { emailOrUsername: string; password: string }) => {
            const response = await apiClient.post('/auth/login', data);
            return response.data;
        },
        changePassword: async (data: { currentPassword: string; newPassword: string }) => {
            const response = await apiClient.post('/auth/change-password', data);
            return response.data;
        },
        enable2FA: async () => {
            const response = await apiClient.post('/auth/2fa/enable');
            return response.data;
        },
        disable2FA: async () => {
            const response = await apiClient.post('/auth/2fa/disable');
            return response.data;
        },
    },

    // Users
    users: {
        getProfile: async () => {
            const response = await apiClient.get('/users/profile');
            return response.data;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateProfile: async (data: any) => {
            const response = await apiClient.patch('/users/profile', data);
            return response.data;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateNotificationPreferences: async (preferences: any) => {
            const response = await apiClient.patch('/users/notification-preferences', preferences);
            return response.data;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatePrivacySettings: async (settings: any) => {
            const response = await apiClient.patch('/users/privacy-settings', settings);
            return response.data;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatePreferences: async (preferences: any) => {
            const response = await apiClient.patch('/users/preferences', preferences);
            return response.data;
        },
        exportData: async () => {
            const response = await apiClient.post('/users/export-data');
            return response.data;
        },
        requestDataDeletion: async () => {
            const response = await apiClient.post('/users/request-data-deletion');
            return response.data;
        },
        getLeaderboard: async () => {
            const response = await apiClient.get('/users/leaderboard');
            return response.data;
        },
        getUser: async (id: string) => {
            const response = await apiClient.get(`/users/${id}`);
            return response.data;
        },
    },



    // Programs
    programs: {
        getAll: async (params?: { status?: string; programType?: string; search?: string }): Promise<Program[]> => {
            const response = await apiClient.get<Program[]>('/programs', { params });
            return response.data;
        },
        getMyPrograms: async () => {
            const response = await apiClient.get<Program[]>('/programs/my-programs');
            return response.data;
        },
        getBySlug: async (slug: string) => {
            const response = await apiClient.get(`/programs/${slug}`);
            return response.data;
        },
        getStats: async (id: string) => {
            const response = await apiClient.get(`/programs/${id}/stats`);
            return response.data;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        create: async (data: any) => {
            const response = await apiClient.post('/programs', data);
            return response.data;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        update: async (id: string, data: any) => {
            const response = await apiClient.patch(`/programs/${id}`, data);
            return response.data;
        },
        delete: async (id: string) => {
            const response = await apiClient.delete(`/programs/${id}`);
            return response.data;
        },
    },

    // Reports
    reports: {
        getAll: async (params?: { status?: string; severity?: string; programId?: string }) => {
            const response = await apiClient.get('/reports', { params });
            return response.data;
        },
        getMyReports: async () => {
            const response = await apiClient.get('/reports/my-reports');
            return response.data;
        },
        getCompanyReports: async () => {
            const response = await apiClient.get('/reports/company-reports');
            return response.data;
        },
        getById: async (id: string) => {
            const response = await apiClient.get(`/reports/${id}`);
            return response.data;
        },
        getOne: async (id: string) => {
            const response = await apiClient.get(`/reports/${id}`);
            return response.data;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        create: async (data: any) => {
            const response = await apiClient.post('/reports', data);
            return response.data;
        },
        updateStatus: async (id: string, data: { status: string; internalNotes?: string }) => {
            const response = await apiClient.patch(`/reports/${id}/status`, data);
            return response.data;
        },
        getStats: async (programId: string) => {
            const response = await apiClient.get(`/reports/stats/${programId}`);
            return response.data;
        },
    },

    // Payments
    payments: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requestPayout: async (data: { amount: number; method: string; destination: any; currency: string }) => {
            const response = await apiClient.post('/payments/payout-request', data);
            return response.data;
        },
        getHistory: async () => {
            const response = await apiClient.get('/payments/history');
            return response.data;
        },
        getBalance: async () => {
            const response = await apiClient.get('/payments/balance');
            return response.data;
        },
    },

    // Comments
    comments: {
        getByReportId: async (reportId: string) => {
            const response = await apiClient.get(`/comments/report/${reportId}`);
            return response.data;
        },
        create: async (data: { reportId: string; content: string; parentCommentId?: string }) => {
            const response = await apiClient.post('/comments', data);
            return response.data;
        },
    },

    // Notifications
    notifications: {
        getAll: async () => {
            const response = await apiClient.get('/notifications');
            return response.data;
        },
        markAsRead: async (id: string) => {
            const response = await apiClient.patch(`/notifications/${id}/read`);
            return response.data;
        },
        markAllAsRead: async () => {
            const response = await apiClient.patch('/notifications/read-all');
            return response.data;
        },
    },

    // Companies
    companies: {
        getDashboardStats: async () => {
            const response = await apiClient.get('/companies/dashboard-stats');
            return response.data;
        },
    },

    // Admin
    admin: {
        getDashboardStats: async () => {
            const response = await apiClient.get('/admin/dashboard-stats');
            return response.data;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getUsers: async (filters?: any) => {
            const response = await apiClient.get('/admin/users', { params: filters });
            return response.data;
        },
        verifyCompany: async (userId: string) => {
            const response = await apiClient.patch(`/admin/users/${userId}/verify`);
            return response.data;
        },
        banUser: async (userId: string, reason?: string) => {
            const response = await apiClient.patch(`/admin/users/${userId}/ban`, { reason });
            return response.data;
        },
        updateUser: async (userId: string, data: { firstName?: string; lastName?: string; email?: string; role?: string }) => {
            const response = await apiClient.patch(`/admin/users/${userId}`, data);
            return response.data;
        },
        deleteUser: async (userId: string) => {
            const response = await apiClient.delete(`/admin/users/${userId}`);
            return response.data;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getAllReports: async (filters?: any) => {
            const response = await apiClient.get('/admin/reports', { params: filters });
            return response.data;
        },
        getAllPayouts: async (status?: string) => {
            const response = await apiClient.get('/admin/payouts', { params: { status } });
            return response.data;
        },
        processPayout: async (payoutId: string, data: { status: string; transactionRef?: string; adminNotes?: string }) => {
            const response = await apiClient.patch(`/admin/payouts/${payoutId}/process`, data);
            return response.data;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getTransactions: async (filters?: any) => {
            const response = await apiClient.get('/admin/transactions', { params: filters });
            return response.data;
        },
        getAnalytics: {
            userGrowth: async (days: number = 30) => {
                const response = await apiClient.get('/admin/analytics/user-growth', { params: { days } });
                return response.data;
            },
            reportTrends: async (days: number = 30) => {
                const response = await apiClient.get('/admin/analytics/report-trends', { params: { days } });
                return response.data;
            },
            revenueTrends: async (days: number = 30) => {
                const response = await apiClient.get('/admin/analytics/revenue-trends', { params: { days } });
                return response.data;
            },
        },
        getKycQueue: async () => {
            const response = await apiClient.get('/admin/kyc/queue');
            return response.data;
        },
        reviewKyc: async (userId: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
            const response = await apiClient.patch(`/admin/kyc/${userId}/review`, { status, notes });
            return response.data;
        },
        bulkVerifyCompanies: async (userIds: string[]) => {
            const response = await apiClient.post('/admin/users/bulk/verify', { userIds });
            return response.data;
        },
        bulkBanUsers: async (userIds: string[], reason: string) => {
            const response = await apiClient.post('/admin/users/bulk/ban', { userIds, reason });
            return response.data;
        },
        bulkDeleteUsers: async (userIds: string[]) => {
            const response = await apiClient.post('/admin/users/bulk/delete', { userIds });
            return response.data;
        },
    },
};

export default api;
