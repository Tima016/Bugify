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
    DollarSign,
    Plus,
    BarChart3,
    ArrowRight,
    Briefcase,
    CheckCircle,
    Activity
} from 'lucide-react';
import { Program } from '@/types';
import { motion } from 'framer-motion';

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

export function CompanyDashboard() {
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
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-2 border-b-2 border-purple-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Briefcase className="h-8 w-8 text-purple-500 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    const statItems = [
        {
            title: 'Active Programs',
            value: stats.activePrograms,
            sub: `${programs.length} total programs`,
            icon: Shield,
            color: 'text-blue-400',
            bgGradient: 'from-blue-500/20 to-blue-600/5',
            borderColor: 'border-blue-500/20'
        },
        {
            title: 'Reports to Triage',
            value: stats.pendingReports,
            sub: 'Requires attention',
            icon: AlertTriangle,
            color: 'text-orange-400',
            bgGradient: 'from-orange-500/20 to-orange-600/5',
            borderColor: 'border-orange-500/20'
        },
        {
            title: 'Total Bounties Paid',
            value: `$${stats.totalPaid.toLocaleString()}`,
            sub: 'Lifetime payout',
            icon: DollarSign,
            color: 'text-green-400',
            bgGradient: 'from-green-500/20 to-green-600/5',
            borderColor: 'border-green-500/20'
        },
        {
            title: 'Avg Resolution Time',
            value: stats.avgResolution,
            sub: 'Across all programs',
            icon: Activity,
            color: 'text-purple-400',
            bgGradient: 'from-purple-500/20 to-purple-600/5',
            borderColor: 'border-purple-500/20'
        }
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-1">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-2">
                        Company Dashboard
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Manage your bounty programs and incoming reports.
                    </p>
                </div>
                <Link href="/dashboard/company/programs/new">
                    <Button variant="premium" className="shadow-premium-glow">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Program
                    </Button>
                </Link>
            </motion.div>

            {/* Key Metrics */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statItems.map((stat) => (
                    <div key={stat.title} className="group relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <Card className="relative border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 overflow-hidden h-full">
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl border ${stat.borderColor} bg-background/50`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    {stat.title === 'Reports to Triage' && Number(stat.value) > 0 && (
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                        </span>
                                    )}
                                </div>
                                <div className="text-3xl font-bold tracking-tight text-white">{stat.value}</div>
                                <p className="text-sm font-medium text-muted-foreground mt-1">{stat.title}</p>
                                <p className="text-xs text-muted-foreground/50 mt-2">{stat.sub}</p>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </motion.div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* My Programs List */}
                <motion.div variants={item} className="lg:col-span-2">
                    <Card variant="glass" className="h-full border-premium-accent/10">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <div className="p-2 rounded-lg bg-premium-accent/10 text-premium-accent">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    My Programs
                                </CardTitle>
                                <CardDescription className="mt-1">Status of your bug bounty programs</CardDescription>
                            </div>
                            <Link href="/dashboard/company/programs">
                                <Button variant="ghost" size="sm" className="hover:bg-premium-accent/10 hover:text-premium-accent group">
                                    View All <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {programs.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                                    <h3 className="text-lg font-medium text-white">No programs yet</h3>
                                    <p className="max-w-xs mx-auto mt-2 mb-6">Create your first bug bounty program to start receiving reports.</p>
                                    <Link href="/dashboard/company/programs/new">
                                        <Button variant="premium">Launch Program</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {programs.slice(0, 3).map((program, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            key={program.id}
                                        >
                                            <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-white/5 hover:bg-white/10 hover:border-premium-accent/30 transition-all duration-300 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-premium-accent to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-premium-accent/20">
                                                        {program.programName.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-white group-hover:text-premium-accent transition-colors">{program.programName}</h4>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                            <Badge variant="outline" className={`${program.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'} text-[10px] h-5 px-1.5`}>
                                                                {program.status}
                                                            </Badge>
                                                            <span>{program.programType}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <p className="font-medium text-white">{program.totalValidReports || 0} Reports</p>
                                                    <Link href={`/dashboard/company/programs/${program.id}`}>
                                                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-premium-accent hover:text-white mt-1">
                                                            Manage <ArrowRight className="ml-1 h-3 w-3" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Activity / Action Items */}
                <motion.div variants={item}>
                    <Card variant="glass" className="h-full border-white/5">
                        <CardHeader className="border-b border-white/5 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-400" />
                                Action Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            {/* Static mock data for now, ideally dynamic */}
                            <div className="flex gap-3 items-start p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl hover:bg-orange-500/15 transition-colors cursor-pointer group">
                                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-sm text-orange-400 group-hover:text-orange-300 transition-colors">Review Critical Report</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Report #8291 marked as Critical needs triage.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/15 transition-colors cursor-pointer group">
                                <DollarSign className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-sm text-blue-400 group-hover:text-blue-300 transition-colors">Fund Wallet</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Balance is low. Add funds to ensure bounty payouts.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center pt-4">
                                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white">
                                    View All Actions
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
