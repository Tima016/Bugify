'use client';

import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import {
    Building2,
    Globe,
    Users,
    MapPin,
    Calendar,
    Shield,
    CheckCircle,
    AlertCircle,
    Zap,
    TrendingUp,
    Lock,
    Mail,
    Edit
} from 'lucide-react';

export function CompanyProfile() {
    const { user } = useAuthStore();

    // Mock data for company stats (since backend modifications are forbidden)
    const stats = [
        { label: 'Active Programs', value: '3', icon: Shield, color: 'text-blue-400', border: 'border-blue-400/20', bg: 'bg-blue-400/10' },
        { label: 'Bounties Paid', value: '$124,500', icon: Zap, color: 'text-yellow-400', border: 'border-yellow-400/20', bg: 'bg-yellow-400/10' },
        { label: 'Resolved Reports', value: '86', icon: CheckCircle, color: 'text-green-400', border: 'border-green-400/20', bg: 'bg-green-400/10' },
        { label: 'Avg Response', value: '12h', icon: TrendingUp, color: 'text-purple-400', border: 'border-purple-400/20', bg: 'bg-purple-400/10' },
    ];

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
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-7xl mx-auto"
        >
            {/* Hero Section */}
            <motion.div variants={item} className="relative rounded-3xl overflow-hidden border border-border bg-card/50 backdrop-blur-sm shadow-xl">
                {/* Banner Background */}
                <div className="h-48 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 relative">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
                </div>

                <div className="px-8 pb-8">
                    <div className="relative -mt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-premium-accent/20 rounded-2xl blur-xl" />
                            <Avatar className="h-32 w-32 rounded-2xl border-4 border-background shadow-2xl relative z-10">
                                <AvatarImage src={user?.profilePictureUrl} className="object-cover" />
                                <AvatarFallback className="rounded-2xl text-4xl font-bold bg-gradient-to-br from-gray-800 to-black text-white">
                                    {user?.companyName?.[0] || 'C'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-background z-20" title="Verified Company">
                                <CheckCircle className="h-5 w-5 fill-green-500 text-white" />
                            </div>
                        </motion.div>

                        <div className="flex-1 space-y-2 text-center md:text-left pt-4 md:pt-0">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground flex items-center justify-center md:justify-start gap-3">
                                    {user?.companyName || 'TechCorp Industries'}
                                    <Badge variant="outline" className="bg-premium-accent/10 text-premium-accent border-premium-accent/20">
                                        Verified
                                    </Badge>
                                </h1>
                                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-1">
                                    <Globe className="h-4 w-4" />
                                    techcorp.io
                                    <span className="text-border mx-2">|</span>
                                    <MapPin className="h-4 w-4" />
                                    San Francisco, CA
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <Button variant="outline" className="flex-1 md:flex-none border-border hover:bg-muted">
                                Public View
                            </Button>
                            <Button variant="premium" className="flex-1 md:flex-none shadow-premium-glow">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-card/50 border-border backdrop-blur-sm hover:border-premium-accent/30 transition-colors group overflow-hidden relative">
                        <CardContent className="p-6 flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-foreground mt-1 group-hover:scale-105 transition-transform origin-left">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.border} border`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </CardContent>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                    </Card>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Overview */}
                <motion.div variants={item} className="lg:col-span-2 space-y-8">
                    <Card className="bg-card/50 border-border backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-premium-accent" />
                                Company Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-muted-foreground leading-relaxed">
                                TechCorp Industries is a leading provider of enterprise security solutions. We are committed to building secure infrastructure and valuing the research community. Our bug bounty program aims to harden our external perimeter and protect customer data through collaboration with top-tier security researchers.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Industry</span>
                                    <p className="text-foreground font-medium flex items-center gap-2">
                                        Technology & SaaS
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Size</span>
                                    <p className="text-foreground font-medium flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        500 - 1,000 Employees
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Founded</span>
                                    <p className="text-foreground font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        2015
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</span>
                                    <p className="text-foreground font-medium flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        security@techcorp.io
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-border backdrop-blur-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-green-500" />
                                Active Programs
                            </CardTitle>
                            <CardDescription>
                                Currently public bug bounty programs
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {[1, 2].map((_, i) => (
                                <div key={i} className="p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold border border-blue-500/20">
                                            TC
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground group-hover:text-premium-accent transition-colors">Core Infrastructure</h4>
                                            <p className="text-sm text-muted-foreground">Public • Up to $15,000</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Column: Security & Policy */}
                <motion.div variants={item} className="space-y-6">
                    <Card className="bg-card/50 border-border backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Lock className="h-4 w-4 text-premium-accent" />
                                Security Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-xl bg-muted/50 border border-border">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">Security Grade</span>
                                    <Badge className="bg-green-500 text-white">A+</Badge>
                                </div>
                                <div className="h-2 bg-background rounded-full overflow-hidden">
                                    <div className="h-full w-[95%] bg-green-500 rounded-full" />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Disclosure Policy
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Vulnerability Intake
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                                    <Users className="h-4 w-4 mr-2" />
                                    Security Team
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
