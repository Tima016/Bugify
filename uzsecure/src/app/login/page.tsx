'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            console.log('[handleSubmit] Starting login...');
            
            await login(formData.emailOrUsername, formData.password);
            console.log('[handleSubmit] Login API call completed');

            // Get the user from store after login completes
            const state = useAuthStore.getState();
            const user = state.user;
            const role = user?.role?.toUpperCase();
            const isAuthenticated = state.isAuthenticated;

            console.log('[handleSubmit] User after login:', user);
            console.log('[handleSubmit] Role:', role);
            console.log('[handleSubmit] Is authenticated:', isAuthenticated);

            if (!user || !isAuthenticated) {
                console.error('[handleSubmit] User not set or not authenticated after login');
                return;
            }

            setIsRedirecting(true);

            // Small delay to ensure cookies are set and state is propagated
            setTimeout(() => {
                try {
                    if (role === 'ADMIN') {
                        console.log('[handleSubmit] Redirecting to /admin');
                        router.push('/admin');
                    } else if (role === 'COMPANY') {
                        console.log('[handleSubmit] Redirecting to /company');
                        router.push('/company');
                    } else {
                        console.log('[handleSubmit] Redirecting to /dashboard');
                        router.push('/dashboard');
                    }
                } catch (error) {
                    console.error('[handleSubmit] Redirect error:', error);
                    setIsRedirecting(false);
                }
            }, 100);
        } catch (error) {
            console.error('Login failed:', error);
            setIsRedirecting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your UzSecure account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="emailOrUsername" className="text-sm font-medium">
                                Email or Username
                            </label>
                            <input
                                id="emailOrUsername"
                                name="emailOrUsername"
                                type="text"
                                required
                                value={formData.emailOrUsername}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                placeholder="Enter your email or username"
                                disabled={isLoading || isRedirecting}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                placeholder="Enter your password"
                                disabled={isLoading || isRedirecting}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || isRedirecting}
                        >
                            {isRedirecting ? 'Redirecting...' : isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </div>
                    <div className="text-sm text-center text-muted-foreground">
                        <Link href="/" className="hover:underline">
                            ← Back to home
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
