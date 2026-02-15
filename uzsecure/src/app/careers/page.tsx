'use client';

import PageShell from '@/components/layout/page-shell';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CareersPage() {
    return (
        <PageShell
            title="Join Our Mission"
            description="Help us secure the digital future of Uzbekistan."
            parent={{ name: "Company", href: "#" }}
        >
            <div className="space-y-6 mt-8">
                <div className="flex items-center justify-between p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Senior Security Engineer</h3>
                            <p className="text-muted-foreground">Remote (Uzbekistan) • Full-time</p>
                        </div>
                    </div>
                    <Button>Apply Now</Button>
                </div>
                <div className="flex items-center justify-between p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Community Manager</h3>
                            <p className="text-muted-foreground">Tashkent • Full-time</p>
                        </div>
                    </div>
                    <Button variant="outline">Apply Now</Button>
                </div>
            </div>
        </PageShell>
    );
}
