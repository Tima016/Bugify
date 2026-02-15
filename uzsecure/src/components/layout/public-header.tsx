'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Shield, Menu, X, ChevronRight, Lock, Search } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
// Mock Framer Motion to avoid build errors if package is missing or types are wrong
const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const motion = {
    header: ({ children, className, ...props }: any) => <header className={className} {...props}>{children}</header>,
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
};

export function PublicHeader() {
    const { user, logout } = useAuthStore();
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        {
            title: "Platform",
            items: [
                { title: "Bug Bounty", href: "/platform/bug-bounty", description: "Crowdsourced vulnerability discovery." },
                { title: "Vulnerability Disclosure", href: "/platform/vdb", description: "Secure reporting channels for verified vulns." },
                { title: "Penetration Testing", href: "/platform/pentest", description: "On-demand testing by elite professionals." },
                { title: "Attack Surface Management", href: "/platform/asm", description: "Continuous discovery and monitoring." },
            ]
        },
        {
            title: "Solutions",
            items: [
                { title: "For Enterprise", href: "/solutions/enterprise", description: "Scale security with compliance controls." },
                { title: "For Government", href: "/solutions/government", description: "Securing national digital infrastructure." },
                { title: "For Startups", href: "/solutions/startups", description: "Security essentials for high-growth teams." },
                { title: "By Industry", href: "/solutions/industry", description: "Tailored solutions for your sector." },
            ]
        },
        {
            title: "Resources",
            items: [
                { title: "Hacktivity", href: "/hacktivity", description: "Global feed of disclosed vulnerabilities." },
                { title: "Leaderboard", href: "/leaderboard", description: "Top ranking security researchers." },
                { title: "Academy", href: "/academy", description: "Learn ethical hacking and cybersecurity." },
                { title: "Blog", href: "/blog", description: "Latest industry news and updates." },
                { title: "Docs", href: "/docs", description: "Platform documentation and API reference." },
            ]
        },
        {
            title: "Company",
            items: [
                { title: "About Us", href: "/about", description: "Our mission to secure the digital world." },
                { title: "Careers", href: "/careers", description: "Join our team of security experts." },
                { title: "Partners", href: "/partners", description: "Our ecosystem of security partners." },
                { title: "Contact", href: "/contact", description: "Get in touch with our team." },
            ]
        }
    ];

    return (
        <motion.header
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300 border-b",
                isScrolled
                    ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm"
                    : "bg-transparent border-transparent"
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-blue-600 text-white shadow-lg transition-transform group-hover:scale-105">
                        <Shield className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 group-hover:to-primary transition-colors">
                        UzSecure
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-6">
                    <NavigationMenu>
                        <NavigationMenuList>
                            {navItems.map((section) => (
                                <NavigationMenuItem key={section.title}>
                                    <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary focus:bg-transparent data-[state=open]:text-primary">
                                        {section.title}
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="w-[500px] md:w-[600px] lg:w-[700px] p-6 bg-background/95 backdrop-blur-3xl border border-border/50 rounded-xl shadow-2xl">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 pl-3">
                                                        Explore {section.title}
                                                    </h4>
                                                    <ul className="grid gap-2">
                                                        {section.items.map((item) => (
                                                            <ListItem
                                                                key={item.title}
                                                                title={item.title}
                                                                href={item.href}
                                                                className="hover:bg-primary/5 focus:bg-primary/5 rounded-lg transition-colors"
                                                            >
                                                                {item.description}
                                                            </ListItem>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="bg-muted/30 rounded-lg p-4 flex flex-col justify-end">
                                                    <div className="mb-4">
                                                        <Shield className="h-8 w-8 text-primary mb-2" />
                                                        <h3 className="text-lg font-bold text-foreground">Secure your future</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Trusted by leading organizations to protect their digital assets.
                                                        </p>
                                                    </div>
                                                    <Link href="/register" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                                                        Get Started <ChevronRight className="h-3 w-3" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            ))}
                            <NavigationMenuItem>
                                <Link href="/programs" legacyBehavior passHref>
                                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-foreground/80 hover:text-primary focus:bg-transparent")}>
                                        Programs
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    <div className="flex items-center border-r border-border/50 pr-4 mr-1">
                        <ThemeToggle />
                    </div>

                    {user ? (
                        <UserDropdown user={user} logout={logout} />
                    ) : (
                        <AuthButtons />
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-4 lg:hidden">
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-foreground"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl lg:hidden"
                    >
                        <div className="flex h-20 items-center justify-between px-4 border-b border-border/50">
                            <span className="text-xl font-bold">Menu</span>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="flex flex-col p-4 space-y-6 overflow-y-auto h-[calc(100vh-5rem)]">
                            {navItems.map((section) => (
                                <div key={section.title} className="space-y-3">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        {section.title}
                                    </h4>
                                    <div className="grid gap-2">
                                        {section.items.map((item) => (
                                            <Link
                                                key={item.title}
                                                href={item.href}
                                                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div>
                                                    <div className="font-medium">{item.title}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-6 border-t border-border/50">
                                {user ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <Avatar>
                                                <AvatarImage src={user.profilePictureUrl} />
                                                <AvatarFallback>{user.username[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.username}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                        <Link href="/dashboard">
                                            <Button className="w-full">Dashboard</Button>
                                        </Link>
                                        <Button variant="outline" className="w-full text-destructive" onClick={logout}>Sign Out</Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full">Log in</Button>
                                        </Link>
                                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full">Get Started</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"

function AuthButtons() {
    return (
        <div className="flex items-center gap-3">
            <Link href="/login">
                <Button variant="ghost" className="font-medium hover:bg-primary/10 hover:text-primary">
                    Log in
                </Button>
            </Link>
            <Link href="/register">
                <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all font-semibold">
                    Get Started
                </Button>
            </Link>
        </div>
    )
}

function UserDropdown({ user, logout }: { user: any, logout: () => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <Avatar className="h-9 w-9 border-2 border-background">
                        <AvatarImage src={user.profilePictureUrl} alt={user.username} />
                        <AvatarFallback className="bg-primary/10 text-primary">{user.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2" align="end">
                <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md mb-2">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profilePictureUrl} />
                        <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-semibold">{user.username}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{user.email}</p>
                    </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                        <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <span>Dashboard</span>
                        </div>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            <span>Settings</span>
                        </div>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
