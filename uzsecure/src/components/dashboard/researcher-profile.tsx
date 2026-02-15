'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Shield, Bell, User, Key, Save, Mail, Camera } from 'lucide-react';
import { toast } from 'sonner';

export function ResearcherProfile() {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Profile updated successfully');
        setIsLoading(false);
    };

    const container = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-5xl mx-auto"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                        Researcher Profile
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Manage your account settings and preferences.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-8">
                <TabsList className="bg-muted border border-border p-1 inline-flex rounded-xl w-full md:w-auto h-auto">
                    <TabsTrigger
                        value="profile"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all px-6 py-2.5 rounded-lg flex-1 md:flex-none"
                    >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger
                        value="security"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all px-6 py-2.5 rounded-lg flex-1 md:flex-none"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger
                        value="notifications"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all px-6 py-2.5 rounded-lg flex-1 md:flex-none"
                    >
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="border-border bg-card/50 backdrop-blur-sm">
                        <CardHeader className="border-b border-border pb-6">
                            <CardTitle className="text-xl">Profile Information</CardTitle>
                            <CardDescription>Update your personal details and public profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-premium-accent/20 rounded-full blur-xl group-hover:bg-premium-accent/30 transition-colors" />
                                    <Avatar className="h-28 w-28 border-4 border-background ring-2 ring-border relative z-10">
                                        <AvatarImage src={user?.profilePictureUrl} />
                                        <AvatarFallback className="text-3xl bg-gradient-to-br from-premium-accent to-purple-600 text-white font-bold">
                                            {user?.username?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button className="absolute bottom-0 right-0 p-2 bg-premium-accent text-white rounded-full shadow-lg hover:bg-premium-accent/90 transition-colors z-20 ring-4 ring-background">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2 text-center md:text-left">
                                    <h3 className="font-bold text-2xl text-foreground">{user?.username}</h3>
                                    <p className="text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
                                        <Mail className="w-4 h-4" />
                                        {user?.email}
                                    </p>
                                    <div className="pt-2">
                                        <Button variant="outline" size="sm" className="bg-background hover:bg-muted border-border">
                                            Change Avatar
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                                        <Input id="firstName" defaultValue={user?.firstName} className="bg-background border-border text-foreground focus:border-premium-accent/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                                        <Input id="lastName" defaultValue={user?.lastName} className="bg-background border-border text-foreground focus:border-premium-accent/50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-foreground">Email Address</Label>
                                    <Input id="email" defaultValue={user?.email} disabled className="bg-muted border-border text-muted-foreground cursor-not-allowed opacity-70" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-foreground">Username</Label>
                                    <Input id="username" defaultValue={user?.username} disabled className="bg-muted border-border text-muted-foreground cursor-not-allowed opacity-70" />
                                </div>

                                <div className="flex justify-end pt-4 border-t border-border">
                                    <Button type="submit" disabled={isLoading} variant="premium" className="w-full md:w-auto min-w-[140px] shadow-premium-glow">
                                        {isLoading ? 'Saving...' : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                    <Card className="border-border bg-card/50 backdrop-blur-sm">
                        <CardHeader className="border-b border-border pb-6">
                            <CardTitle className="text-xl">Password</CardTitle>
                            <CardDescription>Manage your password and security settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 max-w-2xl">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" className="bg-background border-border" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" className="bg-background border-border" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input id="confirm-password" type="password" className="bg-background border-border" />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button variant="outline" className="bg-background hover:bg-muted border-border">Update Password</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-premium-accent/20 bg-gradient-to-br from-card to-premium-accent/5 backdrop-blur-md overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield className="h-32 w-32 text-premium-accent" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                                <div className="p-2 rounded-lg bg-premium-accent/10 text-premium-accent">
                                    <Key className="h-5 w-5" />
                                </div>
                                Two-Factor Authentication
                            </CardTitle>
                            <CardDescription>Add an extra layer of security to your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
                            <div className="space-y-1 text-center sm:text-left">
                                <p className="font-medium text-foreground flex items-center justify-center sm:justify-start gap-2">
                                    Status: <span className="inline-flex items-center px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs border border-red-500/20">Disabled</span>
                                </p>
                                <p className="text-sm text-muted-foreground max-w-md">Protect your account by requiring an authenticator code in addition to your password.</p>
                            </div>
                            <Button variant="premium" className="w-full sm:w-auto shadow-premium-glow">Enable 2FA</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="focus-visible:outline-none focus-visible:ring-0">
                    <Card className="border-border bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl">Notification Preferences</CardTitle>
                            <CardDescription>Choose what you want to be notified about.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/50">
                                <Bell className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                <h3 className="text-lg font-medium text-foreground">Coming Soon</h3>
                                <p className="mt-2 text-sm">Granular notification settings are being developed.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
