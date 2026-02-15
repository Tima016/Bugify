import PageShell from "@/components/layout/page-shell";

export default function FinancialSolutionsPage() {
    return (
        <PageShell
            title="Financial Services Security"
            description="Bank-grade security testing for fintech and traditional financial institutions."
            parent={{ name: "Solutions", href: "/solutions" }}
        >
            <div className="space-y-12">
                <section className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Compliance & Security for Finance</h2>
                        <p className="text-muted-foreground mb-6">
                            Financial institutions face unique regulatory challenges and sophisticated threats.
                            UzSecure provides continuous testing designed to meet requirements like PCI-DSS,
                            SOC 2, and GLBA while protecting sensitive customer data.
                        </p>
                    </div>
                </section>
            </div>
        </PageShell>
    );
}
