import PageShell from "@/components/layout/page-shell";

export default function CaseStudiesPage() {
    return (
        <PageShell
            title="Case Studies"
            description="See how leading organizations secure their assets with UzSecure."
            parent={{ name: "Resources", href: "/resources" }}
        >
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-lg bg-card hover:border-primary/50 transition-colors">
                    <h3 className="text-xl font-bold mb-2">FinTech Unicorn Secures Launch</h3>
                    <p className="text-muted-foreground mb-4">
                        How a leading payment processor used continuous bug bounty to scale securely
                        and meet compliance requirements.
                    </p>
                    <span className="text-primary font-medium">Read Story &rarr;</span>
                </div>
                <div className="p-6 border rounded-lg bg-card hover:border-primary/50 transition-colors">
                    <h3 className="text-xl font-bold mb-2">Government Agency Modernization</h3>
                    <p className="text-muted-foreground mb-4">
                        Securing citizen data during a massive digital transformation project
                        using private crowdsourced testing.
                    </p>
                    <span className="text-primary font-medium">Read Story &rarr;</span>
                </div>
            </div>
        </PageShell>
    );
}
