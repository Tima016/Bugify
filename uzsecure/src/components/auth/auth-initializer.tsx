'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';

/**
 * AuthInitializer component
 * Runs on app startup to restore user session from persisted tokens
 */
export function AuthInitializer() {
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        const initializeAuth = async () => {
            if (hasInitializedRef.current) return;

            const { loadUserFromToken, isAuthenticated } = useAuthStore.getState();

            console.log('[AuthInitializer] Starting auth check...');
            hasInitializedRef.current = true;

            try {
                // If we have a token in cookies, try to load the user
                // Cookies are automatically sent with requests
                await loadUserFromToken();
                console.log('[AuthInitializer] User loaded successfully');
            } catch (error) {
                console.log('[AuthInitializer] No active session found, user not authenticated.');
                // Reset authenticated flag on failed load
                useAuthStore.setState({ isAuthenticated: false });
            }
        };

        initializeAuth();
    }, []);

    return null;
}
