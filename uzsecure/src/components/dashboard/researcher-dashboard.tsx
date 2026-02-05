'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    TrendingUp,
    DollarSign,
    FileText,
    Award,
    ArrowRight,
    CheckCircle,
    Clock
} from 'lucide-react';

interface UserProfile {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    reputationScore: number;
    totalEarnings: string;
    stats: {
        totalReports: number;
        validReports: number;
        successRate: number;
        totalEarned: string;
    };
}

interface Report {
    id: string;
    reportNumber: string;
    title: string;
    severity: string;
    status: string;
    bountyAmount: string | null;
    submittedDate: string;
    program: {
        programName: string;
        slug: string;
        company: {
            companyName: string;
        };
    };
}

export function ResearcherDashboard() {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileData, reportsData] = await Promise.all([
                    api.users.getProfile(),
                    api.reports.getMyReports(),
                ]);
                setProfile(profileData);
                setReports(reportsData.slice(0, 5)); // Show only recent 5
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
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

    const stats = [
        {
            title: 'Total Reports',
            value: profile?.stats.totalReports || 0,
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            title: 'Valid Reports',
            value: profile?.stats.validReports || 0,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
        },
        {
            title: 'Success Rate',
            value: `${profile?.stats.successRate.toFixed(0) || 0}%`,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
        {
            title: 'Total Earned',
            value: `$${parseFloat(profile?.stats.totalEarned || '0').toLocaleString()}`,
            icon: DollarSign,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        },
    ];

    const getSeverityColor = (severity: string) => {
        const colors: Record<string, string> = {
            CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        };
        return colors[severity] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            TRIAGED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            RESOLVED: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
            DUPLICATE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h2 className="text-3xl font-bold">
                    Welcome back, {user?.firstName}! 👋
                </h2>
                <p className="text-muted-foreground mt-2">
                    Here's what's happening with your bug bounty journey
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Reports */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Reports</CardTitle>
                    <Link href="/dashboard/reports">
                        <Button variant="ghost" size="sm">
                            View All <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {reports.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No reports yet</p>
                            <Link href="/programs">
                                <Button className="mt-4">
                                    Browse Programs
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report) => (
                                <Link
                                    key={report.id}
                                    href={`/dashboard/reports/${report.id}`}
                                    className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-mono text-sm text-muted-foreground">
                                                    {report.reportNumber}
                                                </span>
                                                <Badge className={getSeverityColor(report.severity)}>
                                                    {report.severity}
                                                </Badge>
                                                <Badge className={getStatusColor(report.status)}>
                                                    {report.status}
                                                </Badge>
                                            </div>
                                            <h4 className="font-semibold mb-1">{report.title}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {report.program.company.companyName} • {report.program.programName}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {report.bountyAmount && (
                                                <p className="text-lg font-bold text-green-600">
                                                    ${parseFloat(report.bountyAmount).toLocaleString()}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(report.submittedDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area: Recommended Programs & Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recommended Programs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-primary" />
                                Recommended for You
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Mock Recommendations - in real app, filter by skills */}
                                {[1, 2].map((i) => (
                                    <div key={i} className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center font-bold text-muted-foreground">
                                                C{i}
                                            </div>
                                            <Badge variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground">
                                                New
                                            </Badge>
                                        </div>
                                        <h4 className="font-semibold truncate">Target Corp {i}</h4>
                                        <p className="text-sm text-muted-foreground mb-3">Enterprise Web App</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-green-600 font-medium">Up to $5,000</span>
                                            <span className="text-muted-foreground">Web</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href="/programs" className="block mt-4 text-center text-sm text-primary hover:underline">
                                Browse all programs
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Submit New Report</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">
                                    Found a vulnerability? Submit a report and earn bounties.
                                </p>
                                <Link href="/programs">
                                    <Button className="w-full">
                                        Browse Programs
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Your Rank</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-3xl font-bold">{profile?.reputationScore || 0}</p>
                                        <p className="text-sm text-muted-foreground">Reputation Points</p>
                                    </div>
                                    <Award className="h-12 w-12 text-yellow-500" />
                                </div>
                                <Link href="/leaderboard">
                                    <Button variant="outline" className="w-full">
                                        View Leaderboard
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Sidebar: Activity Timeline */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border z-0" />

                            {/* Mock Activity Items - Replace with api.notifications.getAll() later */}
                            {[
                                { title: 'Report #1234 Triaged', time: '2 hours ago', icon: CheckCircle, color: 'text-purple-500', bg: 'bg-background' },
                                { title: 'New Comment on #5678', time: '5 hours ago', icon: FileText, color: 'text-blue-500', bg: 'bg-background' },
                                { title: 'Welcome to UzSecure!', time: '1 day ago', icon: Award, color: 'text-yellow-500', bg: 'bg-background' },
                            ].map((item, i) => (
                                <div key={i} className="relative flex gap-3 z-10">
                                    <div className={`h-6 w-6 rounded-full border bg-background flex items-center justify-center shrink-0 ${item.color}`}>
                                        <item.icon className="h-3 w-3" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-xs">View all activity</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
