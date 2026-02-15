'use client';

import PageShell from '@/components/layout/page-shell';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BlogPage() {
    return (
        <PageShell
            title="Blog"
            description="Insights, updates, and stories from the UzSecure team."
            parent={{ name: "Company", href: "#" }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <article className="group cursor-pointer">
                    <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <p className="text-sm text-primary mb-2">Security Research</p>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Analyzing the Top 5 Vulnerabilities in 2024</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                        A deep dive into the most common security flaws found by our community this year and how to prevent them.
                    </p>
                    <div className="flex items-center text-sm font-medium text-primary">
                        Read more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                </article>
                <article className="group cursor-pointer">
                    <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <p className="text-sm text-primary mb-2">Platform Update</p>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Introducing the New Researcher Dashboard</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                        We've redesigned the dashboard to give you better insights into your performance and earnings.
                    </p>
                    <div className="flex items-center text-sm font-medium text-primary">
                        Read more <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                </article>
            </div>
        </PageShell>
    );
}
