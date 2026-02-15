'use client';

import { PageHeader } from '@/components/layout/page-header';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { motion } from 'framer-motion';
import { BackButton } from '@/components/ui/back-button';

interface PageShellProps {
    title: string;
    description: string;
    children?: React.ReactNode;
    parent?: {
        name: string;
        href: string;
    };
}

export default function PageShell({ title, description, children, parent }: PageShellProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <PublicHeader />

            <main className="flex-1 pt-24 pb-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <BackButton />
                    </div>
                    <PageHeader
                        title={title}
                        description={description}
                        parent={parent}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-8"
                    >
                        {children || (
                            <div className="prose dark:prose-invert max-w-none">
                                <div className="p-8 border border-dashed border-border rounded-lg bg-card/50 text-center text-muted-foreground">
                                    <p>Content coming soon for {title}.</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
