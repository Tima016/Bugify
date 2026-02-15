import { create } from 'zustand';
import axios from 'axios';
import api from '@/lib/api-client';

interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string; // Derived from JWT token
    reputationScore: number;
    totalEarnings: string;
    profilePictureUrl?: string;
    companyName?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;

    // Actions
    login: (emailOrUsername: string, password: string) => Promise<void>;
    register: (data: {
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        role?: 'RESEARCHER' | 'COMPANY';
        companyName?: string;
    }) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
    clearError: () => void;
    getUserRole: () => string | null;
    loadUserFromToken: () => Promise<void>; // NEW: Fetch user data from backend
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    _hasHydrated: true, // No longer using persistence for auth state, so always ready

    setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
    },

    login: async (emailOrUsername: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            console.log('[login] Calling API login...', { emailOrUsername });
            const response = await api.auth.login({ emailOrUsername, password });

            console.log('[login] Full response:', response);

            // Backend returns { user, accessToken, refreshToken }
            const user = response.user;
            console.log('[login] Extracted user:', user);

            if (!user) {
                throw new Error('No user data in response');
            }

            console.log('[login] User role:', user.role);
            console.log('[login] Login successful');

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });

            console.log('[login] State updated');
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (error as any).response?.data?.message || (error as Error).message || 'Login failed';
            console.error('[login] Login failed:', errorMessage);
            console.error('[login] Full error:', error);
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    register: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.auth.register(data);
            // Backend sets httpOnly cookies.
            const user = response.user;

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessage = (error as any).response?.data?.message || 'Registration failed';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await axios.post(process.env.NEXT_PUBLIC_API_URL + '/auth/logout', {}, { withCredentials: true });
        } catch (e) {
            console.error('Logout failed', e);
        }
        // Clear cookies on the client side
        if (typeof document !== 'undefined') {
            // Clear with different configurations to ensure they're removed
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
            document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
            document.cookie = 'access_token=; path=/; max-age=0';
            document.cookie = 'refresh_token=; path=/; max-age=0';
        }
        set({
            user: null,
            error: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
        });
    },

    setUser: (user: User) => {
        set({ user });
    },

    clearError: () => {
        set({ error: null });
    },

    getUserRole: () => {
        return get().user?.role || null;
    },

    // Load user from backend (session check)
    loadUserFromToken: async () => {
        set({ isLoading: true });
        try {
            console.log('[loadUserFromToken] Fetching user profile...');
            const userData = await api.users.getProfile();
            console.log('[loadUserFromToken] Profile fetched:', userData);

            set({
                user: userData,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error: unknown) {
            console.error('[loadUserFromToken] Failed to load user:', error);
            set({ user: null, isAuthenticated: false, isLoading: false });
            throw error;
        }
    },
}));
