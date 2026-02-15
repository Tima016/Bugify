'use client';

import PageShell from '@/components/layout/page-shell';
import { BookOpen, Video, Code } from 'lucide-react';

export default function AcademyPage() {
    return (
        <PageShell
            title="UzSecure Academy"
            description="Learn ethical hacking and cybersecurity from industry experts."
            parent={{ name: "Community", href: "#" }}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm hover:border-primary/50 transition-colors cursor-pointer group">
                    <BookOpen className="h-8 w-8 mb-4 text-primary group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold mb-2">Web Security 101</h3>
                    <p className="text-sm text-muted-foreground">Master the basics of OWASP Top 10 vulnerabilities.</p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm hover:border-primary/50 transition-colors cursor-pointer group">
                    <Video className="h-8 w-8 mb-4 text-purple-500 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
                    <p className="text-sm text-muted-foreground">Watch walkthroughs of real-world bug bounty finds.</p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm hover:border-primary/50 transition-colors cursor-pointer group">
                    <Code className="h-8 w-8 mb-4 text-green-500 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold mb-2">Secure Coding</h3>
                    <p className="text-sm text-muted-foreground">Learn how to write secure code and fix vulnerabilities.</p>
                </div>
            </div>
        </PageShell>
    );
}
