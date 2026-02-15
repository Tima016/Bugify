'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowRight, Loader2, Bug, CheckCircle2, User } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

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
                        // Company users also go to dashboard, the dashboard page handles the view
                        console.log('[handleSubmit] Redirecting to /dashboard (Company)');
                        router.push('/dashboard');
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
        <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground overflow-hidden selection:bg-premium-accent/30">
            {/* Visual Side (Premium Animated) */}
            <div className="relative hidden lg:flex items-center justify-center p-12 bg-muted overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-premium-accent/20 rounded-full blur-[128px] animate-pulse-slow" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-premium-accent/30 bg-premium-accent/10 px-4 py-1.5 text-sm font-medium text-premium-accent mb-8 backdrop-blur-md shadow-premium-glow">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-premium-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-premium-accent"></span>
                            </span>
                            Secure Access Portal
                        </div>

                        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight text-foreground">
                            Secure the <span className="text-transparent bg-clip-text bg-gradient-to-r from-premium-accent to-purple-500">Future</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                            Join the elite community of researchers and companies building a safer digital Uzbekistan.
                        </p>

                        <div className="space-y-6">
                            {[
                                'Access to exclusive bug bounty programs',
                                'Real-time vulnerability reporting and tracking',
                                'Secure payments and verified payouts',
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (index * 0.1) }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm shadow-sm"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-premium-accent/20 flex items-center justify-center text-premium-accent">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <span className="text-foreground/90 font-medium">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-background relative">
                <div className="absolute top-8 left-8 lg:left-12 z-20">
                    <BackButton />
                </div>

                <Card variant="glass" className="w-full max-w-md p-8 md:p-12 border-premium-accent/10 shadow-premium">
                    <div className="text-center lg:text-left mb-10">
                        <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-premium-accent text-white shadow-premium-glow group-hover:bg-premium-accent-dark transition-all duration-300">
                                <Shield className="h-7 w-7" />
                            </div>
                            <span className="text-3xl font-bold tracking-tight">UzSecure</span>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="emailOrUsername" className="text-sm font-medium ml-1">
                                    Email or Username
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-premium-accent transition-colors" />
                                    <input
                                        id="emailOrUsername"
                                        name="emailOrUsername"
                                        type="text"
                                        required
                                        value={formData.emailOrUsername}
                                        onChange={handleChange}
                                        className="flex h-12 w-full rounded-lg border border-input bg-background/50 pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                        placeholder="name@example.com"
                                        disabled={isLoading || isRedirecting}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </label>
                                    <Link href="/forgot-password" className="text-xs font-medium text-premium-accent hover:text-premium-accent-light transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-premium-accent transition-colors" />
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="flex h-12 w-full rounded-lg border border-input bg-background/50 pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                        placeholder="••••••••"
                                        disabled={isLoading || isRedirecting}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="premium"
                            className="w-full h-12 text-base shadow-premium-glow mt-2"
                            disabled={isLoading || isRedirecting}
                        >
                            {isRedirecting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Redirecting...
                                </>
                            ) : isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm mt-8">
                        <span className="text-muted-foreground">Don&apos;t have an account? </span>
                        <Link href="/register" className="font-semibold text-premium-accent hover:text-premium-accent-light hover:underline underline-offset-4 transition-colors">
                            Sign up for free
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
