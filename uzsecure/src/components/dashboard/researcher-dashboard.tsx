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
    Clock,
    Trophy,
    Shield,
    Target,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

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

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

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
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-2 border-b-2 border-premium-accent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="h-8 w-8 text-premium-accent animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: 'Total Reports',
            value: profile?.stats.totalReports || 0,
            icon: FileText,
            color: 'text-blue-400',
            bgGradient: 'from-blue-500/20 to-blue-600/5',
            borderColor: 'border-blue-500/20'
        },
        {
            title: 'Valid Reports',
            value: profile?.stats.validReports || 0,
            icon: CheckCircle,
            color: 'text-green-400',
            bgGradient: 'from-green-500/20 to-green-600/5',
            borderColor: 'border-green-500/20'
        },
        {
            title: 'Success Rate',
            value: `${profile?.stats.successRate.toFixed(0) || 0}%`,
            icon: TrendingUp,
            color: 'text-purple-400',
            bgGradient: 'from-purple-500/20 to-purple-600/5',
            borderColor: 'border-purple-500/20'
        },
        {
            title: 'Total Earned',
            value: `$${parseFloat(profile?.stats.totalEarned || '0').toLocaleString()}`,
            icon: DollarSign,
            color: 'text-yellow-400',
            bgGradient: 'from-yellow-500/20 to-yellow-600/5',
            borderColor: 'border-yellow-500/20'
        },
    ];

    const getSeverityColor = (severity: string) => {
        const colors: Record<string, string> = {
            CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
            HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]',
            MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            LOW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        };
        return colors[severity] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            NEW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            TRIAGED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            ACCEPTED: 'bg-green-500/10 text-green-500 border-green-500/20',
            RESOLVED: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
            DUPLICATE: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        };
        return colors[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Welcome Section */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-1">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-premium-accent to-purple-400">{user?.firstName}</span>! 👋
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Here's what's happening with your bug bounty journey
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/programs">
                        <Button variant="premium" className="shadow-premium-glow">
                            <Target className="mr-2 h-4 w-4" />
                            Find Programs
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.title} className="group relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <Card className="relative border-border bg-card/50 backdrop-blur-md hover:bg-card/80 transition-all duration-300 overflow-hidden h-full shadow-sm">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <stat.icon className="h-24 w-24" />
                            </div>
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl border ${stat.borderColor} bg-background/50`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    {stat.title === 'Success Rate' && (
                                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                            +2.5%
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                                <p className="text-sm font-medium text-muted-foreground mt-1">
                                    {stat.title}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Recent Reports */}
                <motion.div variants={item} className="lg:col-span-2">
                    <Card className="h-full border-border bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                                <div className="p-2 rounded-lg bg-premium-accent/10 text-premium-accent">
                                    <FileText className="h-5 w-5" />
                                </div>
                                Recent Reports
                            </CardTitle>
                            <Link href="/dashboard/reports">
                                <Button variant="ghost" size="sm" className="hover:bg-premium-accent/10 hover:text-premium-accent group">
                                    View All <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {reports.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-card/50">
                                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground">No reports yet</h3>
                                    <p className="text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">Start hunting bugs to populate your dashboard and earn rewards.</p>
                                    <Link href="/programs">
                                        <Button variant="premium">
                                            Browse Programs
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reports.map((report, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={report.id}
                                        >
                                            <Link href={`/dashboard/reports/${report.id}`} className="block group">
                                                <div className="p-4 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-premium-accent/30 transition-all duration-300 relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                                                    <div className="flex items-start justify-between gap-4 relative z-10">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                                                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                                                                    {report.reportNumber}
                                                                </span>
                                                                <Badge variant="outline" className={`${getSeverityColor(report.severity)}`}>
                                                                    {report.severity}
                                                                </Badge>
                                                                <Badge variant="outline" className={`${getStatusColor(report.status)}`}>
                                                                    {report.status}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="font-semibold truncate text-foreground group-hover:text-premium-accent transition-colors">{report.title}</h4>
                                                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                                <Shield className="h-3 w-3" />
                                                                <span className="truncate">
                                                                    {report.program.company.companyName} • {report.program.programName}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            {report.bountyAmount && (
                                                                <p className="text-lg font-bold text-green-500 font-mono drop-shadow-sm">
                                                                    ${parseFloat(report.bountyAmount).toLocaleString()}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {new Date(report.submittedDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Sidebar Widgets */}
                <motion.div variants={item} className="space-y-6">
                    {/* Rank Card */}
                    <Card className="border-premium-accent/20 bg-gradient-to-br from-card to-premium-accent/5 backdrop-blur-md overflow-hidden relative shadow-premium-glow">
                        <div className="absolute top-[-20%] right-[-20%] p-4 opacity-20 rotate-12">
                            <Award className="h-48 w-48 text-premium-accent" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Your Rank
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-6 relative z-10">
                                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-lg">
                                    {profile?.reputationScore || 0}
                                </div>
                                <p className="text-sm text-premium-accent font-medium mt-1 uppercase tracking-wider">Reputation Points</p>

                                <div className="w-full h-3 bg-black/20 rounded-full mt-8 overflow-hidden border border-white/5 relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '70%' }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-premium-accent to-purple-500 absolute top-0 left-0"
                                    />
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:10px_10px] opacity-20" />
                                </div>
                                <div className="flex justify-between w-full mt-2 text-xs text-muted-foreground">
                                    <span>Current Level</span>
                                    <span>Next Level</span>
                                </div>

                                <p className="text-xs text-center mt-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                                    <Zap className="h-3 w-3 inline mr-1 text-yellow-500" />
                                    Top 5% of researchers
                                </p>
                            </div>
                            <Link href="/leaderboard">
                                <Button variant="outline" className="w-full mt-6 border-white/10 bg-white/5 hover:bg-premium-accent hover:text-white hover:border-premium-accent transition-all duration-300">
                                    View Leaderboard
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card variant="glass" className="border-white/5">
                        <CardHeader>
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/programs">
                                <Button className="w-full justify-start hover:bg-white/5 hover:text-premium-accent border-transparent" variant="outline">
                                    <Target className="mr-2 h-4 w-4 text-premium-accent" />
                                    Browse Programs
                                </Button>
                            </Link>
                            <Link href="/dashboard/settings">
                                <Button className="w-full justify-start hover:bg-white/5 hover:text-green-400 border-transparent" variant="outline">
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    Complete Profile
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
