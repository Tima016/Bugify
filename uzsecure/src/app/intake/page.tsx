import PageShell from "@/components/layout/page-shell";

export default function IntakePage() {
    return (
        <PageShell
            title="Vulnerability Intake"
            description="Streamline the receipt and triage of potential security vulnerabilities."
            parent={{ name: "Platform", href: "/platform" }}
        >
            <div className="space-y-12">
                <section className="max-w-3xl">
                    <h2 className="text-2xl font-bold mb-4">Centralized Vulnerability Management</h2>
                    <p className="text-muted-foreground mb-6">
                        Provide a secure, standardized channel for researchers and the public to report
                        security issues found in your systems. Our intake platform handles validation,
                        deduplication, and routing to the right engineering teams.
                    </p>
                </section>
            </div>
        </PageShell>
    );
}
