'use client';

import { PublicFooter } from '@/components/layout/public-footer';
import { PublicHeader } from '@/components/layout/public-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

export default function ContactPage() {
    const benefits = [
        "Pay only for valid results with bug bounties",
        "Continuous 24/7 security testing",
        "Access to elite vetted researchers",
        "Launch your program in days, not weeks",
        "Compliance-ready reporting (SOC2, ISO)",
    ];

    return (
        <div className="min-h-screen bg-black text-foreground selection:bg-premium-accent/30 flex flex-col">
            <PublicHeader />

            <main className="flex-grow pt-20">
                <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
                    {/* Background Effects */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-premium-accent/10 rounded-full blur-[128px] animate-pulse-slow" />
                        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left Column */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-8"
                        >
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                                Proactive cybersecurity starts <span className="text-transparent bg-clip-text bg-gradient-to-r from-premium-accent to-indigo-500">here</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                                Don't wait for a breach to test your defenses. secure your organization with the power of the crowd.
                            </p>

                            <div className="space-y-4 pt-4">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="h-6 w-6 rounded-full bg-premium-accent/20 flex items-center justify-center text-premium-accent shrink-0">
                                            <Check className="h-4 w-4" />
                                        </div>
                                        <span className="text-lg text-white/90">{benefit}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="pt-8 flex items-center gap-8">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-12 w-12 rounded-full border-2 border-black bg-white/10 flex items-center justify-center overflow-hidden">
                                            {/* Placeholder avatars */}
                                            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                                        </div>
                                    ))}
                                    <div className="h-12 w-12 rounded-full border-2 border-black bg-premium-accent flex items-center justify-center text-white font-bold text-xs">
                                        100+
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p className="font-semibold text-white">Trusted by Security Teams</p>
                                    <p>From startups to enterprise</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column - Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        >
                            <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-premium-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName" className="text-white">First Name</Label>
                                            <Input id="firstName" placeholder="John" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-premium-accent/50 transition-colors h-12" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName" className="text-white">Last Name</Label>
                                            <Input id="lastName" placeholder="Doe" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-premium-accent/50 transition-colors h-12" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-white">Work Email</Label>
                                        <Input id="email" type="email" placeholder="john@company.com" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-premium-accent/50 transition-colors h-12" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="company" className="text-white">Company</Label>
                                            <Input id="company" placeholder="Acme Inc." className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-premium-accent/50 transition-colors h-12" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-white">Job Title</Label>
                                            <Input id="title" placeholder="CISO" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-premium-accent/50 transition-colors h-12" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-white">Phone</Label>
                                        <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-premium-accent/50 transition-colors h-12" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="interest" className="text-white">I'm interested in...</Label>
                                        <Select>
                                            <SelectTrigger id="interest" className="bg-white/5 border-white/10 text-white h-12">
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                <SelectItem value="bug-bounty">Bug Bounty Program</SelectItem>
                                                <SelectItem value="pentest">Penetration Testing (PTaaS)</SelectItem>
                                                <SelectItem value="vdb">Vulnerability Disclosure</SelectItem>
                                                <SelectItem value="asm">Attack Surface Management</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country" className="text-white">Country</Label>
                                        <Select>
                                            <SelectTrigger id="country" className="bg-white/5 border-white/10 text-white h-12">
                                                <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                <SelectItem value="uz">Uzbekistan</SelectItem>
                                                <SelectItem value="us">United States</SelectItem>
                                                <SelectItem value="uk">United Kingdom</SelectItem>
                                                <SelectItem value="de">Germany</SelectItem>
                                                <SelectItem value="sg">Singapore</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="source" className="text-white">How did you hear about us? (Optional)</Label>
                                        <Select>
                                            <SelectTrigger id="source" className="bg-white/5 border-white/10 text-white h-12">
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                <SelectItem value="search">Search Engine</SelectItem>
                                                <SelectItem value="social">Social Media</SelectItem>
                                                <SelectItem value="event">Event / Conference</SelectItem>
                                                <SelectItem value="referral">Referral</SelectItem>
                                                <SelectItem value="blog">Blog / Content</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button size="lg" className="w-full h-14 text-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 mt-2">
                                        Talk to an Expert <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground">
                                        By submitting this form, you agree to our <a href="/privacy" className="underline hover:text-white">Privacy Policy</a> and <a href="/terms" className="underline hover:text-white">Terms of Service</a>.
                                    </p>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}
