'use client';

import PageShell from '@/components/layout/page-shell';

export default function GovernmentSolutionsPage() {
    return (
        <PageShell
            title="Government Solutions"
            description="Securing national digital infrastructure with sovereign-grade security."
            parent={{ name: "Solutions", href: "#" }}
        >
            <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3 text-primary">National Security First</h3>
                <p className="text-muted-foreground mb-4">
                    UzSecure partners with government agencies to protect critical infrastructure, citizen data, and public services from cyber threats.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>Sovereign data residency within Uzbekistan.</li>
                    <li>Vetted researchers with background checks.</li>
                    <li>Compliance with national cybersecurity standards.</li>
                </ul>
            </div>
        </PageShell>
    );
}
