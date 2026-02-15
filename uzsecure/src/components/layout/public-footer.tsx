import Link from 'next/link';
import { Github, Twitter, Linkedin, Shield, Mail, MapPin, Facebook, Youtube } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function PublicFooter() {
    return (
        <footer className="bg-background border-t border-border relative overflow-hidden pt-16 pb-8">
            {/* Background elements */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
                    {/* Platform Column */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Platform</h3>
                        <ul className="space-y-3">
                            <FooterLink href="/platform/bug-bounty">Bug Bounty</FooterLink>
                            <FooterLink href="/platform/vdb">Vulnerability Disclosure</FooterLink>
                            <FooterLink href="/platform/pentest">Penetration Testing</FooterLink>
                            <FooterLink href="/platform/asm">Attack Surface Mgmt</FooterLink>
                            <FooterLink href="/intake">Vulnerability Intake</FooterLink>
                        </ul>
                    </div>

                    {/* Solutions Column */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Solutions</h3>
                        <ul className="space-y-3">
                            <FooterLink href="/solutions/enterprise">For Enterprise</FooterLink>
                            <FooterLink href="/solutions/government">For Government</FooterLink>
                            <FooterLink href="/solutions/startups">For Startups</FooterLink>
                            <FooterLink href="/solutions/financial">Financial Services</FooterLink>
                            <FooterLink href="/solutions/healthcare">Healthcare</FooterLink>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <FooterLink href="/blog">Blog</FooterLink>
                            <FooterLink href="/case-studies">Case Studies</FooterLink>
                            <FooterLink href="/docs">Documentation</FooterLink>
                            <FooterLink href="/academy">UzSecure Academy</FooterLink>
                            <FooterLink href="/hacktivity">Hacktivity</FooterLink>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Company</h3>
                        <ul className="space-y-3">
                            <FooterLink href="/about">About Us</FooterLink>
                            <FooterLink href="/careers">Careers <span className="text-[10px] ml-1 bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Hiring</span></FooterLink>
                            <FooterLink href="/partners">Partners</FooterLink>
                            <FooterLink href="/trust">Trust & Security</FooterLink>
                            <FooterLink href="/contact">Contact Us</FooterLink>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <FooterLink href="/privacy">Privacy Policy</FooterLink>
                            <FooterLink href="/terms">Terms of Service</FooterLink>
                            <FooterLink href="/cookies">Cookie Policy</FooterLink>
                            <FooterLink href="/responsible-disclosure">Responsible Disclosure</FooterLink>
                        </ul>
                    </div>
                </div>

                <Separator className="my-8 bg-border/50" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col gap-2">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                <Shield className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">UzSecure</span>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                            The world's most trusted crowdsourced security platform.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <SocialLink href="#" icon={<Twitter className="h-4 w-4" />} label="Twitter" />
                        <SocialLink href="#" icon={<Github className="h-4 w-4" />} label="GitHub" />
                        <SocialLink href="#" icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
                        <SocialLink href="#" icon={<Youtube className="h-4 w-4" />} label="YouTube" />
                    </div>
                </div>
                <div className="mt-8 text-center md:text-left text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} UzSecure Inc. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <a
            href={href}
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-background text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
        >
            {icon}
        </a>
    )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors block">
                {children}
            </Link>
        </li>
    )
}
