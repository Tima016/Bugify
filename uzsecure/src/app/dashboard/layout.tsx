'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import {
    Home,
    FileText,
    Shield,
    Trophy,
    Settings,
    LogOut,
    Menu,
    X,
    Wallet,
    Bell,
    User,
    ChevronRight,
    Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/protected-route';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['RESEARCHER', 'COMPANY'] },
    { name: 'My Reports', href: '/dashboard/reports', icon: FileText, roles: ['RESEARCHER'] },
    { name: 'Programs', href: '/programs', icon: Shield, roles: ['RESEARCHER'] },
    { name: 'My Programs', href: '/dashboard/company/programs', icon: Shield, roles: ['COMPANY'] },
    { name: 'Incoming Reports', href: '/dashboard/company/reports', icon: FileText, roles: ['COMPANY'] },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, roles: ['RESEARCHER', 'COMPANY'] },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet, roles: ['RESEARCHER', 'COMPANY'] },
    { name: 'Profile', href: '/dashboard/profile', icon: User, roles: ['RESEARCHER', 'COMPANY'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-foreground flex selection:bg-premium-accent/30">
                {/* Mobile sidebar backdrop */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar */}
                <motion.aside
                    className={cn(
                        "fixed top-0 left-0 z-50 h-full w-72 bg-card/80 backdrop-blur-xl border-r border-white/10 lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out shadow-2xl",
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    )}
                >
                    <div className="flex flex-col h-full bg-gradient-to-b from-transparent via-transparent to-premium-accent/5">
                        {/* Logo */}
                        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-premium-accent to-purple-600 flex items-center justify-center text-white shadow-premium-glow group-hover:scale-105 transition-transform duration-300">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                                    UzSecure
                                </span>
                            </Link>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-2 rounded-md hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* User info */}
                        <div className="p-6">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner group hover:border-premium-accent/30 transition-colors duration-300">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-premium-accent to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-premium-accent/20 ring-2 ring-white/10">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate group-hover:text-premium-accent transition-colors">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            @{user?.username}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs bg-black/20 rounded-lg p-2 border border-white/5">
                                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                                        <Zap className="h-3 w-3 text-yellow-500" /> Reputation
                                    </span>
                                    <span className="font-bold text-premium-accent">{user?.reputationScore || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                            <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Menu
                            </div>
                            {navigation.map((item) => {
                                // SECURITY: Get role from JWT token, not localStorage
                                const userRole = useAuthStore.getState().getUserRole();
                                if (userRole && item.roles && !item.roles.includes(userRole)) {
                                    return null;
                                }
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                            isActive
                                                ? 'text-white bg-premium-accent shadow-premium-glow'
                                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shimmer" />
                                        )}
                                        <div className="flex items-center gap-3 relative z-10">
                                            <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : "text-muted-foreground group-hover:text-premium-accent")} />
                                            <span>{item.name}</span>
                                        </div>
                                        {isActive && <ChevronRight className="h-4 w-4 text-white/70" />}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Logout */}
                        <div className="p-4 border-t border-white/10">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 w-full transition-all duration-200 group"
                            >
                                <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </motion.aside>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0 lg:ml-0 transition-all duration-300 relative">
                    {/* Background Ambient Glow */}
                    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-premium-accent/5 rounded-full blur-[128px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[128px]" />
                    </div>

                    {/* Top bar */}
                    <header
                        className={cn(
                            "sticky top-0 z-30 h-20 flex items-center justify-between px-4 lg:px-8 transition-all duration-300",
                            isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-sm" : "bg-transparent"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 -ml-2 rounded-md hover:bg-white/5 text-foreground transition-colors"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            {/* <h1 className="text-xl font-bold tracking-tight">
                                {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
                            </h1> */}
                            {/* Breadcrumb or simple title can go here */}
                            <div />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <ThemeToggle />
                            <NotificationCenter />
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
