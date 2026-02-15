'use client';

import PageShell from '@/components/layout/page-shell';

export default function TermsPage() {
    return (
        <PageShell
            title="Terms of Service"
            description="The rules and guidelines for using UzSecure."
            parent={{ name: "Legal", href: "#" }}
        >
            <div className="prose dark:prose-invert max-w-none space-y-8">
                <p>Last updated: February 14, 2026</p>

                <section>
                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing or using our platform, you agree to be bound by these Terms of Service.</p>
                </section>

                <section>
                    <h3>2. Researcher Conduct</h3>
                    <p>Researchers must adhere to our Code of Conduct. Unauthorized access, destruction of data, or disruption of services is strictly prohibited.</p>
                </section>

                <section>
                    <h3>3. Confidentiality</h3>
                    <p>You agree to keep all vulnerability information confidential until it is publicly disclosed by the program owner.</p>
                </section>
            </div>
        </PageShell>
    );
}
