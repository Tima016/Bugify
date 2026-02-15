import PageShell from "@/components/layout/page-shell";

export default function ResponsibleDisclosurePage() {
    return (
        <PageShell
            title="Responsible Disclosure Policy"
            description="Guidelines for reporting security vulnerabilities to UzSecure."
            parent={{ name: "Legal", href: "/legal" }}
        >
            <div className="prose dark:prose-invert max-w-4xl">
                <h2>Policy Overview</h2>
                <p>
                    UzSecure takes the security of our systems seriously. We value the security community
                    and believe that responsible disclosure of vulnerabilities is essential to improving
                    security for everyone.
                </p>

                <h3>Scope</h3>
                <p>
                    This policy applies to all systems owned and operated by UzSecure.
                    Any vulnerability found on <code>*.uzsecure.uz</code> is in scope,
                    unless explicitly excluded.
                </p>

                <h3>Reporting</h3>
                <p>
                    If you believe you have found a security vulnerability, please submit a report
                    to us via our platform or email security@uzsecure.uz.
                </p>
            </div>
        </PageShell>
    );
}
