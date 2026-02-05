'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, loadUserFromToken } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdminAccess = async () => {
            setIsLoading(true);
            try {
                // Load user from token to get fresh data
                if (!user) {
                    await loadUserFromToken();
                }
            } catch (error) {
                console.error('Failed to load user:', error);
                router.push('/login');
                setIsLoading(false);
                return;
            }

            // Check role after loading
            const currentUser = useAuthStore.getState().user;
            
            if (!currentUser) {
                router.push('/login');
                setIsLoading(false);
                return;
            }

            if (currentUser.role?.toUpperCase() !== 'ADMIN') {
                router.push('/dashboard');
                setIsLoading(false);
                return;
            }

            setIsLoading(false);
        };

        checkAdminAccess();
    }, [user, router, loadUserFromToken]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (user.role?.toUpperCase() !== 'ADMIN') {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
