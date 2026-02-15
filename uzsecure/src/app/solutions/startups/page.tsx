'use client';

import PageShell from '@/components/layout/page-shell';

export default function StartupSolutionsPage() {
    return (
        <PageShell
            title="Security for Startups"
            description="Security essentials for growing companies at an affordable pace."
            parent={{ name: "Solutions", href: "#" }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold mb-3 text-primary">Launch Securely</h3>
                    <p className="text-muted-foreground">
                        Get a baseline verification before your big launch. Our on-demand pentesting fits your release cycle.
                    </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold mb-3 text-primary">Grow Safely</h3>
                    <p className="text-muted-foreground">
                        Scale your security program as you grow. Start with a VDP and move to a Bug Bounty when ready.
                    </p>
                </div>
            </div>
        </PageShell>
    );
}
