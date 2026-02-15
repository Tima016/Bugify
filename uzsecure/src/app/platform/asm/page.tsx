import PageShell from "@/components/layout/page-shell";

export default function ASMPage() {
    return (
        <PageShell
            title="Attack Surface Management"
            description="Continuous visibility into your organization's digital footprint."
            parent={{ name: "Platform", href: "/platform" }}
        >
            <div className="space-y-12">
                <section className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">See What Attackers See</h2>
                        <p className="text-muted-foreground mb-6">
                            Modern organizations have complex, rapidly changing digital environments.
                            Our ASM solution automatically discovers, inventories, and monitors your
                            external assets to identify exposures before they become breaches.
                        </p>
                        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                            <li>Continuous asset discovery</li>
                            <li>Shadow IT detection</li>
                            <li>Real-time exposure monitoring</li>
                            <li>Automated risk scoring</li>
                        </ul>
                    </div>
                </section>
            </div>
        </PageShell>
    );
}
