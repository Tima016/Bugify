'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated, loadUserFromToken } = useAuthStore();
    const router = useRouter();

    // SECURITY: Load user data from backend on mount if authenticated but no user data yet
    useEffect(() => {
        if (isAuthenticated && !user) {
            console.log('[ProtectedRoute] Authenticated but no user data, loading from token...');
            loadUserFromToken();
        }
    }, [isAuthenticated, user, loadUserFromToken]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            console.log('[ProtectedRoute] Not authenticated, redirecting to login');
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || (isAuthenticated && !user)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || !isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
