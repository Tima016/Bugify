import PageShell from "@/components/layout/page-shell";

export default function HealthcareSolutionsPage() {
    return (
        <PageShell
            title="Healthcare Security"
            description="Protecting patient data and medical infrastructure."
            parent={{ name: "Solutions", href: "/solutions" }}
        >
            <div className="space-y-12">
                <section className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">HIPAA-Compliant Security Testing</h2>
                        <p className="text-muted-foreground mb-6">
                            Healthcare organizations are top targets for cyberattacks. We help you
                            secure EMR systems, medical devices, and patient portals against
                            ransomware and data theft.
                        </p>
                    </div>
                </section>
            </div>
        </PageShell>
    );
}
