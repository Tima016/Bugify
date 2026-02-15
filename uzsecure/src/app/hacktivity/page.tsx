'use client';

import PageShell from '@/components/layout/page-shell';
import { Activity } from 'lucide-react';

export default function HacktivityPage() {
    return (
        <PageShell
            title="Hacktivity"
            description="Real-time feed of disclosed vulnerabilities from the community."
            parent={{ name: "Community", href: "#" }}
        >
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card/50">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium">Stored XSS in user profile</p>
                            <p className="text-sm text-muted-foreground">Reported by <span className="text-primary">hunter{i}</span> to <span className="text-foreground">TechCorp</span></p>
                        </div>
                        <div className="ml-auto text-sm text-muted-foreground whitespace-nowrap">2h ago</div>
                    </div>
                ))}
            </div>
        </PageShell>
    );
}
