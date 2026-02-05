'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs from shadcn
import { Store, User } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isLoading, error, clearError } = useAuthStore();
    const [role, setRole] = useState<'RESEARCHER' | 'COMPANY'>('RESEARCHER');
    const [isRedirecting, setIsRedirecting] = useState(false);

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
                    <CardDescription className="text-center">
                        Join UzSecure and start your journey
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="RESEARCHER" onValueChange={(v) => setRole(v as any)} className="w-full mb-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="RESEARCHER" className="flex items-center gap-2">
                                <User className="h-4 w-4" /> Researcher
                            </TabsTrigger>
                            <TabsTrigger value="COMPANY" className="flex items-center gap-2">
                                <Store className="h-4 w-4" /> Company
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="text-sm font-medium">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                    placeholder="John"
                                />
                                {validationErrors.firstName && (
                                    <p className="text-xs text-red-600">{validationErrors.firstName}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="lastName" className="text-sm font-medium">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                    placeholder="Doe"
                                />
                                {validationErrors.lastName && (
                                    <p className="text-xs text-red-600">{validationErrors.lastName}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                {role === 'COMPANY' ? 'Business Email' : 'Email'}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                placeholder={role === 'COMPANY' ? "security@company.com" : "john@example.com"}
                            />
                            {validationErrors.email && (
                                <p className="text-xs text-red-600">{validationErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                placeholder="johndoe"
                            />
                            {validationErrors.username && (
                                <p className="text-xs text-red-600">{validationErrors.username}</p>
                            )}
                        </div>

                        {role === 'COMPANY' && (
                            <div className="space-y-2">
                                <label htmlFor="companyName" className="text-sm font-medium">
                                    Company Name
                                </label>
                                <input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    required
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                    placeholder="Acme Corp"
                                />
                                {validationErrors.companyName && (
                                    <p className="text-xs text-red-600">{validationErrors.companyName}</p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                placeholder="••••••••"
                            />
                            {validationErrors.password && (
                                <p className="text-xs text-red-600">{validationErrors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                placeholder="••••••••"
                            />
                            {validationErrors.confirmPassword && (
                                <p className="text-xs text-red-600">{validationErrors.confirmPassword}</p>
                            )}
                        </div>

                        <div className="flex items-start space-x-2">
                            <input
                                id="agreeToTerms"
                                name="agreeToTerms"
                                type="checkbox"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                className="mt-1"
                            />
                            <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground">
                                I agree to the{' '}
                                <Link href="/terms" className="text-primary hover:underline">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-primary hover:underline">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>
                        {validationErrors.agreeToTerms && (
                            <p className="text-xs text-red-600">{validationErrors.agreeToTerms}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || isRedirecting}
                        >
                            {isRedirecting ? 'Redirecting...' : isLoading ? 'Creating account...' : `Create ${role === 'COMPANY' ? 'Company' : 'Researcher'} Account`}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Sign in
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
