'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, ArrowRight, Loader2, Bug, CheckCircle2, User, Store, AlertCircle } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

import { Suspense } from 'react';

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { register, isLoading, error, clearError } = useAuthStore();
    const [role, setRole] = useState<'RESEARCHER' | 'COMPANY'>('RESEARCHER');
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'COMPANY') {
            setRole('COMPANY');
        } else if (roleParam === 'RESEARCHER') {
            setRole('RESEARCHER');
        }
    }, [searchParams]);

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        companyName: '',
        agreeToTerms: false,
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.email.includes('@')) {
            errors.email = 'Please enter a valid email address';
        }

        if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (role === 'COMPANY' && !formData.companyName.trim()) {
            errors.companyName = 'Company name is required';
        }

        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }

        if (!formData.agreeToTerms) {
            errors.agreeToTerms = 'You must agree to the terms and conditions';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!validateForm()) {
            return;
        }

        try {
            console.log('[handleSubmit] Starting registration...');

            await register({
                email: formData.email,
                username: formData.username,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: role,
                companyName: role === 'COMPANY' ? formData.companyName : undefined,
            });
            console.log('[handleSubmit] Registration API call completed');

            // Get the user from store after registration completes
            const state = useAuthStore.getState();
            const user = state.user;

            console.log('[handleSubmit] User after registration:', user);

            if (!user) {
                console.error('[handleSubmit] No user in state after registration');
                return;
            }

            setIsRedirecting(true);

            // Small delay to ensure cookies are set and state is propagated
            setTimeout(() => {
                console.log('[handleSubmit] Redirecting to /dashboard');
                router.push('/dashboard');
            }, 100);
        } catch (error) {
            console.error('Registration failed:', error);
            setIsRedirecting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: '',
            });
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground overflow-hidden selection:bg-premium-accent/30">
            {/* Visual Side (Premium Animated) */}
            <div className="relative hidden lg:flex items-center justify-center p-12 bg-muted overflow-hidden order-2">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-premium-accent/20 rounded-full blur-[128px] animate-pulse-slow" />
                    <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
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
                            Join the Network
                        </div>

                        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight text-foreground">
                            Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-premium-accent to-blue-500">Journey</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                            Create an account to access the platform. Choose your role and start making an impact securely.
                        </p>

                        <div className="grid gap-6">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-md shadow-lg"
                            >
                                <User className="h-10 w-10 text-premium-accent mb-4" />
                                <h3 className="text-xl font-bold mb-2 text-foreground">For Researchers</h3>
                                <p className="text-muted-foreground">Find vulnerabilities, report bugs, and earn bounties from verified companies.</p>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-md shadow-lg"
                            >
                                <Store className="h-10 w-10 text-purple-500 mb-4" />
                                <h3 className="text-xl font-bold mb-2 text-foreground">For Companies</h3>
                                <p className="text-muted-foreground">Protect your assets with crowdsourced security. verified programs and expert triage.</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16 relative overflow-y-auto order-1 bg-background h-screen">
                <div className="absolute top-6 left-6 lg:left-12 z-20">
                    <BackButton />
                </div>

                <Card variant="glass" className="w-full max-w-lg p-8 md:p-10 border-premium-accent/10 shadow-premium mt-12 lg:mt-0">
                    <div className="text-center lg:text-left mb-8">
                        <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-premium-accent text-white shadow-premium-glow group-hover:bg-premium-accent-dark transition-all duration-300">
                                <Shield className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">UzSecure</span>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Create an account</h2>
                        <p className="text-muted-foreground">
                            Enter your details to register
                        </p>
                    </div>

                    <Tabs value={role} onValueChange={(v) => setRole(v as any)} className="w-full mb-8">
                        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 p-1">
                            <TabsTrigger value="RESEARCHER" className="flex items-center gap-2 h-10 data-[state=active]:bg-background data-[state=active]:text-premium-accent data-[state=active]:shadow-sm">
                                <User className="h-4 w-4" /> Researcher
                            </TabsTrigger>
                            <TabsTrigger value="COMPANY" className="flex items-center gap-2 h-10 data-[state=active]:bg-background data-[state=active]:text-purple-500 data-[state=active]:shadow-sm">
                                <Store className="h-4 w-4" /> Company
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2 font-medium"
                            >
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </motion.div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="text-sm font-medium ml-1">First Name</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                    placeholder="John"
                                />
                                {validationErrors.firstName && <p className="text-xs text-destructive ml-1">{validationErrors.firstName}</p>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="lastName" className="text-sm font-medium ml-1">Last Name</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                    placeholder="Doe"
                                />
                                {validationErrors.lastName && <p className="text-xs text-destructive ml-1">{validationErrors.lastName}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium ml-1">{role === 'COMPANY' ? 'Business Email' : 'Email'}</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                placeholder={role === 'COMPANY' ? "security@company.com" : "john@example.com"}
                            />
                            {validationErrors.email && <p className="text-xs text-destructive ml-1">{validationErrors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium ml-1">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                placeholder="johndoe"
                            />
                            {validationErrors.username && <p className="text-xs text-destructive ml-1">{validationErrors.username}</p>}
                        </div>

                        {role === 'COMPANY' && (
                            <div className="space-y-2">
                                <label htmlFor="companyName" className="text-sm font-medium ml-1">Company Name</label>
                                <input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    required
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                    placeholder="Acme Corp"
                                />
                                {validationErrors.companyName && <p className="text-xs text-destructive ml-1">{validationErrors.companyName}</p>}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium ml-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                placeholder="••••••••"
                            />
                            {validationErrors.password && <p className="text-xs text-destructive ml-1">{validationErrors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium ml-1">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                                placeholder="••••••••"
                            />
                            {validationErrors.confirmPassword && <p className="text-xs text-destructive ml-1">{validationErrors.confirmPassword}</p>}
                        </div>

                        <div className="flex items-start space-x-2 pt-2 ml-1">
                            <input
                                id="agreeToTerms"
                                name="agreeToTerms"
                                type="checkbox"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                className="mt-1 h-4 w-4 rounded border-input bg-background text-premium-accent focus:ring-premium-accent"
                            />
                            <label htmlFor="agreeToTerms" className="text-xs text-muted-foreground leading-snug">
                                I agree to the{' '}
                                <Link href="/terms" className="text-premium-accent hover:underline">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-premium-accent hover:underline">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>
                        {validationErrors.agreeToTerms && (
                            <p className="text-xs text-destructive ml-1">{validationErrors.agreeToTerms}</p>
                        )}

                        <Button
                            type="submit"
                            variant="premium"
                            className="w-full h-11 font-medium mt-4 shadow-premium-glow"
                            disabled={isLoading || isRedirecting}
                        >
                            {isRedirecting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Redirecting...
                                </>
                            ) : isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                `Create ${role === 'COMPANY' ? 'Company' : 'Researcher'} Account`
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm mt-6">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href="/login" className="font-semibold text-premium-accent hover:text-premium-accent-light hover:underline underline-offset-4 transition-colors">
                            Sign in
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><Loader2 className="h-8 w-8 animate-spin text-premium-accent" /></div>}>
            <RegisterContent />
        </Suspense>
    );
}
