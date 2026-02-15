'use client';

import PageShell from '@/components/layout/page-shell';

export default function AboutPage() {
    return (
        <PageShell
            title="About UzSecure"
            description="Empowering Uzbekistan's digital security through collaboration."
            parent={{ name: "Company", href: "#" }}
        >
            <div className="space-y-8 max-w-3xl mx-auto">
                <div>
                    <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        To build a safer digital ecosystem for Uzbekistan by connecting organizations with the world's best ethical hackers.
                        We believe in the power of crowdsourced security to identify vulnerabilities before they can be exploited.
                    </p>
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-4">Our Story</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        Founded in 2024, UzSecure emerged from the need for a sovereign, trusted vulnerability disclosure platform.
                        We work closely with government bodies and private enterprises to standardize security practices.
                    </p>
                </div>
            </div>
        </PageShell>
    );
}
