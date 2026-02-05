'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, FileText, Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
    users: {
        total: number;
        researchers: number;
        companies: number;
        admins: number;
    };
    payouts: {
        pending: {
            count: number;
            value: number;
        };
    };
    programs: {
        active: number;
    };
    reports: {
        total: number;
        pending: number;
        resolved: number;
    };
    revenue: {
        total: number;
    };
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await api.admin.getDashboardStats();
            setStats(data);
        } catch (error: any) {
            console.error('Failed to fetch admin stats:', error);
            toast.error('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Failed to load dashboard data</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats.users.total.toLocaleString(),
            subtitle: `${stats.users.researchers} Researchers, ${stats.users.companies} Companies`,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            title: 'Pending Payouts',
            value: `$${stats.payouts.pending.value.toLocaleString()}`,
            subtitle: `${stats.payouts.pending.count} requests`,
            icon: Wallet,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
        },
        {
            title: 'Active Programs',
            value: stats.programs.active.toLocaleString(),
            subtitle: 'Currently running',
            icon: Building2,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            title: 'Total Reports',
            value: stats.reports.total.toLocaleString(),
            subtitle: `${stats.reports.pending} Pending, ${stats.reports.resolved} Resolved`,
            icon: FileText,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            title: 'Platform Revenue',
            value: `$${stats.revenue.total.toLocaleString()}`,
            subtitle: 'Total paid out',
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Platform overview and key metrics
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.subtitle}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <a
                            href="/admin/payouts"
                            className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
                        >
                            <Wallet className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                            <p className="font-medium">Process Payouts</p>
                            <p className="text-sm text-muted-foreground">
                                {stats.payouts.pending.count} pending
                            </p>
                        </a>
                        <a
                            href="/admin/users"
                            className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
                        >
                            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <p className="font-medium">Manage Users</p>
                            <p className="text-sm text-muted-foreground">
                                {stats.users.total} total users
                            </p>
                        </a>
                        <a
                            href="/admin/companies"
                            className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
                        >
                            <Building2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <p className="font-medium">Verify Companies</p>
                            <p className="text-sm text-muted-foreground">
                                Review applications
                            </p>
                        </a>
                        <a
                            href="/admin/reports"
                            className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
                        >
                            <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                            <p className="font-medium">View Reports</p>
                            <p className="text-sm text-muted-foreground">
                                {stats.reports.pending} pending review
                            </p>
                        </a>
                    </div>
                </CardContent>
            </Card>

            {/* User Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>User Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Researchers</p>
                                        <p className="text-sm text-muted-foreground">Security experts</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-bold">{stats.users.researchers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Companies</p>
                                        <p className="text-sm text-muted-foreground">Program owners</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-bold">{stats.users.companies}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Administrators</p>
                                        <p className="text-sm text-muted-foreground">Platform staff</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-bold">{stats.users.admins}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Report Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Total Reports</p>
                                    <p className="text-sm text-muted-foreground">All time</p>
                                </div>
                                <span className="text-2xl font-bold">{stats.reports.total}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Pending Review</p>
                                    <p className="text-sm text-muted-foreground">Needs attention</p>
                                </div>
                                <span className="text-2xl font-bold text-orange-600">{stats.reports.pending}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Resolved</p>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                </div>
                                <span className="text-2xl font-bold text-green-600">{stats.reports.resolved}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
