'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, FileText, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function AdminAnalyticsPage() {
    const [userGrowth, setUserGrowth] = useState<any[]>([]);
    const [reportTrends, setReportTrends] = useState<any[]>([]);
    const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        fetchAnalytics();
    }, [days]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [userGrowthData, reportTrendsData, revenueTrendsData] = await Promise.all([
                api.admin.getAnalytics.userGrowth(days),
                api.admin.getAnalytics.reportTrends(days),
                api.admin.getAnalytics.revenueTrends(days),
            ]);

            setUserGrowth(userGrowthData);
            setReportTrends(reportTrendsData);
            setRevenueTrends(revenueTrendsData);
        } catch (error: any) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Platform performance and trends
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setDays(7)}
                        className={`px-4 py-2 rounded-lg ${days === 7 ? 'bg-primary text-white' : 'bg-muted'}`}
                    >
                        7 Days
                    </button>
                    <button
                        onClick={() => setDays(30)}
                        className={`px-4 py-2 rounded-lg ${days === 30 ? 'bg-primary text-white' : 'bg-muted'}`}
                    >
                        30 Days
                    </button>
                    <button
                        onClick={() => setDays(90)}
                        className={`px-4 py-2 rounded-lg ${days === 90 ? 'bg-primary text-white' : 'bg-muted'}`}
                    >
                        90 Days
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {/* User Growth Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                User Growth
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={userGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#f97316"
                                        strokeWidth={2}
                                        name="New Users"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Report Submissions Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Report Submissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={reportTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                                    <Bar dataKey="high" stackId="a" fill="#f97316" name="High" />
                                    <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
                                    <Bar dataKey="low" stackId="a" fill="#22c55e" name="Low" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Revenue Trends Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Revenue Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={revenueTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#f97316"
                                        fill="#f97316"
                                        fillOpacity={0.3}
                                        name="Revenue ($)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total New Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {userGrowth.reduce((sum, item) => sum + item.count, 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Last {days} days
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {reportTrends.reduce((sum, item) => sum + item.count, 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Last {days} days
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${revenueTrends.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Last {days} days
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
