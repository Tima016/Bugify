'use client';

import PageShell from '@/components/layout/page-shell';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function HelpCenterPage() {
    return (
        <PageShell
            title="Help Center"
            description="Find answers to common questions."
            parent={{ name: "Resources", href: "#" }}
        >
            <div className="max-w-xl mx-auto space-y-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search for help..." className="pl-10 h-12" />
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Common Topics</h3>
                    <div className="p-4 rounded-lg border border-border bg-card/30 hover:bg-accent/50 cursor-pointer transition-colors">
                        <p className="font-medium">How do I get paid?</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card/30 hover:bg-accent/50 cursor-pointer transition-colors">
                        <p className="font-medium">What is the scope of a program?</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card/30 hover:bg-accent/50 cursor-pointer transition-colors">
                        <p className="font-medium">How to dispute a report status?</p>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
