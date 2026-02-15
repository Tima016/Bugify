'use client';

import PageShell from '@/components/layout/page-shell';

export default function VDBFooterPage() {
    return (
        <PageShell
            title="Vulnerability Disclosure"
            description="Submit a vulnerability report securely."
            parent={{ name: "Platform", href: "#" }}
        >
            <div className="max-w-2xl mx-auto text-center space-y-6">
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Real-time feed of vulnerabilities disclosed across the UzSecure platform. Learn from others&apos; findings.
                </p>
                <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
                    <h3 className="text-xl font-bold text-primary mb-2">Submit a Report</h3>
                    <p className="text-sm mb-4">You will be redirected to our secure submission form.</p>
                    <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
                        Start Submission
                    </button>
                </div>
            </div>
        </PageShell>
    );
}
