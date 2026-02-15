'use client';

import PageShell from '@/components/layout/page-shell';

export default function PartnersPage() {
    return (
        <PageShell
            title="Partners"
            description="Our ecosystem of trusted partners."
            parent={{ name: "Company", href: "#" }}
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="h-24 bg-muted/50 rounded-lg flex items-center justify-center font-bold text-xl">
                    CYBERCORP
                </div>
                <div className="h-24 bg-muted/50 rounded-lg flex items-center justify-center font-bold text-xl">
                    GOVTECH
                </div>
                <div className="h-24 bg-muted/50 rounded-lg flex items-center justify-center font-bold text-xl">
                    BANKSEC
                </div>
                <div className="h-24 bg-muted/50 rounded-lg flex items-center justify-center font-bold text-xl">
                    CLOUDSYS
                </div>
            </div>
        </PageShell>
    );
}
