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
    Wallet
} from 'lucide-react';
import { useState } from 'react';
import ProtectedRoute from '@/components/auth/protected-route';
import { NotificationCenter } from '@/components/notifications/notification-center';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['RESEARCHER', 'COMPANY'] },
    { name: 'My Reports', href: '/dashboard/reports', icon: FileText, roles: ['RESEARCHER'] },
    { name: 'Programs', href: '/programs', icon: Shield, roles: ['RESEARCHER'] }, // Researchers browse, Companies manage
    { name: 'My Programs', href: '/dashboard/company/programs', icon: Shield, roles: ['COMPANY'] },
    { name: 'Incoming Reports', href: '/dashboard/company/reports', icon: FileText, roles: ['COMPANY'] },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, roles: ['RESEARCHER', 'COMPANY'] },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet, roles: ['RESEARCHER', 'COMPANY'] }, // Companies fund, Researchers withdraw
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['RESEARCHER', 'COMPANY'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                {/* Mobile sidebar backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                            <Link href="/" className="text-xl font-bold text-primary">
                                UzSecure
                            </Link>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* User info */}
                        <div className="px-6 py-4 border-b border-border">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary font-semibold">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        @{user?.username}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Reputation</span>
                                <span className="font-semibold text-primary">{user?.reputationScore || 0}</span>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-foreground hover:bg-accent'
                                            }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Logout */}
                        <div className="px-3 py-4 border-t border-border">
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent w-full transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <div className="lg:pl-64">
                    {/* Top bar */}
                    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden mr-4"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <h1 className="text-lg font-semibold">
                                {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationCenter />
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="p-4 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
