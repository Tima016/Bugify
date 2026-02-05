import Link from 'next/link';
import { Github, Twitter, Linkedin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function PublicFooter() {
    return (
        <footer className="bg-background border-t border-border">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8">
                        <Link href="/" className="text-2xl font-bold text-primary">
                            UzSecure
                        </Link>
                        <p className="text-sm text-muted-foreground leading-6">
                            Making Uzbekistan's digital infrastructure safer, one bug bounty at a time.
                            Join the community of elite researchers and security-conscious companies.
                        </p>
                        <div className="flex space-x-6">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <span className="sr-only">GitHub</span>
                                <Github className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <span className="sr-only">Twitter</span>
                                <Twitter className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <span className="sr-only">LinkedIn</span>
                                <Linkedin className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Platform</h3>
                                <ul role="list" className="mt-4 space-y-4">
                                    <li>
                                        <Link href="/programs" className="text-sm text-muted-foreground hover:text-primary">
                                            Browse Programs
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-primary">
                                            Leaderboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/register" className="text-sm text-muted-foreground hover:text-primary">
                                            For Researchers
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/register?type=company" className="text-sm text-muted-foreground hover:text-primary">
                                            For Companies
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold text-foreground">Support</h3>
                                <ul role="list" className="mt-4 space-y-4">
                                    <li>
                                        <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary">
                                            Documentation
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/api-docs" className="text-sm text-muted-foreground hover:text-primary">
                                            API Reference
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/guides" className="text-sm text-muted-foreground hover:text-primary">
                                            Guides
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                                            Contact Us
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Company</h3>
                                <ul role="list" className="mt-4 space-y-4">
                                    <li>
                                        <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                                            About
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                                            Blog
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/careers" className="text-sm text-muted-foreground hover:text-primary">
                                            Careers
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/partners" className="text-sm text-muted-foreground hover:text-primary">
                                            Partners
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold text-foreground">Legal</h3>
                                <ul role="list" className="mt-4 space-y-4">
                                    <li>
                                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                                            Privacy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                                            Terms
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary">
                                            Cookie Policy
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-16 border-t border-border pt-8 sm:mt-20 lg:mt-24 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs leading-5 text-muted-foreground">
                        &copy; {new Date().getFullYear()} UzSecure Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                                    <Globe className="h-4 w-4" />
                                    English
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>English</DropdownMenuItem>
                                <DropdownMenuItem>O'zbekcha</DropdownMenuItem>
                                <DropdownMenuItem>Русский</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </footer>
    );
}
