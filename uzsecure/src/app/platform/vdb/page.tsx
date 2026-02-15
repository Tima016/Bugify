'use client';

import PageShell from '@/components/layout/page-shell';

export default function VDBPage() {
    return (
        <PageShell
            title="Vulnerability Disclosure"
            description="Securely receive and manage vulnerability reports from the public."
            parent={{ name: "Platform", href: "#" }}
        >
            <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3 text-primary">Standardized & Secure</h3>
                <p className="text-muted-foreground">Implement ISO 29147 compliant disclosure channels to ensure researchers have a safe way to report issues.</p>
            </div>
        </PageShell>
    );
}
