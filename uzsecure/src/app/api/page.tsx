'use client';

import PageShell from '@/components/layout/page-shell';

export default function ApiRefPage() {
    return (
        <PageShell
            title="API Reference"
            description="Integrate UzSecure into your workflow with our API."
            parent={{ name: "Resources", href: "#" }}
        >
            <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm space-y-4">
                <code className="block bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                    GET https://api.uzsecure.uz/v1/programs
                </code>
                <p className="text-muted-foreground">
                    Access program data, submit reports, and manage your account programmatically.
                </p>
                <div className="flex gap-4 pt-4">
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">Get API Key</button>
                    <button className="border border-border bg-transparent px-4 py-2 rounded-md hover:bg-accent">View Spec</button>
                </div>
            </div>
        </PageShell>
    );
}
