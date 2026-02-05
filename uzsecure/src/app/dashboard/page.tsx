'use client';

import { useAuthStore } from '@/store/auth-store';
import { ResearcherDashboard } from '@/components/dashboard/researcher-dashboard';
import { CompanyDashboard } from '@/components/dashboard/company-dashboard';

export default function DashboardPage() {
    const { user } = useAuthStore();

    // SECURITY: Get role from JWT token, not localStorage
    const userRole = useAuthStore.getState().getUserRole();

    if (!user || !userRole) {
        return null; // or loading
    }

    if (userRole.toUpperCase() === 'COMPANY') {
        return <CompanyDashboard />;
    }

    // Default to Researcher view
    return <ResearcherDashboard />;
}
