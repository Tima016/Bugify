'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import {
    LayoutDashboard,
    Users,
    Building2,
    FileText,
    Wallet,
    Receipt, // Added Receipt to icon imports
    BarChart3,
    LogOut,
    Menu,
    X,
    Shield
} from 'lucide-react';
import { useState } from 'react';
import AdminRoute from '@/components/auth/admin-route';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'KYC Queue', href: '/admin/kyc', icon: Shield },
    { name: 'Companies', href: '/admin/companies', icon: Building2 },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Payouts', href: '/admin/payouts', icon: Wallet },
    { name: 'Transactions', href: '/admin/transactions', icon: Receipt }, // Added Transactions nav item
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <AdminRoute>
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
                    className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-orange-900 to-red-900 border-r border-orange-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="flex items-center justify-between h-16 px-6 border-b border-orange-700">
                            <div className="flex items-center gap-2">
                                <Shield className="h-6 w-6 text-orange-200" />
                                <span className="text-xl font-bold text-white">Admin Panel</span>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden text-white"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Admin info */}
                        <div className="px-6 py-4 border-b border-orange-700">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-orange-200 flex items-center justify-center">
                                    <span className="text-orange-900 font-semibold">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-white">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs text-orange-200 truncate">
                                        Administrator
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-orange-800 text-white'
                                            : 'text-orange-100 hover:bg-orange-800/50'
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
                        <div className="px-3 py-4 border-t border-orange-700">
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-orange-100 hover:bg-orange-800/50 w-full transition-colors"
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
                                {navigation.find((item) => item.href === pathname)?.name || 'Admin Dashboard'}
                            </h1>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="p-4 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AdminRoute>
    );
}
