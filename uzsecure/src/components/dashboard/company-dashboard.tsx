'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    DollarSign,
    Plus,
    BarChart3,
    ArrowRight
} from 'lucide-react';
import { Program } from '@/types';

export function CompanyDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        activePrograms: 0,
        pendingReports: 0,
        totalPaid: 0,
        avgResolution: '0 days'
    });
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch company's programs
                const myPrograms = await api.programs.getMyPrograms();
                setPrograms(myPrograms);

                // Fetch real dashboard stats
                const dashboardStats = await api.companies.getDashboardStats();
                setStats({
                    activePrograms: dashboardStats.activePrograms,
                    pendingReports: dashboardStats.pendingReports,
                    totalPaid: dashboardStats.totalPaid,
                    avgResolution: dashboardStats.avgResolutionTime
                });
            } catch (error) {
                console.error('Failed to fetch company data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Company Dashboard</h2>
                    <p className="text-muted-foreground mt-2">
                        Manage your bounty programs and incoming reports.
                    </p>
                </div>
                <Link href="/dashboard/company/programs/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Program
                    </Button>
                </Link>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                        <Shield className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activePrograms}</div>
                        <p className="text-xs text-muted-foreground">{programs.length} total programs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reports to Triage</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingReports}</div>
                        <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bounties Paid</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalPaid.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Lifetime payout</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgResolution}</div>
                        <p className="text-xs text-muted-foreground">Across all programs</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* My Programs List */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>My Programs</CardTitle>
                            <CardDescription>Status of your bug bounty programs</CardDescription>
                        </div>
                        <Link href="/dashboard/company/programs">
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {programs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No programs created yet.
                                <div className="mt-4">
                                    <Link href="/dashboard/company/programs/new">
                                        <Button variant="outline">Launch your first program</Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {programs.slice(0, 3).map(program => (
                                    <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                {program.programName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{program.programName}</h4>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Badge variant={program.status?.toUpperCase() === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px] h-5">
                                                        {program.status}
                                                    </Badge>
                                                    <span>{program.programType}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{program.totalValidReports || 0} Reports</p>
                                            <Link href={`/dashboard/company/programs/${program.id}`}>
                                                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                                    Manage <ArrowRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity / Action Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Action Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3 items-start p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-sm text-yellow-900 dark:text-yellow-400">Review Critical Report</p>
                                <p className="text-xs text-yellow-800/80 dark:text-yellow-500/80 mt-1">
                                    Report #8291 marked as Critical needs triage.
                                </p>
                                <Button size="sm" variant="ghost" className="h-6 px-0 text-yellow-700 hover:text-yellow-900 hover:bg-transparent mt-2">
                                    View Report
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                            <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-sm text-blue-900 dark:text-blue-400">Fund Wallet</p>
                                <p className="text-xs text-blue-800/80 dark:text-blue-500/80 mt-1">
                                    Balance is low. Add funds to ensure bounty payouts.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
