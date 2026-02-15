'use client';

import PageShell from '@/components/layout/page-shell';

export default function DocsPage() {
    return (
        <PageShell
            title="Documentation"
            description="Guides and references for researchers and companies."
            parent={{ name: "Resources", href: "#" }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold mb-3 text-primary">Researcher Guide</h3>
                    <p className="text-muted-foreground">Everything you need to know about reporting vulnerabilities on UzSecure.</p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold mb-3 text-primary">Company Guide</h3>
                    <p className="text-muted-foreground">How to launch and manage your bug bounty program effectively.</p>
                </div>
            </div>
        </PageShell>
    );
}
