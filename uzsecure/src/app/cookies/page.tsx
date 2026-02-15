'use client';

import PageShell from '@/components/layout/page-shell';

export default function CookiesPage() {
    return (
        <PageShell
            title="Cookie Policy"
            description="Information about how we use cookies."
            parent={{ name: "Legal", href: "#" }}
        >
            <div className="prose dark:prose-invert max-w-none space-y-8">
                <p>Last updated: February 14, 2026</p>

                <section>
                    <h3>What are cookies?</h3>
                    <p>Cookies are small text files that are stored on your device when you visit a website. We use cookies to ensure our website functions properly and to improve your experience.</p>
                </section>

                <section>
                    <h3>Types of cookies we use</h3>
                    <ul>
                        <li><strong>Essential Cookies:</strong> Necessary for the website to function (e.g., authentication).</li>
                        <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website.</li>
                    </ul>
                </section>
            </div>
        </PageShell>
    );
}
