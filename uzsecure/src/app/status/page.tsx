'use client';

import PageShell from '@/components/layout/page-shell';
import { CheckCircle } from 'lucide-react';

export default function StatusPage() {
    return (
        <PageShell
            title="System Status"
            description="Current status of UzSecure services."
            parent={{ name: "Resources", href: "#" }}
        >
            <div className="space-y-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 mb-8">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">All Systems Operational</span>
                </div>

                <StatusItem name="API V1" status="Operational" />
                <StatusItem name="Web Dashboard" status="Operational" />
                <StatusItem name="Email Notifications" status="Operational" />
                <StatusItem name="Report Submission" status="Operational" />
            </div>
        </PageShell>
    );
}

function StatusItem({ name, status }: { name: string; status: string }) {
    return (
        <div className="flex items-center justify-between p-4 border-b border-border/50">
            <span>{name}</span>
            <span className="text-sm font-medium text-green-500">{status}</span>
        </div>
    )
}
