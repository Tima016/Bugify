'use client';

import { useAuthStore } from '@/store/auth-store';
import { CompanyProfile } from '@/components/dashboard/company-profile';
import { ResearcherProfile } from '@/components/dashboard/researcher-profile';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
    const { user, isLoading: authLoading } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    if (authLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-premium-accent" />
            </div>
        );
    }

    if (!user) {
        return null; // Should be handled by ProtectedRoute
    }

    const role = user.role?.toUpperCase();

    console.log('--- PROFILE DEBUG ---');
    console.log('User from store:', user);
    console.log('Detected Role:', role);
    console.log('---------------------');

    if (role === 'COMPANY') {
        return <CompanyProfile />;
    }

    // Default to researcher profile for RESEARCHER role or fallback
    return <ResearcherProfile />;
}
