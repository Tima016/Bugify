'use client';

import PageShell from '@/components/layout/page-shell';

export default function PrivacyPage() {
    return (
        <PageShell
            title="Privacy Policy"
            description="How we collect, use, and protect your data."
            parent={{ name: "Legal", href: "#" }}
        >
            <div className="prose dark:prose-invert max-w-none space-y-8">
                <p>Last updated: February 14, 2026</p>

                <section>
                    <h3>1. Introduction</h3>
                    <p>UzSecure ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose your personal information.</p>
                </section>

                <section>
                    <h3>2. Information We Collect</h3>
                    <p>We collect information you provide directly to us, such as when you create an account, submit a report, or communicate with us.</p>
                </section>

                <section>
                    <h3>3. How We Use Your Information</h3>
                    <p>We use your information to provide, maintain, and improve our services, including verification of researcher identity and processing bounty payments.</p>
                </section>
            </div>
        </PageShell>
    );
}
