import PageShell from "@/components/layout/page-shell";

export default function TrustPage() {
    return (
        <PageShell
            title="Trust & Security"
            description="Our commitment to the security of the UzSecure platform."
            parent={{ name: "Company", href: "/about" }}
        >
            <div className="space-y-8 max-w-4xl">
                <section>
                    <h2 className="text-2xl font-bold mb-4">Our Security Philosophy</h2>
                    <p className="text-muted-foreground">
                        Security is our core business. We employ defense-in-depth strategies,
                        continuous monitoring, and our own dog-fooding practices to ensuring
                        the integrity of the UzSecure platform.
                    </p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold mb-4">Compliance</h2>
                    <p className="text-muted-foreground">
                        We are committed to maintaining the highest standards of data protection
                        and regulatory compliance, adhering to international best practices.
                    </p>
                </section>
            </div>
        </PageShell>
    );
}
