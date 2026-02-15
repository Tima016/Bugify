'use client';

import PageShell from '@/components/layout/page-shell';

export default function EnterpriseSolutionsPage() {
    return (
        <PageShell
            title="Enterprise Security Solutions"
            description="Scale security with enterprise-grade controls, compliance, and dedicated support."
            parent={{ name: "Solutions", href: "#" }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold mb-2 text-primary">SSO & RBAC</h3>
                    <p className="text-sm text-muted-foreground">Manage access with granular controls and integrate with your existing identity provider.</p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold mb-2 text-primary">Audit Logs</h3>
                    <p className="text-sm text-muted-foreground">Comprehensive logging for all actions to meet compliance requirements.</p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold mb-2 text-primary">Dedicated PTM</h3>
                    <p className="text-sm text-muted-foreground">A dedicated Program Technical Manager to guide your security journey.</p>
                </div>
            </div>
        </PageShell>
    );
}
