'use client';

import PageShell from '@/components/layout/page-shell';

export default function BugBountyPage() {
    return (
        <PageShell
            title="Bug Bounty Programs"
            description="Launch manage, and scale your vulnerability disclosure programs with the power of the crowd."
            parent={{ name: "Platform", href: "#" }} // href="#" or a platform overview page if it existed
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold mb-3 text-primary">Crowdsourced Security</h3>
                    <p className="text-muted-foreground">Tap into the global community of ethical hackers to find vulnerabilities before criminals do.</p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold mb-3 text-primary">Rapid Triage</h3>
                    <p className="text-muted-foreground">Our expert team interacts with researchers to validate reports, ensuring you focus only on real threats.</p>
                </div>
            </div>
        </PageShell>
    );
}
